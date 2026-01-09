import "@/global.css";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-foreground">
        Welcome to Nativewind!
      </Text>
      <Text className="text-md text-center text-muted-foreground">This is a sample app for Nativewind experience.</Text>
    </View>
  );
}

