import { useState, useEffect } from "react";
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
  today.setHours(0, 0, 0, 0); // Set to start of today
  date.setHours(0, 0, 0, 0); // Set to start of the date
  return date < today;
};

// Helper function to get date key for storage
const getDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
};

interface DailyEntry {
  date: string;
  content: string;
  createdAt: string;
  lastModified: string;
}

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [currentContent, setCurrentContent] = useState("");

  // Load entry for current date
  useEffect(() => {
    const dateKey = getDateKey(currentDate);
    const entry = entries[dateKey];
    setCurrentContent(entry?.content || "");
  }, [currentDate, entries]);

  // Save entry (only if not past date)
  const saveEntry = (content: string) => {
    if (isPastDate(currentDate)) {
      return; // Cannot save to past dates
    }

    const dateKey = getDateKey(currentDate);
    const now = new Date().toISOString();

    setEntries((prev) => ({
      ...prev,
      [dateKey]: {
        date: dateKey,
        content,
        createdAt: prev[dateKey]?.createdAt || now,
        lastModified: now,
      },
    }));
  };

  // Handle content change
  const handleContentChange = (content: string) => {
    if (isPastDate(currentDate)) {
      return; // Cannot edit past dates
    }
    setCurrentContent(content);
    saveEntry(content);
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isEditable = !isPastDate(currentDate);
  const isToday = getDateKey(currentDate) === getDateKey(new Date());

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

          {/* Writing Area */}
          <div className="writing-area">
            <textarea
              className="page-content"
              value={currentContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={
                isPastDate(currentDate)
                  ? "This page is from the past and cannot be edited."
                  : isToday
                  ? "What's on your mind today?"
                  : "Plan for this future day..."
              }
              disabled={!isEditable}
              rows={20}
            />
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
