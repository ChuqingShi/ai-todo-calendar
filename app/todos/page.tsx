"use client";

import { useState, useEffect, useRef } from "react";
import { DndContext, DragEndEvent, useDroppable, DragOverEvent, pointerWithin } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { startOfWeek, format, addDays } from "date-fns";
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

  // Ref to preserve scroll position in unscheduled todos
  const unscheduledScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPos = useRef<number>(0);

  // Ref to preserve scroll position in selected day's todos
  const selectedDayScrollRef = useRef<HTMLDivElement>(null);
  const savedSelectedDayScrollPos = useRef<number>(0);

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
   * Restore scroll position after todos change
   */
  useEffect(() => {
    if (unscheduledScrollRef.current) {
      if (savedScrollPos.current === -1) {
        // Scroll to bottom for newly added items
        unscheduledScrollRef.current.scrollTop = unscheduledScrollRef.current.scrollHeight;
        savedScrollPos.current = 0; // Reset
      } else if (savedScrollPos.current > 0) {
        // Restore previous position
        unscheduledScrollRef.current.scrollTop = savedScrollPos.current;
      }
    }

    // Restore scroll position for selected day's todos
    if (selectedDayScrollRef.current && savedSelectedDayScrollPos.current > 0) {
      selectedDayScrollRef.current.scrollTop = savedSelectedDayScrollPos.current;
    }
  }, [todos]);

  /**
   * Add a new todo
   */
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    const unscheduledCount = todos.filter((t) => !t.deadline).length;

    const newTodo: Todo = {
      id: Date.now(), // Simple unique ID generator
      title: inputValue,
      completed: false,
      order: unscheduledCount, // Add to end of unscheduled list
    };

    // Mark to scroll to bottom for newly added item
    savedScrollPos.current = -1;

    setTodos([...todos, newTodo]);
    setInputValue("");
  };

  /**
   * Toggle todo completion status
   */
  const toggleTodo = (id: number) => {
    // Save scroll position before updating
    if (unscheduledScrollRef.current) {
      savedScrollPos.current = unscheduledScrollRef.current.scrollTop;
    }
    if (selectedDayScrollRef.current) {
      savedSelectedDayScrollPos.current = selectedDayScrollRef.current.scrollTop;
    }

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
    // Save scroll position before deleting
    if (unscheduledScrollRef.current) {
      savedScrollPos.current = unscheduledScrollRef.current.scrollTop;
    }
    if (selectedDayScrollRef.current) {
      savedSelectedDayScrollPos.current = selectedDayScrollRef.current.scrollTop;
    }

    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;

    // Remove the todo
    let updatedTodos = todos.filter((todo) => todo.id !== id);

    // Renumber remaining todos in the same section
    const sectionDeadline = todoToDelete.deadline;

    if (sectionDeadline === undefined) {
      // Renumber unscheduled todos
      const unscheduledTodos = updatedTodos
        .filter((t) => !t.deadline)
        .sort((a, b) => a.order - b.order);

      const orderMap = new Map(
        unscheduledTodos.map((todo, index) => [todo.id, index])
      );

      updatedTodos = updatedTodos.map((todo) =>
        orderMap.has(todo.id) ? { ...todo, order: orderMap.get(todo.id)! } : todo
      );
    } else {
      // Renumber todos in the specific date
      const dateTodos = updatedTodos
        .filter((t) => t.deadline === sectionDeadline)
        .sort((a, b) => a.order - b.order);

      const orderMap = new Map(
        dateTodos.map((todo, index) => [todo.id, index])
      );

      updatedTodos = updatedTodos.map((todo) =>
        orderMap.has(todo.id) ? { ...todo, order: orderMap.get(todo.id)! } : todo
      );
    }

    setTodos(updatedTodos);
  };

  /**
   * Edit a todo's title
   */
  const editTodo = (id: number, newTitle: string) => {
    // Save scroll position before editing
    if (unscheduledScrollRef.current) {
      savedScrollPos.current = unscheduledScrollRef.current.scrollTop;
    }
    if (selectedDayScrollRef.current) {
      savedSelectedDayScrollPos.current = selectedDayScrollRef.current.scrollTop;
    }

    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, title: newTitle } : todo
      )
    );
  };

  /**
   * Clear all unscheduled todos
   */
  const clearUnscheduledTodos = () => {
    setTodos(todos.filter((todo) => todo.deadline !== undefined));
  };

  /**
   * Clear all todos for the selected date
   */
  const clearSelectedDayTodos = () => {
    setTodos(todos.filter((todo) => todo.deadline !== selectedDate));
  };

  /**
   * Clear all todos in the current week
   */
  const clearWeekTodos = () => {
    const weekEnd = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");
    const weekEndStr = format(weekEnd, "yyyy-MM-dd");

    setTodos(
      todos.filter((todo) => {
        if (!todo.deadline) return true; // Keep unscheduled
        return todo.deadline < weekStartStr || todo.deadline >= weekEndStr;
      })
    );
  };

  /**
   * Postpone uncompleted todos from today to tomorrow
   */
  const postponeToTomorrow = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

    // Get uncompleted todos from today
    const uncompletedTodayTodos = todos
      .filter((todo) => todo.deadline === today && !todo.completed)
      .sort((a, b) => a.order - b.order);

    if (uncompletedTodayTodos.length === 0) return;

    // Get tomorrow's existing todo count for proper order assignment
    const tomorrowCount = todos.filter((t) => t.deadline === tomorrow).length;

    // Move uncompleted todos to tomorrow
    let updatedTodos = todos.map((todo) => {
      const uncompletedIndex = uncompletedTodayTodos.findIndex((t) => t.id === todo.id);
      if (uncompletedIndex !== -1) {
        return {
          ...todo,
          deadline: tomorrow,
          order: tomorrowCount + uncompletedIndex,
        };
      }
      return todo;
    });

    // Renumber remaining today's todos (completed ones)
    const remainingTodayTodos = updatedTodos
      .filter((t) => t.deadline === today)
      .sort((a, b) => a.order - b.order);

    const todayOrderMap = new Map(
      remainingTodayTodos.map((todo, index) => [todo.id, index])
    );

    updatedTodos = updatedTodos.map((todo) =>
      todayOrderMap.has(todo.id)
        ? { ...todo, order: todayOrderMap.get(todo.id)! }
        : todo
    );

    setTodos(updatedTodos);
  };

  /**
   * Handle drag end - update todo deadline or reorder
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Save scroll position before updating todos
    if (unscheduledScrollRef.current) {
      savedScrollPos.current = unscheduledScrollRef.current.scrollTop;
    }

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
      const sourceDeadline = activeTodo?.deadline;

      // Mark to scroll to bottom for newly dragged-in item
      savedScrollPos.current = -1;

      // Move todo to unscheduled
      let updatedTodos = todos.map((todo) =>
        todo.id === todoId
          ? { ...todo, deadline: undefined, order: unscheduledCount }
          : todo
      );

      // If moving from a scheduled date, renumber remaining todos in source section
      if (sourceDeadline) {
        const sourceDayTodos = updatedTodos
          .filter((t) => t.deadline === sourceDeadline)
          .sort((a, b) => a.order - b.order);

        const sourceOrderMap = new Map(
          sourceDayTodos.map((todo, index) => [todo.id, index])
        );

        updatedTodos = updatedTodos.map((todo) =>
          sourceOrderMap.has(todo.id)
            ? { ...todo, order: sourceOrderMap.get(todo.id)! }
            : todo
        );
      }

      setTodos(updatedTodos);
    } else if (dropTarget.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Otherwise set the deadline to the date (if it's a valid date format)
      const targetDayTodos = todos
        .filter((t) => t.deadline === dropTarget && t.id !== todoId)
        .sort((a, b) => a.order - b.order);
      const sourceDeadline = activeTodo?.deadline;

      // Move todo to target date
      let updatedTodos = todos.map((todo) =>
        todo.id === todoId
          ? { ...todo, deadline: dropTarget, order: targetDayTodos.length }
          : todo
      );

      // If moving from a different section, renumber remaining todos in source section
      if (sourceDeadline !== dropTarget) {
        if (sourceDeadline === undefined) {
          // Moving from unscheduled - renumber remaining unscheduled todos
          const unscheduledTodos = updatedTodos
            .filter((t) => !t.deadline)
            .sort((a, b) => a.order - b.order);

          const unscheduledOrderMap = new Map(
            unscheduledTodos.map((todo, index) => [todo.id, index])
          );

          updatedTodos = updatedTodos.map((todo) =>
            unscheduledOrderMap.has(todo.id)
              ? { ...todo, order: unscheduledOrderMap.get(todo.id)! }
              : todo
          );
        } else {
          // Moving from a different date - renumber remaining todos in source date
          const sourceDayTodos = updatedTodos
            .filter((t) => t.deadline === sourceDeadline)
            .sort((a, b) => a.order - b.order);

          const sourceOrderMap = new Map(
            sourceDayTodos.map((todo, index) => [todo.id, index])
          );

          updatedTodos = updatedTodos.map((todo) =>
            sourceOrderMap.has(todo.id)
              ? { ...todo, order: sourceOrderMap.get(todo.id)! }
              : todo
          );
        }
      }

      setTodos(updatedTodos);
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
        className={`p-3 rounded-lg transition-all border ${
          isOver ? "bg-blue-50 border-2 border-blue-400" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-3 pointer-events-none">
          <h3 className="text-lg font-semibold text-gray-700">
            Unscheduled Todos ({unscheduledTodos.length})
          </h3>
          {unscheduledTodos.length > 0 && (
            <button
              onClick={clearUnscheduledTodos}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-sm text-red-600 hover:text-red-700 transition-colors pointer-events-auto"
            >
              Clear
            </button>
          )}
        </div>
        <div
          ref={unscheduledScrollRef}
          className="space-y-2 pointer-events-auto h-60 overflow-y-auto"
        >
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
      <div className="p-3 rounded-lg bg-white border border-gray-200 ring-2 ring-green-400">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-700">
            {dateLabel}&apos;s Todos ({selectedDayTodos.length})
          </h3>
          <div className="flex gap-2">
            {isToday && selectedDayTodos.some((todo) => !todo.completed) && (
              <div className="group relative">
                <button
                  onClick={postponeToTomorrow}
                  className="text-sm text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Postpone
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Carry over all unfinished todos to tomorrow.
                </div>
              </div>
            )}
            {selectedDayTodos.length > 0 && (
              <button
                onClick={clearSelectedDayTodos}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div
          ref={selectedDayScrollRef}
          className="space-y-2 h-60 overflow-y-auto"
        >
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
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
            onClearWeek={clearWeekTodos}
          />
        </div>
      </div>
    </DndContext>
  );
}
