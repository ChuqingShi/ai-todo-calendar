"use client";

/**
 * Calendar Page
 * Displays todos from weekly planner in monthly calendar view
 */

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  deadline?: string;
  order: number;
}

const STORAGE_KEY = "ai-todo-calendar-todos";

export default function CalendarPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

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
   * Transform todos into FullCalendar events
   * Only show incomplete todos with deadlines, sorted by order
   */
  const events = todos
    .filter((todo) => todo.deadline && !todo.completed)
    .sort((a, b) => a.order - b.order)
    .map((todo, index) => ({
      id: String(todo.id),
      title: todo.title,
      date: todo.deadline,
      backgroundColor: "#3b82f6",
      borderColor: "#2563eb",
      textColor: "white",
      order: index,
    }));

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Calendar</h2>

      {/* FullCalendar Component */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          events={events}
          editable={false}
          selectable={false}
          dayMaxEvents={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          height={800}
        />
      </div>
    </div>
  );
}
