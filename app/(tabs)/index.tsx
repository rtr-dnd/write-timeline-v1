import "@/global.css";
import { Project, store$ } from "@/lib/state/store";
import { Observable } from "@legendapp/state";
import { For, observer } from "@legendapp/state/react";
import { ScrollView, Text, View } from "react-native";

function ProjectItem({ item$ }: { item$: Observable<Project> }) {
  const project = item$.get();

  if (!project) return null;

  return (
    <View className="mb-4 rounded-lg border border-border bg-card p-4">
      <Text className="text-lg font-bold text-card-foreground">
        {project.title}
      </Text>
      <Text className="text-sm text-muted-foreground">
        {new Date(project.createdAt).toLocaleString()}
      </Text>
    </View>
  );
}

const Index = observer(() => {
  return (
    <ScrollView contentContainerClassName="p-4">
      <For each={store$.projects} item={ProjectItem} optimized />
      
      {/* Empty state */}
      {Object.keys(store$.projects.get()).length === 0 && (
        <View className="flex-1 items-center justify-center pt-20">
          <Text className="text-muted-foreground">No projects yet</Text>
        </View>
      )}
    </ScrollView>
  );
});

export default Index;
