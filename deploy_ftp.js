import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deploy() {
    const client = new ftp.Client();
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

        let targetDir = "htdocs"; // Default fallback

        const hasSpecificDomainFolder = list.some(f => f.name === "magstack.rf.gd");
        if (hasSpecificDomainFolder) {
            console.log("Found 'magstack.rf.gd' folder, checking for 'htdoc' or 'htdocs' inside it...");
            await client.cd("magstack.rf.gd");
            const subList = await client.list();
            if (subList.some(f => f.name === "htdoc")) {
                console.log("Found 'magstack.rf.gd/htdoc'. Setting as target.");
                targetDir = "magstack.rf.gd/htdoc";
            } else if (subList.some(f => f.name === "htdocs")) {
                console.log("Found 'magstack.rf.gd/htdocs'. Setting as target.");
                targetDir = "magstack.rf.gd/htdocs";
            } else {
                console.log("No 'htdoc' or 'htdocs' found inside 'magstack.rf.gd'. Using default 'htdocs'.");
            }
            // Ensure we are in the target directory
            await client.cd("/"); // Go to root
            await client.cd(targetDir); // Go to target
            
            console.log(`Clearing remote directory '${targetDir}' to remove stale files...`);
            await client.clearWorkingDir();
        } else {
            // If we didn't navigate into a specific domain folder, we might be in the root htdocs or similar.
            // Be careful about clearing root. But since the user specified the folder, we should be okay if we matched logic.
            // If we fell back to 'htdocs' at root, let's cd into it.
             await client.cd(targetDir);
             console.log(`Clearing remote directory '${targetDir}'...`);
             await client.clearWorkingDir();
        }

        console.log(`Uploading 'dist' contents to '${targetDir}'...`);
        await client.uploadFromDir("dist", "."); // Upload to current working dir (which is targetDir)

        console.log("Upload complete!");
    } catch (err) {
        console.error("FTP Error:", err);
    } finally {
        client.close();
    }
}

deploy();
