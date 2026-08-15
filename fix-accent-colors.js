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

    let newContent = content.replace(/className=(["'{`])([\s\S]*?)(["'}`])/g, (match, p1, classes, p3) => {
        if (colorfulPattern.test(classes)) {
            return match; 
        }
        
        let replaced = classes;
        const colors = ["indigo", "emerald", "amber", "purple", "pink", "fuchsia", "teal", "blue", "rose", "cyan"];
        
        colors.forEach(color => {
            const regex = new RegExp(`(?<!dark:)\\btext-${color}-([34]00)\\b(?!(\\/|space|-))`, "g");
            replaced = replaced.replace(regex, `dark:text-${color}-$1 text-${color}-700`);
            
            const regex200 = new RegExp(`(?<!dark:)\\btext-${color}-200\\b(?!(\\/|space|-))`, "g");
            replaced = replaced.replace(regex200, `dark:text-${color}-200 text-${color}-800`);
        });
        
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
