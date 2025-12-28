import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

console.log('Fixing .env file encoding...');

if (fs.existsSync(envPath)) {
    const rawBuffer = fs.readFileSync(envPath);
    let content = rawBuffer.toString('utf8');

    // Check if it looks like garbage (lots of null bytes typical of utf16 read as utf8)
    if (content.includes('\u0000')) {
        console.log('Detected likely UTF-16 encoding. Converting to UTF-8...');
        content = rawBuffer.toString('utf16le');

        // Write back as UTF-8
        fs.writeFileSync(envPath, content, 'utf8');
        console.log('Successfully converted .env to UTF-8!');
        console.log('Content preview:', content.substring(0, 50).replace(/\r/g, '').replace(/\n/g, ' '));

    } else {
        console.log('File seems to be UTF-8 already.');
        // Ensure no BOM
        if (content.charCodeAt(0) === 0xFEFF) {
            console.log('Removing BOM...');
            fs.writeFileSync(envPath, content.substring(1), 'utf8');
        }
    }
} else {
    console.error('.env file not found.');
}
