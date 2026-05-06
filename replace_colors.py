import os
import glob
import re

replacements = [
    (r'background:\s*[\"\'\']white[\"\'\']', 'background: "var(--bg-card)"'),
    (r'background:\s*[\"\'\']#ffffff[\"\'\']', 'background: "var(--bg-primary)"'),
    (r'background:\s*[\"\'\']#F9FAFB[\"\'\']', 'background: "var(--bg-secondary)"'),
    (r'background:\s*[\"\'\']#F3F4F6[\"\'\']', 'background: "var(--bg-tertiary)"'),
    (r'color:\s*[\"\'\']#111827[\"\'\']', 'color: "var(--text-primary)"'),
    (r'color:\s*[\"\'\']#4B5563[\"\'\']', 'color: "var(--text-secondary)"'),
    (r'color:\s*[\"\'\']#6B7280[\"\'\']', 'color: "var(--text-tertiary)"'),
    (r'border:\s*[\"\'\']1px solid #E5E7EB[\"\'\']', 'border: "1px solid var(--border-primary)"'),
    (r'borderBottom:\s*[\"\'\']1px solid #E5E7EB[\"\'\']', 'borderBottom: "1px solid var(--border-primary)"'),
    (r'borderTop:\s*[\"\'\']1px solid #E5E7EB[\"\'\']', 'borderTop: "1px solid var(--border-primary)"'),
    (r'borderRight:\s*[\"\'\']1px solid #E5E7EB[\"\'\']', 'borderRight: "1px solid var(--border-primary)"'),
    (r'borderColor:\s*[\"\'\']#E5E7EB[\"\'\']', 'borderColor: "var(--border-primary)"'),
]

files = glob.glob('src/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in replacements:
        new_content = re.sub(pattern, repl, new_content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')
