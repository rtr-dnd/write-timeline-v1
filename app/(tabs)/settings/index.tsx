import { actions, ApiMode, store$ } from "@/lib/state/store";
import { THEME } from "@/lib/theme";
import { generateAPIUrl } from "@/lib/utils";
import { observer } from "@legendapp/state/react";
import { Check } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();
  
  const apiMode = store$.settings.apiMode.get() || 'production';
  const currentApiUrl = generateAPIUrl("/api/chat");

  const ModeOption = ({ mode, label, description }: { mode: ApiMode; label: string; description: string }) => (
    <Pressable
      onPress={() => actions.setApiMode(mode)}
      className={`flex-row items-center p-4 border-b border-border ${apiMode === mode ? 'bg-muted/20' : ''}`}
    >
      <View className="flex-1 pr-4">
        <Text className={`text-base font-semibold ${apiMode === mode ? 'text-primary' : 'text-foreground'}`}>
          {label}
        </Text>
        <Text className="text-xs text-muted-foreground mt-0.5">
          {description}
        </Text>
      </View>
      {apiMode === mode && (
        <Check size={20} color={activeTheme.primary} />
      )}
    </Pressable>
  );

  return (
    <View 
      className="flex-1 bg-background" 
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="p-4">
        <View className="bg-card rounded-xl border border-border overflow-hidden mb-6">
          <View className="p-4 border-b border-border bg-muted/10">
            <Text className="text-lg font-bold text-foreground">API Connection</Text>
            <Text className="text-sm text-muted-foreground">
              Select which server the app connects to.
            </Text>
          </View>
          
          <ModeOption 
            mode="production" 
            label="Production" 
            description="Uses the deployed Vercel API (EXPO_PUBLIC_API_BASE_URL)." 
          />
          <ModeOption 
            mode="local_expo" 
            label="Local (Expo)" 
            description="Connects to the API hosted within the Expo Dev Server." 
          />
          <ModeOption 
            mode="local_vercel" 
            label="Local (Vercel)" 
            description="Connects to localhost:3000 (vercel dev)." 
          />

          <View className="p-4 bg-muted/30">
            <Text className="text-xs font-bold text-muted-foreground uppercase mb-1">
              Active Endpoint
            </Text>
            <Text className="text-sm text-foreground font-mono" numberOfLines={1}>
              {currentApiUrl}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

export default SettingsScreen;