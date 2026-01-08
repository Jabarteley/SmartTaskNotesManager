import { db } from '@/config/firebaseConfig';
import { Note } from '@/types';
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

const NOTES_COLLECTION = 'notes';

export const notesService = {
    // Subscribe to user's notes in real-time
    subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
        const q = query(
            collection(db, NOTES_COLLECTION),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const notes: Note[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Note[];
            callback(notes);
        });
    },

    // Create a new note
    async createNote(note: Omit<Note, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, NOTES_COLLECTION), note);
        return docRef.id;
    },

    // Update an existing note
    async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
        const noteRef = doc(db, NOTES_COLLECTION, noteId);
        await updateDoc(noteRef, { ...updates, timestamp: new Date().toISOString() });
    },

    // Delete a note
    async deleteNote(noteId: string): Promise<void> {
        const noteRef = doc(db, NOTES_COLLECTION, noteId);
        await deleteDoc(noteRef);
    },

    // Get all notes for a user (one-time fetch)
    async getNotes(userId: string): Promise<Note[]> {
        const q = query(
            collection(db, NOTES_COLLECTION),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Note[];
    },
};
