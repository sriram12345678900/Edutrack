
const fs = require("fs");
const path = require("path");

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walk(dirPath, callback);
        } else if (f.endsWith(".tsx") || f.endsWith(".ts")) {
            callback(dirPath);
        }
    });
}

function removeEmojis(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    // Match emojis (this regex matches most emoji characters)
    let newContent = content.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}]/gu, "");
    
    // Sometimes emojis are followed by a space, let us remove double spaces that might result
    // Not strictly necessary, but good for cleanup.
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, "utf8");
        console.log("Removed emojis in: " + filePath);
    }
}

walk("src/app", removeEmojis);
walk("src/components", removeEmojis);
console.log("Done");

