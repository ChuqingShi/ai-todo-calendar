import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deadline?: string;
  order: number;
}

interface WeeklyCalendarProps {
  todos: Todo[];
  currentWeekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  selectedDate?: string;
  onDateClick?: (dateStr: string) => void;
}

interface DayCardProps {
  date: Date;
  todos: Todo[];
  selectedDate?: string;
  onDateClick?: (dateStr: string) => void;
}

interface CalendarTodoItemProps {
  todo: Todo;
}

function CalendarTodoItem({ todo }: CalendarTodoItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        text-xs p-2 rounded border cursor-grab active:cursor-grabbing
        ${todo.completed
          ? "bg-gray-50 border-gray-200 line-through text-gray-400"
          : "bg-blue-50 border-blue-200 text-blue-900"
        }
        ${isDragging ? "shadow-lg ring-2 ring-blue-400" : ""}
      `}
    >
      {todo.title.length > 20
        ? `${todo.title.substring(0, 20)}...`
        : todo.title}
    </div>
  );
}

function DayCard({ date, todos, selectedDate, onDateClick }: DayCardProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
  });

  const todosForDay = todos
    .filter((todo) => todo.deadline === dateStr)
    .sort((a, b) => a.order - b.order);

  const isToday = isSameDay(date, new Date());
  const isSelected = selectedDate === dateStr;

  const handleDateClick = () => {
    if (onDateClick) {
      onDateClick(dateStr);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-32 p-3 border rounded-lg transition-all
        ${isOver ? "bg-blue-50 border-blue-400 border-2" : "bg-white border-gray-200"}
        ${isToday ? "ring-2 ring-blue-300" : ""}
        ${isSelected ? "ring-2 ring-green-400" : ""}
      `}
    >
      <div
        className="text-center mb-2 cursor-pointer hover:bg-gray-50 rounded-md py-1"
        onClick={handleDateClick}
      >
        <div className="text-xs font-semibold text-gray-600 uppercase">
          {format(date, "EEE")}
        </div>
        <div className={`text-lg font-bold ${isToday ? "text-blue-600" : "text-gray-900"}`}>
          {format(date, "d")}
        </div>
      </div>

      <SortableContext
        items={todosForDay.map((todo) => `todo-${todo.id}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1 pointer-events-auto">
          {todosForDay.map((todo) => (
            <CalendarTodoItem key={todo.id} todo={todo} />
          ))}
          {todosForDay.length === 0 && (
            <div className="text-xs text-gray-300 text-center py-2 pointer-events-none">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function WeeklyCalendar({
  todos,
  currentWeekStart,
  onPreviousWeek,
  onNextWeek,
  selectedDate,
  onDateClick,
}: WeeklyCalendarProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Week of {format(currentWeekStart, "MMM d, yyyy")}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onPreviousWeek}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
          >
            ← Prev
          </button>
          <button
            onClick={onNextWeek}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <DayCard
            key={day.toISOString()}
            date={day}
            todos={todos}
            selectedDate={selectedDate}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}
