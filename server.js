const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'acmais-super-secret-key-2026', // In production, use environment variables
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS in production
        maxAge: 3600000 // 1 hour session
    }
}));

// Serve static assets from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Set up a simple route to serve the root index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Authentication Middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.redirect('/?error=unauthorized');
    }
};

// API: Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // MOCK authentication - replace with actual DB validation later!
    // Hardcoded credentials for demonstration
    if (email === 'cliente@acmais.com.br' && password === 'acmais2026') {
        req.session.userId = 1; 
        req.session.email = email;
        return res.json({ success: true, redirect: '/dashboard' });
    }
    
    res.status(401).json({ success: false, message: 'E-mail ou senha inválidos' });
});

// API: Logout Route
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao fazer logoff' });
        }
        res.clearCookie('connect.sid'); // clean up the session cookie
        res.json({ success: true, redirect: '/' });
    });
});

// Protected Route: Dashboard (Área do Cliente)
app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Start server
app.listen(port, () => {
    console.log(`ACMais server rodando em http://localhost:${port}`);
});
