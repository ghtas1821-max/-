import Dexie, { type Table } from 'dexie';

export interface SyncMetadata {
  id: string;
  tableName: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export class MenaDatabase extends Dexie {
  products!: Table<any>;
  customers!: Table<any>;
  suppliers!: Table<any>;
  employees!: Table<any>;
  attendance!: Table<any>;
  salaries!: Table<any>;
  users!: Table<any>;
  transactions!: Table<any>;
  expenses!: Table<any>;
  treasuries!: Table<any>;
  activityLogs!: Table<any>;
  backups!: Table<any>;
  systemErrors!: Table<any>;
  syncQueue!: Table<SyncMetadata>;

  constructor() {
    super('MenaBusinessDB');
    this.version(1).stores({
      products: 'id, category, status, updatedAt',
      customers: 'id, name, phone, updatedAt',
      suppliers: 'id, name, updatedAt',
      employees: 'id, name, nationalId, updatedAt',
      attendance: 'id, employeeId, date, updatedAt',
      salaries: 'id, employeeId, month, updatedAt',
      users: 'id, username, updatedAt',
      transactions: 'id, type, date, updatedAt',
      expenses: 'id, date, updatedAt',
      treasuries: 'id, name, updatedAt',
      activityLogs: 'id, timestamp, updatedAt',
      backups: 'id, date',
      systemErrors: 'id, timestamp, status',
      syncQueue: 'id, tableName, timestamp'
    });
  }

  async queueSync(tableName: string, action: 'create' | 'update' | 'delete', data: any) {
    const id = `${tableName}_${data.id || Math.random().toString(36).substr(2, 9)}`;
    await this.syncQueue.put({
      id,
      tableName,
      action,
      data,
      timestamp: Date.now()
    });
  }
}

export const db = new MenaDatabase();
