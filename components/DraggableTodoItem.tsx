import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deadline?: string;
}

interface DraggableTodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function DraggableTodoItem({
  todo,
  onToggle,
  onDelete,
}: DraggableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `todo-${todo.id}`,
      data: { todo },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-md
        hover:shadow-sm transition-shadow
        ${isDragging ? "shadow-lg ring-2 ring-blue-400" : ""}
      `}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </div>

      {/* Checkbox to mark as completed */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
      />

      {/* Todo title */}
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

      {/* Delete button */}
      <button
        onClick={() => onDelete(todo.id)}
        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        Delete
      </button>
    </div>
  );
}
