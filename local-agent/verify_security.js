const WebSocket = require('ws');

const PORT = 4477;
const URL = `ws://localhost:${PORT}`;

function testConnection(origin, shouldSucceed, testName) {
    return new Promise((resolve) => {
        console.log(`\nStarting Test: ${testName}`);
        console.log(`Connecting with Origin: ${origin}`);

        const options = origin ? { headers: { Origin: origin } } : {};
        const ws = new WebSocket(URL, options);

        ws.on('open', () => {
            if (shouldSucceed) {
                console.log('✅ Success: Connected as expected.');
                ws.close();
                resolve(true);
            } else {
                console.error('❌ FAILURE: Connected when should have been rejected!');
                ws.close();
                resolve(false);
            }
        });

        ws.on('error', (err) => {
            if (shouldSucceed) {
                console.error(`❌ FAILURE: Connection failed unexpectedly: ${err.message}`);
                resolve(false);
            } else {
                console.log(`✅ Success: Connection rejected as expected (${err.message}).`);
                resolve(true);
            }
        });
    });
}

async function runTests() {
    console.log('🛡️ Sentinel Security Verification');

    const t1 = await testConnection('http://malicious-site.com', false, 'Malicious Origin');
    const t2 = await testConnection('http://localhost:3000', true, 'Allowed Origin (Localhost)');
    const t3 = await testConnection('https://themag.dev', true, 'Allowed Origin (Production)');
    // Test 4: No Origin header
    const t4 = await testConnection(undefined, false, 'No Origin Header');

    if (t1 && t2 && t3 && t4) {
        console.log('\n🎉 ALL SECURITY CHECKS PASSED');
        process.exit(0);
    } else {
        console.error('\n💥 SECURITY CHECKS FAILED');
        process.exit(1);
    }
}

runTests();
