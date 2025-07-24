import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Theme, ThemeContextType } from "../types/theme";
import { availableThemes, defaultTheme } from "../data/themes";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  // Load saved theme from localStorage on initialization
  useEffect(() => {
    const savedThemeId = localStorage.getItem("anoto-theme");
    if (savedThemeId) {
      const savedTheme = availableThemes.find(
        (theme) => theme.id === savedThemeId
      );
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    }
  }, []);

  // Apply theme CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const theme = currentTheme;

    // Apply color variables
    root.style.setProperty("--paper-white", theme.colors.paperWhite);
    root.style.setProperty("--paper-cream", theme.colors.paperCream);
    root.style.setProperty("--paper-gray", theme.colors.paperGray);
    root.style.setProperty("--ink-primary", theme.colors.inkPrimary);
    root.style.setProperty("--ink-secondary", theme.colors.inkSecondary);
    root.style.setProperty("--ink-muted", theme.colors.inkMuted);
    root.style.setProperty("--rule-color", theme.colors.ruleColor);
    root.style.setProperty("--rule-color-light", theme.colors.ruleColorLight);
    root.style.setProperty("--margin-red", theme.colors.marginRed);
    root.style.setProperty("--binding-brown", theme.colors.bindingBrown);
    root.style.setProperty("--today-color", theme.colors.todayColor);
    root.style.setProperty("--past-color", theme.colors.pastColor);
    root.style.setProperty("--future-color", theme.colors.futureColor);
    root.style.setProperty("--focus-color", theme.colors.focusColor);
    root.style.setProperty("--hover-color", theme.colors.hoverColor);
    root.style.setProperty("--shadow-light", theme.colors.shadowLight);
    root.style.setProperty("--shadow-medium", theme.colors.shadowMedium);
    root.style.setProperty("--shadow-dark", theme.colors.shadowDark);

    // Apply font variables
    root.style.setProperty("--font-handwriting", theme.fonts.handwriting);
    root.style.setProperty("--font-casual-writing", theme.fonts.casualWriting);
    root.style.setProperty("--font-ui", theme.fonts.ui);

    // Apply spacing variables
    root.style.setProperty("--line-height", theme.spacing.lineHeight);
    root.style.setProperty("--base-font-size", theme.spacing.fontSize);
    root.style.setProperty("--page-margin", theme.spacing.pageMargin);

    // Apply line style class to body
    document.body.className = `theme-${theme.id} line-style-${theme.lineStyle} binding-${theme.bindingStyle}`;

    if (theme.highContrast) {
      document.body.classList.add("high-contrast");
    }

    if (!theme.paperTexture) {
      document.body.classList.add("no-texture");
    }
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = availableThemes.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem("anoto-theme", themeId);
    }
  };

  const resetToDefault = () => {
    setCurrentTheme(defaultTheme);
    localStorage.removeItem("anoto-theme");
  };

  const value: ThemeContextType = {
    currentTheme,
    availableThemes,
    setTheme,
    resetToDefault,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
