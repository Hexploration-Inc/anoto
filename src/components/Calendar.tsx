import React from "react";
import "./Calendar.css";

// Helper function to get date key for storage (LOCAL timezone)
const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to check if a date is in the past
const isPastDate = (date: Date): boolean => {
  const today = new Date();
  const dateKey = getDateKey(date);
  const todayKey = getDateKey(today);
  return dateKey < todayKey;
};

// Helper function to check if a date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  const dateKey = getDateKey(date);
  const todayKey = getDateKey(today);
  return dateKey === todayKey;
};

// Helper function to get the start of the month calendar grid
const getCalendarStartDate = (year: number, month: number): Date => {
  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - dayOfWeek);
  return startDate;
};

// Helper function to format month/year header
const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  isReminder: boolean;
  reminderShown: boolean;
  reminderDate: string;
}

interface DailyEntry {
  date: string;
  tasks: Task[];
  createdAt: string;
  lastModified: string;
}

interface CalendarProps {
  currentDate: Date;
  entries: Record<string, DailyEntry>;
  onDateSelect: (date: Date) => void;
  onNavigateMonth: (direction: "prev" | "next") => void;
  onSwitchToDaily: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  currentDate,
  entries,
  onDateSelect,
  onNavigateMonth,
  onSwitchToDaily,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar grid start date (might be from previous month)
  const startDate = getCalendarStartDate(year, month);

  // Generate 42 days (6 weeks × 7 days) for the calendar grid
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });

  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  // Helper function to get entry info for a date
  const getDateInfo = (date: Date) => {
    const dateKey = getDateKey(date);
    const entry = entries[dateKey];

    if (!entry) {
      return {
        hasEntries: false,
        reminderCount: 0,
        completedCount: 0,
        totalCount: 0,
      };
    }

    const totalCount = entry.tasks.filter(
      (task) => task.text.trim() !== ""
    ).length;
    const completedCount = entry.tasks.filter(
      (task) => task.completed && task.text.trim() !== ""
    ).length;
    const reminderCount = entry.tasks.filter(
      (task) => task.isReminder && !task.completed && task.text.trim() !== ""
    ).length;

    return {
      hasEntries: totalCount > 0,
      reminderCount,
      completedCount,
      totalCount,
    };
  };

  // Helper function to check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month && date.getFullYear() === year;
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onSwitchToDaily();
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button
          className="nav-button calendar-nav"
          onClick={() => onNavigateMonth("prev")}
          title="Previous Month"
        >
          ←
        </button>

        <h2 className="calendar-title">{formatMonthYear(currentDate)}</h2>

        <button
          className="nav-button calendar-nav"
          onClick={() => onNavigateMonth("next")}
          title="Next Month"
        >
          →
        </button>
      </div>

      {/* Switch to Daily View Button */}
      <div className="calendar-view-controls">
        <button className="view-switch-button" onClick={onSwitchToDaily}>
          📝 Switch to Daily View
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Week day headers */}
        <div className="calendar-weekdays">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        <div className="calendar-weeks">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((date, dayIndex) => {
                const dateInfo = getDateInfo(date);
                const isCurrentMonthDate = isCurrentMonth(date);
                const isPast = isPastDate(date);
                const isTodayDate = isToday(date);

                return (
                  <button
                    key={dayIndex}
                    className={`calendar-day ${
                      !isCurrentMonthDate ? "other-month" : ""
                    } ${isPast ? "past" : ""} ${isTodayDate ? "today" : ""} ${
                      dateInfo.hasEntries ? "has-entries" : ""
                    }`}
                    onClick={() => handleDateClick(date)}
                    disabled={false} // Allow clicking any date for navigation
                  >
                    <span className="calendar-day-number">
                      {date.getDate()}
                    </span>

                    {/* Entry indicators */}
                    {dateInfo.hasEntries && (
                      <div className="calendar-day-indicators">
                        {/* Task completion indicator */}
                        {dateInfo.totalCount > 0 && (
                          <div className="task-indicator">
                            <span className="task-dots">
                              {Array.from(
                                { length: Math.min(dateInfo.totalCount, 5) },
                                (_, i) => (
                                  <span
                                    key={i}
                                    className={`task-dot ${
                                      i < dateInfo.completedCount
                                        ? "completed"
                                        : "pending"
                                    }`}
                                  />
                                )
                              )}
                              {dateInfo.totalCount > 5 && (
                                <span className="task-overflow">
                                  +{dateInfo.totalCount - 5}
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Reminder indicator */}
                        {dateInfo.reminderCount > 0 && (
                          <div className="reminder-indicator-cal">
                            <span className="reminder-icon-cal">⏰</span>
                            <span className="reminder-count-cal">
                              {dateInfo.reminderCount}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot today-legend"></span>
          <span>Today</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot has-entries-legend"></span>
          <span>Has entries</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot completed-legend"></span>
          <span>Completed tasks</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">⏰</span>
          <span>Reminders</span>
        </div>
      </div>
    </div>
  );
};
