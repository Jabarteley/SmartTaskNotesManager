import Colors from '@/constants/Colors';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useTheme() {
    const colorScheme = useRNColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';

    return { theme, isDark, colorScheme };
}

export { useRNColorScheme as useColorScheme };
