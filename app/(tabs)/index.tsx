import "@/global.css";
import { actions, Project, store$ } from "@/lib/state/store";
import { THEME } from "@/lib/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Observable } from "@legendapp/state";
import { For, observer } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProjectItem = observer(({ item$ }: { item$: Observable<Project> }) => {
  const router = useRouter();
  const project = item$.get();
  const { colorScheme } = useColorScheme();
  const activeTheme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  if (!project) return null;

  const handlePress = () => {
    router.push(`/project/${project.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => actions.deleteProject(project.id) 
        }
      ]
    );
  };

  return (
    <View className="flex-1 flex-row items-center border-b border-border bg-background px-4 py-3">
      <Pressable 
        onPress={handlePress}
        className="flex-1 active:opacity-50"
      >
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {project.title}
        </Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          {new Date(project.createdAt).toLocaleString()}
        </Text>
      </Pressable>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Pressable hitSlop={10} className="ml-2 p-2 active:opacity-50">
            <Ionicons name="ellipsis-vertical" size={20} color={activeTheme.mutedForeground} />
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-40'>
          <DropdownMenuItem onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" className="mr-2" />
            <Text className="text-destructive">Delete</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
});

const Index = observer(() => {
  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-20">
        <For each={store$.projects} item={ProjectItem} optimized />
        
        {/* Empty state */}
        {Object.keys(store$.projects.get()).length === 0 && (
          <View className="flex-1 items-center justify-center pt-20 p-4">
            <Text className="text-muted-foreground text-center">No projects yet</Text>
            <Text className="mt-2 text-sm text-muted-foreground text-center">Tap + in the header to create one</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

export default Index;
