import sys
import re

file_path = r'c:\Users\Ryan\OneDrive - JCM CONTABILIDADE\Suporte - Desenvolvimento\Site\VIsualVersionACMais\views\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the img tag
new_img = '<img src=\"/img/logo ACMAIS CCBPOE Dark.png\" alt=\"ACMais - Logo\" id=\"theme-logo\">'
content = re.sub(r'<img\s+src=\"data:image/png;base64,[^\"]+\"\s+alt=\"ACMais - Logo\"\s+id=\"theme-logo\">', new_img, content)

# Insert the button
button_html = '''</a>
            <button id=\"theme-toggle\" class=\"btn-theme-toggle\" aria-label=\"Alternar tema\">
              <svg class=\"icon-sun\" xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display: none;\"><circle cx=\"12\" cy=\"12\" r=\"5\"></circle><line x1=\"12\" y1=\"1\" x2=\"12\" y2=\"3\"></line><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"23\"></line><line x1=\"4.22\" y1=\"4.22\" x2=\"5.64\" y2=\"5.64\"></line><line x1=\"18.36\" y1=\"18.36\" x2=\"19.78\" y2=\"19.78\"></line><line x1=\"1\" y1=\"12\" x2=\"3\" y2=\"12\"></line><line x1=\"21\" y1=\"12\" x2=\"23\" y2=\"12\"></line><line x1=\"4.22\" y1=\"19.78\" x2=\"5.64\" y2=\"18.36\"></line><line x1=\"18.36\" y1=\"5.64\" x2=\"19.78\" y2=\"4.22\"></line></svg>
              <svg class=\"icon-moon\" xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z\"></path></svg>
            </button>'''

# We want to place the button after the login portal anchor
content = re.sub(r'(class=\"btn-nav-portal.*?>[\s\S]*?</a>)', r'\1\n' + button_html, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
