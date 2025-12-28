import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env file not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/VITE_GEMINI_API_KEY\s*=\s*["']?([^"'\s]+)["']?/);
if (!match) { process.exit(1); }
const apiKey = match[1].trim();

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const data = JSON.parse(body);
            console.log('AVAILABLE MODELS:');
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.error(`ERROR ${res.statusCode}: ${body}`);
        }
    });
}).on('error', e => console.error(e));
