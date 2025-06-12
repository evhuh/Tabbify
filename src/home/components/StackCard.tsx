
import { useState } from 'react';Lock
import { ChevronDown, ChevronRight, Star, Lock } from 'lucide-react';

type StackCardProps = {
    name: string;
    color: string;
    pinned?: boolean;
    locked?: boolean;
    onRename?: (newName: string) => void;
    onDelete?: () => void;
    onRestore?: () => void;
    onCopyLinks?: () => void;
    onToggleLock?: () => void;
    onTogglePin?: () => void;
};

export default function StackCard({
    name,
    color,
    pinned,
    locked,
    onRename,
    onDelete,
    onRestore,
    //   onCopyLinks,
    onToggleLock,
    onTogglePin,
}: StackCardProps) {
    const [expanded, setExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(name);

    return (
        <div
        className="relative rounded-2xl shadow-md p-3 border border-gray-300 bg-white hover:shadow-lg transition"
        style={{ backgroundColor: color || '#e0f2ff' }}
        >
        {/* Top-right stacked icons */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            {pinned && <Star size={14} className="text-yellow-500" />}
            {locked && <Lock size={14} className="text-black" />}
        </div>

        {/* ROW 1 */}
        <div className="flex justify-between items-center">
            <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isEditing ? (
            <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                setIsEditing(false);
                onRename?.(editName);
                }}
                autoFocus
                className="bg-transparent border-none outline-none font-semibold text-sm w-full"
            />
            ) : (
            <h3
                onClick={() => setIsEditing(true)}
                className="font-semibold text-sm truncate cursor-pointer"
            >
                {name || 'Untitled Stack'}
            </h3>
            )}
            <div
            title="Color Picker"
            className="w-4 h-4 rounded-full border border-white"
            style={{ backgroundColor: color || '#60a5fa' }}
            >
            {/* TODO! add actual color picker logic later */}
            </div>
        </div>

        {/* ROW 2 */}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
            <button onClick={onRestore} className="hover:text-black transition">Restore</button>
            <button onClick={onDelete} className="hover:text-black transition">Delete</button>
            <button onClick={onToggleLock} className="hover:text-black transition">Lock</button>
            <button onClick={onTogglePin} className="hover:text-black transition">Star</button>
        </div>
        </div>
    );
}
