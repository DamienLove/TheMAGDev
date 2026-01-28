import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
    const client = new ftp.Client();
    client.ftp.timeout = 120000;
    // client.ftp.verbose = true; // Turn on if debugging is needed

    try {
        await client.access({
            host: "ftpupload.net",
            user: "if0_40352355",
            password: "4KgEjspgN2",
            port: 21,
            secure: false // Explicitly set to false or use implicit/explicit per server req. 
                          // ftpupload.net usually requires explicit TLS or plain. 
                          // basic-ftp defaults to false for secure. 
                          // Let's try default settings first, but InfinityFree often needs secure: true 
                          // with secureOptions: { lib: 'tls', rejectUnauthorized: false } if cert is self-signed.
                          // Actually, standard FTP is on 21. Let's try basic first.
        });

        console.log("Connected to FTP.");

        const list = await client.list();
        console.log("Root directory listing:", list.map(f => f.name));

        const targets = new Set();

        if (list.some(f => f.name === "htdocs")) {
            targets.add("htdocs");
        }

        const hasSpecificDomainFolder = list.some(f => f.name === "magstack.rf.gd");
        if (hasSpecificDomainFolder) {
            console.log("Found 'magstack.rf.gd' folder, checking for 'htdocs' or 'htdoc' inside it...");
            await client.cd("magstack.rf.gd");
            const subList = await client.list();
            if (subList.some(f => f.name === "htdocs")) {
                console.log("Found 'magstack.rf.gd/htdocs'. Adding as target.");
                targets.add("magstack.rf.gd/htdocs");
            }
            if (subList.some(f => f.name === "htdoc")) {
                console.log("Found 'magstack.rf.gd/htdoc'. Adding as target.");
                targets.add("magstack.rf.gd/htdoc");
            }
            await client.cd("/");
        }

        if (targets.size === 0) {
            console.log("No explicit targets found. Falling back to 'htdocs'.");
            targets.add("htdocs");
        }

        for (const targetDir of targets) {
            await client.cd("/");
            await client.cd(targetDir);
            console.log(`Clearing remote directory '${targetDir}' to remove stale files...`);
            await client.clearWorkingDir();
            console.log(`Uploading 'dist' contents to '${targetDir}'...`);
            await client.uploadFromDir("dist", ".");
        }

        console.log("Upload complete!");
    } catch (err) {
        console.error("FTP Error:", err);
    } finally {
        client.close();
    }
}

deploy();
