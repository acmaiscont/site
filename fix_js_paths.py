import os
import re

views_dir = r'c:\Users\Ryan\OneDrive - JCM CONTABILIDADE\Suporte - Desenvolvimento\Site\VIsualVersionACMais\views'

for filename in os.listdir(views_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(views_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace '/img/...' with './img/...'
        content = re.sub(r"'/img/", "'./img/", content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("JS Paths updated.")
