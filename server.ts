import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
// import { createServer as createViteServer } from 'vite'; // Moved to dynamic import inside startServer

import Database from 'better-sqlite3';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: any;
const dbPath = process.env.DB_PATH || 'mena_business.db';

function initializeDatabase() {
  console.log('Connecting to database at:', dbPath);
  try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    console.log('Database connection established.');
    initDb();
  } catch (error) {
    console.error('CRITICAL: Failed to initialize database:', error);
    // If WAL fails, try once more without it
    if (error instanceof Error && error.message.includes('WAL')) {
      console.log('Attempting to connect without WAL mode...');
      try {
        db = new Database(dbPath);
        console.log('Database connection established (without WAL).');
        initDb();
      } catch (retryError) {
        console.error('FATAL: Database initialization failed completely:', retryError);
        throw retryError;
      }
    } else {
      throw error;
    }
  }
}

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Initialize Database Tables
const initDb = () => {
  console.log('Initializing database...');
  const ensureColumnExists = (tableName: string, columnName: string, columnType: string) => {
    try {
      const dbInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
      const exists = dbInfo.some(col => col.name === columnName);
      if (!exists) {
        console.log(`Adding column ${columnName} to table ${tableName}...`);
        db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
      }
    } catch (e) {
      console.warn(`Warning: Could not check/add column ${columnName} to ${tableName}. This might be expected if the table doesn't exist yet.`);
    }
  };

  // Products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      sku TEXT,
      barcode TEXT,
      category TEXT,
      type TEXT,
      status TEXT,
      description TEXT,
      shortDescription TEXT,
      purchasePrice REAL,
      price REAL,
      wholesalePrice REAL,
      minPrice REAL,
      vat REAL,
      defaultDiscount REAL,
      stock REAL,
      minStockAlert REAL,
      maxStock REAL,
      unit TEXT,
      location TEXT,
      serialNumber TEXT,
      batchNumber TEXT,
      expiryDate INTEGER,
      primarySupplierId TEXT,
      images TEXT,
      variants TEXT,
      isBundle INTEGER,
      bundleItems TEXT,
      updatedAt INTEGER
    )
  `);

  // Customers
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      openingBalance REAL,
      openingBalanceType TEXT,
      currentBalance REAL DEFAULT 0,
      updatedAt INTEGER
    )
  `);

  // Suppliers
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT,
      contactName TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      category TEXT,
      openingBalance REAL,
      openingBalanceType TEXT,
      updatedAt INTEGER
    )
  `);

  // Employees
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT,
      nationalId TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      jobTitle TEXT,
      branchId TEXT,
      department TEXT,
      status TEXT,
      salary REAL,
      salaryType TEXT,
      bonuses REAL,
      deductions REAL,
      hiredAt INTEGER,
      updatedAt INTEGER
    )
  `);

  // Attendance
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      date TEXT,
      checkIn TEXT,
      checkOut TEXT,
      status TEXT,
      note TEXT,
      updatedAt INTEGER
    )
  `);

  // Salaries
  db.exec(`
    CREATE TABLE IF NOT EXISTS salaries (
      id TEXT PRIMARY KEY,
      employeeId TEXT,
      month TEXT,
      baseSalary REAL,
      bonuses REAL,
      deductions REAL,
      netSalary REAL,
      status TEXT,
      paidAt INTEGER,
      updatedAt INTEGER
    )
  `);

  // Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT,
      employeeId TEXT,
      status TEXT,
      lastLogin INTEGER,
      failedAttempts INTEGER,
      isLocked INTEGER,
      updatedAt INTEGER
    )
  `);

  // Transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT,
      customerId TEXT,
      supplierId TEXT,
      total REAL,
      discount REAL,
      tax REAL,
      shipping REAL,
      netTotal REAL,
      paidAmount REAL,
      remainingAmount REAL,
      status TEXT,
      date INTEGER,
      items TEXT,
      payments TEXT,
      note TEXT,
      warehouseId TEXT,
      userId TEXT,
      updatedAt INTEGER
    )
  `);

  // Expenses
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      name TEXT,
      categoryId TEXT,
      amount REAL,
      treasuryId TEXT,
      date INTEGER,
      note TEXT,
      userId TEXT,
      updatedAt INTEGER
    )
  `);

  // Treasury
  db.exec(`
    CREATE TABLE IF NOT EXISTS treasury (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      balance REAL,
      currency TEXT,
      status TEXT,
      bankName TEXT,
      accountNumber TEXT,
      walletNumber TEXT,
      updatedAt INTEGER
    )
  `);

  // Activity Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      username TEXT,
      action TEXT,
      details TEXT,
      timestamp INTEGER,
      type TEXT,
      device TEXT,
      ip TEXT
    )
  `);

  // Backups
  db.exec(`
    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      filename TEXT,
      date INTEGER,
      size TEXT,
      type TEXT,
      status TEXT
    )
  `);

  // Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Warehouses
  db.exec(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT,
      location TEXT,
      manager TEXT,
      status TEXT,
      updatedAt INTEGER
    )
  `);

  // Stock Movements (for Audit/Logs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      productId TEXT,
      warehouseId TEXT,
      type TEXT,
      quantity REAL,
      note TEXT,
      date INTEGER,
      userId TEXT,
      updatedAt INTEGER
    )
  `);

  // Expense Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      updatedAt INTEGER
    )
  `);

  // Branches
  db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT,
      address TEXT,
      phone TEXT,
      updatedAt INTEGER
    )
  `);

  // Departments
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT,
      branchId TEXT,
      updatedAt INTEGER
    )
  `);

  // Migrations for existing deployments
  const tablesWithSync = [
    'products', 'customers', 'suppliers', 'employees', 'attendance',
    'salaries', 'users', 'transactions', 'expenses', 'treasury',
    'warehouses', 'stock_movements', 'expense_categories', 'branches', 'departments'
  ];
  
  console.log('Running database migrations...');
  tablesWithSync.forEach(table => {
    try {
      ensureColumnExists(table, 'updatedAt', 'INTEGER');
    } catch (e) {
      console.error(`Migration failed for table ${table}:`, e);
    }
  });

  // Additional columns for users table (lockout system)
  ensureColumnExists('users', 'failedAttempts', 'INTEGER DEFAULT 0');
  ensureColumnExists('users', 'isLocked', 'INTEGER DEFAULT 0');
  console.log('Database migrations completed.');

  // Ensure default admin exists with hashed password and reset lockout
  try {
    const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;
    if (!admin) {
      db.prepare('INSERT INTO users (id, username, password, name, role, status, failedAttempts, isLocked, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run('1', 'admin', hashPassword('admin123'), 'مدير النظام', 'admin', 'active', 0, 0, Date.now());
    } else if (admin.password === 'admin' || admin.isLocked) {
      // Migrate from plain text or unlock if it's the default admin
      db.prepare('UPDATE users SET password = ?, failedAttempts = 0, isLocked = 0, updatedAt = ? WHERE username = ?')
        .run(hashPassword('admin123'), Date.now(), 'admin');
    }
  } catch (e) {
    console.warn('Warning: Could not initialize admin user. This might be due to missing columns that will be added later or schema conflicts.', e);
  }
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (req, res) => {
  try {
    const isDbOpen = db.open;
    res.json({ 
      status: 'ok', 
      timestamp: Date.now(),
      database: isDbOpen ? 'open' : 'closed',
      mode: process.env.NODE_ENV || 'development'
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: (e as Error).message });
  }
});

// API Endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    
    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    if (user.isLocked) {
      return res.status(403).json({ error: 'الحساب مغلق بسبب محاولات فاشلة متكررة. اتصل بالمسؤول.' });
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      const attempts = (user.failedAttempts || 0) + 1;
      const isLocked = attempts >= 5 ? 1 : 0;
      db.prepare('UPDATE users SET failedAttempts = ?, isLocked = ? WHERE id = ?').run(attempts, isLocked, user.id);
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // Success
    db.prepare('UPDATE users SET failedAttempts = 0, lastLogin = ?, updatedAt = ? WHERE id = ?')
      .run(Date.now(), Date.now(), user.id);

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: { ...userWithoutPassword, isLocked: false } });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/data', (req, res) => {
  try {
    const data = {
      products: db.prepare('SELECT * FROM products').all().map((p: any) => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        variants: JSON.parse(p.variants || '[]'),
        bundleItems: JSON.parse(p.bundleItems || '[]'),
        isBundle: !!p.isBundle
      })),
      customers: db.prepare('SELECT * FROM customers').all(),
      suppliers: db.prepare('SELECT * FROM suppliers').all(),
      employees: db.prepare('SELECT * FROM employees').all(),
      attendance: db.prepare('SELECT * FROM attendance').all(),
      salaries: db.prepare('SELECT * FROM salaries').all(),
      users: db.prepare('SELECT * FROM users').all().map((u: any) => ({
        ...u,
        isLocked: !!u.isLocked
      })),
      transactions: db.prepare('SELECT * FROM transactions').all().map((t: any) => ({
        ...t,
        items: JSON.parse(t.items || '[]'),
        payments: JSON.parse(t.payments || '[]')
      })),
      expenses: db.prepare('SELECT * FROM expenses').all(),
      treasuries: db.prepare('SELECT * FROM treasury').all(),
      activityLogs: db.prepare('SELECT * FROM activity_logs').all(),
      backups: db.prepare('SELECT * FROM backups').all(),
      settings: JSON.parse((db.prepare('SELECT value FROM settings WHERE key = ?').get('system') as any)?.value || '{}'),
      securitySettings: JSON.parse((db.prepare('SELECT value FROM settings WHERE key = ?').get('security') as any)?.value || '{}'),
      warehouses: db.prepare('SELECT * FROM warehouses').all(),
      stockMovements: db.prepare('SELECT * FROM stock_movements').all(),
      expenseCategories: db.prepare('SELECT * FROM expense_categories').all(),
      branches: db.prepare('SELECT * FROM branches').all(),
      departments: db.prepare('SELECT * FROM departments').all()
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/save', (req, res) => {
  const { 
    products, customers, suppliers, employees, attendance, 
    salaries, users, transactions, expenses, treasuries, 
    activityLogs, backups, settings, securitySettings,
    warehouses, stockMovements, expenseCategories, branches, departments
  } = req.body;

  const transaction = db.transaction(() => {
    // ... 기존 코드 유지 ...
    
    if (warehouses) {
      const insert = db.prepare('INSERT INTO warehouses (id, name, location, manager, status, updatedAt) VALUES (@id, @name, @location, @manager, @status, @updatedAt) ON CONFLICT(id) DO UPDATE SET name=excluded.name, location=excluded.location, manager=excluded.manager, status=excluded.status, updatedAt=excluded.updatedAt WHERE excluded.updatedAt > warehouses.updatedAt OR warehouses.updatedAt IS NULL');
      for (const w of warehouses) insert.run({ ...w, updatedAt: w.updatedAt || Date.now() });
    }

    if (stockMovements) {
      const insert = db.prepare('INSERT INTO stock_movements (id, productId, warehouseId, type, quantity, note, date, userId, updatedAt) VALUES (@id, @productId, @warehouseId, @type, @quantity, @note, @date, @userId, @updatedAt) ON CONFLICT(id) DO UPDATE SET productId=excluded.productId, warehouseId=excluded.warehouseId, type=excluded.type, quantity=excluded.quantity, note=excluded.note, updatedAt=excluded.updatedAt WHERE excluded.updatedAt > stock_movements.updatedAt OR stock_movements.updatedAt IS NULL');
      for (const m of stockMovements) insert.run({ ...m, updatedAt: m.updatedAt || Date.now() });
    }

    if (expenseCategories) {
      const insert = db.prepare('INSERT INTO expense_categories (id, name, updatedAt) VALUES (@id, @name, @updatedAt) ON CONFLICT(id) DO UPDATE SET name=excluded.name, updatedAt=excluded.updatedAt WHERE excluded.updatedAt > expense_categories.updatedAt OR expense_categories.updatedAt IS NULL');
      for (const ec of expenseCategories) insert.run({ ...ec, updatedAt: ec.updatedAt || Date.now() });
    }

    if (branches) {
      const insert = db.prepare('INSERT INTO branches (id, name, address, phone, updatedAt) VALUES (@id, @name, @address, @phone, @updatedAt) ON CONFLICT(id) DO UPDATE SET name=excluded.name, address=excluded.address, phone=excluded.phone, updatedAt=excluded.updatedAt WHERE excluded.updatedAt > branches.updatedAt OR branches.updatedAt IS NULL');
      for (const b of branches) insert.run({ ...b, updatedAt: b.updatedAt || Date.now() });
    }

    if (departments) {
      const insert = db.prepare('INSERT INTO departments (id, name, branchId, updatedAt) VALUES (@id, @name, @branchId, @updatedAt) ON CONFLICT(id) DO UPDATE SET name=excluded.name, branchId=excluded.branchId, updatedAt=excluded.updatedAt WHERE excluded.updatedAt > departments.updatedAt OR departments.updatedAt IS NULL');
      for (const d of departments) insert.run({ ...d, updatedAt: d.updatedAt || Date.now() });
    }
    
    if (products) {
      const insert = db.prepare(`
        INSERT INTO products (id, name, sku, barcode, category, type, status, description, shortDescription, purchasePrice, price, wholesalePrice, minPrice, vat, defaultDiscount, stock, minStockAlert, maxStock, unit, location, serialNumber, batchNumber, expiryDate, primarySupplierId, images, variants, isBundle, bundleItems, updatedAt)
        VALUES (@id, @name, @sku, @barcode, @category, @type, @status, @description, @shortDescription, @purchasePrice, @price, @wholesalePrice, @minPrice, @vat, @defaultDiscount, @stock, @minStockAlert, @maxStock, @unit, @location, @serialNumber, @batchNumber, @expiryDate, @primarySupplierId, @images, @variants, @isBundle, @bundleItems, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, sku=excluded.sku, barcode=excluded.barcode, category=excluded.category,
          type=excluded.type, status=excluded.status, description=excluded.description,
          shortDescription=excluded.shortDescription, purchasePrice=excluded.purchasePrice,
          price=excluded.price, wholesalePrice=excluded.wholesalePrice, minPrice=excluded.minPrice,
          vat=excluded.vat, defaultDiscount=excluded.defaultDiscount, stock=excluded.stock,
          minStockAlert=excluded.minStockAlert, maxStock=excluded.maxStock, unit=excluded.unit,
          location=excluded.location, serialNumber=excluded.serialNumber, batchNumber=excluded.batchNumber,
          expiryDate=excluded.expiryDate, primarySupplierId=excluded.primarySupplierId,
          images=excluded.images, variants=excluded.variants, isBundle=excluded.isBundle,
          bundleItems=excluded.bundleItems, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > products.updatedAt OR products.updatedAt IS NULL
      `);
      for (const p of products) {
        insert.run({
          ...p,
          images: JSON.stringify(p.images || []),
          variants: JSON.stringify(p.variants || []),
          bundleItems: JSON.stringify(p.bundleItems || []),
          isBundle: p.isBundle ? 1 : 0,
          updatedAt: p.updatedAt || Date.now()
        });
      }
    }

    if (customers) {
      const insert = db.prepare(`
        INSERT INTO customers (id, name, phone, email, address, openingBalance, openingBalanceType, currentBalance, updatedAt)
        VALUES (@id, @name, @phone, @email, @address, @openingBalance, @openingBalanceType, @currentBalance, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, phone=excluded.phone, email=excluded.email, address=excluded.address,
          openingBalance=excluded.openingBalance, openingBalanceType=excluded.openingBalanceType,
          currentBalance=excluded.currentBalance, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > customers.updatedAt OR customers.updatedAt IS NULL
      `);
      for (const c of customers) insert.run({ ...c, currentBalance: c.currentBalance || 0, updatedAt: c.updatedAt || Date.now() });
    }

    if (suppliers) {
      const insert = db.prepare(`
        INSERT INTO suppliers (id, name, contactName, phone, email, address, category, openingBalance, openingBalanceType, updatedAt)
        VALUES (@id, @name, @contactName, @phone, @email, @address, @category, @openingBalance, @openingBalanceType, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, contactName=excluded.contactName, phone=excluded.phone, email=excluded.email,
          address=excluded.address, category=excluded.category, openingBalance=excluded.openingBalance,
          openingBalanceType=excluded.openingBalanceType, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > suppliers.updatedAt OR suppliers.updatedAt IS NULL
      `);
      for (const s of suppliers) insert.run({ ...s, updatedAt: s.updatedAt || Date.now() });
    }

    if (transactions) {
      const insert = db.prepare(`
        INSERT INTO transactions (id, type, customerId, supplierId, total, discount, tax, shipping, netTotal, paidAmount, remainingAmount, status, date, items, payments, note, warehouseId, userId, updatedAt)
        VALUES (@id, @type, @customerId, @supplierId, @total, @discount, @tax, @shipping, @netTotal, @paidAmount, @remainingAmount, @status, @date, @items, @payments, @note, @warehouseId, @userId, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          type=excluded.type, customerId=excluded.customerId, supplierId=excluded.supplierId,
          total=excluded.total, discount=excluded.discount, tax=excluded.tax, shipping=excluded.shipping,
          netTotal=excluded.netTotal, paidAmount=excluded.paidAmount, remainingAmount=excluded.remainingAmount,
          status=excluded.status, date=excluded.date, items=excluded.items, payments=excluded.payments,
          note=excluded.note, warehouseId=excluded.warehouseId, userId=excluded.userId, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > transactions.updatedAt OR transactions.updatedAt IS NULL
      `);
      for (const t of transactions) {
        insert.run({
          ...t,
          items: JSON.stringify(t.items || []),
          payments: JSON.stringify(t.payments || []),
          updatedAt: t.updatedAt || Date.now()
        });
      }
    }

    if (employees) {
      const insert = db.prepare(`
        INSERT INTO employees (id, name, nationalId, phone, email, address, jobTitle, branchId, department, status, salary, salaryType, bonuses, deductions, hiredAt, updatedAt)
        VALUES (@id, @name, @nationalId, @phone, @email, @address, @jobTitle, @branchId, @department, @status, @salary, @salaryType, @bonuses, @deductions, @hiredAt, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, nationalId=excluded.nationalId, phone=excluded.phone, email=excluded.email,
          address=excluded.address, jobTitle=excluded.jobTitle, branchId=excluded.branchId,
          department=excluded.department, status=excluded.status, salary=excluded.salary,
          salaryType=excluded.salaryType, bonuses=excluded.bonuses, deductions=excluded.deductions,
          hiredAt=excluded.hiredAt, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > employees.updatedAt OR employees.updatedAt IS NULL
      `);
      for (const e of employees) insert.run({ ...e, updatedAt: e.updatedAt || Date.now() });
    }

    if (attendance) {
      const insert = db.prepare(`
        INSERT INTO attendance (id, employeeId, date, checkIn, checkOut, status, note, updatedAt)
        VALUES (@id, @employeeId, @date, @checkIn, @checkOut, @status, @note, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          employeeId=excluded.employeeId, date=excluded.date, checkIn=excluded.checkIn,
          checkOut=excluded.checkOut, status=excluded.status, note=excluded.note, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > attendance.updatedAt OR attendance.updatedAt IS NULL
      `);
      for (const a of attendance) insert.run({ ...a, updatedAt: a.updatedAt || Date.now() });
    }

    if (salaries) {
      const insert = db.prepare(`
        INSERT INTO salaries (id, employeeId, month, baseSalary, bonuses, deductions, netSalary, status, paidAt, updatedAt)
        VALUES (@id, @employeeId, @month, @baseSalary, @bonuses, @deductions, @netSalary, @status, @paidAt, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          employeeId=excluded.employeeId, month=excluded.month, baseSalary=excluded.baseSalary,
          bonuses=excluded.bonuses, deductions=excluded.deductions, netSalary=excluded.netSalary,
          status=excluded.status, paidAt=excluded.paidAt, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > salaries.updatedAt OR salaries.updatedAt IS NULL
      `);
      for (const s of salaries) insert.run({ ...s, updatedAt: s.updatedAt || Date.now() });
    }

    if (users) {
      const insert = db.prepare(`
        INSERT INTO users (id, username, password, name, role, employeeId, status, lastLogin, failedAttempts, isLocked, updatedAt)
        VALUES (@id, @username, @password, @name, @role, @employeeId, @status, @lastLogin, @failedAttempts, @isLocked, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          username=excluded.username, password=excluded.password, name=excluded.name,
          role=excluded.role, employeeId=excluded.employeeId, status=excluded.status,
          lastLogin=excluded.lastLogin, failedAttempts=excluded.failedAttempts,
          isLocked=excluded.isLocked, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > users.updatedAt OR users.updatedAt IS NULL
      `);
      for (const u of users) insert.run({ ...u, isLocked: u.isLocked ? 1 : 0, updatedAt: u.updatedAt || Date.now() });
    }

    if (expenses) {
      const insert = db.prepare(`
        INSERT INTO expenses (id, name, categoryId, amount, treasuryId, date, note, userId, updatedAt)
        VALUES (@id, @name, @categoryId, @amount, @treasuryId, @date, @note, @userId, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, categoryId=excluded.categoryId, amount=excluded.amount,
          treasuryId=excluded.treasuryId, date=excluded.date, note=excluded.note,
          userId=excluded.userId, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > expenses.updatedAt OR expenses.updatedAt IS NULL
      `);
      for (const e of expenses) insert.run({ ...e, updatedAt: e.updatedAt || Date.now() });
    }

    if (treasuries) {
      const insert = db.prepare(`
        INSERT INTO treasury (id, name, type, balance, currency, status, bankName, accountNumber, walletNumber, updatedAt)
        VALUES (@id, @name, @type, @balance, @currency, @status, @bankName, @accountNumber, @walletNumber, @updatedAt)
        ON CONFLICT(id) DO UPDATE SET
          name=excluded.name, type=excluded.type, balance=excluded.balance, currency=excluded.currency,
          status=excluded.status, bankName=excluded.bankName, accountNumber=excluded.accountNumber,
          walletNumber=excluded.walletNumber, updatedAt=excluded.updatedAt
        WHERE excluded.updatedAt > treasury.updatedAt OR treasury.updatedAt IS NULL
      `);
      for (const t of treasuries) insert.run({ ...t, updatedAt: t.updatedAt || Date.now() });
    }

    if (activityLogs) {
      const insert = db.prepare(`
        INSERT INTO activity_logs (id, userId, username, action, details, timestamp, type, device, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING
      `);
      for (const l of activityLogs) insert.run(l.id, l.userId, l.username, l.action, l.details, l.timestamp, l.type, l.device, l.ip);
    }

    if (backups) {
      db.prepare('DELETE FROM backups').run();
      const insert = db.prepare('INSERT INTO backups (id, filename, date, size, type, status) VALUES (?, ?, ?, ?, ?, ?)');
      for (const b of backups) insert.run(b.id, b.filename, b.date, b.size, b.type, b.status);
    }

    if (settings) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('system', JSON.stringify(settings));
    }

    if (securitySettings) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('security', JSON.stringify(securitySettings));
    }
  });

  try {
    transaction();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Backup Logic
const backupDatabase = () => {
  const backupDir = path.join(__dirname, 'backup');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${dateStr}.db`;
  const dest = path.join(backupDir, filename);

  try {
    fs.copyFileSync(dbPath, dest);
    const stats = fs.statSync(dest);
    const size = `${(stats.size / 1024).toFixed(2)} KB`;
    
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO backups (id, filename, date, size, type, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, filename, Date.now(), size, 'auto', 'success');
    
    console.log(`Backup created: ${filename}`);
    return { success: true, filename, size };
  } catch (error) {
    console.error('Backup failed:', error);
    return { success: false, error: (error as Error).message };
  }
};

app.post('/api/backup', (req, res) => {
  const result = backupDatabase();
  if (result.success) res.json(result);
  else res.status(500).json(result);
});

app.post('/api/restore', (req, res) => {
  const { filename } = req.body;
  const backupPath = path.join(__dirname, 'backup', filename);

  if (!fs.existsSync(backupPath)) {
    return res.status(404).json({ error: 'Backup file not found' });
  }

  try {
    // Close DB before restore
    db.close();
    fs.copyFileSync(backupPath, 'mena_business.db');
    // Reopen DB
    // Note: In a real app, we'd need to restart the server or re-initialize the db object
    // For simplicity here, we'll just tell the user to restart or handle it
    res.json({ success: true, message: 'Database restored. Please restart the application.' });
    process.exit(0); // Restart server (AI Studio will restart it)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

async function startServer() {
  console.log('Starting server initialization...');
  try {
    initializeDatabase();
    
    // Auto Backup every 24 hours
    setInterval(backupDatabase, 24 * 60 * 60 * 1000);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Mounting Vite middleware for development...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('Serving static files from dist for production...');
      const distPath = path.join(__dirname, 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          const indexPath = path.join(distPath, 'index.html');
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            console.warn('index.html not found, falling back to 404');
            res.status(404).send('Frontend build not found (index.html missing)');
          }
        });
      } else {
        console.warn('dist directory not found, falling back to 404');
        app.get('*', (req, res) => {
          res.status(404).send('Frontend build not found (dist directory missing)');
        });
      }
    }

    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server started in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`Listening on http://0.0.0.0:${PORT}`);
      console.log(`Database path: ${path.resolve(dbPath)}`);
      if (process.send) {
        process.send('server-ready');
      }
    });
  } catch (error) {
    console.error('CRITICAL: Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error('UNHANDLED REJECTION: Failed to start server:', err);
  process.exit(1);
});
