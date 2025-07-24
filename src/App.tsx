import { useState, useEffect, useRef } from "react";
import "./App.css";

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to check if a date is in the past
const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

// Helper function to get date key for storage
const getDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
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

  // Audio references
  const penAudioRef = useRef<HTMLAudioElement | null>(null);
  const strikeAudioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize audio
  useEffect(() => {
    penAudioRef.current = new Audio("/pen-sound.mp3");
    penAudioRef.current.loop = true;
    penAudioRef.current.volume = 0.4;
    penAudioRef.current.load();

    // Use the strike sound for checking tasks
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
    setFocusedLineIndex(null); // Reset focus when changing dates
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
        tasks: tasks.filter((task) => task.text.trim() !== ""), // Only save non-empty tasks
        createdAt: prev[dateKey]?.createdAt || now,
        lastModified: now,
      },
    }));
  };

  // Play strike sound for animation duration only
  const playStrikeSound = () => {
    if (strikeAudioRef.current) {
      strikeAudioRef.current.currentTime = 0; // Start from beginning
      strikeAudioRef.current
        .play()
        .catch((e) => console.log("Strike audio play failed:", e));

      // Stop the sound after 500ms to match the strikethrough animation duration
      setTimeout(() => {
        if (strikeAudioRef.current) {
          strikeAudioRef.current.pause();
          strikeAudioRef.current.currentTime = 0; // Reset for next use
        }
      }, 500); // 500ms matches the CSS animation duration
    }
  };

  // Start pen sound
  const startPenSound = () => {
    if (penAudioRef.current && penAudioRef.current.paused) {
      penAudioRef.current.currentTime =
        Math.random() * (penAudioRef.current.duration || 0) * 0.8;
      penAudioRef.current
        .play()
        .catch((e) => console.log("Pen audio play failed:", e));
    }
  };

  // Stop pen sound
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
      // Update existing task
      if (text.trim()) {
        updatedTasks[taskIndex].text = text;
      } else {
        // Remove task if text is empty
        updatedTasks.splice(taskIndex, 1);
      }
    } else if (text.trim()) {
      // Create new task only if there's text
      updatedTasks.push({
        id: `line-${lineIndex}`,
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
      });
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
      // Move to next line
      const nextLineIndex = lineIndex + 1;
      setFocusedLineIndex(nextLineIndex);

      // Focus next input after a short delay
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
  const isToday = getDateKey(currentDate) === getDateKey(new Date());

  // Create enough lines to fill the page (20 lines total)
  const totalLines = 20;

  return (
    <main className="planner-container">
      {/* Planner Header */}
      <header className="planner-header">
        <h1 className="planner-title">Anoto</h1>
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
            disabled={isToday}
          >
            Today
          </button>
          <button className="nav-button" onClick={goToNextDay} title="Next Day">
            →
          </button>
        </div>
      </header>

      {/* Notebook Page */}
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
              {isToday && <span className="today-indicator">Today</span>}
              {!isPastDate(currentDate) && !isToday && (
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
                      {/* Only show checkbox if line has content or is focused */}
                      {shouldShowCheckbox && (
                        <div
                          className="margin-checkbox"
                          onClick={() => isEditable && toggleTask(lineIndex)}
                        >
                          <span className="checkbox-brackets">
                            {task?.completed ? "[✓]" : "[ ]"}
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
                        }`}
                        placeholder={
                          lineIndex === 0 && isEditable
                            ? isToday
                              ? "What's on your agenda today?"
                              : "Plan for this day..."
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
    </main>
  );
}

export default App;
