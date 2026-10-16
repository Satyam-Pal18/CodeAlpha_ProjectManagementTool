const bcrypt = require('bcryptjs');

async function seedData(pool) {
  try {
    const [existingUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log(`ℹ️  [MySQL] Database already populated. Skipping seeding.`);
      return;
    }

    console.log(`🌱 [MySQL] Seeding default users, projects, tasks, and comments...`);

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Insert Users
    const users = [
      ['Satyam Pal', 'satyam@example.com', hashedPassword, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Project Lead'],
      ['Alex Rivera', 'alex@example.com', hashedPassword, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Frontend Engineer'],
      ['Priya Sharma', 'priya@example.com', hashedPassword, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Backend Architect'],
      ['Marcus Chen', 'marcus@example.com', hashedPassword, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Product Designer']
    ];

    const userIds = [];
    for (const u of users) {
      const [res] = await pool.query(
        'INSERT INTO users (name, email, password, avatar, role) VALUES (?, ?, ?, ?, ?)',
        u
      );
      userIds.push(res.insertId);
    }

    // 2. Insert Projects
    const [proj1] = await pool.query(
      'INSERT INTO projects (title, description, status, owner_id, color) VALUES (?, ?, ?, ?, ?)',
      [
        'CyberPulse Dashboard v2.0',
        'Next-generation team productivity platform with real-time WebSockets, Kanban boards, and collaborative task assignment.',
        'Active',
        userIds[0],
        '#8b5cf6'
      ]
    );

    const [proj2] = await pool.query(
      'INSERT INTO projects (title, description, status, owner_id, color) VALUES (?, ?, ?, ?, ?)',
      [
        'CrimsonPay Mobile App',
        'Fintech mobile client app integration with secure transaction feeds and biometric authentication flows.',
        'Active',
        userIds[0],
        '#f43f5e'
      ]
    );

    // 3. Insert Project Members
    for (const uid of userIds) {
      await pool.query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
        [proj1.insertId, uid, uid === userIds[0] ? 'Owner' : 'Member']
      );
      await pool.query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
        [proj2.insertId, uid, uid === userIds[0] ? 'Owner' : 'Member']
      );
    }

    // 4. Insert Tasks for Project 1
    const tasks = [
      {
        projectId: proj1.insertId,
        title: 'Design Cyber Violet & Crimson Design System',
        desc: 'Craft obsidian dark mode tokens, neon violet accents, crimson status badges, and typography scales.',
        status: 'done',
        priority: 'high',
        assignedTo: userIds[3], // Marcus
        createdBy: userIds[0],
        dueDate: '2026-10-18',
        orderIndex: 0
      },
      {
        projectId: proj1.insertId,
        title: 'Implement MySQL Auto-Migration and Seeders',
        desc: 'Build schema initialization with users, projects, tasks, comments, and activity log tables.',
        status: 'done',
        priority: 'urgent',
        assignedTo: userIds[2], // Priya
        createdBy: userIds[0],
        dueDate: '2026-10-19',
        orderIndex: 1
      },
      {
        projectId: proj1.insertId,
        title: 'Interactive Kanban Board with Drag & Drop',
        desc: 'Create smooth HTML5 drag-and-drop columns (Backlog, Todo, In Progress, Review, Done) with quick-action status switches.',
        status: 'in_progress',
        priority: 'urgent',
        assignedTo: userIds[1], // Alex
        createdBy: userIds[0],
        dueDate: '2026-10-21',
        orderIndex: 0
      },
      {
        projectId: proj1.insertId,
        title: 'Real-time WebSocket Sync via Socket.io',
        desc: 'Broadcast task-moved, task-created, and new-comment events live across multiple client browser windows.',
        status: 'in_progress',
        priority: 'high',
        assignedTo: userIds[2], // Priya
        createdBy: userIds[0],
        dueDate: '2026-10-22',
        orderIndex: 1
      },
      {
        projectId: proj1.insertId,
        title: 'Task Commenting Thread & Activity Log',
        desc: 'Allow team members to discuss tasks directly with user avatars, real-time timestamps, and activity history.',
        status: 'todo',
        priority: 'medium',
        assignedTo: userIds[0], // Satyam
        createdBy: userIds[0],
        dueDate: '2026-10-24',
        orderIndex: 0
      },
      {
        projectId: proj1.insertId,
        title: 'Project Analytics & Burn-down Metric Cards',
        desc: 'Display completion percentage, overdue task alerts, and team workload breakdown charts.',
        status: 'backlog',
        priority: 'low',
        assignedTo: userIds[1], // Alex
        createdBy: userIds[0],
        dueDate: '2026-10-28',
        orderIndex: 0
      }
    ];

    const taskIds = [];
    for (const t of tasks) {
      const [res] = await pool.query(
        `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, created_by, due_date, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.projectId, t.title, t.desc, t.status, t.priority, t.assignedTo, t.createdBy, t.dueDate, t.orderIndex]
      );
      taskIds.push(res.insertId);
    }

    // 5. Insert Sample Comments
    if (taskIds.length >= 3) {
      await pool.query(
        'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
        [taskIds[2], userIds[3], 'Figma specifications updated with glassmorphic cards and 8px border-radius!']
      );
      await pool.query(
        'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
        [taskIds[2], userIds[1], 'Awesome Marcus! Implementing the CSS drag handles and touch-friendly controls now.']
      );
      await pool.query(
        'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
        [taskIds[3], userIds[0], 'Make sure to emit room-scoped events so projects only receive their own updates.']
      );
    }

    // 6. Insert Activity Logs
    await pool.query(
      'INSERT INTO activity_logs (project_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [proj1.insertId, userIds[0], 'created_project', 'Created project "CyberPulse Dashboard v2.0"']
    );
    await pool.query(
      'INSERT INTO activity_logs (project_id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [proj1.insertId, userIds[1], 'moved_task', 'Moved "Interactive Kanban Board" to In Progress']
    );

    console.log(`✨ [MySQL] Seeding completed successfully! 4 users, 2 projects, 6 tasks seeded.`);
  } catch (error) {
    console.error(`❌ [MySQL] Seeding error:`, error.message);
  }
}

module.exports = seedData;
