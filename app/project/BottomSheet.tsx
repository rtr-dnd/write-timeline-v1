import { THEME } from "@/lib/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";
import { useCallback, useMemo, useRef } from "react";
import { Keyboard, TextInput } from "react-native";
import Chat from "./Chat";

export default function ProjectBottomSheet(props: {
    id: string;
    notes: string;
}) {
  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === "dark" ? "dark" : "light"];

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetTextInputRef = useRef<TextInput>(null);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === 1) {
      bottomSheetTextInputRef.current?.focus();
    } else {
      Keyboard.dismiss();
    }
  }, []);

  const snapPoints = useMemo(() => ["15%", "100%"], []);
    return (
      <BottomSheet
        backgroundStyle={{
          backgroundColor: activeTheme.muted,
        }}
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={snapPoints}
        enableHandlePanningGesture
        android_keyboardInputMode="adjustPan"
      >
        {/* <BottomSheetView className="p-2">
          <View className="flex-1">
            <TextInput
              ref={bottomSheetTextInputRef}
              className="w-full flex-1 px-4 py-4 text-foreground"
              placeholderTextColor={activeTheme.mutedForeground}
              placeholder="Notes here..."
              multiline
              textAlignVertical="top"
              value={props.notes}
              onChangeText={(text) =>
                actions.updateProject(props.id, { notes: text })
              }
            />
          </View>
        </BottomSheetView> */}
        <Chat projectId={props.id} />
      </BottomSheet>
    )
}