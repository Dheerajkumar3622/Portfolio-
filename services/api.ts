import type { PortfolioData, GuestbookEntry, Lead, Report, User } from '../types';
import * as DB from './db';

// ====================================================================================
// HYBRID API SERVICE (Offline-First)
// ------------------------------------------------------------------------------------
// This service attempts to communicate with the Express backend.
// If the backend is unreachable (Network Error) or not set up (404/503),
// it automatically falls back to the local IndexedDB (db.ts).
// ====================================================================================

const API_BASE = '/api';

/**
 * Executes an API call. If it fails (network error, 404, 503),
 * it falls back to the local IndexedDB implementation.
 */
const withFallback = async <T>(
    apiFn: () => Promise<Response>,
    dbFn: () => Promise<T>,
    transformApiData?: (data: any) => T
): Promise<T> => {
    try {
        const response = await apiFn();
        
        // If API endpoint is missing (404), service unavailable (503), or other server error
        if (!response.ok) {
            console.warn(`API unavailable (Status: ${response.status}). Switching to local DB.`);
            return dbFn();
        }

        const data = await response.json();
        return transformApiData ? transformApiData(data) : data;

    } catch (error) {
        console.warn("API Network Error (Backend likely down). Switching to local DB.", error);
        return dbFn();
    }
};

// --- Portfolio API ---
export const getPortfolio = async (): Promise<PortfolioData | null> => {
    return withFallback(
        () => fetch(`${API_BASE}/portfolio`),
        () => DB.getPortfolioDataFromDB(),
        (data) => Object.keys(data).length > 0 ? data : null
    );
};

export const savePortfolio = async (data: PortfolioData): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/portfolio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),
        () => DB.savePortfolioDataToDB(data)
    );
};

// --- Auth / User API ---
export const postUser = async (user: User): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        }),
        () => DB.addUser(user)
    );
};

export const fetchUser = async (id: string): Promise<User | null> => {
    return withFallback(
        () => fetch(`${API_BASE}/auth/user/${id}`),
        () => DB.getUser(id)
    );
};

export const putUser = async (user: User): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/auth/user`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        }),
        () => DB.updateUser(user)
    );
};

export const fetchAllUsers = async (): Promise<User[]> => {
    return withFallback(
        () => fetch(`${API_BASE}/auth/users`),
        () => DB.getAllUsers()
    );
};

export const removeUser = async (id: string): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/auth/user/${id}`, { method: 'DELETE' }),
        () => DB.deleteUser(id)
    );
};

// --- Guestbook API ---
export const postGuestbook = async (entry: { userId: string, message: string }): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/guestbook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        }),
        () => DB.saveGuestbookEntry(entry)
    );
};

export const fetchGuestbook = async (options: { limit?: number, offset?: number } = {}): Promise<GuestbookEntry[]> => {
    return withFallback(
        () => {
            const params = new URLSearchParams();
            if (options.limit) params.append('limit', options.limit.toString());
            if (options.offset) params.append('offset', options.offset.toString());
            return fetch(`${API_BASE}/guestbook?${params.toString()}`);
        },
        () => DB.getGuestbookEntries(options)
    );
};

export const fetchNewerGuestbook = async (timestamp: number): Promise<GuestbookEntry[]> => {
    return withFallback(
        () => fetch(`${API_BASE}/guestbook/newer?timestamp=${timestamp}`),
        () => DB.getNewerGuestbookEntries(timestamp)
    );
};

export const removeGuestbook = async (id: string): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/guestbook/${id}`, { method: 'DELETE' }),
        () => DB.deleteGuestbookEntry(id)
    );
};

export const updateGuestbook = async (id: string, updatedFields: Partial<GuestbookEntry>): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/guestbook/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields),
        }),
        () => DB.updateGuestbookEntry(id, updatedFields)
    );
};

// --- Leads API ---
export const postLead = async (lead: Omit<Lead, 'id' | 'timestamp'>): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/leads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead),
        }),
        () => DB.saveLead(lead)
    );
};

export const fetchLeads = async (): Promise<Lead[]> => {
    return withFallback(
        () => fetch(`${API_BASE}/leads`),
        () => DB.getLeads()
    );
};

// --- Moderation API ---
export const postReport = async (entry: GuestbookEntry): Promise<void> => {
    return withFallback(
        () => {
            const report = {
                messageId: entry.id,
                messageContent: entry.message,
                messageAuthor: entry.userId
            };
            return fetch(`${API_BASE}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report),
            });
        },
        () => DB.addReport(entry)
    );
};

export const fetchReports = async (): Promise<Report[]> => {
    return withFallback(
        () => fetch(`${API_BASE}/reports`),
        () => DB.getReports()
    );
};

export const removeReport = async (id: string): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' }),
        () => DB.deleteReport(id)
    );
};