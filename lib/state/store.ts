import { observable } from "@legendapp/state";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export interface Project {
  id: string;
  title: string;
  content: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  projects: Record<string, Project>;
}

const persistOptions = configureSynced({
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage,
    }),
  },
});

export const store$ = observable<AppState>({
  projects: {},
});

syncObservable(
  store$,
  persistOptions({
    persist: {
      name: "app-store",
    },
  })
);

export const actions = {
  addProject: (title: string) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    store$.projects[id].set({
      id,
      title,
      content: "",
      notes: "",
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
  updateProject: (
    id: string,
    data: Partial<Omit<Project, "id" | "createdAt">>
  ) => {
    const project = store$.projects[id];
    if (project.peek()) {
      project.assign({
        ...data,
        updatedAt: new Date().toISOString(),
      });
    }
  },
  deleteProject: (id: string) => {
    store$.projects[id].delete();
  },
};
