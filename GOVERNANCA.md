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

### F. Padrão de Textos e Caracteres Especiais
Para manter a compatibilidade total de codificação e layout, não utilize o caractere travessão longo (—) nos textos HTML do site. Caso seja necessário espaçar ideias, utilize o hífen comum (-) ou apenas vírgulas e pontos.

## 4. Histórico de Decisões e Implementações (Log de Governança)
Abaixo está o registro das principais evoluções do projeto e o motivo técnico pelo qual foram implementadas:

* **Compatibilidade Estática (Deploy GitHub Pages):** O site foi reestruturado para permitir deploy no GitHub Pages. Como este não roda Node.js (server.js), os arquivos HTML e assets (/public) são sempre movidos para a raiz na branch gh-pages.
* **API Fallback no Frontend:** A função de carregar a equipe tenta acessar primeiro o arquivo estático ./data/team_members.json. Se falhar (ex: rodando localhost via Express), aciona um fallback para a rota /api/team. Isso mantém o sistema flexível para produção (estático) e desenvolvimento (dinâmico).
* **Carrossel 3D (Fisheye Infinito):** A exibição de liderança foi convertida de grids estáticos para um carrossel 3D infinito. *Motivo:* Os grids quebravam o layout quando havia número ímpar ou excesso de diretores. O carrossel resolve isso calculando distâncias modulares, mostrando no máximo 5 pessoas e escondendo os excedentes sem quebrar o CSS.
* **Transições (Fade In) [Revertido]:** Tentamos aplicar IntersectionObserver para revelar as sessões no scroll (estilo santionispirits.com). *Motivo da Reversão:* O cliente considerou o efeito muito rápido/lento ou obstrutivo, optando por preservar a velocidade bruta e o carregamento instantâneo de conteúdo.
* **Padronização de Caracteres (Em-dash):** O caractere travessão longo (—) foi removido globalmente da base de código, pois interagia mal com conversores de encoding de arquivo (UTF-8 vs MacRoman), quebrando os caracteres acentuados. A regra de governança agora orienta o uso exclusivo do hífen comum (-).
* **CRUD de Colaboradores:** Criação de um painel e rotas no backend (Node.js) capazes de ler e reescrever dinamicamente o arquivo JSON da equipe, permitindo a gestão fácil de funcionários, contornando a complexidade de um banco de dados real (SQL) na fase inicial.

