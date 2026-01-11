import { actions } from "@/lib/state/store";
import { THEME } from "@/lib/theme";
import Ionicons from '@expo/vector-icons/Ionicons';
import { observer } from "@legendapp/state/react";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { Pressable } from "react-native";

const CreateProjectButton = observer(() => {  
    const { colorScheme } = useColorScheme();
    const activeTheme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleCreateProject = () => {
    actions.addProject(`Project ${new Date().toLocaleTimeString()}`);
  };

  return (
    <Pressable onPress={handleCreateProject} className="mr-4 active:opacity-50">
        <Ionicons name="add" size={24} color={activeTheme.foreground} />
    </Pressable>
  )
})

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const activeTheme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: activeTheme.foreground,
                tabBarInactiveTintColor: activeTheme.mutedForeground,
            }}>
            <Tabs.Screen name="index" options={{
                title: "Projects",
                headerRight: () => (
                    <CreateProjectButton />
                ),
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? "folder-sharp" : "folder-outline"} color={color} size={24} />
                )
            }} />
            <Tabs.Screen name="settings/index" options={{
                title: "Settings",
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? "settings-sharp" : "settings-outline"} color={color} size={24} />
                )
            }} />
        </Tabs>
    );
}