import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';

export default function StudentLayout() {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Role guard: only STUDENT allowed
  if (user.role !== 'STUDENT') {
    return <Redirect href="/(owner)/dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="home" />
    </Stack>
  );
}
