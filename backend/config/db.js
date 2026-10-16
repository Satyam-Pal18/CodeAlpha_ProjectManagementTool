const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

let pool = null;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'codealpha_project_management_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

async function initDatabase() {
  try {
    // 1. First connect without DB to create database if not exists
    const initConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await initConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await initConn.end();

    // 2. Create MySQL Connection Pool
    pool = mysql.createPool(dbConfig);

    console.log(`✅ [MySQL] Connected to MySQL Server at ${dbConfig.host}:${dbConfig.port}`);
    console.log(`🗄️  [MySQL] Target Database: "${dbConfig.database}"`);

    // 3. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        role VARCHAR(50) DEFAULT 'Developer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        owner_id INT NOT NULL,
        color VARCHAR(30) DEFAULT '#8b5cf6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(50) DEFAULT 'Member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_member (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status ENUM('backlog', 'todo', 'in_progress', 'review', 'done') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        assigned_to INT NULL,
        created_by INT NOT NULL,
        due_date DATE NULL,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log(`📋 [MySQL] All 6 Tables verified/created successfully in MySQL.`);

    // 4. Seed initial default demo data if users table is empty
    const seedData = require('../utils/seedData');
    await seedData(pool);

    return pool;
  } catch (error) {
    console.error(`❌ [MySQL] Fatal Database Connection Error:`, error.message);
    throw error;
  }
}

// Helpers for clean async queries
async function dbQuery(sql, params = []) {
  if (!pool) throw new Error('Database pool has not been initialized.');
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function dbGet(sql, params = []) {
  if (!pool) throw new Error('Database pool has not been initialized.');
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

async function dbRun(sql, params = []) {
  if (!pool) throw new Error('Database pool has not been initialized.');
  const [result] = await pool.query(sql, params);
  return result;
}

module.exports = {
  initDatabase,
  dbQuery,
  dbGet,
  dbRun,
  getPool: () => pool
};
