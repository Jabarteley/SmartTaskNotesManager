import Colors from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Task } from '@/types';
import { CheckCircle, ChevronRight, Circle, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskItemProps {
    task: Task;
    onPress: () => void;
    onToggle: () => void;
    onDelete: () => void;
}

export default function TaskItem({ task, onPress, onToggle, onDelete }: TaskItemProps) {
    const { theme } = useTheme();
    const isCompleted = task.status === 'completed';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isCompleted && styles.completedContainer,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <TouchableOpacity
                style={styles.checkbox}
                onPress={onToggle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                {isCompleted ? (
                    <CheckCircle size={24} color={Colors.success} />
                ) : (
                    <Circle size={24} color={theme.textMuted} />
                )}
            </TouchableOpacity>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.title,
                        { color: theme.text },
                        isCompleted && styles.completedText,
                    ]}
                    numberOfLines={1}
                >
                    {task.title}
                </Text>
                {task.description ? (
                    <Text
                        style={[styles.description, { color: theme.textSecondary }]}
                        numberOfLines={2}
                    >
                        {task.description}
                    </Text>
                ) : null}
                <View style={styles.meta}>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: isCompleted
                                    ? Colors.successLight + '20'
                                    : Colors.warningLight + '20',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                { color: isCompleted ? Colors.success : Colors.warning },
                            ]}
                        >
                            {isCompleted ? 'Completed' : 'Pending'}
                        </Text>
                    </View>
                </View>
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
    completedContainer: {
        opacity: 0.7,
    },
    checkbox: {
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
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.7,
    },
    description: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
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
