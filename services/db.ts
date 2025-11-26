import type { PortfolioData, GuestbookEntry, Lead, Report, User } from '../types';

// ====================================================================================
// DATABASE IMPLEMENTATION (IndexedDB)
// ------------------------------------------------------------------------------------
// This file contains the low-level implementation for storing and retrieving data
// from the browser's IndexedDB.
//
// IMPORTANT: UI components should NOT import from this file directly. They should
// use the abstracted functions from `services/api.ts`. This allows for a seamless
// transition to a real backend server in the future.
// ====================================================================================


const DB_NAME = 'PortfolioDB';
const STORE_NAMES = {
  PORTFOLIO: 'portfolio',
  GUESTBOOK: 'guestbook',
  LEADS: 'leads',
  REPORTS: 'reports',
  USERS: 'users',
};
const VERSION = 5; // Incremented version for schema change

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
         if (!db.objectStoreNames.contains(STORE_NAMES.PORTFOLIO)) {
            db.createObjectStore(STORE_NAMES.PORTFOLIO);
         }
      }
      if (oldVersion < 2) {
         if (!db.objectStoreNames.contains(STORE_NAMES.LEADS)) {
            db.createObjectStore(STORE_NAMES.LEADS, { keyPath: 'id' });
         }
      }
       if (oldVersion < 3) {
         if (!db.objectStoreNames.contains(STORE_NAMES.GUESTBOOK)) {
            db.createObjectStore(STORE_NAMES.GUESTBOOK, { keyPath: 'id' });
         }
         if (db.objectStoreNames.contains('chatLogs')) {
            db.deleteObjectStore('chatLogs');
         }
      }
      if (oldVersion < 4) {
        if (!db.objectStoreNames.contains(STORE_NAMES.REPORTS)) {
            db.createObjectStore(STORE_NAMES.REPORTS, { keyPath: 'id' });
         }
      }
      if (oldVersion < 5) {
        if (!db.objectStoreNames.contains(STORE_NAMES.USERS)) {
            db.createObjectStore(STORE_NAMES.USERS, { keyPath: 'id' });
         }
      }
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
  });
};

// --- User Authentication ---
export const addUser = async (user: User): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.USERS, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.USERS);
    const request = store.add(user);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getUser = async (id: string): Promise<User | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.USERS, 'readonly');
    const store = transaction.objectStore(STORE_NAMES.USERS);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const updateUser = async (user: User): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.USERS, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.USERS);
    const request = store.put(user);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.USERS, 'readonly');
    const store = transaction.objectStore(STORE_NAMES.USERS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const deleteUser = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.USERS, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.USERS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};


// --- Portfolio Data ---
export const getPortfolioDataFromDB = async (): Promise<PortfolioData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.PORTFOLIO, 'readonly');
    const store = transaction.objectStore(STORE_NAMES.PORTFOLIO);
    const request = store.get('main_portfolio');
    
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

export const savePortfolioDataToDB = async (data: PortfolioData): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.PORTFOLIO, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.PORTFOLIO);
    const request = store.put(data, 'main_portfolio');
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// --- Guestbook Entries ---
export const saveGuestbookEntry = async (entry: { userId: string, message: string }): Promise<void> => {
  const db = await openDB();
  const newEntry: GuestbookEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    reactions: { '👍': 0, '❤️': 0, '🎉': 0 },
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.GUESTBOOK, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.GUESTBOOK);
    const request = store.add(newEntry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};


export const getGuestbookEntries = async (options: { limit?: number, offset?: number } = {}): Promise<GuestbookEntry[]> => {
    const { limit = 50, offset = 0 } = options;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAMES.GUESTBOOK, 'readonly');
        const store = transaction.objectStore(STORE_NAMES.GUESTBOOK);
        const request = store.getAll();
        request.onsuccess = () => {
            const sorted = request.result.sort((a,b) => b.timestamp - a.timestamp); // Newest first
            const paginated = sorted.slice(offset, offset + limit);
            resolve(paginated);
        };
        request.onerror = () => reject(request.error);
    });
};

export const getNewerGuestbookEntries = async (timestamp: number): Promise<GuestbookEntry[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAMES.GUESTBOOK, 'readonly');
        const store = transaction.objectStore(STORE_NAMES.GUESTBOOK);
        const request = store.getAll();
        request.onsuccess = () => {
            const newerEntries = request.result
                .filter(entry => entry.timestamp > timestamp)
                .sort((a,b) => b.timestamp - a.timestamp); // Newest first
            resolve(newerEntries);
        };
        request.onerror = () => reject(request.error);
    });
};


export const deleteGuestbookEntry = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.GUESTBOOK, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.GUESTBOOK);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const updateGuestbookEntry = async (id: string, updatedFields: Partial<GuestbookEntry>): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAMES.GUESTBOOK, 'readwrite');
        const store = transaction.objectStore(STORE_NAMES.GUESTBOOK);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const entry = getRequest.result;
            if (entry) {
                const updatedEntry = { ...entry, ...updatedFields };
                const putRequest = store.put(updatedEntry);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            } else {
                reject(new Error('Entry not found'));
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};


// --- Leads ---
export const saveLead = async (lead: Omit<Lead, 'id' | 'timestamp'>): Promise<void> => {
  const db = await openDB();
  const newLead: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.LEADS, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.LEADS);
    const request = store.add(newLead);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getLeads = async (): Promise<Lead[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAMES.LEADS, 'readonly');
        const store = transaction.objectStore(STORE_NAMES.LEADS);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.sort((a,b) => b.timestamp - a.timestamp)); // Newest first
        request.onerror = () => reject(request.error);
    });
};

// --- Moderation ---
export const addReport = async (entry: GuestbookEntry): Promise<void> => {
  const db = await openDB();
  const report: Report = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    messageId: entry.id,
    messageContent: entry.message,
    messageAuthor: entry.userId,
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.REPORTS, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.REPORTS);
    const request = store.add(report);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getReports = async (): Promise<Report[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.REPORTS, 'readonly');
    const store = transaction.objectStore(STORE_NAMES.REPORTS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.timestamp - a.timestamp));
    request.onerror = () => reject(request.error);
  });
};

export const deleteReport = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAMES.REPORTS, 'readwrite');
    const store = transaction.objectStore(STORE_NAMES.REPORTS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
