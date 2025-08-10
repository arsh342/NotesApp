import React, { createContext, useContext, useState, useEffect } from "react";

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string;
  category: "general" | "editor" | "formatting";
}

interface SettingsContextType {
  autoSave: boolean;
  setAutoSave: (enabled: boolean) => void;
  autoSaveInterval: number;
  setAutoSaveInterval: (interval: number) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  // Editor settings
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: string;
  setFontFamily: (family: string) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  wordWrap: boolean;
  setWordWrap: (enabled: boolean) => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (enabled: boolean) => void;
  tabSize: number;
  setTabSize: (size: number) => void;
  minimap: boolean;
  setMinimap: (enabled: boolean) => void;
  bracketMatching: boolean;
  setBracketMatching: (enabled: boolean) => void;
  autoIndent: boolean;
  setAutoIndent: (enabled: boolean) => void;
  // Keyboard shortcuts
  shortcuts: KeyboardShortcut[];
  setShortcuts: (shortcuts: KeyboardShortcut[]) => void;
  updateShortcut: (id: string, keys: string) => void;
  resetShortcuts: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const SETTINGS_STORAGE_KEY = "notes-app-settings";

// Default keyboard shortcuts
const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // General shortcuts
  {
    id: "save",
    name: "Save Note",
    description: "Save the current note",
    keys: "Cmd+S",
    category: "general",
  },
  {
    id: "search",
    name: "Search",
    description: "Open search dialog",
    keys: "Cmd+F",
    category: "general",
  },
  {
    id: "toggleSidebar",
    name: "Toggle Sidebar",
    description: "Show or hide the sidebar",
    keys: "Cmd+Shift+B",
    category: "general",
  },
  {
    id: "newNote",
    name: "New Note",
    description: "Create a new note",
    keys: "Cmd+N",
    category: "general",
  },
  {
    id: "closeSearch",
    name: "Close Search",
    description: "Close search dialog",
    keys: "Escape",
    category: "general",
  },

  // Editor shortcuts
  {
    id: "increaseFontSize",
    name: "Increase Font Size",
    description: "Make text larger",
    keys: "Cmd++",
    category: "editor",
  },
  {
    id: "decreaseFontSize",
    name: "Decrease Font Size",
    description: "Make text smaller",
    keys: "Cmd+-",
    category: "editor",
  },
  {
    id: "indent",
    name: "Indent",
    description: "Indent current line",
    keys: "Tab",
    category: "editor",
  },
  {
    id: "unindent",
    name: "Unindent",
    description: "Remove indentation",
    keys: "Shift+Tab",
    category: "editor",
  },

  // Formatting shortcuts
  {
    id: "bold",
    name: "Bold",
    description: "Make text bold",
    keys: "Cmd+B",
    category: "formatting",
  },
  {
    id: "italic",
    name: "Italic",
    description: "Make text italic",
    keys: "Cmd+I",
    category: "formatting",
  },
  {
    id: "underline",
    name: "Underline",
    description: "Underline text",
    keys: "Cmd+U",
    category: "formatting",
  },
  {
    id: "bulletList",
    name: "Bullet List",
    description: "Create bullet list",
    keys: "Cmd+Shift+8",
    category: "formatting",
  },
  {
    id: "numberedList",
    name: "Numbered List",
    description: "Create numbered list",
    keys: "Cmd+Shift+7",
    category: "formatting",
  },
];

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [autoSave, setAutoSaveState] = useState(false);
  const [autoSaveInterval, setAutoSaveIntervalState] = useState(3000);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Editor settings
  const [fontSize, setFontSizeState] = useState(14);
  const [fontFamily, setFontFamilyState] = useState(
    "Inter, system-ui, sans-serif"
  );
  const [lineHeight, setLineHeightState] = useState(1.6);
  const [wordWrap, setWordWrapState] = useState(true);
  const [showLineNumbers, setShowLineNumbersState] = useState(false);
  const [tabSize, setTabSizeState] = useState(2);
  const [minimap, setMinimapState] = useState(false);
  const [bracketMatching, setBracketMatchingState] = useState(true);
  const [autoIndent, setAutoIndentState] = useState(true);

  // Keyboard shortcuts
  const [shortcuts, setShortcuts] =
    useState<KeyboardShortcut[]>(DEFAULT_SHORTCUTS);

  // Shortcut helper functions
  const updateShortcut = (id: string, keys: string) => {
    setShortcuts((prev) =>
      prev.map((shortcut) =>
        shortcut.id === id ? { ...shortcut, keys } : shortcut
      )
    );
  };

  const resetShortcuts = () => {
    setShortcuts(DEFAULT_SHORTCUTS);
  };

  // Save shortcuts when they change
  useEffect(() => {
    saveSettings({ shortcuts });
  }, [shortcuts]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAutoSaveState(settings.autoSave ?? false);
        setAutoSaveIntervalState(settings.autoSaveInterval ?? 3000);
        setTheme(settings.theme ?? "light");
        setFontSizeState(settings.fontSize ?? 14);
        setFontFamilyState(
          settings.fontFamily ?? "Inter, system-ui, sans-serif"
        );
        setLineHeightState(settings.lineHeight ?? 1.6);
        setWordWrapState(settings.wordWrap ?? true);
        setShowLineNumbersState(settings.showLineNumbers ?? false);
        setTabSizeState(settings.tabSize ?? 2);
        setMinimapState(settings.minimap ?? false);
        setBracketMatchingState(settings.bracketMatching ?? true);
        setAutoIndentState(settings.autoIndent ?? true);
        setShortcuts(settings.shortcuts ?? DEFAULT_SHORTCUTS);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (
    newSettings: Partial<{
      autoSave: boolean;
      autoSaveInterval: number;
      theme: "light" | "dark";
      fontSize: number;
      fontFamily: string;
      lineHeight: number;
      wordWrap: boolean;
      showLineNumbers: boolean;
      tabSize: number;
      minimap: boolean;
      bracketMatching: boolean;
      autoIndent: boolean;
      shortcuts: KeyboardShortcut[];
    }>
  ) => {
    const currentSettings = {
      autoSave,
      autoSaveInterval,
      theme,
      fontSize,
      fontFamily,
      lineHeight,
      wordWrap,
      showLineNumbers,
      tabSize,
      minimap,
      bracketMatching,
      autoIndent,
      shortcuts,
      ...newSettings,
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
  };

  const setAutoSave = (enabled: boolean) => {
    setAutoSaveState(enabled);
    saveSettings({ autoSave: enabled });
  };

  const setAutoSaveInterval = (interval: number) => {
    setAutoSaveIntervalState(interval);
    saveSettings({ autoSaveInterval: interval });
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    saveSettings({ theme: newTheme });
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    saveSettings({ fontSize: size });
  };

  const setFontFamily = (family: string) => {
    setFontFamilyState(family);
    saveSettings({ fontFamily: family });
  };

  const setLineHeight = (height: number) => {
    setLineHeightState(height);
    saveSettings({ lineHeight: height });
  };

  const setWordWrap = (enabled: boolean) => {
    setWordWrapState(enabled);
    saveSettings({ wordWrap: enabled });
  };

  const setShowLineNumbers = (enabled: boolean) => {
    setShowLineNumbersState(enabled);
    saveSettings({ showLineNumbers: enabled });
  };

  const setTabSize = (size: number) => {
    setTabSizeState(size);
    saveSettings({ tabSize: size });
  };

  const setMinimap = (enabled: boolean) => {
    setMinimapState(enabled);
    saveSettings({ minimap: enabled });
  };

  const setBracketMatching = (enabled: boolean) => {
    setBracketMatchingState(enabled);
    saveSettings({ bracketMatching: enabled });
  };

  const setAutoIndent = (enabled: boolean) => {
    setAutoIndentState(enabled);
    saveSettings({ autoIndent: enabled });
  };

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const value: SettingsContextType = {
    autoSave,
    setAutoSave,
    autoSaveInterval,
    setAutoSaveInterval,
    theme,
    toggleTheme,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    lineHeight,
    setLineHeight,
    wordWrap,
    setWordWrap,
    showLineNumbers,
    setShowLineNumbers,
    tabSize,
    setTabSize,
    minimap,
    setMinimap,
    bracketMatching,
    setBracketMatching,
    autoIndent,
    setAutoIndent,
    shortcuts,
    setShortcuts,
    updateShortcut,
    resetShortcuts,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
