
import type { PortfolioData, GuestbookEntry, Lead, Report, User, ChatRoom, ChatMessage } from '../types';

const DB_NAME = 'PortfolioDB';
const STORE_NAMES = {
  PORTFOLIO: 'portfolio',
  GUESTBOOK: 'guestbook', // Legacy
  LEADS: 'leads',
  REPORTS: 'reports',
  USERS: 'users',
  ROOMS: 'rooms',
  MESSAGES: 'messages'
};
const VERSION = 6;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (!db.objectStoreNames.contains(STORE_NAMES.PORTFOLIO)) db.createObjectStore(STORE_NAMES.PORTFOLIO);
      if (!db.objectStoreNames.contains(STORE_NAMES.LEADS)) db.createObjectStore(STORE_NAMES.LEADS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_NAMES.GUESTBOOK)) db.createObjectStore(STORE_NAMES.GUESTBOOK, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_NAMES.REPORTS)) db.createObjectStore(STORE_NAMES.REPORTS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_NAMES.USERS)) db.createObjectStore(STORE_NAMES.USERS, { keyPath: 'id' });
      
      // New Messaging Stores
      if (!db.objectStoreNames.contains(STORE_NAMES.ROOMS)) db.createObjectStore(STORE_NAMES.ROOMS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_NAMES.MESSAGES)) {
          const msgStore = db.createObjectStore(STORE_NAMES.MESSAGES, { keyPath: 'id' });
          msgStore.createIndex('roomId', 'roomId', { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Generic Helper ---
const runTransaction = async <T>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<any> | void): Promise<T> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = callback(store);
        if (request) {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } else {
             transaction.oncomplete = () => resolve(undefined as unknown as T);
             transaction.onerror = () => reject(transaction.error);
        }
    });
};

// --- Chat Features ---
export const saveRoom = (room: ChatRoom) => runTransaction(STORE_NAMES.ROOMS, 'readwrite', store => store.put(room));
export const getRooms = () => runTransaction<ChatRoom[]>(STORE_NAMES.ROOMS, 'readonly', store => store.getAll());

export const saveMessage = (msg: ChatMessage) => runTransaction(STORE_NAMES.MESSAGES, 'readwrite', store => store.put(msg));

export const getMessagesByRoom = async (roomId: string): Promise<ChatMessage[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAMES.MESSAGES, 'readonly');
        const store = transaction.objectStore(STORE_NAMES.MESSAGES);
        const index = store.index('roomId');
        const request = index.getAll(roomId);
        request.onsuccess = () => resolve(request.result.sort((a,b) => a.timestamp - b.timestamp));
        request.onerror = () => reject(request.error);
    });
};

// --- Existing User/Portfolio implementations ---
export const addUser = (user: User) => runTransaction(STORE_NAMES.USERS, 'readwrite', store => store.add(user));
export const getUser = (id: string) => runTransaction<User>(STORE_NAMES.USERS, 'readonly', store => store.get(id));
export const updateUser = (user: User) => runTransaction(STORE_NAMES.USERS, 'readwrite', store => store.put(user));
export const getAllUsers = () => runTransaction<User[]>(STORE_NAMES.USERS, 'readonly', store => store.getAll());
export const deleteUser = (id: string) => runTransaction(STORE_NAMES.USERS, 'readwrite', store => store.delete(id));

export const getPortfolioDataFromDB = () => runTransaction<PortfolioData>(STORE_NAMES.PORTFOLIO, 'readonly', store => store.get('main_portfolio'));
export const savePortfolioDataToDB = (data: PortfolioData) => runTransaction(STORE_NAMES.PORTFOLIO, 'readwrite', store => store.put(data, 'main_portfolio'));

export const saveLead = (lead: Lead) => runTransaction(STORE_NAMES.LEADS, 'readwrite', store => store.add(lead));
export const getLeads = () => runTransaction<Lead[]>(STORE_NAMES.LEADS, 'readonly', store => store.getAll());

export const addReport = (entry: any) => runTransaction(STORE_NAMES.REPORTS, 'readwrite', store => store.add(entry));
export const getReports = () => runTransaction<Report[]>(STORE_NAMES.REPORTS, 'readonly', store => store.getAll());
export const deleteReport = (id: string) => runTransaction(STORE_NAMES.REPORTS, 'readwrite', store => store.delete(id));

// Guestbook Legacy
export const saveGuestbookEntry = (entry: any) => runTransaction(STORE_NAMES.GUESTBOOK, 'readwrite', store => store.add(entry));
export const getGuestbookEntries = () => runTransaction<GuestbookEntry[]>(STORE_NAMES.GUESTBOOK, 'readonly', store => store.getAll());
export const deleteGuestbookEntry = (id: string) => runTransaction(STORE_NAMES.GUESTBOOK, 'readwrite', store => store.delete(id));
export const updateGuestbookEntry = (id: string, fields: any) => runTransaction(STORE_NAMES.GUESTBOOK, 'readwrite', store => {
    const req = store.get(id);
    req.onsuccess = () => {
        if(req.result) store.put({ ...req.result, ...fields });
    };
});
