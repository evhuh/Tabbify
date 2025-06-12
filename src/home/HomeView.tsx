// full-page Home UI component
import { DndContext } from '@dnd-kit/core';
import LibraryPanel from './components/LibraryPanel';
import WhiteboardPanel from './components/WhiteboardPanel';

export default function HomeView() {
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    console.log('Dragged:', active.id, 'Dropped on:', over?.id);
    // TODO: update Zustand based on drag logic
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
    <div className="flex h-screen overflow-hidden">

      <LibraryPanel />
      <WhiteboardPanel />

    </div>
    </DndContext>
  );
}
