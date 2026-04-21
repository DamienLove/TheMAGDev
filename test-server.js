const { WebSocketServer } = require('ws');
const PORT = 4477;
const wss = new WebSocketServer({
    port: PORT,
    verifyClient: (info, cb) => {
        const origin = info.origin;
        if (origin === undefined ||
            (origin && origin.startsWith('http://localhost:')) ||
            ['https://themag.dev', 'https://stackblitz.io'].includes(origin)) {
            cb(true);
        } else {
            console.warn(`[Security] Blocked unauthorized connection attempt from origin: ${origin}`);
            cb(false, 403, 'Forbidden');
        }
    }
});
console.log('started');
process.exit(0);
