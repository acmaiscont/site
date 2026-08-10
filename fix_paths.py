import os
import re

views_dir = r'c:\Users\Ryan\OneDrive - JCM CONTABILIDADE\Suporte - Desenvolvimento\Site\VIsualVersionACMais\views'

for filename in os.listdir(views_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(views_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace href="/css/..." with href="./css/..."
        content = re.sub(r'href="/css/', 'href="./css/', content)
        # Replace src="/img/..." with src="./img/..."
        content = re.sub(r'src="/img/', 'src="./img/', content)
        # Replace action="/api/..." with action="./api/..." (just in case)
        # We probably don't need to change API routes because they don't work on GH Pages anyway
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Paths updated.")
