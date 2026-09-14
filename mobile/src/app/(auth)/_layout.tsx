import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';

export default function AuthLayout() {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  // If already authenticated, redirect to appropriate role dashboard
  if (isInitialized && isAuthenticated && user) {
    if (user.role === 'STUDENT') {
      return <Redirect href="/(student)/home" />;
    }
    if (user.role === 'OWNER') {
      return <Redirect href="/(owner)/dashboard" />;
    }
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
