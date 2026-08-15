const fs = require("fs");
const path = require("path");

const colorfulPattern = /bg-(indigo|purple|pink|amber|emerald|teal|fuchsia|rose|blue|red)|from-|to-|via-|bg-gradient/;

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath, callback);
        } else if (f.endsWith(".tsx") || f.endsWith(".ts")) {
            callback(dirPath);
        }
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    let original = content;

    // Find all className="..." or className={`...`} or className={'...'}
    // This regex looks for className= followed by ", ', or { and matches until the closing quote/brace
    let newContent = content.replace(/className=(["'{`])([\s\S]*?)(["'}`])/g, (match, p1, classes, p3) => {
        // If the classes string contains colorful backgrounds, we skip replacing text colors
        // so that colorful buttons/banners retain white text
        if (colorfulPattern.test(classes)) {
            return match; 
        }
        
        let replaced = classes;
        replaced = replaced.replace(/(?<!dark:)\btext-white\b(?!(\/|space|-))/g, "dark:text-white text-slate-900");
        replaced = replaced.replace(/(?<!dark:)\btext-slate-100\b(?!(\/|space|-))/g, "dark:text-slate-100 text-slate-900");
        replaced = replaced.replace(/(?<!dark:)\btext-slate-200\b(?!(\/|space|-))/g, "dark:text-slate-200 text-slate-800");
        replaced = replaced.replace(/(?<!dark:)\btext-slate-300\b(?!(\/|space|-))/g, "dark:text-slate-300 text-slate-700");
        replaced = replaced.replace(/(?<!dark:)\btext-slate-400\b(?!(\/|space|-))/g, "dark:text-slate-400 text-slate-600");
        
        return `className=${p1}${replaced}${p3}`;
    });

    if (newContent !== original) {
        fs.writeFileSync(filePath, newContent, "utf8");
        console.log("Updated: " + filePath);
    }
}

walk("src/app", processFile);
walk("src/components", processFile);
console.log("Done");
