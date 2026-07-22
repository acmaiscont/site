# Governança de Deploy e Arquitetura do Projeto

Este documento detalha o funcionamento da arquitetura deste projeto, especialmente abordando a diferença entre o ambiente de desenvolvimento local (Node.js) e o ambiente de produção estático (GitHub Pages), e estabelece regras claras de deploy para que não ocorram quebras visuais e de rotas (como páginas em branco ou sem formatação).

## 1. O Problema das Quebras Visuais

Durante o desenvolvimento, o projeto utiliza um servidor Express (`server.js`) que:
1. Serve as rotas de páginas apontando para a pasta `/views` (ex: `res.sendFile('/views/index.html')`).
2. Serve recursos estáticos (CSS, imagens e JS do front-end) a partir da pasta `/public` de forma "transparente" na raiz (ex: `/css/style.css`).

**O que acontece no GitHub Pages:**
O GitHub Pages é um servidor puramente estático. Ele **NÃO executa o `server.js`** nem possui regras de roteamento dinâmico. Ele apenas pega os arquivos exatamente onde estão e os serve no navegador.

- Se a página HTML estiver em `/views/index.html`, o usuário teria que acessar `seusite.com/views/`.
- Se o HTML estiver na raiz e referenciar `<link href="/css/style.css">`, mas o CSS estiver dentro de `/public/css/style.css`, **o GitHub Pages não encontrará o CSS** e a página perderá todos os elementos visuais (ficando apenas texto).

## 2. A Solução (Regra de Deploy)

Para que o site funcione perfeitamente no GitHub Pages, os arquivos do front-end devem ser consolidados na raiz da branch de deploy (`gh-pages`).

A estrutura na branch `gh-pages` DEVE obrigatoriamente ser:
```
/ (raiz)
├── index.html (copiado de /views/)
├── dashboard.html (copiado de /views/)
├── colaborador_dashboard.html (copiado de /views/)
├── colaborador_login.html (copiado de /views/)
├── css/ (copiado de /public/css/)
├── img/ (copiado de /public/img/)
└── js/ (copiado de /public/js/) Se houver
```

## 3. Como Fazer o Deploy Corretamente

Sempre que fizer alterações no HTML (`views/`) ou no CSS/Imagens (`public/`), você deve transferi-los para a raiz da branch `gh-pages` antes de empurrar para o servidor online.

### Comando Manual de Deploy (No Windows / PowerShell):
Caso precise fazer o deploy manual a partir da branch `main`, siga os passos:

```powershell
# 1. Mude para a branch gh-pages
git checkout gh-pages

# 2. Copie os arquivos de views para a raiz
Copy-Item -Path views\*.html -Destination . -Force

# 3. Copie os arquivos de public para a raiz
Copy-Item -Path public\* -Destination . -Recurse -Force

# 4. Adicione, faça o commit e envie (Push)
git add .
git commit -m "Deploy atualizado com arquivos de views e public na raiz"
git push origin gh-pages

# 5. Volte para a branch main
git checkout main
```

## 4. O Backend (Node.js e JSON)

Lembre-se que funções como salvar clientes e editar banco de dados (`data/clients.json`) **NÃO FUNCIONAM** no GitHub Pages. Se o objetivo final é usar o painel do cliente de forma dinâmica na internet, este projeto precisará ser hospedado em um serviço como **Render, Railway, Heroku ou Vercel** no futuro.

## 5. Caminhos Absolutos vs Relativos no JavaScript

**Atenção aos scripts Inline e arquivos JS:** Caminhos de imagens e CSS manipulados no JavaScript (por exemplo, na função de alternar Tema Light/Dark: `img.src = '/img/logo.png'`) também **NÃO FUNCIONAM** no GitHub Pages se começarem com `/`.
O GitHub Pages considera a barra `/` como a raiz do domínio global (ex: `usuario.github.io/img/`) em vez do subdiretório do repositório (ex: `usuario.github.io/site/img/`).

Para evitar a quebra do logo ou de outras imagens controladas via JavaScript:
- **ERRADO:** `img.src = '/img/logo.png';`
- **CERTO:** `img.src = './img/logo.png';`

Certifique-se de que caminhos relativos (com `./`) sejam usados tanto no HTML `<img src="...">` quanto no JavaScript `img.src = ...` quando entre aspas simples.

---
**Data da Criação:** 22/07/2026
**Propósito:** Evitar a perda de CSS e rotas devido à incompatibilidade de caminhos entre o Express (Local) e o GitHub Pages (Produção).
