const fs = require('fs');
const path = require('path');

const replacements = [
    { pattern: /background:\s*["']white["']/g, repl: 'background: "var(--bg-card)"' },
    { pattern: /background:\s*["']#ffffff["']/g, repl: 'background: "var(--bg-primary)"' },
    { pattern: /background:\s*["']#F9FAFB["']/g, repl: 'background: "var(--bg-secondary)"' },
    { pattern: /background:\s*["']#F3F4F6["']/g, repl: 'background: "var(--bg-tertiary)"' },
    { pattern: /color:\s*["']#111827["']/g, repl: 'color: "var(--text-primary)"' },
    { pattern: /color:\s*["']#4B5563["']/g, repl: 'color: "var(--text-secondary)"' },
    { pattern: /color:\s*["']#6B7280["']/g, repl: 'color: "var(--text-tertiary)"' },
    { pattern: /border:\s*["']1px solid #E5E7EB["']/g, repl: 'border: "1px solid var(--border-primary)"' },
    { pattern: /borderBottom:\s*["']1px solid #E5E7EB["']/g, repl: 'borderBottom: "1px solid var(--border-primary)"' },
    { pattern: /borderTop:\s*["']1px solid #E5E7EB["']/g, repl: 'borderTop: "1px solid var(--border-primary)"' },
    { pattern: /borderRight:\s*["']1px solid #E5E7EB["']/g, repl: 'borderRight: "1px solid var(--border-primary)"' },
    { pattern: /borderColor:\s*["']#E5E7EB["']/g, repl: 'borderColor: "var(--border-primary)"' },
];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    
    replacements.forEach(({pattern, repl}) => {
        newContent = newContent.replace(pattern, repl);
    });
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated', file);
    }
});
