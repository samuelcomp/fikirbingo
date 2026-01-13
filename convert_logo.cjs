const fs = require('fs');
const path = require('path');

const logoPath = 'C:\\Users\\MEGAUPLOAD\\.gemini\\antigravity\\brain\\f034a63b-897b-4788-894d-312ced5ea814\\fikir_bingo_premium_logo_1768303669555.png';
const outputPath = path.join(__dirname, 'src', 'assets', 'logo.js');

if (!fs.existsSync(path.join(__dirname, 'src', 'assets'))) {
    fs.mkdirSync(path.join(__dirname, 'src', 'assets'), { recursive: true });
}

try {
    const data = fs.readFileSync(logoPath);
    const base64 = data.toString('base64');
    const content = `export const logoBase64 = "data:image/png;base64,${base64}";\n`;
    fs.writeFileSync(outputPath, content);
    console.log('✅ Logo converted and saved to src/assets/logo.js');
} catch (err) {
    console.error('❌ Error converting logo:', err);
}
