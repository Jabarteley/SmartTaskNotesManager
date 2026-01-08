import NoteItem from '@/components/NoteItem';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { notesService } from '@/services/notesService';
import { Note } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Save, Search, StickyNote, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [notes, setNotes] = useState<Note[]>([]);
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = notesService.subscribeToNotes(user.uid, (fetchedNotes) => {
            setNotes(fetchedNotes);
            setLoading(false);
            setRefreshing(false);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            setFilteredNotes(
                notes.filter(
                    (note) =>
                        note.title.toLowerCase().includes(query) ||
                        note.content.toLowerCase().includes(query)
                )
            );
        } else {
            setFilteredNotes(notes);
        }
    }, [notes, searchQuery]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
    }, []);

    const openAddModal = () => {
        setEditingNote(null);
        setNoteTitle('');
        setNoteContent('');
        setModalVisible(true);
    };

    const openEditModal = (note: Note) => {
        setEditingNote(note);
        setNoteTitle(note.title);
        setNoteContent(note.content);
        setModalVisible(true);
    };

    const handleSaveNote = async () => {
        if (!noteTitle.trim()) {
            Alert.alert('Error', 'Please enter a note title');
            return;
        }

        if (!user) return;

        setSaving(true);
        try {
            if (editingNote) {
                await notesService.updateNote(editingNote.id, {
                    title: noteTitle.trim(),
                    content: noteContent.trim(),
                });
            } else {
                await notesService.createNote({
                    title: noteTitle.trim(),
                    content: noteContent.trim(),
                    timestamp: new Date().toISOString(),
                    userId: user.uid,
                });
            }
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteNote = (note: Note) => {
        Alert.alert('Delete Note', `Are you sure you want to delete "${note.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await notesService.deleteNote(note.id);
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete note');
                    }
                },
            },
        ]);
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                <StickyNote size={48} color={Colors.secondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No notes yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Tap the + button to create your first note
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Notes</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                </Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search notes..."
                    placeholderTextColor={theme.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Notes List */}
            <FlatList
                data={filteredNotes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NoteItem
                        note={item}
                        onPress={() => openEditModal(item)}
                        onDelete={() => handleDeleteNote(item)}
                    />
                )}
                contentContainerStyle={filteredNotes.length === 0 ? styles.listEmpty : styles.listContent}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={openAddModal}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[Colors.secondary, Colors.primary]}
                    style={styles.fabGradient}
                >
                    <Plus size={28} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Add/Edit Note Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.flex}
                    >
                        {/* Modal Header */}
                        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.modalHeaderButton, { backgroundColor: theme.surface }]}
                            >
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {editingNote ? 'Edit Note' : 'New Note'}
                            </Text>
                            <TouchableOpacity
                                onPress={handleSaveNote}
                                disabled={saving}
                                style={[styles.modalHeaderButton, { backgroundColor: Colors.primary }]}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Save size={20} color="#FFF" />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Modal Content */}
                        <View style={styles.modalContent}>
                            <TextInput
                                style={[
                                    styles.noteTitleInput,
                                    { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                                ]}
                                placeholder="Note title"
                                placeholderTextColor={theme.textMuted}
                                value={noteTitle}
                                onChangeText={setNoteTitle}
                                maxLength={100}
                            />
                            <TextInput
                                style={[
                                    styles.noteContentInput,
                                    { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                                ]}
                                placeholder="Start typing your note..."
                                placeholderTextColor={theme.textMuted}
                                value={noteContent}
                                onChangeText={setNoteContent}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 16,
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 100,
    },
    listEmpty: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    fabGradient: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    modalHeaderButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    noteTitleInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    noteContentInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        lineHeight: 24,
    },
});
