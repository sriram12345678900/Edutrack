const fs = require('fs');
const path = require('path');

function fixClasses(content) {
    let newContent = content;
    newContent = newContent.replace(/dark:bg-white dark:bg-slate-800/g, 'dark:bg-slate-800');
    newContent = newContent.replace(/dark:bg-white dark:bg-slate-900/g, 'dark:bg-slate-900');
    newContent = newContent.replace(/dark:bg-white\/60 dark:bg-slate-900\/50/g, 'dark:bg-slate-900\/50');
    newContent = newContent.replace(/dark:border-slate-200 dark:border-slate-700/g, 'dark:border-slate-700');
    newContent = newContent.replace(/bg-white dark:bg-white/g, 'bg-white');
    
    let lines = newContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('className="')) {
            if (line.includes('focus:outline-none') && line.includes('focus:ring')) {
                if (!line.includes('text-slate-900') && !line.includes('text-slate-700') && !line.includes('text-white') && !line.includes('text-slate-800')) {
                    lines[i] = line.replace('className="', 'className="text-slate-900 dark:text-white ');
                }
            }
        }
    }
    return lines.join('\n');
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src/app');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = fixClasses(content);
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Fixed ' + file);
    }
});
