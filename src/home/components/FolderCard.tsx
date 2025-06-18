
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Star, StarOff } from 'lucide-react';

type Stack = {
    id: string;
    name: string;
    color: string;
    pinned: boolean;
    locked: boolean;
};

type FolderCardProps = {
    name: string;
    color: string;
    pinned?: boolean;
    stacks?: Stack[];
    onRename?: (newName: string) => void;
    onDelete?: () => void;
    onTogglePin?: () => void;
};

export default function FolderCard({
    name,
    color,
    pinned,
    stacks = [],
    onRename,
    onDelete,
    onTogglePin,
}: FolderCardProps) {
    const [expanded, setExpanded] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);

    const startEditing = () => {
        setEditName(name === "Untitled Folder" ? "" : name);
        setIsEditing(true);
    }

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    return (
        <div className="relative rounded-2xl border border-gray-300 bg-yellow-50 p-3 mb-4">
        {/* top-right */}
        {/* TODO: CETNER TO TITLE */}
        <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
            {pinned ? <Star size={14} className="text-yellow-500" /> : <StarOff size={14} className="text-gray-500"/>}
        </div>

        {/* ROW 1 */}
        <div className="flex items-center gap-2">
            <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isEditing ? (
            <input
                ref={inputRef}
                value={editName}
                placeholder="Untitled Folder"
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                    const trimmed = editName.trim();
                    const finalName = trimmed || "Untitled Folder";
                    setIsEditing(false);
                    onRename?.(finalName);
                }}
                // autoFocus
                className="bg-transparent border-none outline-none font-semibold text-sm"
            />
            ) : (
            <h3
                onClick={startEditing}
                className="font-semibold text-sm cursor-pointer"
            >
                {name || 'Untitled Folder'}
            </h3>
            )}
        </div>

        {/* ROW2 */}
        <div className="mt-1 flex gap-3 text-xs text-gray-400 font-medium">
            {/* DELETE */}
            <button 
                onClick={onDelete} 
                className="hover:text-black transition flex items-center gap-1">
                Delete
            </button>

            {/* STAR */}
            <button 
                onClick={onTogglePin} 
                className="hover:text-black transition flex items-center gap-1">
                {pinned ? 'Unpin' : 'Pin'}
            </button>

            <div
            className="ml-auto w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
            title="Folder Color"
            />
        </div>

        {/* Stack content */}
        {expanded && (
            <div className="mt-2 space-y-2">
            {stacks.map((stack) => (
                <div key={stack.id} className="p-1 border rounded bg-white text-sm">
                {stack.name}
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
