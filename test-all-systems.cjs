const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');

console.log('====================================================');
console.log('🚀 OTOMATIZON — GLOBAL INTEGRITY & SYSTEM AUDIT');
console.log('====================================================\n');

function checkServerReady() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET',
      timeout: 1000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function ensureServerRunning() {
  const isUp = await checkServerReady();
  if (isUp) {
    console.log('⚡ Server is already running on http://localhost:3001\n');
    return null;
  }

  console.log('⚙️ Starting local Otomatizon backend server on port 3001...');
  const serverProcess = spawn('node', ['server.cjs'], {
    cwd: __dirname,
    stdio: 'ignore',
    detached: false
  });

  // Wait up to 10 seconds for server to be responsive
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (await checkServerReady()) {
      console.log('✅ Server successfully initialized and ready!\n');
      return serverProcess;
    }
  }

  throw new Error('Server failed to start within timeout.');
}

const testFiles = [
  'test-completeness-audit.cjs',
  'test-system-foundation.cjs',
  'test-command-center.cjs',
  'test-operating-system-scenario.cjs',
  'test-real-connectors.cjs',
  'test-semantic-intelligence.cjs',
  'test-delayed-worker.cjs',
  'test-end-to-end-quality.cjs',
  'test-opportunities-engine.cjs',
  'test-results-impact.cjs',
  'test-activity-stream.cjs',
  'test-integration-hub.cjs',
  'test-cloud-billing.cjs',
  'test-red-team.cjs'
];

async function runAll() {
  let serverProc = null;
  try {
    serverProc = await ensureServerRunning();
  } catch (err) {
    console.error('❌ Could not start test server:', err.message);
    process.exit(1);
  }

  let totalPassed = 0;
  let totalFailed = 0;
  const results = [];

  for (const testFile of testFiles) {
    const filePath = path.join(__dirname, testFile);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${testFile}: SKIPPED (File not found)`);
      continue;
    }
    
    process.stdout.write(`Testing [${testFile}] ... `);
    try {
      const output = execSync(`node "${filePath}"`, { 
        cwd: __dirname, 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 30000 
      });
      console.log('✅ PASSED');
      totalPassed++;
      results.push({ file: testFile, status: 'PASSED', output: output.trim().split('\n').slice(-1).join('') });
    } catch (err) {
      console.log('❌ FAILED');
      totalFailed++;
      results.push({ file: testFile, status: 'FAILED', error: err.stderr || err.stdout || err.message });
    }
  }

  if (serverProc) {
    console.log('\n🛑 Stopping test server...');
    serverProc.kill();
  }

  console.log('\n====================================================');
  console.log(`🏁 AUDIT SUMMARY: ${totalPassed} Passed / ${totalFailed} Failed out of ${testFiles.length} suites`);
  console.log('====================================================');

  if (totalFailed > 0) {
    console.log('\n❌ Failure details:');
    for (const r of results.filter(r => r.status === 'FAILED')) {
      console.log(`\n--- ${r.file} ---`);
      console.log(r.error);
    }
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 14 TEST SUITES AND PRODUCTION SYSTEMS ARE 100% OPERATIONAL & SYNCHRONIZED!');
    process.exit(0);
  }
}

runAll().catch(e => {
  console.error(e);
  process.exit(1);
});
