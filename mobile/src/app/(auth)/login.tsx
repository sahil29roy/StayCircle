import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme.context';
import { useAuth } from '../../hooks/useAuth';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { spacing, radius } from '../../constants/spacing';
import { loginSchema } from '../../validators/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrors({});
    setApiError(null);

    const validated = loginSchema.safeParse({ email, password });
    if (!validated.success) {
      const fieldErrors: Record<string, string> = {};
      validated.error.issues.forEach((err) => {
        const field = String(err.path[0] || '');
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(validated.data);

      if (user.role === 'STUDENT') {
        router.replace('/(student)/home');
      } else {
        router.replace('/(owner)/dashboard');
      }
    } catch (err: any) {
      setApiError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable padding="none" style={styles.screen}>
      <Header />

      <View style={styles.content}>
        {/* Title */}
        <View style={styles.headerBlock}>
          <Text variant="heading" style={styles.title}>
            Welcome back
          </Text>
          <Text variant="body" color="muted">
            Log in to manage your stay and your circle.
          </Text>
        </View>

        {/* API Error Alert */}
        {apiError && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: '#FFEBEE', borderColor: colors.error },
            ]}
          >
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text variant="bodySmall" color="error" style={styles.errorBannerText}>
              {apiError}
            </Text>
          </View>
        )}

        {/* Form Inputs */}
        <Input
          label="Email Address"
          placeholder="e.g. rahul@example.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        {/* Forgot Password Link */}
        <View style={styles.forgotPasswordRow}>
          <TouchableOpacity
            onPress={() => {
              alert('Password reset will be available in Part 3.');
            }}
          >
            <Text variant="bodySmall" color="primary" style={styles.forgotText}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <Button
          title={isSubmitting ? 'Logging in...' : 'Log In'}
          variant="primary"
          size="lg"
          loading={isSubmitting}
          onPress={handleLogin}
          style={styles.submitButton}
        />

        {/* Sign up link */}
        <View style={styles.signupRow}>
          <Text variant="bodySmall" color="muted">
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/role-selection')}>
            <Text variant="bodySmall" color="primary" style={styles.signupLink}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  headerBlock: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  errorBannerText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.xs,
  },
  forgotText: {
    fontWeight: '500',
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLink: {
    fontWeight: '600',
  },
});
