"use client";

/**
 * Calendar Page
 * Uses FullCalendar with minimal setup for basic calendar display
 */

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateClickArg } from "@fullcalendar/interaction";

export default function CalendarPage() {
  /**
   * Handle date click (placeholder for future functionality)
   */
  const handleDateClick = (arg: DateClickArg) => {
    console.log("Date clicked:", arg.dateStr);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Calendar</h2>

      {/* FullCalendar Component */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          dateClick={handleDateClick}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          height="auto"
        />
      </div>
    </div>
  );
}
