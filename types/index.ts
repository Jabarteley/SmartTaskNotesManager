// Type definitions for the app
export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'completed';
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    timestamp: string;
    userId: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    createdAt: string;
}
