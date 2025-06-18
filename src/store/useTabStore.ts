
// TODO:
    // persist whiteboard: WhiteboardItem[] in Zustand + chrome.storage.local
        // whiteboardLayout: Record<StackId, { x: number; y: number }>




// Globa Zustand store
// manage: Folders, Tabs, Stacks, persist all to chrome.storage.local

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistOptions } from 'zustand/middleware';

// Schema
type WhiteboardItem = {
    id: string;
    sourceGroupId: string; // from library
    position: { x: number; y: number };
    width: number;
    height: number;
};

type Tab = {
    id: string;
    title: string;
    url: string;
};

type Stack = {
    id: string;
    name: string;
    color: string;
    pinned: boolean;
    locked: boolean;
    tabs: Tab[];
};

type Folder = {
    id: string;
    name: string;
    pinned: boolean;
    pinnedAt?: number;
    stacks: Stack[];
};

type TabStore = {
    folders: Folder[];
    activeFolderId: string | null;
    globalStacks: Stack[];
    whiteboardItems: WhiteboardItem[];

    // Folder actions
    addFolder: (name: string) => void;
    toggleFolderPin: (id: string) => void;
    removeFolder: (id: string) => void;

    addGlobalStack: (stack: Stack) => void;

    // Stack actions
    addStack: (folderId: string, stack: Stack) => void;
    updateStack: (stackId: string, changes: Partial<Stack>) => void;
    moveStack: (fromFolderId: string, toFolderId: string, stackId: string) => void;
    removeStack: (folderId: string, stackId: string) => void;

    // Whiteboard actions
    addWhiteboardItem: (item: Omit<WhiteboardItem, 'id'>) => void;
    updateWhiteboardItemPosition: (id: string, position: { x: number; y: number }) => void;
    removeWhiteboardItem: (id: string) => void;
    clearWhiteboard: () => void;
};


// Actions 
type TabStorePersist = PersistOptions<TabStore>;

export const useTabStore = create<TabStore>()(
  persist<TabStore, [], [], TabStorePersist>(
    // state and actions
    (set, get) => ({
        folders: [],
        activeFolderId: null,
        globalStacks: [],
        whiteboardItems: [],
        

        addFolder: (name) => {
            const id = crypto.randomUUID();
            const newFolder: Folder = { id, name, pinned: false, stacks: [] };
            set((state) => ({ folders: [...state.folders, newFolder] }));
        },

        toggleFolderPin: (id) => {
            set((state) => ({
            folders: state.folders.map((f) =>
                f.id === id 
                    ? { 
                        ...f, 
                        pinned: !f.pinned,
                        pinnedAt: !f.pinned ? Date.now() : undefined,
                    } 
                    : f
            ),
            }));
        },

        removeFolder: (id) => {
            set((state) => ({
                folders: state.folders.filter((folder) => folder.id !== id),
            }));
        },

        // for popup btn
        addGlobalStack: (stack) => {
            set((state) => ({
                globalStacks: [...state.globalStacks, stack]
            }));
        },

        // for folders
        addStack: (folderId, stack) => {
            set((state) => ({
            folders: state.folders.map((folder) =>
                folder.id === folderId
                ? { ...folder, stacks: [...folder.stacks, stack] }
                : folder
            )
            }));
        },

        updateStack: (stackId, changes) => {
            set((state) => ({
            folders: state.folders.map((folder) => ({
                ...folder,
                stacks: folder.stacks.map((stack) =>
                stack.id === stackId ? { ...stack, ...changes } : stack
                )
            }))
            }));
        },

        moveStack: (fromFolderId, toFolderId, stackId) => {
            const from = get().folders.find((f) => f.id === fromFolderId);
            const to = get().folders.find((f) => f.id === toFolderId);
            const stack = from?.stacks.find((s) => s.id === stackId);
            if (!from || !to || !stack) return;

            set((state) => ({
            folders: state.folders.map((folder) => {
                if (folder.id === fromFolderId) {
                return {
                    ...folder,
                    stacks: folder.stacks.filter((s) => s.id !== stackId)
                };
                }
                if (folder.id === toFolderId) {
                return { ...folder, stacks: [...folder.stacks, stack] };
                }
                return folder;
            })
            }));
        },

        removeStack: (folderId, stackId) => {
            set((state) => ({
            folders: state.folders.map((folder) =>
                folder.id === folderId
                ? {
                    ...folder,
                    stacks: folder.stacks.filter((stack) => stack.id !== stackId)
                    }
                : folder
            )
            }));
        },

        addWhiteboardItem: (item) => {
            const id = crypto.randomUUID();
            const newItem = { ...item, id };
            set(state => ({ whiteboardItems: [...state.whiteboardItems, newItem] }));
        },

        updateWhiteboardItemPosition: (id, position) => {
            set(state => ({
            whiteboardItems: state.whiteboardItems.map(item =>
                item.id === id ? { ...item, position } : item
            )
            }));
        },

        removeWhiteboardItem: (id) => {
            set(state => ({
            whiteboardItems: state.whiteboardItems.filter(item => item.id !== id)
            }));
        },

        clearWhiteboard: () => {
            set({ whiteboardItems: [] });
        },

    }),

    {
        name: 'tabbify-store',
        storage: {
            getItem: (name) =>
                new Promise((resolve) => {
                chrome.storage.local.get([name], (result) => {
                    resolve(result[name] ?? null);
                });
                }),

            setItem: (name, value) =>
                new Promise((resolve) => {
                chrome.storage.local.set({ [name]: value }, () => resolve(undefined));
                }),

            removeItem: (name) =>
                new Promise((resolve) => {
                chrome.storage.local.remove([name], () => resolve(undefined));
                }),
        }
    }
  )
);

export type { Folder, Stack, Tab };
