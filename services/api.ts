
import type { PortfolioData, GuestbookEntry, Lead, Report, User, ChatRoom, ChatMessage } from '../types';
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
        if (!response.ok) return dbFn();
        const data = await response.json();
        return transformApiData ? transformApiData(data) : data;
    } catch (error) {
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
        await DB.savePortfolioDataToDB(data);
    } catch (error: any) {
        console.error("Cloud Save Failed:", error);
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
        () => DB.addUser(user).then(() => {})
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
        () => DB.updateUser(user).then(() => {})
    );
};

export const fetchAllUsers = async (): Promise<User[]> => {
    return withFallback(
        () => fetch(`${API_BASE}/auth/users`),
        () => DB.getAllUsers()
    );
};

// --- New Chat System API ---

export const getMyRooms = async (userId: string): Promise<ChatRoom[]> => {
    return withFallback(
        () => fetch(`${API_BASE}/chat/rooms/${userId}`),
        () => DB.getRooms().then(rooms => rooms.filter(r => r.participants.includes(userId) || r.type === 'global'))
    );
};

export const getRoomMessages = async (roomId: string): Promise<ChatMessage[]> => {
    return withFallback(
        () => fetch(`${API_BASE}/chat/messages/${roomId}`),
        () => DB.getMessagesByRoom(roomId)
    );
};

export const createDMRoom = async (participants: string[]): Promise<ChatRoom> => {
    return withFallback(
        () => fetch(`${API_BASE}/chat/room/dm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participants }),
        }),
        async () => {
             // Mock offline DM creation
             const id = `dm-${participants.sort().join('-')}`;
             const room = { id, type: 'dm', participants, updatedAt: Date.now() } as ChatRoom;
             await DB.saveRoom(room);
             return room;
        }
    );
};

export const createGroupRoom = async (name: string, participants: string[], adminId: string): Promise<ChatRoom> => {
    return withFallback(
        () => fetch(`${API_BASE}/chat/room/group`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, participants, adminId }),
        }),
        async () => {
             const id = `group-${Date.now()}`;
             const room = { id, name, type: 'group', participants: [...participants, adminId], admins: [adminId], updatedAt: Date.now() } as ChatRoom;
             await DB.saveRoom(room);
             return room;
        }
    );
};


// --- Legacy Guestbook API (Kept for compatibility if needed) ---
export const postGuestbook = async (entry: { userId: string, message: string }): Promise<void> => {
    return withFallback(
        () => fetch(`${API_BASE}/guestbook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        }),
        () => DB.saveGuestbookEntry({ ...entry, id: crypto.randomUUID(), timestamp: Date.now() }).then(() => {})
    );
};

export const fetchGuestbook = async (options: { limit?: number, offset?: number } = {}): Promise<GuestbookEntry[]> => {
    return withFallback(
        () => {
            const params = new URLSearchParams();
            if (options.limit) params.append('limit', options.limit.toString());
            return fetch(`${API_BASE}/guestbook?${params.toString()}`);
        },
        () => DB.getGuestbookEntries()
    );
};
export const fetchNewerGuestbook = async (timestamp: number) => fetchGuestbook(); // Fallback
export const postReport = async (entry: any) => Promise.resolve();
export const fetchReports = async () => [];
export const fetchLeads = async () => [];
