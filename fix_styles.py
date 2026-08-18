import os
import re

def fix_classes(content):
    # Remove dark:bg-white or dark:bg-white/60 if followed by dark:bg-slate-
    # We do a naive replace:
    content = content.replace("dark:bg-white dark:bg-slate-800", "dark:bg-slate-800")
    content = content.replace("dark:bg-white dark:bg-slate-900", "dark:bg-slate-900")
    content = content.replace("dark:bg-white/60 dark:bg-slate-900", "dark:bg-slate-900")
    content = content.replace("dark:border-slate-200 dark:border-slate-700", "dark:border-slate-700")
    
    # Also add text-slate-900 dark:text-white to any className string that contains focus:ring
    # if it doesn't already have text color.
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if '<input' in line or '<select' in line or 'className=' in line:
            if 'focus:outline-none' in line and 'focus:ring' in line:
                if 'text-slate-900' not in line and 'text-slate-' not in line and 'text-white' not in line:
                    lines[i] = line.replace('className="', 'className="text-slate-900 dark:text-white ')
    return '\n'.join(lines)

for root, _, files in os.walk('c:/Users/Admin/.gemini/antigravity/scratch/edutrack/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            orig_content = content
            content = fix_classes(content)
            
            if content != orig_content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Fixed {path}')
