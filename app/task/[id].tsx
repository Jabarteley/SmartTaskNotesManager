import { db } from '@/config/firebaseConfig';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { tasksService } from '@/services/tasksService';
import { Task } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddEditTaskScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const isEditing = id && id !== 'new';
    const { user } = useAuth();
    const { theme } = useTheme();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'pending' | 'completed'>('pending');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    useEffect(() => {
        if (isEditing) {
            fetchTask();
        }
    }, [id]);

    const fetchTask = async () => {
        try {
            const taskDoc = await getDoc(doc(db, 'tasks', id as string));
            if (taskDoc.exists()) {
                const taskData = taskDoc.data() as Task;
                setTitle(taskData.title);
                setDescription(taskData.description || '');
                setStatus(taskData.status);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load task');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        if (!user) return;

        setLoading(true);
        try {
            const now = new Date().toISOString();

            if (isEditing) {
                await tasksService.updateTask(id as string, {
                    title: title.trim(),
                    description: description.trim(),
                    status,
                });
            } else {
                await tasksService.createTask({
                    title: title.trim(),
                    description: description.trim(),
                    status: 'pending',
                    userId: user.uid,
                    createdAt: now,
                    updatedAt: now,
                });
            }

            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: theme.surface }]}
                    >
                        <ArrowLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>
                        {isEditing ? 'Edit Task' : 'New Task'}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Input */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Title</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                            ]}
                            placeholder="Enter task title"
                            placeholderTextColor={theme.textMuted}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />
                    </View>

                    {/* Description Input */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                            ]}
                            placeholder="Enter task description (optional)"
                            placeholderTextColor={theme.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Status Selection (only for editing) */}
                    {isEditing && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Status</Text>
                            <View style={styles.statusContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        {
                                            backgroundColor:
                                                status === 'pending' ? Colors.warning + '20' : theme.surface,
                                            borderColor: status === 'pending' ? Colors.warning : theme.border,
                                        },
                                    ]}
                                    onPress={() => setStatus('pending')}
                                >
                                    <Text
                                        style={[
                                            styles.statusButtonText,
                                            { color: status === 'pending' ? Colors.warning : theme.textSecondary },
                                        ]}
                                    >
                                        Pending
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.statusButton,
                                        {
                                            backgroundColor:
                                                status === 'completed' ? Colors.success + '20' : theme.surface,
                                            borderColor: status === 'completed' ? Colors.success : theme.border,
                                        },
                                    ]}
                                    onPress={() => setStatus('completed')}
                                >
                                    <Text
                                        style={[
                                            styles.statusButtonText,
                                            { color: status === 'completed' ? Colors.success : theme.textSecondary },
                                        ]}
                                    >
                                        Completed
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.saveButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.saveButtonText}>
                                        {isEditing ? 'Update Task' : 'Create Task'}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    textArea: {
        minHeight: 120,
        paddingTop: 14,
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    statusButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 16,
        paddingBottom: 24,
    },
    saveButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
