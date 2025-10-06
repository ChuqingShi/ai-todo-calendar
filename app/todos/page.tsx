"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, useDroppable, DragOverEvent, pointerWithin } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { startOfWeek, format } from "date-fns";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import SortableTodoItem from "@/components/SortableTodoItem";
import StaticTodoItem from "@/components/StaticTodoItem";

/**
 * Todo Interface
 * Each todo has an id, title, completed status, optional deadline, and order
 */
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deadline?: string; // ISO date string (YYYY-MM-DD)
  order: number; // For manual ordering
}

const STORAGE_KEY = "ai-todo-calendar-todos";

export default function TodosPage() {
  // State to store todos (persisted in localStorage)
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );

  /**
   * Load todos from localStorage on mount and when window regains focus
   */
  useEffect(() => {
    const loadTodos = () => {
      if (typeof window !== "undefined") {
        try {
          const savedTodos = localStorage.getItem(STORAGE_KEY);
          if (savedTodos) {
            const parsed = JSON.parse(savedTodos);
            // Add order field to old todos that don't have it
            const todosWithOrder = parsed.map((todo: Todo, index: number) => ({
              ...todo,
              order: todo.order !== undefined ? todo.order : index,
            }));
            setTodos(todosWithOrder);
          }
        } catch (error) {
          console.error("Failed to load todos from localStorage:", error);
        }
        setIsLoaded(true);
      }
    };

    loadTodos();

    // Reload when window regains focus (e.g., when navigating back)
    window.addEventListener("focus", loadTodos);

    return () => {
      window.removeEventListener("focus", loadTodos);
    };
  }, []);

  /**
   * Save todos to localStorage whenever they change (but only after initial load)
   */
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error("Failed to save todos to localStorage:", error);
      }
    }
  }, [todos, isLoaded]);

  /**
   * Add a new todo
   */
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    const newTodo: Todo = {
      id: Date.now(), // Simple unique ID generator
      title: inputValue,
      completed: false,
      order: todos.length, // Add to end
    };

    setTodos([...todos, newTodo]);
    setInputValue("");
  };

  /**
   * Toggle todo completion status
   */
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  /**
   * Delete a todo
   */
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  /**
   * Edit a todo's title
   */
  const editTodo = (id: number, newTitle: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, title: newTitle } : todo
      )
    );
  };

  /**
   * Handle drag end - update todo deadline or reorder
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeTodoId = parseInt(activeId.replace("todo-", ""));
    const overTodoId = parseInt(overId.replace("todo-", ""));

    const activeTodo = todos.find((t) => t.id === activeTodoId);
    const overTodo = todos.find((t) => t.id === overTodoId);

    // Check if this is a same-day reordering operation (both todos have same deadline)
    if (activeTodo && overTodo && activeTodo.deadline === overTodo.deadline) {
      // Get the list of todos for this specific deadline
      const todoList = activeTodo.deadline
        ? todos.filter((t) => t.deadline === activeTodo.deadline).sort((a, b) => a.order - b.order)
        : todos.filter((t) => !t.deadline).sort((a, b) => a.order - b.order);

      const oldIndex = todoList.findIndex((t) => t.id === activeTodoId);
      const newIndex = todoList.findIndex((t) => t.id === overTodoId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(todoList, oldIndex, newIndex);

        // Create a map of todo IDs to their new order values
        const orderMap = new Map(reordered.map((todo, index) => [todo.id, index]));

        // Update order values for todos in this specific list
        const updatedTodos = todos.map((todo) => {
          if (orderMap.has(todo.id)) {
            return { ...todo, order: orderMap.get(todo.id)! };
          }
          return todo;
        });

        setTodos(updatedTodos);
        return;
      }
    }

    // Handle calendar drop (setting deadline)
    const todoId = activeTodoId;
    const dropTarget = overId;

    // If dropped on unscheduled zone, remove deadline and set order to end
    if (dropTarget === "unscheduled") {
      const unscheduledCount = todos.filter((t) => !t.deadline).length;
      setTodos(
        todos.map((todo) =>
          todo.id === todoId
            ? { ...todo, deadline: undefined, order: unscheduledCount }
            : todo
        )
      );
    } else if (dropTarget.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Otherwise set the deadline to the date (if it's a valid date format)
      const targetDayTodos = todos
        .filter((t) => t.deadline === dropTarget)
        .sort((a, b) => a.order - b.order);

      setTodos(
        todos.map((todo) =>
          todo.id === todoId
            ? { ...todo, deadline: dropTarget, order: targetDayTodos.length }
            : todo
        )
      );
    }
  };

  /**
   * Navigate to previous week
   */
  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  /**
   * Navigate to next week
   */
  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), "yyyy-MM-dd");

  // Separate todos into unscheduled and selected day's todos, sorted by order
  const unscheduledTodos = todos
    .filter((todo) => !todo.deadline)
    .sort((a, b) => a.order - b.order);

  const selectedDayTodos = todos
    .filter((todo) => todo.deadline === selectedDate)
    .sort((a, b) => a.order - b.order);

  // Droppable zone for unscheduled todos
  const UnscheduledDropZone = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: "unscheduled",
    });

    return (
      <div
        ref={setNodeRef}
        className={`min-h-32 p-4 rounded-lg transition-all ${
          isOver ? "bg-blue-50 border-2 border-blue-400" : "bg-transparent"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-3 pointer-events-none">
          Unscheduled Todos ({unscheduledTodos.length})
        </h3>
        <div className="space-y-2 pointer-events-auto">
          {unscheduledTodos.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg pointer-events-none">
              No unscheduled todos. Drag todos from the calendar to unschedule them.
            </p>
          ) : (
            unscheduledTodos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  // Static view for selected day's todos (non-draggable, non-droppable)
  const SelectedDayTodosView = () => {
    const isToday = selectedDate === today;
    const selectedDateObj = new Date(selectedDate + "T00:00:00");
    const dateLabel = isToday
      ? "Today"
      : format(selectedDateObj, "MMM d");

    return (
      <div className="min-h-32 p-4 rounded-lg bg-transparent">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          {dateLabel}&apos;s Todos ({selectedDayTodos.length})
        </h3>
        <div className="space-y-2">
          {selectedDayTodos.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              No todos scheduled for {dateLabel.toLowerCase()}.
            </p>
          ) : (
            selectedDayTodos.map((todo) => (
              <StaticTodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">My Todos</h2>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {/* Unscheduled Todos and Today's Todos Section - Side by Side */}
        <div className="mb-6 flex gap-4">
          {/* Left: Unscheduled Todos */}
          <div className="flex-1">
            <SortableContext
              items={unscheduledTodos.map((todo) => `todo-${todo.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <UnscheduledDropZone />
            </SortableContext>
          </div>

          {/* Right: Selected Day's Todos */}
          <div className="flex-1">
            <SelectedDayTodosView />
          </div>
        </div>

        {/* Weekly Calendar Section */}
        <div>
          <WeeklyCalendar
            todos={todos}
            currentWeekStart={currentWeekStart}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
            selectedDate={selectedDate}
            onDateClick={setSelectedDate}
          />
        </div>
      </div>
    </DndContext>
  );
}
