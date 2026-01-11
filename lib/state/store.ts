import { observable } from "@legendapp/state";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import { configureSynced, syncObservable } from "@legendapp/state/sync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UIMessage } from "ai";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export interface ChatThread {
  id: string;
  title: string;
  messages: UIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  content: string;
  notes: string;
  threads: Record<string, ChatThread>;
  activeThreadId: string | null;
  lastUpdatedSource?: 'editor' | 'external';
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
      threads: {},
      activeThreadId: null,
      lastUpdatedSource: 'editor',
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
  updateProject: (
    id: string,
    data: Partial<Omit<Project, "id" | "createdAt" | "lastUpdatedSource">>,
    source: 'editor' | 'external' = 'editor'
  ) => {
    const project = store$.projects[id];
    if (project.peek()) {
      project.assign({
        ...data,
        lastUpdatedSource: source,
        updatedAt: new Date().toISOString(),
      });
    }
  },
  deleteProject: (id: string) => {
    store$.projects[id].delete();
  },
  // Thread actions
  addThread: (projectId: string, title: string = "New Chat") => {
    const threadId = uuidv4();
    const now = new Date().toISOString();
    const newThread: ChatThread = {
      id: threadId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    
    store$.projects[projectId].threads[threadId].set(newThread as any);
    store$.projects[projectId].activeThreadId.set(threadId);
    return threadId;
  },
  deleteThread: (projectId: string, threadId: string) => {
    store$.projects[projectId].threads[threadId].delete();
    if (store$.projects[projectId].activeThreadId.peek() === threadId) {
      store$.projects[projectId].activeThreadId.set(null);
    }
  },
  setActiveThread: (projectId: string, threadId: string | null) => {
    store$.projects[projectId].activeThreadId.set(threadId);
  },
  updateThreadMessages: (projectId: string, threadId: string, messages: UIMessage[]) => {
      const now = new Date().toISOString();
      store$.projects[projectId].threads[threadId].assign({
          messages: messages as any,
          updatedAt: now
      });
  },
};
