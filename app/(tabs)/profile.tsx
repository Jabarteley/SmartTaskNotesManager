import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Calendar, ChevronRight, LogOut, Mail, Moon, Shield, Smartphone, Sun, User } from 'lucide-react-native';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { theme, isDark, themeMode, setThemeMode } = useTheme();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                        router.replace('/(auth)/login');
                    } catch (error) {
                        Alert.alert('Error', 'Failed to logout');
                    }
                },
            },
        ]);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const ProfileItem = ({
        icon: Icon,
        label,
        value,
    }: {
        icon: any;
        label: string;
        value: string;
    }) => (
        <View style={[styles.profileItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.profileItemIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Icon size={20} color={Colors.primary} />
            </View>
            <View style={styles.profileItemContent}>
                <Text style={[styles.profileItemLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.profileItemValue, { color: theme.text }]}>{value}</Text>
            </View>
        </View>
    );

    const ThemeButton = ({ mode, icon: Icon, label }: { mode: 'light' | 'dark' | 'system'; icon: any; label: string }) => {
        const isActive = themeMode === mode;
        return (
            <TouchableOpacity
                style={[
                    styles.themeButton,
                    {
                        backgroundColor: isActive ? Colors.primary : theme.surface,
                        borderColor: isActive ? Colors.primary : theme.border,
                    },
                ]}
                onPress={() => setThemeMode(mode)}
            >
                <Icon size={20} color={isActive ? '#FFF' : theme.textSecondary} />
                <Text style={[styles.themeButtonText, { color: isActive ? '#FFF' : theme.textSecondary }]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
                </View>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.secondary]}
                        style={styles.avatarGradient}
                    >
                        <Text style={styles.avatarText}>{getInitials(user?.displayName)}</Text>
                    </LinearGradient>
                    <Text style={[styles.userName, { color: theme.text }]}>
                        {user?.displayName || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
                </View>

                {/* Theme Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
                    <View style={styles.themeContainer}>
                        <ThemeButton mode="light" icon={Sun} label="Light" />
                        <ThemeButton mode="dark" icon={Moon} label="Dark" />
                        <ThemeButton mode="system" icon={Smartphone} label="System" />
                    </View>
                </View>

                {/* Profile Info */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account Info</Text>
                    <ProfileItem icon={User} label="Display Name" value={user?.displayName || 'Not set'} />
                    <ProfileItem icon={Mail} label="Email" value={user?.email || 'Not set'} />
                    <ProfileItem
                        icon={Calendar}
                        label="Member Since"
                        value={formatDate(user?.metadata?.creationTime)}
                    />
                    <ProfileItem
                        icon={Shield}
                        label="Email Verified"
                        value={user?.emailVerified ? 'Yes' : 'No'}
                    />
                </View>

                {/* Offline Status */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Storage</Text>
                    <View style={[styles.profileItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={[styles.profileItemIcon, { backgroundColor: Colors.success + '20' }]}>
                            <Text style={{ fontSize: 16 }}>📱</Text>
                        </View>
                        <View style={styles.profileItemContent}>
                            <Text style={[styles.profileItemLabel, { color: theme.textSecondary }]}>Offline Mode</Text>
                            <Text style={[styles.profileItemValue, { color: Colors.success }]}>Enabled</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: Colors.error + '15' }]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                >
                    <LogOut size={20} color={Colors.error} />
                    <Text style={[styles.logoutText, { color: Colors.error }]}>Logout</Text>
                    <ChevronRight size={20} color={Colors.error} />
                </TouchableOpacity>

                {/* App Version */}
                <Text style={[styles.version, { color: theme.textMuted }]}>
                    Smart Task & Notes Manager v1.0.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 40,
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
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        paddingHorizontal: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    themeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    themeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    themeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
    },
    profileItemIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileItemContent: {
        flex: 1,
    },
    profileItemLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    profileItemValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
    },
    logoutText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    version: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 32,
    },
});
