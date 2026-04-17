import { db as localDb } from './db';

const API_URL = '/api';

export const dataService = {
  isOnline() {
    return navigator.onLine;
  },

  async fetchData() {
    if (this.isOnline()) {
      try {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        // Sync to local DB
        await this.persistToLocal(data);
        return data;
      } catch (error) {
        console.warn('Online fetch failed, falling back to local:', error);
      }
    }
    
    // Offline or fetch failed
    return this.fetchFromLocal();
  },

  async persistToLocal(data: any) {
    const tables = [
      'products', 'customers', 'suppliers', 'employees', 'attendance', 
      'salaries', 'users', 'transactions', 'expenses', 'treasuries', 
      'activityLogs', 'backups'
    ];

    for (const table of tables) {
      if (data[table]) {
        // @ts-ignore
        await localDb[table].bulkPut(data[table]);
      }
    }
    
    if (data.settings) localStorage.setItem('pos_settings', JSON.stringify(data.settings));
    if (data.securitySettings) localStorage.setItem('pos_security_settings', JSON.stringify(data.securitySettings));
  },

  async fetchFromLocal() {
    return {
      products: await localDb.products.toArray(),
      customers: await localDb.customers.toArray(),
      suppliers: await localDb.suppliers.toArray(),
      employees: await localDb.employees.toArray(),
      attendance: await localDb.attendance.toArray(),
      salaries: await localDb.salaries.toArray(),
      users: await localDb.users.toArray(),
      transactions: await localDb.transactions.toArray(),
      expenses: await localDb.expenses.toArray(),
      treasuries: await localDb.treasuries.toArray(),
      activityLogs: await localDb.activityLogs.toArray(),
      backups: await localDb.backups.toArray(),
      settings: JSON.parse(localStorage.getItem('pos_settings') || '{}'),
      securitySettings: JSON.parse(localStorage.getItem('pos_security_settings') || '{}')
    };
  },

  async saveData(data: any) {
    const timestamp = Date.now();
    
    // Update local immediately (Optimistic)
    await this.persistToLocal(data);
    
    if (this.isOnline()) {
      try {
        const response = await fetch(`${API_URL}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (response.ok) return response.json();
      } catch (error) {
        console.warn('Sync to server failed, data saved locally:', error);
      }
    }
    
    // If offline or sync failed, we'd need a way to track deltas.
    // For now, the user requested SQLite saving directly.
    return { success: true, offline: !this.isOnline() };
  },

  async sync() {
    if (!this.isOnline()) return { success: false, message: 'Offline' };
    
    try {
      // 1. Fetch current local state
      const localData = await this.fetchFromLocal();
      
      // 2. Push to server
      const response = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData),
      });
      
      if (!response.ok) throw new Error('Sync failed');
      
      // 3. Re-fetch from server to get any remote changes (Conflict resolution: Server wins for now)
      return await this.fetchData();
    } catch (error) {
      console.error('Sync Error:', error);
      throw error;
    }
  },

  async createBackup() {
    const response = await fetch(`${API_URL}/backup`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to create backup');
    return response.json();
  },

  async restoreBackup(filename: string) {
    const response = await fetch(`${API_URL}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    });
    if (!response.ok) throw new Error('Failed to restore backup');
    return response.json();
  }
};
