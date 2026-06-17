const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'index.html');
const viewsPath = path.join(__dirname, 'views');
const cssPath = path.join(__dirname, 'public', 'css');
const jsPath = path.join(__dirname, 'public', 'js');

// Create directories
fs.mkdirSync(viewsPath, { recursive: true });
fs.mkdirSync(cssPath, { recursive: true });
fs.mkdirSync(jsPath, { recursive: true });

let html = fs.readFileSync(srcPath, 'utf8');

// Extract all styles and combine them
let styles = '';
html = html.replace(/<style>([\s\S]*?)<\/style>/gi, (match, content) => {
    styles += content + '\n';
    return ''; // remove from html
});

// Extract specific scripts (excluding JSON-LD) and combine them
let scripts = '';
html = html.replace(/<script>([\s\S]*?)<\/script>/gi, (match, content) => {
    scripts += content + '\n';
    return ''; // remove from html
});

// Write extracted CSS and JS
if (styles) {
    fs.writeFileSync(path.join(cssPath, 'style.css'), styles);
    // Inject the CSS link right before the </head> tag if it's not already there
    html = html.replace('</head>', '  <link rel="stylesheet" href="/css/style.css">\n</head>');
}
if (scripts) {
    fs.writeFileSync(path.join(jsPath, 'main.js'), scripts);
    // Inject the JS script tag right before the </body> tag
    html = html.replace('</body>', '  <script src="/js/main.js"></script>\n</body>');
}

fs.writeFileSync(path.join(viewsPath, 'index.html'), html);
// we can also remove the old index.html now
fs.unlinkSync(srcPath);

console.log("Extraction complete.");
