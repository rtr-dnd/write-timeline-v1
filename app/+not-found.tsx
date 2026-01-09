import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Oops!" }} />
            <View className="flex-1 bg-white justify-center items-center px-4">
                <Text className="text-2xl font-bold text-gray-800 mb-4">
                    404 - Page Not Found
                </Text>
                <Link href="/" className="text-lg text-blue-500 underline">
                    Go back to Home
                </Link>
            </View>
        </>
    )
}