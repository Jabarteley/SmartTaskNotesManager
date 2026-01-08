import { db } from '@/config/firebaseConfig';
import { Task } from '@/types';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';

const TASKS_COLLECTION = 'tasks';

export const tasksService = {
    // Subscribe to user's tasks in real-time
    subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
        const q = query(
            collection(db, TASKS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const tasks: Task[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Task[];
            callback(tasks);
        });
    },

    // Create a new task
    async createTask(task: Omit<Task, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, TASKS_COLLECTION), task);
        return docRef.id;
    },

    // Update an existing task
    async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
        const taskRef = doc(db, TASKS_COLLECTION, taskId);
        await updateDoc(taskRef, { ...updates, updatedAt: new Date().toISOString() });
    },

    // Delete a task
    async deleteTask(taskId: string): Promise<void> {
        const taskRef = doc(db, TASKS_COLLECTION, taskId);
        await deleteDoc(taskRef);
    },

    // Toggle task status
    async toggleTaskStatus(taskId: string, currentStatus: 'pending' | 'completed'): Promise<void> {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
        await this.updateTask(taskId, { status: newStatus });
    },

    // Get all tasks for a user (one-time fetch)
    async getTasks(userId: string): Promise<Task[]> {
        const q = query(
            collection(db, TASKS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Task[];
    },
};
