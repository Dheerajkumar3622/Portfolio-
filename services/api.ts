import type { PortfolioData, GuestbookEntry, Lead, Report, User } from '../types';

// ====================================================================================
// FULL STACK API SERVICE
// ------------------------------------------------------------------------------------
// This file communicates with the Express backend located in server.js.
// ====================================================================================

const API_BASE = '/api';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Network response was not ok');
    }
    return response.json();
};

// --- Portfolio API ---
export const getPortfolio = async (): Promise<PortfolioData | null> => {
    try {
        const response = await fetch(`${API_BASE}/portfolio`);
        const data = await handleResponse(response);
        // If empty object returned, treat as null to trigger default data load
        return Object.keys(data).length > 0 ? data : null;
    } catch (error) {
        console.error("Error fetching portfolio:", error);
        return null;
    }
};

export const savePortfolio = async (data: PortfolioData): Promise<void> => {
    await fetch(`${API_BASE}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

// --- Auth / User API ---
export const postUser = async (user: User): Promise<void> => {
    await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
};

export const fetchUser = async (id: string): Promise<User | null> => {
    const response = await fetch(`${API_BASE}/auth/user/${id}`);
    return handleResponse(response);
};

export const putUser = async (user: User): Promise<void> => {
    await fetch(`${API_BASE}/auth/user`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
};

export const fetchAllUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE}/auth/users`);
    return handleResponse(response);
};

export const removeUser = async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/auth/user/${id}`, {
        method: 'DELETE',
    });
};

// --- Guestbook API ---
export const postGuestbook = async (entry: { userId: string, message: string }): Promise<void> => {
    await fetch(`${API_BASE}/guestbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
};

export const fetchGuestbook = async (options: { limit?: number, offset?: number } = {}): Promise<GuestbookEntry[]> => {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    
    const response = await fetch(`${API_BASE}/guestbook?${params.toString()}`);
    return handleResponse(response);
};

export const fetchNewerGuestbook = async (timestamp: number): Promise<GuestbookEntry[]> => {
    const response = await fetch(`${API_BASE}/guestbook/newer?timestamp=${timestamp}`);
    return handleResponse(response);
};

export const removeGuestbook = async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/guestbook/${id}`, {
        method: 'DELETE',
    });
};

export const updateGuestbook = async (id: string, updatedFields: Partial<GuestbookEntry>): Promise<void> => {
    await fetch(`${API_BASE}/guestbook/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
    });
};

// --- Leads API ---
export const postLead = async (lead: Omit<Lead, 'id' | 'timestamp'>): Promise<void> => {
    await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
    });
};

export const fetchLeads = async (): Promise<Lead[]> => {
    const response = await fetch(`${API_BASE}/leads`);
    return handleResponse(response);
};

// --- Moderation API ---
export const postReport = async (entry: GuestbookEntry): Promise<void> => {
    const report = {
        messageId: entry.id,
        messageContent: entry.message,
        messageAuthor: entry.userId
    };
    await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
    });
};

export const fetchReports = async (): Promise<Report[]> => {
    const response = await fetch(`${API_BASE}/reports`);
    return handleResponse(response);
};

export const removeReport = async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/reports/${id}`, {
        method: 'DELETE',
    });
};