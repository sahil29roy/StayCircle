import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';

export default function OwnerLayout() {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Role guard: only OWNER allowed
  if (user.role !== 'OWNER') {
    return <Redirect href="/(student)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
