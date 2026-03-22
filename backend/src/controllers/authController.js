const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runAsync, getAsync } = require('../config/db');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, password, role, preferred_category, preferred_location } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (role !== 'host' && role !== 'brand') {
        return res.status(400).json({ message: 'Role must be either host or brand' });
    }

    try {
        const existingUser = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await runAsync(
            'INSERT INTO users (name, email, password_hash, role, preferred_category, preferred_location) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, role, preferred_category || null, preferred_location || null]
        );

        const token = generateToken(result.id, role);

        res.status(201).json({
            id: result.id,
            name,
            email,
            role,
            preferred_category: preferred_category || null,
            preferred_location: preferred_location || null,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await getAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferred_category: user.preferred_category,
            preferred_location: user.preferred_location,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await getAsync(
            'SELECT id, name, email, role, preferred_category, preferred_location, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe };
