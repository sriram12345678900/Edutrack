const fs = require('fs');
const path = require('path');

function fixClasses(content) {
    let newContent = content;
    // Replace dark:bg-white when followed by another dark:bg-...
    newContent = newContent.replace(/dark:bg-white(?:\/\d+)?\s+(?=.*?dark:bg-)/g, '');
    newContent = newContent.replace(/dark:bg-white\s+(?=.*?dark:bg-)/g, '');
    // Replace dark:border-white when followed by another dark:border-...
    newContent = newContent.replace(/dark:border-white(?:\/\d+)?\s+(?=.*?dark:border-)/g, '');
    
    // Replace bg-white dark:bg-white
    newContent = newContent.replace(/bg-white(?:\/\d+)?\s+dark:bg-white(?:\/\d+)?\s+/g, 'bg-white ');
    
    return newContent;
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
