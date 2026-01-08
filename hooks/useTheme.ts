import Colors from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeContext';

export function useTheme() {
    const { theme, isDark, themeMode, setThemeMode, toggleTheme } = useThemeContext();
    const colors = Colors[theme];

    return {
        theme: colors,
        isDark,
        colorScheme: theme,
        themeMode,
        setThemeMode,
        toggleTheme
    };
}
