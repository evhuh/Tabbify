// full-page Home UI component

export default function HomeView() {
  return (
    <div className="flex h-screen">
      {/* Library Sidebar */}
      <aside className="w-1/4 bg-gray-100 p-4 border-r border-gray-300">
        <h2 className="text-lg font-bold mb-2">Library</h2>
        <div className="space-y-2">
          <div className="bg-white p-2 shadow rounded">Folder 1</div>
          <div className="bg-white p-2 shadow rounded">Folder 2</div>
        </div>
      </aside>

      {/* Whiteboard Area */}
      <main className="flex-1 bg-white p-4">
        <h2 className="text-lg font-bold mb-2">Whiteboard</h2>
        <div className="h-full border-2 border-dashed border-gray-300 rounded p-4">
          Drag Stacks here!
        </div>
      </main>
    </div>
  );
}
