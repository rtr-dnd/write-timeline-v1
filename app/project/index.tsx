import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function ProjectScreen() {
    return (
        <View className="flex-1 bg-background justify-center items-center">
            <Stack.Screen options={{ title: 'New Project' }} />
            <Text className="text-foreground">Project screen</Text>
        </View>
    )
}