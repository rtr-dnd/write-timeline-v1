import { actions, store$ } from "@/lib/state/store";
import { THEME } from "@/lib/theme";
import { generateAPIUrl } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { observer } from "@legendapp/state/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { Check, ChevronLeft, Loader2, MessageSquarePlus, MessageSquare } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const ChatInterface = observer(({ 
  projectId, 
  threadId 
}: { 
  projectId: string; 
  threadId: string;
}) => {
  const [input, setInput] = useState("");
  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === "dark" ? "dark" : "light"];
  
  const thread$ = store$.projects[projectId].threads[threadId];
  const thread = thread$.get();

  const { messages, error, sendMessage } = useChat({
    id: threadId,
    messages: thread?.messages || [],
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
      body: () => ({
        projectContent: store$.projects[projectId].content.peek(),
      }),
    }),
    onError: (error) => console.error(error, "ERROR"),
  });

  useEffect(() => {
    if (messages.length > 0) {
      actions.updateThreadMessages(projectId, threadId, messages);
    }
  }, [messages, projectId, threadId]);

  if (error) return <Text className="p-4 text-destructive">{error.message}</Text>;

  return (
    <View className="flex-1">
      <View className="flex-row items-center p-4 border-b border-border">
        <Pressable 
          onPress={() => actions.setActiveThread(projectId, null)}
          className="mr-3 p-1 rounded-full active:bg-muted"
        >
          <ChevronLeft size={24} color={activeTheme.foreground} />
        </Pressable>
        <Text className="text-lg font-bold text-foreground flex-1" numberOfLines={1}>
          {thread?.title}
        </Text>
      </View>

      <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {messages.map((m) => (
          <View key={m.id} style={{ marginVertical: 8 }}>
            <View>
              <Text className="text-foreground mb-1" style={{ fontWeight: 700 }}>
                {m.role === 'user' ? 'You' : 'AI'}
              </Text>
              {m.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <Text className="text-foreground leading-6" key={`${m.id}-${i}`}>
                        {part.text}
                      </Text>
                    );
                  case "tool-readProjectContent":
                    return (
                      <View
                        key={`${m.id}-${i}`}
                        className="flex-row items-center gap-2 rounded-md bg-muted p-3 my-1"
                      >
                        {part.state === 'output-available' ? (
                          <Check size={16} color={activeTheme.primary} />
                        ) : (
                          <Loader2 size={16} className="animate-spin" color={activeTheme.mutedForeground} />
                        )}
                        <Text className="text-sm font-medium text-muted-foreground">
                           {part.state === 'output-available' ? 'Read content' : 'Reading content...'}
                        </Text>
                      </View>
                    );
                }
              })}
            </View>
          </View>
        ))}
        <View style={{ marginTop: 8 }}>
          <BottomSheetTextInput
            className="text-foreground w-full p-2 border border-input rounded-md"
            placeholder="Chat with AI..."
            placeholderTextColor={activeTheme.mutedForeground}
            value={input}
            onChange={(e) => setInput(e.nativeEvent.text)}
            onSubmitEditing={(e) => {
              e.preventDefault();
              sendMessage({ text: input });
              setInput("");
            }}
          />
        </View>
      </BottomSheetScrollView>
    </View>
  );
});

const ThreadList = observer(({ projectId }: { projectId: string }) => {
  const project$ = store$.projects[projectId];
  const threads = project$.threads.get();
  const threadIds = Object.keys(threads || {}).sort((a, b) => 
    new Date(threads[b].updatedAt).getTime() - new Date(threads[a].updatedAt).getTime()
  );

  const handleCreateThread = () => {
    const title = `Chat ${threadIds.length + 1}`;
    actions.addThread(projectId, title);
  };

  return (
    <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-foreground">AI Chats</Text>
        <Pressable 
          onPress={handleCreateThread}
          className="flex-row items-center bg-primary px-4 py-2 rounded-full active:opacity-80"
        >
          <MessageSquarePlus size={18} color="white" />
          <Text className="text-primary-foreground font-bold ml-2">New Chat</Text>
        </Pressable>
      </View>

      {threadIds.length === 0 ? (
        <View className="items-center justify-center py-10">
          <MessageSquare size={48} color="gray" opacity={0.5} />
          <Text className="text-muted-foreground mt-4 text-center">
            No chats yet. Start a new conversation with AI to help with your writing.
          </Text>
        </View>
      ) : (
        threadIds.map((id) => (
          <Pressable 
            key={id}
            onPress={() => actions.setActiveThread(projectId, id)}
            className="flex-row items-center p-4 mb-3 rounded-xl bg-card border border-border active:bg-muted"
          >
            <View className="bg-primary/10 p-2 rounded-full mr-4">
              <MessageSquare size={20} color={THEME.light.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-lg" numberOfLines={1}>
                {threads[id].title}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {new Date(threads[id].updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </BottomSheetScrollView>
  );
});

export default observer(function Chat({ projectId }: { projectId: string }) {
  const activeThreadId = store$.projects[projectId].activeThreadId.get();

  if (activeThreadId && store$.projects[projectId].threads[activeThreadId].peek()) {
    return <ChatInterface projectId={projectId} threadId={activeThreadId} />;
  }

  return <ThreadList projectId={projectId} />;
});
