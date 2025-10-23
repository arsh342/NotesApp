import React from "react";
import {
  Copy,
  Clipboard,
  Scissors,
  Bold,
  Italic,
  Underline,
  Highlighter,
  Trash2,
} from "lucide-react";

interface ContextMenuProps {
  show: boolean;
  position: { x: number; y: number };
  hasTextSelected: boolean;
  onClose: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onFormat: (format: string) => void;
  onDelete: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  show,
  position,
  hasTextSelected,
  onClose,
  onCopy,
  onCut,
  onPaste,
  onFormat,
  onDelete,
}) => {
  if (!show) return null;

  const menuItems = [
    // Text operations
    ...(hasTextSelected
      ? [
          { icon: Copy, label: "Copy", action: onCopy, shortcut: "⌘C" },
          { icon: Scissors, label: "Cut", action: onCut, shortcut: "⌘X" },
        ]
      : []),
    { icon: Clipboard, label: "Paste", action: onPaste, shortcut: "⌘V" },

    // Separator
    ...(hasTextSelected ? [{ separator: true }] : []),

    // Formatting options (only if text is selected)
    ...(hasTextSelected
      ? [
          {
            icon: Bold,
            label: "Bold",
            action: () => onFormat("bold"),
            shortcut: "⌘B",
          },
          {
            icon: Italic,
            label: "Italic",
            action: () => onFormat("italic"),
            shortcut: "⌘I",
          },
          {
            icon: Underline,
            label: "Underline",
            action: () => onFormat("underline"),
            shortcut: "⌘U",
          },
          {
            icon: Highlighter,
            label: "Highlight",
            action: () => onFormat("highlight"),
            shortcut: "",
          },

          // Separator
          { separator: true },

          // Delete option
          {
            icon: Trash2,
            label: "Delete",
            action: onDelete,
            shortcut: "Del",
            danger: true,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Context Menu */}
      <div
        className="fixed z-50 liquid-glass-modal py-2 min-w-48 fade-in"
        style={{
          left: `${Math.min(position.x, window.innerWidth - 200)}px`,
          top: `${Math.min(position.y, window.innerHeight - 300)}px`,
        }}
      >
        {menuItems.map((item, index) => {
          if ("separator" in item) {
            return (
              <div
                key={`separator-${index}`}
                className="my-1 mx-2 border-t"
                style={{ borderColor: "var(--border)" }}
              />
            );
          }

          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={(e) => {
                e.stopPropagation();
                item.action();
              }}
              className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between transition-all duration-200 hover:scale-[1.02] ${
                item.danger
                  ? "hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "hover:bg-selected"
              }`}
              style={{
                color: item.danger ? "var(--danger)" : "var(--text-primary)",
              }}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  size={16}
                  style={{
                    color: item.danger
                      ? "var(--danger)"
                      : "var(--text-secondary)",
                  }}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.shortcut && (
                <span
                  className="text-xs font-mono opacity-60"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
