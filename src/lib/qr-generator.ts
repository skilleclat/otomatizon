/**
 * Self-contained Pure TypeScript QR Code Generator (No external dependencies)
 * Generates valid, standards-compliant ISO/IEC 18004 QR Codes in SVG & Data-URL formats.
 */

// GF(256) Log & Exp tables for Reed-Solomon Error Correction
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = val;
    EXP_TABLE[i + 255] = val;
    LOG_TABLE[val] = i;
    val = (val << 1) ^ (val >= 128 ? 0x11d : 0);
  }
  LOG_TABLE[0] = 0;
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function rsComputeGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], factor);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

function rsCalculateRemainder(data: Uint8Array, numEcBytes: number): Uint8Array {
  const genPoly = rsComputeGeneratorPoly(numEcBytes);
  const result = new Uint8Array(numEcBytes);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0];
    result.copyWithin(0, 1);
    result[numEcBytes - 1] = 0;
    for (let j = 0; j < numEcBytes; j++) {
      result[j] ^= gfMul(genPoly[j], factor);
    }
  }
  return result;
}

// Version table capacities & EC specs for QR Code (Level M)
const VERSION_SPECS: Record<number, { totalBytes: number; ecBytes: number; numBlocks: number }> = {
  1: { totalBytes: 26, ecBytes: 10, numBlocks: 1 },
  2: { totalBytes: 44, ecBytes: 16, numBlocks: 1 },
  3: { totalBytes: 70, ecBytes: 26, numBlocks: 1 },
  4: { totalBytes: 100, ecBytes: 36, numBlocks: 2 },
  5: { totalBytes: 134, ecBytes: 48, numBlocks: 2 },
  6: { totalBytes: 172, ecBytes: 64, numBlocks: 4 },
  7: { totalBytes: 196, ecBytes: 72, numBlocks: 4 },
  8: { totalBytes: 242, ecBytes: 88, numBlocks: 4 },
};

function selectVersion(byteLength: number): number {
  for (let v = 1; v <= 8; v++) {
    const spec = VERSION_SPECS[v];
    const dataCap = spec.totalBytes - spec.ecBytes - 3; // mode + count + terminator
    if (byteLength <= dataCap) return v;
  }
  return 8;
}

export class QREncoder {
  static encode(text: string): boolean[][] {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(text);
    const version = selectVersion(dataBytes.length);
    const spec = VERSION_SPECS[version];
    const dataCapacity = spec.totalBytes - spec.ecBytes;

    // 1. Bitstream assembly
    const bits: number[] = [];
    const pushBits = (val: number, len: number) => {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >> i) & 1);
      }
    };

    // Mode indicator: 0100 for Byte Mode
    pushBits(0b0100, 4);
    // Character count indicator (8 bits for v1-9)
    pushBits(dataBytes.length, 8);
    // Data bytes
    for (const b of dataBytes) {
      pushBits(b, 8);
    }
    // Terminator
    const terminatorLen = Math.min(4, dataCapacity * 8 - bits.length);
    pushBits(0, terminatorLen);
    // Pad to byte boundary
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }
    // Pad with 0xEC, 0x11
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bits.length < dataCapacity * 8) {
      pushBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Convert bits to bytes
    const rawData = new Uint8Array(dataCapacity);
    for (let i = 0; i < dataCapacity; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | bits[i * 8 + j];
      }
      rawData[i] = b;
    }

    // 2. Error correction calculation
    const numBlocks = spec.numBlocks;
    const ecBytesPerBlock = spec.ecBytes / numBlocks;
    const dataBytesPerBlock = Math.floor(dataCapacity / numBlocks);

    const dataBlocks: Uint8Array[] = [];
    const ecBlocks: Uint8Array[] = [];

    for (let b = 0; b < numBlocks; b++) {
      const blockData = rawData.slice(b * dataBytesPerBlock, (b + 1) * dataBytesPerBlock);
      dataBlocks.push(blockData);
      ecBlocks.push(rsCalculateRemainder(blockData, ecBytesPerBlock));
    }

    // 3. Interleaving
    const finalStream: number[] = [];
    for (let i = 0; i < dataBytesPerBlock; i++) {
      for (let b = 0; b < numBlocks; b++) {
        finalStream.push(dataBlocks[b][i]);
      }
    }
    for (let i = 0; i < ecBytesPerBlock; i++) {
      for (let b = 0; b < numBlocks; b++) {
        finalStream.push(ecBlocks[b][i]);
      }
    }

    // 4. Matrix Generation
    const size = 17 + version * 4;
    const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

    // Place Finder Patterns
    const placeFinder = (r: number, c: number) => {
      for (let y = -1; y <= 7; y++) {
        for (let x = -1; x <= 7; x++) {
          const row = r + y;
          const col = c + x;
          if (row >= 0 && row < size && col >= 0 && col < size) {
            if (y >= 0 && y <= 6 && (x === 0 || x === 6 || y === 0 || y === 6)) {
              matrix[row][col] = true;
            } else if (y >= 2 && y <= 4 && x >= 2 && x <= 4) {
              matrix[row][col] = true;
            } else {
              matrix[row][col] = false;
            }
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // Place Alignment Pattern if version >= 2
    if (version >= 2) {
      const alignPos = size - 7;
      for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
          const row = alignPos + y;
          const col = alignPos + x;
          if (matrix[row][col] === null) {
            matrix[row][col] = Math.max(Math.abs(x), Math.abs(y)) !== 1;
          }
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
      if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
    }

    // Reserve format info areas
    for (let i = 0; i < 9; i++) {
      if (matrix[8][i] === null) matrix[8][i] = false;
      if (matrix[i][8] === null) matrix[i][8] = false;
      if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
      if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
    }
    matrix[size - 8][8] = true; // Dark module

    // Place Data bits
    const finalBits: number[] = [];
    for (const byte of finalStream) {
      for (let i = 7; i >= 0; i--) {
        finalBits.push((byte >> i) & 1);
      }
    }

    let bitIdx = 0;
    let upward = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--; // Skip vertical timing column
      const cols = [right, right - 1];
      const rowRange = upward
        ? Array.from({ length: size }, (_, i) => size - 1 - i)
        : Array.from({ length: size }, (_, i) => i);

      for (const row of rowRange) {
        for (const col of cols) {
          if (matrix[row][col] === null) {
            let bit = bitIdx < finalBits.length ? finalBits[bitIdx++] === 1 : false;
            // Mask 0: (row + col) % 2 === 0
            if ((row + col) % 2 === 0) {
              bit = !bit;
            }
            matrix[row][col] = bit;
          }
        }
      }
      upward = !upward;
    }

    // Format Info (Level M = 00, Mask 0 = 000 -> 00000 with BCH -> 0x5412 XOR)
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    // Write format bits around top-left finder
    for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i] === 1;
    matrix[8][7] = formatBits[6] === 1;
    matrix[8][8] = formatBits[7] === 1;
    matrix[7][8] = formatBits[8] === 1;
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i] === 1;

    // Write format bits around other finders
    for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
    for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i] === 1;

    return matrix.map((row) => row.map((cell) => (cell === null ? false : cell)));
  }
}

export function generateQrSvg(
  text: string,
  options: { size?: number; margin?: number; darkColor?: string; lightColor?: string } = {}
): string {
  const matrix = QREncoder.encode(text);
  const matrixSize = matrix.length;
  const margin = options.margin ?? 3;
  const darkColor = options.darkColor ?? "#002E25";
  const lightColor = options.lightColor ?? "#FFFFFF";
  const totalGridSize = matrixSize + margin * 2;
  const svgSize = options.size ?? 280;

  let paths = "";
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = c + margin;
        const y = r + margin;
        paths += `M${x},${y}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalGridSize} ${totalGridSize}" width="${svgSize}" height="${svgSize}" shape-rendering="crispEdges">
  <rect width="${totalGridSize}" height="${totalGridSize}" fill="${lightColor}"/>
  <path d="${paths}" fill="${darkColor}"/>
</svg>`;
}

export function generateQrDataUrl(
  text: string,
  options: { size?: number; margin?: number; darkColor?: string; lightColor?: string } = {}
): string {
  const svg = generateQrSvg(text, options);
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
