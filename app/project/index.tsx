import { THEME } from "@/lib/theme";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useMemo, useRef } from "react";
import { Keyboard, TextInput, View } from "react-native";

export default function ProjectScreen() {
  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === "dark" ? "dark" : "light"];

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetTextInputRef = useRef<TextInput>(null);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
    if (index === 1) {
      // Focus the TextInput inside the bottom sheet when it is opened
      bottomSheetTextInputRef.current?.focus();
    } else {
      Keyboard.dismiss();
    }
  }, []);
  const snapPoints = useMemo(() => ["15%", "100%"], []);

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <Stack.Screen options={{ title: "New Project" }} />
      <TextInput
        className="w-full flex-1 px-4 py-4 text-foreground"
        placeholderTextColor={activeTheme.mutedForeground}
        placeholder="Start your document here..."
        multiline
        textAlignVertical="top"
      />
      <BottomSheet
        backgroundStyle={{
          backgroundColor: activeTheme.muted,
        }}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={snapPoints}
        enableHandlePanningGesture
        enableContentPanningGesture
      >
        <BottomSheetView className="flex-1 p-2">
          <View className="h-[1200] flex">
            <TextInput
              ref={bottomSheetTextInputRef}
              className="w-full flex-1 px-4 py-4 text-foreground"
              placeholderTextColor={activeTheme.mutedForeground}
              placeholder="Chat here..."
              multiline
              textAlignVertical="top"
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
