const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Setup image upload storage for leaders
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'img', 'equipe'));
    },
    filename: function (req, file, cb) {
        // Keep the original filename or standardize it
        cb(null, file.originalname.toLowerCase().replace(/[^a-z0-9.]/g, '_'));
    }
});
const upload = multer({ storage: storage });

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'acmais-super-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 3600000 // 1 hour session
    }
}));

// Serve static assets from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Mock Databases/JSON state persistence
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

const COLLABORATORS_FILE = path.join(DATA_DIR, 'collaborators.json');
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, 'team_members.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

// Default starting collaborators
const defaultCollaborators = [
    { id: 1, name: 'Administrador ACMais', email: 'admin@acmais.com.br', password: 'admin2026', role: 'admin' },
    { id: 2, name: 'Coordenadora Graziele', email: 'grazi@acmais.com.br', password: 'grazi2026', role: 'coordenador' },
    { id: 3, name: 'Mara Conformidade', email: 'mara@acmais.com.br', password: 'mara2026', role: 'colaborador' }
];

// Default starting leadership team members ("A cara da acmais")
const defaultTeamMembers = [
    { id: 'andrezza', name: 'Andrezza', role: 'Diretora', level: 'diretoria', image: 'public/img/equipe/andrezza.jpg', fallback: 'AO' },
    { id: 'patricia', name: 'Patrícia Jota', role: 'Diretora de Operações', level: 'diretoria', image: 'public/img/equipe/patricia.jpg', fallback: 'PJ' },
    { id: 'graziele', name: 'Graziele', role: 'Coordenadora Contábil', level: 'coordenacao', image: 'public/img/equipe/graziele.jpg', fallback: 'GR' },
    { id: 'lucelia', name: 'Lucelia', role: 'Coordenadora Fiscal', level: 'coordenacao', image: 'public/img/equipe/lucelia.jpg', fallback: 'LC' },
    { id: 'fernanda', name: 'Fernanda', role: 'Coordenadora Dep. Pessoal', level: 'coordenacao', image: 'public/img/equipe/fernanda.jpg', fallback: 'FN' },
    { id: 'mara', name: 'Mara', role: 'Conformidade e Legalização', level: 'coordenacao', image: 'public/img/equipe/mara.jpg', fallback: 'MR' }
];

// Default starting clients
const defaultClients = [
    { id: 1, name: 'Empresa Principal Ltda', email: 'cliente@acmais.com.br', password: 'acmais2026', phone: '(31) 98765-4321' }
];

// Initialize JSON database files if they don't exist
if (!fs.existsSync(COLLABORATORS_FILE)) {
    fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(defaultCollaborators, null, 2), 'utf8');
}
if (!fs.existsSync(TEAM_MEMBERS_FILE)) {
    fs.writeFileSync(TEAM_MEMBERS_FILE, JSON.stringify(defaultTeamMembers, null, 2), 'utf8');
}
if (!fs.existsSync(CLIENTS_FILE)) {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(defaultClients, null, 2), 'utf8');
}

function getCollaborators() {
    return JSON.parse(fs.readFileSync(COLLABORATORS_FILE, 'utf8'));
}

function saveCollaborators(data) {
    fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getTeamMembers() {
    return JSON.parse(fs.readFileSync(TEAM_MEMBERS_FILE, 'utf8'));
}

function saveTeamMembers(data) {
    fs.writeFileSync(TEAM_MEMBERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getClients() {
    return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
}

function saveClients(data) {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Authentication Middlewares
const requireClientAuth = (req, res, next) => {
    if (req.session && req.session.userId && req.session.userType === 'cliente') {
        return next();
    } else {
        res.status(401).redirect('/?error=unauthorized');
    }
};

const requireCollabAuth = (req, res, next) => {
    if (req.session && req.session.userId && req.session.userType === 'colaborador') {
        return next();
    } else {
        res.status(401).redirect('/colaborador/login?error=unauthorized');
    }
};

// Root Page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Portal de Colaboradores: Route to serve login/dashboard
app.get('/colaborador', (req, res) => {
    if (req.session && req.session.userId && req.session.userType === 'colaborador') {
        res.sendFile(path.join(__dirname, 'views', 'colaborador_dashboard.html'));
    } else {
        res.redirect('/colaborador/login');
    }
});

app.get('/colaborador/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'colaborador_login.html'));
});

// Protected Route: Dashboard (Área do Cliente)
app.get('/dashboard', requireClientAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// API: Team Members (Used by home page & dashboard)
app.get('/api/team', (req, res) => {
    res.json(getTeamMembers());
});

// API: Client Portal Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const clients = getClients();
    
    const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    if (client) {
        req.session.userId = client.id; 
        req.session.email = client.email;
        req.session.name = client.name;
        req.session.userType = 'cliente';
        return res.json({ success: true, redirect: '/dashboard' });
    }
    
    res.status(401).json({ success: false, message: 'E-mail ou senha inválidos' });
});

// API: Colaborador Login Route
app.post('/api/colaborador/login', (req, res) => {
    const { email, password } = req.body;
    const collabs = getCollaborators();
    
    const user = collabs.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    if (user) {
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.name = user.name;
        req.session.role = user.role; // admin, coordenador, colaborador
        req.session.userType = 'colaborador';
        return res.json({ success: true, user: { name: user.name, role: user.role }, redirect: '/colaborador' });
    }
    
    res.status(401).json({ success: false, message: 'E-mail ou senha de colaborador inválidos.' });
});

// API: Fetch current logged-in user profile
app.get('/api/profile', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            loggedIn: true,
            userType: req.session.userType,
            name: req.session.name || 'Cliente ACMais',
            email: req.session.email,
            role: req.session.role || null
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// API: Logout Route
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao fazer logoff' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, redirect: '/' });
    });
});

// PROTECTED APIs FOR COLLABORATORS

// 1. Fetch Collaborator List (Admin & Coordenador roles)
app.get('/api/collaborators', requireCollabAuth, (req, res) => {
    if (req.session.role !== 'admin' && req.session.role !== 'coordenador') {
        return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }
    const collabs = getCollaborators().map(c => ({ id: c.id, name: c.name, email: c.email, role: c.role }));
    res.json(collabs);
});

// 2. Create/Register Collaborator (Coordenador & Admin roles can register)
app.post('/api/collaborators', requireCollabAuth, (req, res) => {
    // Both Coordinator and Admin can register collaborators
    if (req.session.role !== 'admin' && req.session.role !== 'coordenador') {
        return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }
    
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
    }

    const collabs = getCollaborators();
    if (collabs.some(c => c.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'E-mail já cadastrado.' });
    }

    const newId = collabs.length > 0 ? Math.max(...collabs.map(c => c.id)) + 1 : 1;
    const newCollab = { id: newId, name, email, password, role };
    collabs.push(newCollab);
    saveCollaborators(collabs);

    res.json({ success: true, message: 'Colaborador cadastrado com sucesso.' });
});

// 3. Edit/Delete Collaborator (Admin only)
app.delete('/api/collaborators/:id', requireCollabAuth, (req, res) => {
    // Only Admin can delete/modify collaborators
    if (req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Apenas Administradores podem excluir colaboradores.' });
    }

    const targetId = parseInt(req.params.id);
    let collabs = getCollaborators();
    
    if (targetId === req.session.userId) {
        return res.status(400).json({ success: false, message: 'Você não pode excluir a si mesmo.' });
    }

    const initialLength = collabs.length;
    collabs = collabs.filter(c => c.id !== targetId);
    
    if (collabs.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Colaborador não encontrado.' });
    }

    saveCollaborators(collabs);
    res.json({ success: true, message: 'Colaborador excluído com sucesso.' });
});

// 4. Update A Cara da ACMais leaders (Admin only)
app.post('/api/team/update', requireCollabAuth, upload.single('imageFile'), (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Apenas Administradores podem atualizar a liderança.' });
    }

    const { memberId, name, role, level, fallback } = req.body;
    if (!memberId || !name || !role || !level) {
        return res.status(400).json({ success: false, message: 'Dados incompletos.' });
    }

    let team = getTeamMembers();
    const index = team.findIndex(t => t.id === memberId);

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Membro da liderança não encontrado.' });
    }

    // Update fields
    team[index].name = name;
    team[index].role = role;
    team[index].level = level;
    if (fallback) team[index].fallback = fallback.toUpperCase();

    // Update image if a file was uploaded
    if (req.file) {
        team[index].image = `public/img/equipe/${req.file.filename}`;
    }

    saveTeamMembers(team);
    res.json({ success: true, message: 'Dados do membro atualizados com sucesso.', updatedMember: team[index] });
});

// 5. Fetch Client List (Admin & Coordenador roles)
app.get('/api/clients', requireCollabAuth, (req, res) => {
    if (req.session.role !== 'admin' && req.session.role !== 'coordenador') {
        return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }
    res.json(getClients());
});

// 6. Create/Register Client (Coordenador & Admin roles can register)
app.post('/api/clients', requireCollabAuth, (req, res) => {
    if (req.session.role !== 'admin' && req.session.role !== 'coordenador') {
        return res.status(403).json({ success: false, message: 'Sem permissão.' });
    }
    
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nome, E-mail e Senha são obrigatórios.' });
    }

    const clients = getClients();
    if (clients.some(c => c.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Cliente com este e-mail já cadastrado.' });
    }

    const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
    const newClient = { id: newId, name, email, password, phone: phone || '' };
    clients.push(newClient);
    saveClients(clients);

    res.json({ success: true, message: 'Cliente cadastrado com sucesso.' });
});

// 7. Delete Client (Admin only)
app.delete('/api/clients/:id', requireCollabAuth, (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Apenas Administradores podem excluir clientes.' });
    }

    const targetId = parseInt(req.params.id);
    let clients = getClients();
    const initialLength = clients.length;
    clients = clients.filter(c => c.id !== targetId);
    
    if (clients.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
    }

    saveClients(clients);
    res.json({ success: true, message: 'Cliente excluído com sucesso.' });
});

// Start server
app.listen(port, () => {
    console.log(`ACMais server rodando em http://localhost:${port}`);
});
