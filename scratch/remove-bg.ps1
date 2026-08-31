Add-Type -AssemblyName System.Drawing

$srcPath = "$PSScriptRoot\..\public\logo-official.png"
$destPath = "$PSScriptRoot\..\public\logo.png"
$markPath = "$PSScriptRoot\..\public\logo-mark.png"

$orig = [System.Drawing.Bitmap]::FromFile($srcPath)

# 1. Detect bounding box
$minX = $orig.Width
$maxX = 0
$minY = $orig.Height
$maxY = 0

for ($y = 0; $y -lt $orig.Height; $y++) {
    for ($x = 0; $x -lt $orig.Width; $x++) {
        $c = $orig.GetPixel($x, $y)
        # Foreground pixels have strong color or dark tone
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Detected bounds: X=$minX..$maxX, Y=$minY..$maxY, W=$($maxX - $minX + 1), H=$($maxY - $minY + 1)"

$pad = 6
$cropX = [Math]::Max(0, $minX - $pad)
$cropY = [Math]::Max(0, $minY - $pad)
$cropW = [Math]::Min($orig.Width - $cropX, ($maxX - $minX + 1) + ($pad * 2))
$cropH = [Math]::Min($orig.Height - $cropY, ($maxY - $minY + 1) + ($pad * 2))

# 2. Create high-quality 32bppArgb target image
$fullResult = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($targetY = 0; $targetY -lt $cropH; $targetY++) {
    $srcY = $cropY + $targetY
    for ($targetX = 0; $targetX -lt $cropW; $targetX++) {
        $srcX = $cropX + $targetX
        $pixel = $orig.GetPixel($srcX, $srcY)

        $r = [double]$pixel.R
        $g = [double]$pixel.G
        $b = [double]$pixel.B

        # Thresholds: pure background is when all R, G, B are near white
        # If R > 248, G > 248, B > 248 -> completely transparent
        if ($r -ge 246 -and $g -ge 246 -and $b -ge 246) {
            $fullResult.SetPixel($targetX, $targetY, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
        # If near white (feathered anti-aliasing edge):
        elseif ($r -gt 215 -and $g -gt 215 -and $b -gt 215) {
            # Darkness factor from white (0 = white, 1 = dark)
            $darkness = (255.0 - [Math]::Min($r, [Math]::Min($g, $b))) / (255.0 - 215.0)
            $alpha = [int]([Math]::Min(255.0, [Math]::Max(0.0, $darkness * 255.0)))
            
            # De-fringe: recover foreground color without white wash
            $fgR = [int]([Math]::Max(0.0, [Math]::Min(255.0, ($r - 255.0 * (1.0 - $darkness)) / [Math]::Max(0.01, $darkness))))
            $fgG = [int]([Math]::Max(0.0, [Math]::Min(255.0, ($g - 255.0 * (1.0 - $darkness)) / [Math]::Max(0.01, $darkness))))
            $fgB = [int]([Math]::Max(0.0, [Math]::Min(255.0, ($b - 255.0 * (1.0 - $darkness)) / [Math]::Max(0.01, $darkness))))
            
            $color = [System.Drawing.Color]::FromArgb($alpha, $fgR, $fgG, $fgB)
            $fullResult.SetPixel($targetX, $targetY, $color)
        }
        else {
            # Full opacity solid pixel
            $fullResult.SetPixel($targetX, $targetY, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B))
        }
    }
}

# Save full transparent logo
$tempOut = "$PSScriptRoot\..\public\logo_clean.png"
$fullResult.Save($tempOut, [System.Drawing.Imaging.ImageFormat]::Png)
$fullResult.Dispose()

# Create mark version
$origMarkW = [int]($cropH * 1.15)
$cleanBmp = [System.Drawing.Bitmap]::FromFile($tempOut)
$rectMark = New-Object System.Drawing.Rectangle(0, 0, [Math]::Min($origMarkW, $cropW), $cropH)
$markResult = $cleanBmp.Clone($rectMark, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$markResult.Save($markPath, [System.Drawing.Imaging.ImageFormat]::Png)
$markResult.Dispose()
$cleanBmp.Dispose()

$orig.Dispose()

# Overwrite logo.png
Move-Item -Path $tempOut -Destination $destPath -Force
Write-Host "Successfully generated 100% background-free logo.png and logo-mark.png!"
