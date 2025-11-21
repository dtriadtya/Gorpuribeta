const fs = require('fs');
const path = require('path');
const marked = require('marked');

async function main() {
  const mdPath = path.join(__dirname, '..', 'docs', 'TESTING_CHAPTER.md');
  const outPath = path.join(__dirname, '..', 'artifacts', 'TESTING_CHAPTER.pdf');
  const md = fs.readFileSync(mdPath, 'utf8');
  const rendered = typeof marked === 'function' ? marked(md) : marked.parse(md);
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial,Helvetica,sans-serif;margin:40px;line-height:1.4}pre{background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto}code{background:#f1f1f1;padding:2px 4px;border-radius:4px}h1,h2,h3{color:#111}</style></head><body>${rendered}</body></html>`;

  // Dynamically require puppeteer to avoid adding to package.json manually
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    console.log('puppeteer not installed. Installing now...');
    const { execSync } = require('child_process');
    execSync('npm i puppeteer@20 --no-audit --silent', { stdio: 'inherit' });
    puppeteer = require('puppeteer');
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outPath, format: 'A4', printBackground: true });
  await browser.close();
  console.log('PDF created at', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
