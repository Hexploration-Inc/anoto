import { useState, useEffect, useRef } from "react";
import "./App.css";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { Calendar } from "./components/Calendar";

// Import Tauri's native notification plugin
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

// Helper function to check if a date is in the future
const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  const dateKey = getDateKey(date);
  const todayKey = getDateKey(today);
  return dateKey > todayKey;
};

// Helper function to check if a date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  const dateKey = getDateKey(date);
  const todayKey = getDateKey(today);
  return dateKey === todayKey;
};

// Updated Task interface with reminder support
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  // Reminder fields
  isReminder: boolean; // Automatically true for tasks on future dates
  reminderShown: boolean; // Track if notification was shown
  reminderDate: string; // The date this reminder is for
}

interface DailyEntry {
  date: string;
  tasks: Task[];
  createdAt: string;
  lastModified: string;
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [focusedLineIndex, setFocusedLineIndex] = useState<number | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [currentView, setCurrentView] = useState<"daily" | "calendar">("daily");

  // Audio references
  const penAudioRef = useRef<HTMLAudioElement | null>(null);
  const strikeAudioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reminder checking interval
  const reminderIntervalRef = useRef<number | null>(null);

  // Request notification permission on app start
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await isPermissionGranted();
        if (!permission) {
          const result = await requestPermission();
          setHasNotificationPermission(result === "granted");
        } else {
          setHasNotificationPermission(true);
        }
      } catch (error) {
        console.error("Failed to request notification permission:", error);
        setHasNotificationPermission(false);
      }
    };

    requestNotificationPermission();
  }, []);

  // Set up reminder checking interval (every minute)
  useEffect(() => {
    reminderIntervalRef.current = setInterval(() => {
      checkForDueReminders();
    }, 60000); // Check every minute

    // Also check immediately when the app starts
    checkForDueReminders();

    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, [entries, hasNotificationPermission]);

  // Function to check for due reminders
  const checkForDueReminders = () => {
    if (!hasNotificationPermission) return;

    const today = getDateKey(new Date());
    const todayEntry = entries[today];

    if (!todayEntry) return;

    // Find reminders that are due today and haven't been shown yet
    const dueReminders = todayEntry.tasks.filter(
      (task) => task.isReminder && !task.reminderShown && !task.completed
    );

    dueReminders.forEach((reminder) => {
      showNotification(reminder);
      markReminderAsShown(reminder.id, today);
    });
  };

  // Function to show notification
  const showNotification = async (task: Task) => {
    if (!hasNotificationPermission) return;

    try {
      await sendNotification({
        title: "📝 Anoto Reminder",
        body: task.text,
      });
    } catch (error) {
      // Fallback to web notification in development
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("📝 Anoto Reminder", {
          body: task.text,
          icon: "/tauri.svg",
          tag: task.id,
        });

        setTimeout(() => {
          try {
            if (notification && typeof notification.close === "function") {
              notification.close();
            }
          } catch (e) {
            // Ignore close errors
          }
        }, 10000);

        notification.onclick = () => {
          window.focus();
          try {
            notification.close();
          } catch (e) {
            // Ignore
          }
        };
      }
    }
  };

  // Function to mark reminder as shown
  const markReminderAsShown = (taskId: string, dateKey: string) => {
    setEntries((prev) => {
      const entry = prev[dateKey];
      if (!entry) return prev;

      const updatedTasks = entry.tasks.map((task) =>
        task.id === taskId ? { ...task, reminderShown: true } : task
      );

      return {
        ...prev,
        [dateKey]: {
          ...entry,
          tasks: updatedTasks,
          lastModified: new Date().toISOString(),
        },
      };
    });
  };

  // Helper function to count reminders for a given date
  const getReminderCount = (date: Date): number => {
    const dateKey = getDateKey(date);
    const entry = entries[dateKey];
    if (!entry) return 0;

    return entry.tasks.filter(
      (task) => task.isReminder && !task.completed && task.text.trim() !== ""
    ).length;
  };

  // Initialize audio
  useEffect(() => {
    penAudioRef.current = new Audio("/pen-sound.mov");
    penAudioRef.current.loop = true;
    penAudioRef.current.volume = 0.4;
    penAudioRef.current.load();

    strikeAudioRef.current = new Audio("/strike-sound.mp3");
    strikeAudioRef.current.volume = 0.6;
    strikeAudioRef.current.load();

    return () => {
      if (penAudioRef.current) {
        penAudioRef.current.pause();
        penAudioRef.current = null;
      }
      if (strikeAudioRef.current) {
        strikeAudioRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Load tasks for current date
  useEffect(() => {
    const dateKey = getDateKey(currentDate);
    const entry = entries[dateKey];
    const tasks = entry?.tasks || [];
    setCurrentTasks(tasks);
    setFocusedLineIndex(null);
  }, [currentDate, entries]);

  // Save entry
  const saveEntry = (tasks: Task[]) => {
    if (isPastDate(currentDate)) {
      return;
    }

    const dateKey = getDateKey(currentDate);
    const now = new Date().toISOString();

    setEntries((prev) => ({
      ...prev,
      [dateKey]: {
        date: dateKey,
        tasks: tasks.filter((task) => task.text.trim() !== ""),
        createdAt: prev[dateKey]?.createdAt || now,
        lastModified: now,
      },
    }));
  };

  // Audio functions
  const playStrikeSound = () => {
    if (strikeAudioRef.current) {
      strikeAudioRef.current.currentTime = 0;
      strikeAudioRef.current
        .play()
        .catch((e) => console.log("Strike audio play failed:", e));

      setTimeout(() => {
        if (strikeAudioRef.current) {
          strikeAudioRef.current.pause();
          strikeAudioRef.current.currentTime = 0;
        }
      }, 500);
    }
  };

  const startPenSound = () => {
    if (penAudioRef.current && penAudioRef.current.paused) {
      penAudioRef.current.currentTime =
        Math.random() * (penAudioRef.current.duration || 0) * 0.8;
      penAudioRef.current
        .play()
        .catch((e) => console.log("Pen audio play failed:", e));
    }
  };

  const stopPenSound = () => {
    if (penAudioRef.current && !penAudioRef.current.paused) {
      penAudioRef.current.pause();
    }
  };

  // Toggle task completion
  const toggleTask = (lineIndex: number) => {
    if (isPastDate(currentDate)) {
      return;
    }

    const updatedTasks = [...currentTasks];
    const taskIndex = updatedTasks.findIndex(
      (task) => task.id === `line-${lineIndex}`
    );

    if (taskIndex !== -1) {
      const wasCompleted = updatedTasks[taskIndex].completed;
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        completed: !wasCompleted,
      };

      if (!wasCompleted) {
        playStrikeSound();
      }

      setCurrentTasks(updatedTasks);
      saveEntry(updatedTasks);
    }
  };

  // Handle text change for a specific line
  const handleLineChange = (lineIndex: number, text: string) => {
    if (isPastDate(currentDate)) {
      return;
    }

    // Start pen sound when typing
    if (text) {
      startPenSound();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopPenSound();
      }, 800);
    }

    const updatedTasks = [...currentTasks];
    const taskIndex = updatedTasks.findIndex(
      (task) => task.id === `line-${lineIndex}`
    );

    if (taskIndex !== -1) {
      if (text.trim()) {
        updatedTasks[taskIndex].text = text;
      } else {
        updatedTasks.splice(taskIndex, 1);
      }
    } else if (text.trim()) {
      // Create new task with automatic reminder detection
      const newTask: Task = {
        id: `line-${lineIndex}`,
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        // Automatically mark as reminder if it's a future date
        isReminder: isFutureDate(currentDate),
        reminderShown: false,
        reminderDate: getDateKey(currentDate),
      };
      updatedTasks.push(newTask);
    }

    setCurrentTasks(updatedTasks);
    saveEntry(updatedTasks);
  };

  // Handle Enter key press
  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
    lineIndex: number
  ) => {
    if (event.key === "Enter" && !isPastDate(currentDate)) {
      const nextLineIndex = lineIndex + 1;
      setFocusedLineIndex(nextLineIndex);

      setTimeout(() => {
        if (inputRefs.current[nextLineIndex]) {
          inputRefs.current[nextLineIndex]?.focus();
        }
      }, 50);
    }
  };

  // Handle focus
  const handleFocus = (lineIndex: number) => {
    setFocusedLineIndex(lineIndex);
  };

  // Handle blur
  const handleBlur = () => {
    setFocusedLineIndex(null);
  };

  // Navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isEditable = !isPastDate(currentDate);
  const totalLines = 20;

  const switchToCalendar = () => {
    setCurrentView("calendar");
  };

  const switchToDaily = () => {
    setCurrentView("daily");
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <main className="planner-container">
      {/* Planner Header */}
      <header className="planner-header">
        <h1 className="planner-title">Anoto</h1>

        {/* Add View Toggle */}
        <div className="view-toggle">
          <button
            className={`view-button ${currentView === "daily" ? "active" : ""}`}
            onClick={switchToDaily}
          >
            📝 Daily
          </button>
          <button
            className={`view-button ${
              currentView === "calendar" ? "active" : ""
            }`}
            onClick={switchToCalendar}
          >
            📅 Calendar
          </button>
        </div>

        {/* Only show date navigation in daily view */}
        {currentView === "daily" && (
          <div className="date-navigation">
            <button
              className="nav-button"
              onClick={goToPreviousDay}
              title="Previous Day"
            >
              ←
            </button>
            <button
              className="today-button"
              onClick={goToToday}
              disabled={isToday(currentDate)}
            >
              Today
              {isToday(currentDate) && getReminderCount(new Date()) > 0 && (
                <span className="reminder-badge">
                  {getReminderCount(new Date())}
                </span>
              )}
            </button>
            <button
              className="nav-button"
              onClick={goToNextDay}
              title="Next Day"
            >
              →
            </button>
          </div>
        )}

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Reminder status indicator */}
        {getReminderCount(currentDate) > 0 && (
          <div className="reminder-indicator">
            <span className="reminder-icon">⏰</span>
            <span className="reminder-count">
              {getReminderCount(currentDate)} reminder
              {getReminderCount(currentDate) !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </header>

      {/* Notebook */}
      {currentView === "calendar" ? (
        <Calendar
          currentDate={currentDate}
          entries={entries}
          onDateSelect={handleDateSelect}
          onNavigateMonth={navigateMonth}
          onSwitchToDaily={switchToDaily}
        />
      ) : (
        <div className="notebook">
          <div className="notebook-binding"></div>
          <div className={`page ${isEditable ? "editable" : "readonly"}`}>
            {/* Page Header */}
            <div className="page-header">
              <h2 className="page-date">{formatDate(currentDate)}</h2>
              <div className="page-status">
                {isPastDate(currentDate) && (
                  <span className="past-indicator">Read Only</span>
                )}
                {isToday(currentDate) && (
                  <span className="today-indicator">Today</span>
                )}
                {!isPastDate(currentDate) && !isToday(currentDate) && (
                  <span className="future-indicator">Future</span>
                )}
              </div>
            </div>

            {/* Writing Area with Ruled Lines */}
            <div className="writing-area">
              <div className="ruled-content">
                <div className="notebook-lines">
                  {Array.from({ length: totalLines }, (_, lineIndex) => {
                    const task = currentTasks.find(
                      (task) => task.id === `line-${lineIndex}`
                    );
                    const hasContent = task && task.text.trim().length > 0;
                    const isFocused = focusedLineIndex === lineIndex;
                    const shouldShowCheckbox = hasContent || isFocused;

                    return (
                      <div key={lineIndex} className="notebook-line">
                        {shouldShowCheckbox && (
                          <div
                            className="margin-checkbox"
                            onClick={() => isEditable && toggleTask(lineIndex)}
                          >
                            <span className="checkbox-brackets">
                              {task?.completed ? "[✓]" : "[ ]"}
                              {task?.isReminder && !task.completed && " ⏰"}
                            </span>
                          </div>
                        )}
                        <input
                          ref={(el) => (inputRefs.current[lineIndex] = el)}
                          type="text"
                          value={task?.text || ""}
                          onChange={(e) =>
                            handleLineChange(lineIndex, e.target.value)
                          }
                          onKeyPress={(e) => handleKeyPress(e, lineIndex)}
                          onFocus={() => handleFocus(lineIndex)}
                          onBlur={handleBlur}
                          disabled={!isEditable}
                          className={`line-input ${
                            task?.completed ? "completed" : ""
                          } ${task?.isReminder ? "reminder" : ""}`}
                          placeholder={
                            lineIndex === 0 && isEditable
                              ? isToday(currentDate)
                                ? "What's on your agenda today?"
                                : "Plan for this day... (Future tasks become reminders!)"
                              : ""
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Page Footer */}
            <div className="page-footer">
              {entries[getDateKey(currentDate)] && (
                <small className="entry-info">
                  Last modified:{" "}
                  {new Date(
                    entries[getDateKey(currentDate)].lastModified
                  ).toLocaleString()}
                </small>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
