import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

console.log('Checking .env file...');

if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env file not found!');
    process.exit(1);
}

let envContent = fs.readFileSync(envPath);
let contentStr = envContent.toString('utf8');
let match = contentStr.match(/VITE_GEMINI_API_KEY\s*=\s*["']?([^"'\s]+)["']?/);

if (!match) {
    console.log('UTF-8 parse failed. Trying UTF-16LE...');
    contentStr = envContent.toString('utf16le');
    match = contentStr.match(/VITE_GEMINI_API_KEY\s*=\s*["']?([^"'\s]+)["']?/);
}

if (!match) {
    console.error('ERROR: VITE_GEMINI_API_KEY not found in .env file.');
    console.log('File size:', envContent.length, 'bytes');
    console.log('First 50 characters of file content (safe preview):');
    console.log(contentStr.substring(0, 50).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));

    // Help debug what keys ARE there
    const lines = contentStr.split(/\r?\n/);
    console.log('Keys found in file:');
    lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length > 1) {
            console.log(`- ${parts[0].trim()}`);
            if (parts[0].trim().includes('API_KEY')) {
                console.log('  (Did you mean VITE_GEMINI_API_KEY?)');
            }
        }
    });
    process.exit(1);
}

const apiKey = match[1].trim();
console.log('API Key found!');

// Verification Request
const model = 'gemini-2.0-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const req = https.request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('SUCCESS: API Key is VALID and working!');
        } else {
            console.error(`FAILURE: API returned ${res.statusCode}`);
            console.error('Details:', body);
        }
    });
});

req.write(JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] }));
req.end();
