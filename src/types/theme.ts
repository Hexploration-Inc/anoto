// Theme type definitions for Anoto notebook planner

export interface ThemeColors {
  // Paper and base colors
  paperWhite: string;
  paperCream: string;
  paperGray: string;

  // Ink colors
  inkPrimary: string;
  inkSecondary: string;
  inkMuted: string;

  // Line colors
  ruleColor: string;
  ruleColorLight: string;

  // Accent colors
  marginRed: string;
  bindingBrown: string;

  // Status colors
  todayColor: string;
  pastColor: string;
  futureColor: string;

  // Interactive colors
  focusColor: string;
  hoverColor: string;

  // Shadow colors
  shadowLight: string;
  shadowMedium: string;
  shadowDark: string;
}

export interface ThemeFonts {
  handwriting: string;
  casualWriting: string;
  ui: string;
}

export interface ThemeSpacing {
  lineHeight: string;
  fontSize: string;
  pageMargin: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: "paper-style" | "color-scheme";
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;

  // Paper line styles
  lineStyle: "ruled" | "dotted" | "grid" | "blank";

  // Special visual effects
  paperTexture: boolean;
  bindingStyle: "classic" | "modern" | "minimal";

  // Accessibility
  highContrast: boolean;
}

export interface ThemeContextType {
  currentTheme: Theme;
  availableThemes: Theme[];
  setTheme: (themeId: string) => void;
  resetToDefault: () => void;
}
