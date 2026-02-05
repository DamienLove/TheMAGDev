import * as ftp from 'basic-ftp';

function readEnv(name, fallback = undefined) {
    const value = process.env[name];
    return value === undefined || value === "" ? fallback : value;
}

function parseBool(value, fallback = false) {
    if (value === undefined) return fallback;
    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
    return fallback;
}

async function deploy() {
    const client = new ftp.Client();
    client.ftp.timeout = 120000;
    // client.ftp.verbose = true; // Turn on if debugging is needed

    try {
        const host = readEnv("FTP_HOST");
        const user = readEnv("FTP_USER");
        const password = readEnv("FTP_PASS");
        const port = Number(readEnv("FTP_PORT", "21"));
        const secure = parseBool(readEnv("FTP_SECURE"), false);
        const rejectUnauthorized = parseBool(readEnv("FTP_REJECT_UNAUTHORIZED"), true);
        const remotePath = readEnv("FTP_PATH", "/");

        if (!host || !user || !password) {
            throw new Error("Missing FTP config. Set FTP_HOST, FTP_USER, and FTP_PASS.");
        }

        await client.access({
            host,
            user,
            password,
            port,
            secure,
            secureOptions: { rejectUnauthorized }
        });

        console.log("Connected to FTP.");

        await client.cd("/");
        await client.ensureDir(remotePath);
        await client.cd(remotePath);

        console.log(`Clearing remote directory '${remotePath}' to remove stale files...`);
        await client.clearWorkingDir();
        console.log(`Uploading 'dist' contents to '${remotePath}'...`);
        await client.uploadFromDir("dist", ".");

        console.log("Upload complete!");
    } catch (err) {
        console.error("FTP Error:", err);
    } finally {
        client.close();
    }
}

deploy();
