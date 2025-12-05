
import type { PortfolioData, GuestbookEntry, Lead, Report, User } from '../types';
import * as DB from './db';

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
        
        if (!response.ok) {
            // console.warn(`API unavailable (Status: ${response.status}). Switching to local DB.`);
            return dbFn();
        }

        const data = await response.json();
        return transformApiData ? transformApiData(data) : data;

    } catch (error) {
        // console.warn("API Network Error (Backend likely down). Switching to local DB.", error);
        return dbFn();
    }
};

// Check backend status
export const checkSystemHealth = async (): Promise<{ status: string; database: string }> => {
    try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) return await res.json();
        return { status: 'offline', database: 'disconnected' };
    } catch {
        return { status: 'offline', database: 'disconnected' };
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

// STRICT SAVE: Attempts to save to Cloud. If fail, THROWS error.
// This prevents the "Saved Locally" silent fallback which confuses admins.
export const savePortfolio = async (data: PortfolioData): Promise<void> => {
    try {
        const response = await fetch(`${API_BASE}/portfolio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Server Error (${response.status}): ${errText}`);
        }

        // If cloud save succeeded, ALSO update local DB to keep them in sync for offline reads
        await DB.savePortfolioDataToDB(data);

    } catch (error: any) {
        console.error("Cloud Save Failed:", error);
        // We throw so the UI shows an error. We do NOT save locally to avoid split-brain data.
        throw error;
    }
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
