import os

file_path = r'c:\Users\Ryan\OneDrive - JCM CONTABILIDADE\Suporte - Desenvolvimento\Site\VIsualVersionACMais\views\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if '<img' in line and 'src="data:image/png;base64,' in line:
        # Start of the bad img tag
        new_lines.append('            <img \n')
        new_lines.append('              src="/img/logo ACMAIS CCBPOE Dark.png" \n')
        new_lines.append('              alt="Logo ACMais" \n')
        new_lines.append('              class="theme-aware-logo nav-logo"\n')
        new_lines.append('              id="theme-logo"\n')
        new_lines.append('            >\n')
        if '>' not in line:
            skip = True
        continue
    
    if skip:
        if '>' in line:
            skip = False
        continue
    
    # Fix the extra </a> tags
    # 112:             <a href="#area-cliente" class="btn-nav-portal" aria-label="Acessar Ã¡rea do cliente">Ã rea do Cliente</a>
    # 113: </a>
    if line.strip() == '</a>' and new_lines and 'class="btn-nav-portal"' in new_lines[-1]:
        continue

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Success")
