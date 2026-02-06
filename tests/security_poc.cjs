const WebSocket = require('ws');

function test(origin, name) {
    return new Promise((resolve) => {
        const ws = new WebSocket('ws://localhost:4477', {
            headers: { 'Origin': origin }
        });

        ws.on('open', () => {
            console.log(`[${name}] Connected with origin: ${origin}`);
            ws.send(JSON.stringify({ type: 'run', command: 'echo SUCCESS' }));
        });

        ws.on('message', (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'output' && msg.data.includes('SUCCESS')) {
                console.log(`[${name}] VULNERABLE: Executed command!`);
                ws.close();
                resolve(true); // Connected and executed
            }
        });

        ws.on('error', (err) => {
            // console.log(`[${name}] Connection error: ${err.message}`);
            // Error usually means connection rejected or server down
            resolve(false);
        });

        ws.on('close', (code) => {
             if (code === 1008 || code === 403) {
                 console.log(`[${name}] PROTECTED: Connection rejected with code ${code}`);
             } else {
                 // console.log(`[${name}] Connection closed with code ${code}`);
             }
             resolve(false); // Connection closed (so didn't stay open and execute)
        });

        setTimeout(() => {
            console.log(`[${name}] Timeout`);
            ws.terminate();
            resolve(false);
        }, 3000);
    });
}

async function run() {
    console.log('--- Testing Vulnerability ---');
    // Test Evil Origin - Should FAIL if protected, SUCCEED if vulnerable
    const evilVulnerable = await test('http://evil.com', 'Evil Origin');

    // Test Good Origin - Should SUCCEED always
    const goodVulnerable = await test('http://localhost:5173', 'Good Origin');

    console.log('--- Results ---');
    console.log(`Evil Origin Access: ${evilVulnerable ? 'ALLOWED (VULNERABLE)' : 'DENIED (SECURE)'}`);
    console.log(`Good Origin Access: ${goodVulnerable ? 'ALLOWED' : 'DENIED (BROKEN)'}`);

    if (evilVulnerable) {
        console.log('CONCLUSION: VULNERABLE');
        process.exit(1); // Exit 1 to indicate vulnerability found
    } else {
        console.log('CONCLUSION: SECURE');
        process.exit(0);
    }
}

run();
