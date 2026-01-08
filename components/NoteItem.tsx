import Colors from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Note } from '@/types';
import { ChevronRight, FileText, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoteItemProps {
    note: Note;
    onPress: () => void;
    onDelete: () => void;
}

export default function NoteItem({ note, onPress, onDelete }: NoteItemProps) {
    const { theme } = useTheme();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: Colors.primaryLight + '20' }]}>
                <FileText size={20} color={Colors.primary} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                    {note.title}
                </Text>
                <Text style={[styles.preview, { color: theme.textSecondary }]} numberOfLines={2}>
                    {note.content}
                </Text>
                <Text style={[styles.date, { color: theme.textMuted }]}>
                    {formatDate(note.timestamp)}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={onDelete}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.deleteButton}
                >
                    <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
                <ChevronRight size={20} color={theme.textMuted} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    preview: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    date: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteButton: {
        padding: 4,
    },
});
