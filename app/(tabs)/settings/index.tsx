import { actions, store$ } from "@/lib/state/store";
import { THEME } from "@/lib/theme";
import { generateAPIUrl } from "@/lib/utils";
import { observer } from "@legendapp/state/react";
import { useColorScheme } from "nativewind";
import { Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === "dark" ? "dark" : "light"];
  const insets = useSafeAreaInsets();
  
  const useLocalApi = store$.settings.useLocalApi.get();
  const currentApiUrl = generateAPIUrl("/api/chat");

  return (
    <View 
      className="flex-1 bg-background" 
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="p-6">
        <Text className="text-3xl font-bold text-foreground mb-8">Settings</Text>

        <View className="bg-card rounded-xl border border-border overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-semibold text-foreground mb-1">
                Use Local API
              </Text>
              <Text className="text-sm text-muted-foreground">
                Enable this to use the local development server (localhost) instead of the production API.
              </Text>
            </View>
            <Switch
              value={useLocalApi}
              onValueChange={actions.toggleApiMode}
              trackColor={{ false: activeTheme.muted, true: activeTheme.primary }}
              thumbColor={useLocalApi ? "#ffffff" : "#f4f3f4"}
            />
          </View>
          
          <View className="p-4 bg-muted/30">
            <Text className="text-xs font-bold text-muted-foreground uppercase mb-1">
              Current API Endpoint
            </Text>
            <Text className="text-sm text-foreground font-mono" numberOfLines={1}>
              {currentApiUrl}
            </Text>
          </View>
        </View>
        
        <Text className="text-sm text-muted-foreground mt-4 text-center">
          The app will connect to this URL for AI chat features.
        </Text>
      </View>
    </View>
  );
});

export default SettingsScreen;