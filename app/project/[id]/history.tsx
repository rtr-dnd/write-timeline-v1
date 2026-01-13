import { actions, store$ } from "@/lib/state/store";
import { THEME } from "@/lib/theme";
import {
  CoreBridge,
  RichText,
  TenTapStartKit,
  useEditorBridge,
} from "@10play/tentap-editor";
import { observer } from "@legendapp/state/react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Clock, RotateCcw } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const HistoryScreen = observer(() => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = store$.projects[id].get();
  const history = project?.history || [];
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    history[0]?.id || null
  );

  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === "dark" ? "dark" : "light"];

  const selectedVersion = history.find((v) => v.id === selectedVersionId);

  const previewEditor = useEditorBridge({
    editable: false,
    autofocus: false,
    initialContent: selectedVersion?.content || "",
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(`
        * { background-color: ${activeTheme.background}; color: ${activeTheme.foreground}; }
        p { margin: 0.5rem 0; }
      `),
    ],
    theme: {
      webview: {
        backgroundColor: activeTheme.background,
      },
    },
  });

  useEffect(() => {
    if (selectedVersion) {
      previewEditor.setContent(selectedVersion.content);
    }
  }, [selectedVersion, previewEditor]);

  const handleRestore = () => {
    if (!selectedVersion) return;

    // 1. Save current state before restoring
    actions.createSnapshot(id, "manual");

    // 2. Overwrite current content with selected version
    actions.updateProject(id, { content: selectedVersion.content }, "external");

    router.back();
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'manual': return 'Manual Save';
      case 'ai_backup': return 'Pre-AI Backup';
      case 'auto_save': return 'Auto Save';
      case 'session_end': return 'Session End';
      default: return reason;
    }
  };

  if (!project) {
     return <View className="flex-1 bg-background" />;
  }

  return (
    <View className="flex-1 bg-background flex-row">
      <Stack.Screen options={{ 
        title: "History",
        headerBackTitle: "Editor"
      }} />

      {/* List of Versions */}
      <View className="w-1/3 border-r border-border bg-muted/20">
        <ScrollView contentContainerStyle={{ padding: 8 }}>
          {history.length === 0 ? (
              <Text className="text-muted-foreground p-4 text-center">No history yet</Text>
          ) : (
            history.map((version) => (
              <Pressable
                key={version.id}
                onPress={() => setSelectedVersionId(version.id)}
                className={`p-3 mb-2 rounded-lg border ${
                  selectedVersionId === version.id
                    ? "bg-primary/20 border-primary"
                    : "bg-card border-border"
                }`}
              >
                <View className="flex-row items-center mb-1">
                  <Clock size={12} color={activeTheme.mutedForeground} />
                  <Text className="text-xs text-muted-foreground ml-1">
                    {new Date(version.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text className="text-foreground font-semibold text-xs mb-1">
                  {getReasonLabel(version.reason)}
                </Text>
                <Text className="text-muted-foreground text-[10px]">
                    {new Date(version.createdAt).toLocaleDateString()}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>

      {/* Preview Area */}
      <View className="flex-1 bg-background relative">
        {selectedVersion ? (
          <>
            <View className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
              <Pressable
                onPress={handleRestore}
                className="bg-primary px-4 py-2 rounded-full flex-row items-center shadow-md"
              >
                <RotateCcw size={16} className="text-primary-foreground" />
                <Text className="text-primary-foreground text-sm font-bold ml-2">Restore This Version</Text>
              </Pressable>
            </View>
            <View className="flex-1 p-4">
               <RichText editor={previewEditor} />
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center p-4">
             <Text className="text-muted-foreground">Nothing selected</Text>
          </View>
        )}
      </View>
    </View>
  );
});

export default HistoryScreen;
