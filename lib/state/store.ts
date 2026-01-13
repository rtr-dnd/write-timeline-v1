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

export interface ProjectVersion {
  id: string;
  createdAt: string;
  content: string;
  reason: 'manual' | 'ai_backup' | 'auto_save' | 'session_end';
}

export interface Project {
  id: string;
  title: string;
  content: string;
  notes: string;
  threads: Record<string, ChatThread>;
  history: ProjectVersion[];
  lastSnapshotAt: string;
  activeThreadId: string | null;
  lastUpdatedSource?: 'editor' | 'external';
  createdAt: string;
  updatedAt: string;
}

export type ApiMode = 'production' | 'local_expo' | 'local_vercel';

export interface AppState {
  projects: Record<string, Project>;
  settings: {
    apiMode: ApiMode;
  };
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
  settings: {
    apiMode: 'production',
  },
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
  setApiMode: (mode: ApiMode) => {
    store$.settings.apiMode.set(mode);
  },
  addProject: (title: string) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    store$.projects[id].set({
      id,
      title,
      content: "",
      notes: "",
      threads: {},
      history: [],
      lastSnapshotAt: now,
      activeThreadId: null,
      lastUpdatedSource: 'editor',
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
  createSnapshot: (
    projectId: string,
    reason: 'manual' | 'ai_backup' | 'auto_save' | 'session_end'
  ) => {
    const project = store$.projects[projectId];
    const currentContent = project.content.peek();
    const history = project.history.peek() || [];

    // Avoid duplicate snapshots if content hasn't changed from the *very last* snapshot
    // (Optional check, but good for safety. However, for 'ai_backup' we might want to force it)
    if (history.length > 0 && history[0].content === currentContent) {
       return;
    }

    const newVersion: ProjectVersion = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      content: currentContent,
      reason,
    };

    // Add new version to the beginning, keep max 50
    const newHistory = [newVersion, ...history].slice(0, 50);
    
    project.assign({
      history: newHistory,
      lastSnapshotAt: newVersion.createdAt,
    });
  },
  updateProject: (
    id: string,
    data: Partial<Omit<Project, "id" | "createdAt" | "lastUpdatedSource">>,
    source: 'editor' | 'external' = 'editor'
  ) => {
    const project = store$.projects[id];
    const p = project.peek();
    
    if (p) {
      // Auto-save logic: Check if 10 minutes have passed since last snapshot
      // Only trigger if we are updating content
      if (data.content && data.content !== p.content) {
        const lastSnapshotTime = new Date(p.lastSnapshotAt || p.createdAt).getTime();
        const nowTime = new Date().getTime();
        const tenMinutes = 10 * 60 * 1000;

        if (nowTime - lastSnapshotTime > tenMinutes) {
          actions.createSnapshot(id, 'auto_save');
        }
      }

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
