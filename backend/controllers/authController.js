const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun, dbQuery } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'codealpha_project_management_super_secret_jwt_key_2026';

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=8b5cf6,f43f5e`;

    const result = await dbRun(
      'INSERT INTO users (name, email, password, avatar, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, defaultAvatar, role || 'Developer']
    );

    const token = jwt.sign(
      { id: result.insertId, email: cleanEmail, name: name.trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      avatar: defaultAvatar,
      role: role || 'Developer'
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter your email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password;

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await dbQuery('SELECT id, name, email, avatar, role, created_at FROM users ORDER BY name ASC');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};
