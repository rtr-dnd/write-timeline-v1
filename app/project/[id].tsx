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
import { observer } from "@legendapp/state/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { History } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import ProjectBottomSheet from "./BottomSheet";
import { TentapEditor } from "./TentapEditor";

const ProjectDetailScreen = observer(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

  // Sync from Store to Editor (External updates)
  useEffect(() => {
    if (project?.lastUpdatedSource === 'external' && project.content !== content) {
       editor.setContent(project.content);
    }
  }, [project?.content, project?.lastUpdatedSource]);

  // Sync from Editor to Store (User typing)
  useEffect(() => {
    if (content !== undefined && typeof content === "string" && content !== project?.content) {
      actions.updateProject(id, { content }, 'editor');
    }
  }, [content, id]);

  // Session End Snapshot
  useEffect(() => {
    return () => {
      if (project?.content) {
         actions.createSnapshot(id, 'session_end');
      }
    };
  }, [id]);

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
          headerRight: () => (
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={() => router.push(`/project/${id}/history`)}
                className="p-1"
              >
                <History size={24} color={activeTheme.primary} />
              </Pressable>
            </View>
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

      <ProjectBottomSheet id={id} notes={project.notes} />
    </View>
  );
});

export default ProjectDetailScreen;
