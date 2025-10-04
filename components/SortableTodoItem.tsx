import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deadline?: string;
  order: number;
}

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newTitle: string) => void;
}

export default function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
}: SortableTodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `todo-${todo.id}`,
    data: { todo },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(todo.title);
  };

  const handleSave = () => {
    if (editValue.trim() !== "") {
      onEdit(todo.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(todo.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isEditing ? {} : listeners)}
      className={`
        flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-md
        hover:shadow-sm transition-shadow
        ${isEditing ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        ${isDragging ? "shadow-lg ring-2 ring-blue-400 z-50" : ""}
      `}
    >
      {/* Checkbox to mark as completed */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
      />

      {/* Todo title - editable or display */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          autoFocus
          className="flex-1 px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      ) : (
        <span
          className={`flex-1 ${
            todo.completed ? "line-through text-gray-400" : "text-gray-900"
          }`}
        >
          {todo.title}
          {todo.deadline && (
            <span className="ml-2 text-xs text-blue-600 font-medium">
              📅 {new Date(todo.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </span>
      )}

      {/* Edit button */}
      {!isEditing && (
        <button
          onClick={handleEdit}
          onPointerDown={(e) => e.stopPropagation()}
          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        >
          Edit
        </button>
      )}

      {/* Delete button */}
      <button
        onClick={() => onDelete(todo.id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
