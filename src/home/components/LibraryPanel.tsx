
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useTabStore, type Folder } from '../../store/useTabStore';
import FolderCard from './FolderCard';
import StackCard from './StackCard';

function SortableCard({ item }: { item: { id: string; type: 'folder' | 'stack' } }) {
  const toggleFolderPin: (id: string) => void = useTabStore((state) => state.toggleFolderPin);
  const removeFolder = useTabStore((state) => state.removeFolder);

  const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({
    id: `${item.type}-${item.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderTop: isOver ? '2px solid orange' : undefined,
  };

  const store = useTabStore.getState();

  if (item.type === 'folder') {
    const folder = store.folders.find(f => f.id === item.id)!;
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <FolderCard
          key={folder.id}
          name={folder.name}
          color="#fffbe0"
          pinned={folder.pinned}
          stacks={folder.stacks}
          onRename={(newName) => {
            useTabStore.setState((state) => ({
              folders: state.folders.map((f: Folder) =>
                f.id === folder.id ? { ...f, name: newName } : f
              ),
            }));
          }}
          onTogglePin={() => toggleFolderPin(folder.id)}
          onDelete={() => removeFolder(folder.id)}
        />
      </div>
    );
  }

  const stack = store.globalStacks.find(s => s.id === item.id)!;
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StackCard
        {...stack}
        onRename={(newName) => useTabStore.setState(state => ({
          globalStacks: state.globalStacks.map(s => s.id === stack.id ? { ...s, name: newName } : s)
        }))}
        onTogglePin={() => {
          const now = Date.now();
          useTabStore.setState(state => ({
            globalStacks: state.globalStacks.map(s =>
              s.id === stack.id
                ? {
                    ...s,
                    pinned: !s.pinned,
                    pinnedAt: !s.pinned ? now : undefined
                  }
                : s
            )
          }));
        }}
        onDelete={() => {
          useTabStore.setState(state => ({
            globalStacks: state.globalStacks.filter(s => s.id !== stack.id)
          }));
        }}
        onRestore={() => {}}
      />
    </div>
  );
}


export default function LibraryPanel() {
  // Zustand wiring
  const folders: Folder[] = useTabStore((state) => state.folders);
  const addFolder: (name: string) => void = useTabStore((state) => state.addFolder);
  // const toggleFolderPin: (id: string) => void = useTabStore((state) => state.toggleFolderPin);
  // const removeFolder = useTabStore((state) => state.removeFolder);
  const globalStacks = useTabStore((state) => state.globalStacks);

  // TODO: intiailzie to allow Stacks within Folders to move amongst themselves and outside
  // TODO: initialize to keep free-floating Stacks and Folders to be pinned and dnd'ed 
  // dnd-kit sensors and state
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 }, })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  type Item = { id: string; type: "folder" | "stack" };

  // sort by pinned and unpinned {type, id}
  const pinnedItems: Item[] = [
    ...folders
      .filter(f => f.pinned)
      .sort((a, b) => (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0))
      .map(f => ({ type: 'folder' as const, id: f.id })),
    ...globalStacks
      .filter(s => s.pinned)
      .sort((a, b) => (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0))
      .map(s => ({ type: 'stack' as const, id: s.id })),
  ];
  const unpinnedItems: Item[] = [
    ...folders.filter(f => !f.pinned).map(f => ({ type: 'folder' as const, id: f.id })),
    ...globalStacks.filter(s => !s.pinned).map(s => ({ type: 'stack' as const, id: s.id })),
  ];

  const allItems = [...pinnedItems, ...unpinnedItems];
  const allIds = allItems.map(item => `${item.type}-${item.id}`);
  const pinnedIds = pinnedItems.map(item => `${item.type}-${item.id}`);
  const unpinnedIds = unpinnedItems.map(item => `${item.type}-${item.id}`);

  // drag end handler
  function handleDragEnd(event: { active: any; over: any }) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const pinnedSet = new Set(pinnedIds);

    const activeList = pinnedSet.has(active.id) ? pinnedIds : unpinnedIds;
    const otherList = pinnedSet.has(active.id) ? unpinnedIds : pinnedIds;

    const oldIndex = activeList.indexOf(active.id);
    const newIndex = activeList.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(activeList, oldIndex, newIndex);

    // merge reordered active list with other unchanged list
    const combinedOrder = pinnedSet.has(active.id)
      ? [...newOrder, ...otherList]
      : [...otherList, ...newOrder];

    useTabStore.getState().reorderLibraryItems(combinedOrder);
  }

  // find active tiem for DragOverlay preview
  const activeItem = activeId
    ? allItems.find(item => `${item.type}-${item.id}` === activeId) ?? null
    : null;



  return (
    //  TOP
     <aside className="w-[28rem] overflow-y-auto bg-gray-100 p-4 border-r border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Library</h2>
        <button
          onClick={() => addFolder('Untitled Folder')}
          className="px-3 py-1 bg-blue-300 text-white text-sm rounded hover:bg-blue-400"
        >
          + Add Folder
        </button>
      </div>
      
      {/* ITEMS */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => setActiveId(String(active.id))}
        onDragEnd={handleDragEnd}
      >

        
        <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
          {allItems.map((item, idx) => {
            const id = `${item.type}-${item.id}`;
            const isLastPinned = idx === pinnedItems.length - 1;

            return (
              <div key={id}>
                <SortableCard item={item} />
                {isLastPinned && <hr className="my-2 border-t border-gray-300" />}
              </div>
            );
          })}
        </SortableContext>
        



        <DragOverlay>
          {activeItem ? <SortableCard item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </aside>
  );
}
