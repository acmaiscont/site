# Governança de Deploy e Arquitetura do Projeto ACMais

Este documento detalha o funcionamento da arquitetura deste projeto, estabelece regras de deploy e explica as principais funcionalidades e animações presentes no site.

## 1. O Problema das Quebras Visuais e Rotas
Durante o desenvolvimento, o projeto utiliza um servidor Express (server.js) que serve as rotas apontando para a pasta /views.
O GitHub Pages, no entanto, é um servidor puramente estático e não executa o server.js.

- Se a página HTML estiver em /views/index.html, no GitHub Pages o usuário teria que acessar seusite.com/views/.

### Regra de Deploy
Para que o site funcione perfeitamente no GitHub Pages, os arquivos do front-end devem ser consolidados na **raiz** da branch de deploy (gh-pages).
Sempre que fizer alterações, você deve transferi-los para a raiz antes de enviar para o servidor online.

### Comando Manual de Deploy (No Windows / PowerShell):
\\\powershell
git checkout gh-pages
Copy-Item -Path views\*.html -Destination . -Force
Copy-Item -Path public\* -Destination . -Recurse -Force
Copy-Item -Path data\* -Destination .\data\ -Recurse -Force
git add .
git commit -m "Deploy"
git push origin gh-pages
git checkout main
\\\

## 2. Principais Funcionalidades do Site

### A. Carrossel 3D (Efeito Fisheye Infinito)
Na seção "A Cara da ACMais", a equipe é exibida em um carrossel 3D contínuo (loop infinito).
- **Como funciona:** O script Javascript (FisheyeCarousel em iews/index.html) calcula a distância matemática de cada membro em relação ao centro e adiciona classes CSS (card-active, card-prev-1, etc). 
- **Ocultação Automática:** É configurado para exibir no máximo 5 pessoas (1 no centro e 2 em cada lado). O resto dos membros recebem a classe card-hidden.
- **Rolagem Idle:** Se o usuário não interagir, o carrossel gira automaticamente a cada 4 segundos.

### B. Fallback de API (GitHub Pages vs Localhost)
Como o GitHub Pages não suporta requisições para /api/team (pois não tem backend), o carregamento da equipe primeiro tenta buscar o arquivo estático diretamente (./data/team_members.json). Caso falhe (comum no localhost se a pasta não estiver servida estaticamente), ele usa o bloco catch e faz um fallback para a API do Node.js /api/team.
Isso garante que o site funcione simultaneamente em produção e desenvolvimento!

### C. Parallax e Elementos Flutuantes
O site conta com um gerenciador de parallax (ParallaxManager). Ele monitora o scroll da página e desloca levemente os elementos que possuem atributos data-speed e data-direction. Isso confere um visual moderno e imersivo.

### D. Scroll Revelação (Fade In)
Os elementos principais das seções são revelados aos poucos conforme o usuário faz o scroll da página, através de classes eveal e da API IntersectionObserver do Javascript, trazendo elegância similar a grandes sites institucionais.

### E. Tema Claro / Escuro (Dark Mode)
O site possui um seletor de tema na navegação. A preferência do usuário é salva no localStorage do navegador, então quando ele retorna ao site, seu tema favorito é lembrado.

## 3. Gestão de Dados (O Backend Node.js)
Funções como cadastrar colaboradores (/colaborador_dashboard.html) salvam em arquivos .json usando o backend server.js.
Como mencionado, o GitHub Pages **NÃO SALVA** dados permanentemente pois não processa back-end. Para uso real do painel administrativo e persistência na web, a aplicação Node.js deve ser hospedada em um serviço Cloud (como Render, Heroku ou VPS).
