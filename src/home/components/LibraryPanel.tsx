
import { useTabStore, type Folder } from '../../store/useTabStore';
import FolderCard from './FolderCard';

export default function LibraryPanel() {
  // Zustand wiring
  const folders: Folder[] = useTabStore((state) => state.folders);
  const addFolder: (name: string) => void = useTabStore((state) => state.addFolder);
  const toggleFolderPin: (id: string) => void = useTabStore((state) => state.toggleFolderPin);

  return (
     <aside className="w-[28rem] overflow-y-auto bg-gray-100 p-4 border-r border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Library</h2>
        <button
          onClick={() => addFolder('Untitled Folder')}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + Add Folder
        </button>
      </div>

      <div className="space-y-4">
        {folders.map((folder) => (
          <FolderCard
            key={folder.id}
            name={folder.name}
            color="#fffbe0"
            pinned={folder.pinned}
            stacks={folder.stacks}
            onRename={(newName) => {
              // rename by replacing folder in state
              useTabStore.setState((state) => ({
                folders: state.folders.map((f: Folder) =>
                  f.id === folder.id ? { ...f, name: newName } : f
                ),
              }));
            }}
            onTogglePin={() => toggleFolderPin(folder.id)}
          />
        ))}
      </div>
    </aside>
  );
}
