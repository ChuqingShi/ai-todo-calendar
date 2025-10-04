"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { startOfWeek } from "date-fns";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import DraggableTodoItem from "@/components/DraggableTodoItem";

/**
 * Todo Interface
 * Each todo has an id, title, completed status, and optional deadline
 */
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deadline?: string; // ISO date string (YYYY-MM-DD)
}

const STORAGE_KEY = "ai-todo-calendar-todos";

export default function TodosPage() {
  // State to store todos (persisted in localStorage)
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  /**
   * Load todos from localStorage on mount
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTodos = localStorage.getItem(STORAGE_KEY);
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        }
      } catch (error) {
        console.error("Failed to load todos from localStorage:", error);
      }
    }
  }, []);

  /**
   * Save todos to localStorage whenever they change
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error("Failed to save todos to localStorage:", error);
      }
    }
  }, [todos]);

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
   * Handle drag end - update todo deadline
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const todoId = parseInt(active.id.toString().replace("todo-", ""));
    const dropTarget = over.id.toString();

    // If dropped on unscheduled zone, remove deadline
    if (dropTarget === "unscheduled") {
      setTodos(
        todos.map((todo) =>
          todo.id === todoId ? { ...todo, deadline: undefined } : todo
        )
      );
    } else {
      // Otherwise set the deadline to the date
      setTodos(
        todos.map((todo) =>
          todo.id === todoId ? { ...todo, deadline: dropTarget } : todo
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

  // Separate todos into unscheduled and scheduled
  const unscheduledTodos = todos.filter((todo) => !todo.deadline);

  // Droppable zone for unscheduled todos
  const UnscheduledDropZone = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: "unscheduled",
    });

    return (
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-32 p-4 rounded-lg transition-all ${
          isOver ? "bg-blue-50 border-2 border-blue-400" : "bg-transparent"
        }`}
      >
        {unscheduledTodos.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            No unscheduled todos. Drag todos from the calendar to unschedule them.
          </p>
        ) : (
          unscheduledTodos.map((todo) => (
            <DraggableTodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {/* Unscheduled Todos Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Unscheduled Todos ({unscheduledTodos.length})
          </h3>
          <UnscheduledDropZone />
        </div>

        {/* Weekly Calendar Section */}
        <div>
          <WeeklyCalendar
            todos={todos}
            currentWeekStart={currentWeekStart}
            onPreviousWeek={handlePreviousWeek}
            onNextWeek={handleNextWeek}
          />
        </div>
      </div>
    </DndContext>
  );
}
