import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/theme.context';
import { spacing } from '../../constants/spacing';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  padding?: keyof typeof spacing | 'none';
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardAvoiding?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  padding = 'lg',
  style,
  contentContainerStyle,
  keyboardAvoiding = true,
}) => {
  const { colors, isDark } = useTheme();

  const paddingVal = padding === 'none' ? 0 : spacing[padding];

  const content = scrollable ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[
        { padding: paddingVal, flexGrow: 1 },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.fill,
        { padding: paddingVal },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  if (safeArea) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }, style]}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {wrappedContent}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {wrappedContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
});

export default Screen;
