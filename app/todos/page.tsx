"use client";

import { useState } from "react";

/**
 * Todo Interface
 * Each todo has an id, title, and completed status
 */
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function TodosPage() {
  // State to store todos (in-memory for now, no database)
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

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

  return (
    <div className="max-w-2xl mx-auto">
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

      {/* Todo List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No todos yet. Add one above!
          </p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow"
            >
              {/* Checkbox to mark as completed */}
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />

              {/* Todo title */}
              <span
                className={`flex-1 ${
                  todo.completed
                    ? "line-through text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {todo.title}
              </span>

              {/* Delete button */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
