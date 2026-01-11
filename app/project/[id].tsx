import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { actions, store$ } from "@/lib/state/store";
import { THEME } from "@/lib/theme";
import {
  CoreBridge,
  TenTapStartKit,
  useEditorBridge,
  useEditorContent,
} from "@10play/tentap-editor";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { observer } from "@legendapp/state/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { TentapEditor } from "./TentapEditor";

const ProjectDetailScreen = observer(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project$ = store$.projects[id];
  const project = project$.get();

  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === "dark" ? "dark" : "light"];

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: project?.content || "",
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(`
        * { background-color: ${activeTheme.background}; color: ${activeTheme.foreground}; }
      `),
    ],
    theme: {
      webview: {
        backgroundColor: activeTheme.background,
      },
    },
  });

  const content = useEditorContent(editor);

  useEffect(() => {
    if (content !== undefined && content !== project?.content) {
      if (typeof content === "string") {
        actions.updateProject(id, { content });
      }
    }
  }, [content, id, project?.content]);

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

  const handleRenameOpen = () => {
    setRenameValue(project?.title || "");
    setIsRenameDialogOpen(true);
    console.log("Rename dialog opened");
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      actions.updateProject(id, { title: renameValue.trim() });
    }
    setIsRenameDialogOpen(false);
  };

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Stack.Screen options={{ title: "Project Not Found" }} />
        <Text className="text-foreground">Project not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Pressable onPress={handleRenameOpen}>
              <Text className="text-lg font-bold text-foreground">
                {project.title}
              </Text>
            </Pressable>
          ),
          headerBackTitle: "Projects",
          headerStyle: {
            backgroundColor: activeTheme.background,
          },
          headerTintColor: activeTheme.foreground,
        }}
      />

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project.
            </DialogDescription>
          </DialogHeader>
          <View className="py-4">
            <Input
              key={isRenameDialogOpen ? 'open' : 'closed'}
              defaultValue={project.title}
              onChangeText={setRenameValue}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-foreground"
              placeholder="Project Name"
              placeholderTextColor={activeTheme.mutedForeground}
              autoFocus
            />
          </View>
          <DialogFooter>
            <DialogClose asChild>
              <Pressable className="mr-2 rounded px-4 py-2 bg-muted">
                 <Text className="text-muted-foreground">Cancel</Text>
              </Pressable>
            </DialogClose>
            <Pressable onPress={handleRenameSubmit} className="rounded px-4 py-2 bg-primary">
               <Text className="font-bold text-primary-foreground">Rename</Text>
            </Pressable>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TentapEditor editor={editor} />

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
          <View className="flex-1">
            <TextInput
              ref={bottomSheetTextInputRef}
              className="w-full flex-1 px-4 py-4 text-foreground"
              placeholderTextColor={activeTheme.mutedForeground}
              placeholder="Notes here..."
              multiline
              textAlignVertical="top"
              value={project.notes}
              onChangeText={(text) =>
                actions.updateProject(id, { notes: text })
              }
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
});

export default ProjectDetailScreen;
