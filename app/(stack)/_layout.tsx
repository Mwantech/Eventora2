// app/(stack)/_layout.tsx
import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: !route.name.startsWith("tempobook"),
      })}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}