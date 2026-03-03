import os
import glob

replacements = {
    '->': '->',
    '...': '...',
    '[OK]': '[OK]',
    '[WARN]': '[WARN]',
    '--': '--'
}

for filepath in glob.glob('**/*.py', recursive=True):
    if '.venv' in filepath or 'build\\' in filepath or 'dist\\' in filepath:
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    for old, new in replacements.items():
        if old in content:
            content = content.replace(old, new)
            modified = True
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
