import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./ThemeSwitcher.css";

export const ThemeSwitcher: React.FC = () => {
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const groupedThemes = availableThemes.reduce((groups, theme) => {
    const category = theme.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(theme);
    return groups;
  }, {} as Record<string, typeof availableThemes>);

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-switcher">
      <button
        className="theme-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        🎨 {currentTheme.name}
      </button>

      {isOpen && (
        <div className="theme-switcher-dropdown">
          <div
            className="theme-switcher-overlay"
            onClick={() => setIsOpen(false)}
          />
          <div className="theme-switcher-panel">
            <h3 className="theme-switcher-title">Choose Your Style</h3>

            {Object.entries(groupedThemes).map(([category, themes]) => (
              <div key={category} className="theme-category">
                <h4 className="theme-category-title">
                  {category === "paper-style"
                    ? "📝 Paper Style"
                    : "🎨 Color Scheme"}
                </h4>
                <div className="theme-grid">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-option ${
                        currentTheme.id === theme.id ? "active" : ""
                      }`}
                      onClick={() => handleThemeSelect(theme.id)}
                    >
                      <div
                        className="theme-preview"
                        style={{
                          backgroundColor: theme.colors.paperWhite,
                          border: `1px solid ${theme.colors.ruleColor}`,
                          color: theme.colors.inkPrimary,
                        }}
                      >
                        <div
                          className="theme-preview-line"
                          style={{ borderColor: theme.colors.ruleColor }}
                        >
                          <span style={{ color: theme.colors.inkPrimary }}>
                            Abc
                          </span>
                        </div>
                        <div
                          className="theme-preview-line"
                          style={{ borderColor: theme.colors.ruleColor }}
                        >
                          <span style={{ color: theme.colors.inkMuted }}>
                            123
                          </span>
                        </div>
                      </div>
                      <div className="theme-info">
                        <span className="theme-name">{theme.name}</span>
                        <span className="theme-description">
                          {theme.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
