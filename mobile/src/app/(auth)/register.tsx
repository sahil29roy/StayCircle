import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/theme.context';
import { useAuth } from '../../hooks/useAuth';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Text } from '../../components/ui/Text';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { spacing, radius } from '../../constants/spacing';
import { UserRole, Gender } from '../../types/user';
import {
  studentRegisterSchema,
  ownerRegisterSchema,
} from '../../validators/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const { colors } = useTheme();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>(
    params.role === 'OWNER' ? 'OWNER' : 'STUDENT'
  );

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student Fields
  const [gender, setGender] = useState<Gender>('MALE');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('1');

  // Form State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrors({});
    setApiError(null);

    try {
      if (role === 'STUDENT') {
        const payload = {
          name,
          email,
          phone,
          password,
          confirmPassword,
          role: 'STUDENT' as const,
          gender,
          college,
          course,
          year: parseInt(year, 10) || 1,
        };

        const validated = studentRegisterSchema.safeParse(payload);
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

        setIsSubmitting(true);
        await register({
          name: validated.data.name,
          email: validated.data.email,
          phone: validated.data.phone,
          password: validated.data.password,
          role: 'STUDENT',
          gender: validated.data.gender,
          college: validated.data.college,
          course: validated.data.course,
          year: validated.data.year,
        });

        router.replace('/(student)/home');
      } else {
        const payload = {
          name,
          email,
          phone,
          password,
          confirmPassword,
          role: 'OWNER' as const,
        };

        const validated = ownerRegisterSchema.safeParse(payload);
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

        setIsSubmitting(true);
        await register({
          name: validated.data.name,
          email: validated.data.email,
          phone: validated.data.phone,
          password: validated.data.password,
          role: 'OWNER',
        });

        router.replace('/(owner)/dashboard');
      }
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable padding="none" style={styles.screen}>
      <Header />

      <View style={styles.formContent}>
        {/* Title */}
        <View style={styles.headerBlock}>
          <Text variant="heading" style={styles.title}>
            Create your account
          </Text>
          <Text variant="body" color="muted">
            Join the StayCircle community.
          </Text>
        </View>

        {/* Role Toggle Selector */}
        <View
          style={[
            styles.roleToggleContainer,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => setRole('STUDENT')}
            style={[
              styles.roleToggleButton,
              role === 'STUDENT' && [
                styles.roleToggleActive,
                { backgroundColor: colors.surface },
              ],
            ]}
          >
            <Ionicons
              name="school-outline"
              size={18}
              color={role === 'STUDENT' ? colors.primary : colors.muted}
            />
            <Text
              variant="label"
              style={[
                styles.roleToggleText,
                { color: role === 'STUDENT' ? colors.primary : colors.muted },
              ]}
            >
              Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRole('OWNER')}
            style={[
              styles.roleToggleButton,
              role === 'OWNER' && [
                styles.roleToggleActive,
                { backgroundColor: colors.surface },
              ],
            ]}
          >
            <Ionicons
              name="business-outline"
              size={18}
              color={role === 'OWNER' ? colors.primary : colors.muted}
            />
            <Text
              variant="label"
              style={[
                styles.roleToggleText,
                { color: role === 'OWNER' ? colors.primary : colors.muted },
              ]}
            >
              PG Owner
            </Text>
          </TouchableOpacity>
        </View>

        {/* API Error Alert */}
        {apiError && (
          <View style={[styles.errorBanner, { backgroundColor: '#FFEBEE', borderColor: colors.error }]}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text variant="bodySmall" color="error" style={styles.errorBannerText}>
              {apiError}
            </Text>
          </View>
        )}

        {/* Common Inputs */}
        <Input
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoCapitalize="words"
        />

        <Input
          label="Email Address"
          placeholder="e.g. rahul@example.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Phone Number"
          placeholder="e.g. 9876543210"
          value={phone}
          onChangeText={setPhone}
          error={errors.phone}
          keyboardType="phone-pad"
        />

        <PasswordInput
          label="Password"
          placeholder="Minimum 8 characters"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
        />

        {/* Student Specific Fields */}
        {role === 'STUDENT' && (
          <Card padding="md" style={styles.studentFieldsCard}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Student Details
            </Text>

            {/* Gender Selection */}
            <View style={styles.genderContainer}>
              <Text variant="label" style={styles.genderLabel}>
                Gender
              </Text>
              <View style={styles.genderRow}>
                {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g)}
                    style={[
                      styles.genderPill,
                      { borderColor: colors.border },
                      gender === g && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      style={[
                        styles.genderPillText,
                        gender === g
                          ? { color: colors.primaryForeground, fontWeight: '600' }
                          : { color: colors.foreground },
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && (
                <Text variant="caption" color="error">
                  {errors.gender}
                </Text>
              )}
            </View>

            <Input
              label="College / University"
              placeholder="e.g. ABC Institute of Technology"
              value={college}
              onChangeText={setCollege}
              error={errors.college}
              autoCapitalize="words"
            />

            <Input
              label="Course / Program"
              placeholder="e.g. B.Tech Computer Science"
              value={course}
              onChangeText={setCourse}
              error={errors.course}
              autoCapitalize="words"
            />

            <Input
              label="Year of Study (1 - 6)"
              placeholder="e.g. 2"
              value={year}
              onChangeText={setYear}
              error={errors.year}
              keyboardType="number-pad"
            />
          </Card>
        )}

        {/* Submit Button */}
        <Button
          title={isSubmitting ? 'Creating account...' : 'Register'}
          variant="primary"
          size="lg"
          loading={isSubmitting}
          onPress={handleRegister}
          style={styles.submitButton}
        />

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text variant="bodySmall" color="muted">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text variant="bodySmall" color="primary" style={styles.loginLink}>
              Log in
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
  formContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 4,
    marginBottom: spacing.lg,
  },
  roleToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  roleToggleActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  roleToggleText: {
    marginLeft: spacing.xs + 2,
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
  studentFieldsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  genderContainer: {
    marginBottom: spacing.md,
  },
  genderLabel: {
    marginBottom: spacing.xs,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  genderPillText: {
    fontSize: 13,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    fontWeight: '600',
  },
});
