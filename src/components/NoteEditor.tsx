import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Tag,
  Calendar,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Palette,
  ChevronDown,
  Link,
  Quote,
  Highlighter,
  Search,
  X,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { Note } from "../types/Note";
import { useSettings } from "../contexts/SettingsContext";

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  searchTerm?: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  searchTerm,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Search modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matches, setMatches] = useState<Element[]>([]);
  const [lineCount, setLineCount] = useState(1);

  const contentRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const {
    autoSave,
    autoSaveInterval,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    lineHeight,
    wordWrap,
    showLineNumbers,
    tabSize,
    autoIndent,
    minimap,
    bracketMatching,
    shortcuts,
  } = useSettings();

  // Helper function to match keyboard shortcuts
  const matchesShortcut = (
    event: KeyboardEvent,
    shortcutKeys: string
  ): boolean => {
    const pressedKeys: string[] = [];

    if (event.metaKey) pressedKeys.push("Cmd");
    if (event.ctrlKey && !event.metaKey) pressedKeys.push("Ctrl");
    if (event.altKey) pressedKeys.push("Alt");
    if (event.shiftKey) pressedKeys.push("Shift");

    const key = event.key === " " ? "Space" : event.key;
    if (
      key !== "Meta" &&
      key !== "Control" &&
      key !== "Alt" &&
      key !== "Shift"
    ) {
      pressedKeys.push(key);
    }

    return (
      pressedKeys.join("+") === shortcutKeys ||
      pressedKeys.join("+") === shortcutKeys.replace("Cmd", "Ctrl")
    ); // Support both Cmd and Ctrl
  };

  // Add bracket matching styles
  useEffect(() => {
    if (bracketMatching) {
      const style = document.createElement("style");
      style.textContent = `
        .bracket-highlight {
          background-color: rgba(255, 255, 0, 0.3);
          border-radius: 2px;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [bracketMatching]);

  const colors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#FF0000",
    "#FF6B6B",
    "#FFE066",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#8B4513",
    "#D63031",
    "#FF7675",
    "#FDCB6E",
    "#6C5CE7",
    "#A29BFE",
    "#00B894",
    "#00CED1",
    "#74B9FF",
    "#0984E3",
    "#6C5CE7",
    "#FD79A8",
    "#E17055",
    "#F39C12",
    "#E67E22",
    "#27AE60",
    "#16A085",
    "#8E44AD",
  ];

  const highlightColors = [
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#FF00FF",
    "#FFA500",
    "#FFE066",
    "#A4E8F0",
    "#DDA0DD",
    "#98FB98",
    "#F0E68C",
  ];

  const headingOptions = [
    { label: "Normal Text", tag: "div", className: "text-base font-normal" },
    { label: "Title", tag: "h1", className: "text-4xl font-bold mb-4" },
    { label: "Subtitle", tag: "h2", className: "text-3xl font-semibold mb-3" },
    { label: "Heading", tag: "h3", className: "text-2xl font-semibold mb-3" },
    { label: "Subheading", tag: "h4", className: "text-xl font-medium mb-2" },
    { label: "Section", tag: "h5", className: "text-lg font-medium mb-2" },
    { label: "Subsection", tag: "h6", className: "text-base font-medium mb-2" },
    { label: "Body", tag: "p", className: "text-base font-normal mb-2" },
  ];

  const fontOptions = [
    { label: "Default", value: "inherit" },
    { label: "Serif", value: "serif" },
    { label: "Sans Serif", value: "sans-serif" },
    { label: "Monospace", value: "monospace" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Arial", value: "Arial, Helvetica, sans-serif" },
    { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
    { label: "Courier New", value: "Courier New, Courier, monospace" },
    {
      label: "Comic Sans",
      value: "Comic Sans MS, Comic Sans, cursive, sans-serif",
    },
    { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
    { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
    { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
    { label: "Times New Roman", value: "Times New Roman, Times, serif" },
    {
      label: "Palatino",
      value: "Palatino Linotype, Book Antiqua, Palatino, serif",
    },
    { label: "Garamond", value: "Garamond, serif" },
    { label: "Impact", value: "Impact, Charcoal, sans-serif" },
    { label: "Lucida Console", value: "Lucida Console, Monaco, monospace" },
    { label: "Fira Code", value: "Fira Code, monospace" },
    { label: "Roboto", value: "Roboto, Arial, sans-serif" },
    { label: "Open Sans", value: "Open Sans, Arial, sans-serif" },
    { label: "Lato", value: "Lato, Arial, sans-serif" },
    { label: "Montserrat", value: "Montserrat, Arial, sans-serif" },
    { label: "Source Sans Pro", value: "Source Sans Pro, Arial, sans-serif" },
    { label: "Quicksand", value: "Quicksand, Arial, sans-serif" },
    { label: "Raleway", value: "Raleway, Arial, sans-serif" },
    { label: "Merriweather", value: "Merriweather, serif" },
    { label: "Nunito", value: "Nunito, Arial, sans-serif" },
    { label: "Poppins", value: "Poppins, Arial, sans-serif" },
    { label: "Oswald", value: "Oswald, Arial, sans-serif" },
    { label: "Ubuntu", value: "Ubuntu, Arial, sans-serif" },
    { label: "PT Sans", value: "PT Sans, Arial, sans-serif" },
    { label: "Work Sans", value: "Work Sans, Arial, sans-serif" },
    { label: "Cabin", value: "Cabin, Arial, sans-serif" },
    { label: "Muli", value: "Muli, Arial, sans-serif" },
  ];

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    // Only auto-save if enabled in settings
    if (!autoSave) return;

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      if (note && !isSaved) {
        handleSave(true);
      }
    }, autoSaveInterval);

    setAutoSaveTimeout(timeout);
  }, [note, isSaved, autoSaveTimeout, autoSave, autoSaveInterval]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setCategory(note.category);
      setIsSaved(true);
      if (contentRef.current) {
        contentRef.current.innerHTML = note.content;
        // Apply all editor settings
        contentRef.current.style.fontSize = `${fontSize}px`;
        contentRef.current.style.fontFamily = fontFamily;
        contentRef.current.style.lineHeight = lineHeight.toString();
        contentRef.current.style.wordWrap = wordWrap ? "break-word" : "normal";
        contentRef.current.style.whiteSpace = wordWrap ? "pre-wrap" : "pre";
        contentRef.current.style.tabSize = tabSize.toString();

        // Update line count
        if (showLineNumbers) {
          const text = contentRef.current.textContent || "";
          const lines = text.split("\n").length;
          setLineCount(Math.max(lines, 1));
        }
      }
    }
  }, [
    note,
    fontSize,
    fontFamily,
    lineHeight,
    wordWrap,
    tabSize,
    showLineNumbers,
  ]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is interacting with form elements
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "SELECT" ||
          activeElement.tagName === "OPTION" ||
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            if (note && !isSaved) {
              handleSave();
            }
            break;
          case "v":
            // Handle paste - will be processed by handlePaste
            break;
        }
      }
    };

    const handlePaste = async (_e: ClipboardEvent) => {
      // Image paste functionality removed
    };

    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      document.removeEventListener("paste", handlePaste);
    };
  }, [note, isSaved]);

  // Apply image constraints to all images in the editor
  useEffect(() => {
    if (contentRef.current) {
      const images = contentRef.current.querySelectorAll("img");
      images.forEach((img: HTMLImageElement) => {
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.objectFit = "contain";
        if (!img.style.margin) {
          img.style.margin = "10px 0";
        }
        if (!img.style.borderRadius) {
          img.style.borderRadius = "8px";
        }
        if (!img.style.boxShadow) {
          img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        }
      });
    }
  }, [note?.content]);

  // Utility to get caret character offset within a contenteditable element
  function getCaretCharacterOffsetWithin(element: HTMLElement): number {
    let caretOffset = 0;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  // Utility to set caret at a character offset within a contenteditable element
  function setCaretPosition(element: HTMLElement, offset: number) {
    let currentOffset = 0;
    let nodeStack = [element];
    let node: Node | undefined;
    let found = false;
    while (nodeStack.length && !found) {
      node = nodeStack.pop();
      if (!node) break;
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = (node.textContent || "").length;
        if (currentOffset + textLength >= offset) {
          const sel = window.getSelection();
          const range = document.createRange();
          range.setStart(node, offset - currentOffset);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
          found = true;
          break;
        } else {
          currentOffset += textLength;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        let children = Array.from(node.childNodes);
        for (let i = children.length - 1; i >= 0; i--) {
          if (
            children[i].nodeType === Node.ELEMENT_NODE ||
            children[i].nodeType === Node.TEXT_NODE
          ) {
            nodeStack.push(children[i] as HTMLElement);
          }
        }
      }
    }
    if (!found && element) {
      // fallback: place at end
      element.focus();
    }
  }

  const handleSave = (_isAutoSave = false) => {
    if (!note) return;
    // Save caret position as character offset
    let caretOffset = 0;
    if (contentRef.current) {
      caretOffset = getCaretCharacterOffsetWithin(contentRef.current);
    }
    const currentContent = contentRef.current?.innerHTML || "";
    // Always get the latest title from the input field
    const latestTitle = titleInputRef.current
      ? titleInputRef.current.value
      : title;

    // Always get the latest category from the input field
    const latestCategory = categoryInputRef.current
      ? categoryInputRef.current.value
      : category;

    const updatedNote: Note = {
      ...note,
      title: latestTitle,
      content: currentContent,
      category: latestCategory,
      updatedAt: new Date(),
    };
    onSave(updatedNote);
    setIsSaved(true);
    // Restore caret position after DOM update
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus();
        setCaretPosition(contentRef.current, caretOffset);
      }
    }, 0);
    // Removed auto-save popup indicator
  };

  const handleContentChange = () => {
    setIsSaved(false);
    triggerAutoSave();

    // Update line count for line numbers display
    if (contentRef.current && showLineNumbers) {
      const text = contentRef.current.textContent || "";
      const lines = text.split("\n").length;
      setLineCount(Math.max(lines, 1));
    }

    // Force re-render for minimap update
    if (minimap) {
      // Trigger a re-render by updating a state that affects the minimap
      setLineCount((prev) => prev);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsSaved(false);
    triggerAutoSave();
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setIsSaved(false);
    triggerAutoSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't trigger save if user is typing in an input field
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      return;
    }

    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();

      // Store cursor position before saving
      const selection = window.getSelection();
      let cursorPosition = 0;
      let currentNode: Node | null = null;

      if (selection && selection.rangeCount > 0 && contentRef.current) {
        const range = selection.getRangeAt(0);
        currentNode = range.startContainer;
        cursorPosition = range.startOffset;
      }

      handleSave();

      // Restore cursor position after save
      setTimeout(() => {
        if (
          currentNode &&
          contentRef.current &&
          contentRef.current.contains(currentNode)
        ) {
          const selection = window.getSelection();
          if (selection) {
            const range = document.createRange();
            try {
              range.setStart(
                currentNode,
                Math.min(cursorPosition, currentNode.textContent?.length || 0)
              );
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (error) {
              // If cursor position restoration fails, just focus the content
              contentRef.current?.focus();
            }
          }
        }
      }, 10);
    }
  };

  // Handle Enter key with list continuation support
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const currentElement = range.commonAncestorContainer;

      // Find the closest list item
      let listItem =
        currentElement.nodeType === Node.ELEMENT_NODE
          ? (currentElement as Element)
          : currentElement.parentElement;

      while (
        listItem &&
        listItem.tagName !== "LI" &&
        listItem !== contentRef.current
      ) {
        listItem = listItem.parentElement;
      }

      // If we're inside a list item
      if (listItem && listItem.tagName === "LI") {
        const listItemElement = listItem as HTMLLIElement;
        const listElement = listItemElement.parentElement;

        // Check if the current list item is empty
        const isEmptyListItem = listItemElement.textContent?.trim() === "";

        if (isEmptyListItem) {
          // If the list item is empty, exit the list
          e.preventDefault();

          // Remove the empty list item
          listItemElement.remove();

          // Create a new paragraph after the list
          const newParagraph = document.createElement("div");
          newParagraph.innerHTML = "<br>";

          if (listElement && listElement.parentNode) {
            listElement.parentNode.insertBefore(
              newParagraph,
              listElement.nextSibling
            );

            // Move cursor to the new paragraph
            const newRange = document.createRange();
            newRange.setStart(newParagraph, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        } else {
          // Let the browser handle list item creation naturally
          // This will automatically continue the list with proper numbering/bullets
          return;
        }
      } else {
        // Not in a list, handle normal paragraph breaks
        e.preventDefault();
        e.stopPropagation();

        range.deleteContents();

        // Insert a simple line break
        const br = document.createElement("br");
        range.insertNode(br);

        // Move cursor after the br tag
        const newRange = document.createRange();
        newRange.setStartAfter(br);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      handleContentChange();
      return false;
    }
  };

  const formatText = (command: string, value?: string) => {
    // Only allow formatting if we have a note and the content editor exists
    if (!note || !contentRef.current) {
      return;
    }

    // Ensure the content editor is focused before applying formatting
    contentRef.current.focus();

    // Wait a brief moment for focus to be established
    setTimeout(() => {
      // Double-check that the content editor has focus before applying format
      if (
        document.activeElement === contentRef.current ||
        contentRef.current?.contains(document.activeElement)
      ) {
        document.execCommand(command, false, value);
        handleContentChange();
      }
    }, 10);
  };

  const insertList = (ordered: boolean) => {
    const command = ordered ? "insertOrderedList" : "insertUnorderedList";
    formatText(command);
  };

  const setTextAlign = (alignment: string) => {
    formatText("justifyLeft");
    if (alignment !== "left") {
      formatText(
        `justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`
      );
    }
  };

  const changeFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(32, fontSize + delta));
    setFontSize(newSize);
    if (contentRef.current) {
      contentRef.current.style.fontSize = `${newSize}px`;
    }
    handleContentChange();
  };

  const setTextColor = (color: string) => {
    formatText("foreColor", color);
    setShowColorPicker(false);
  };

  const highlightText = (color: string) => {
    // Use execCommand for highlight, then force dark text color
    formatText("hiliteColor", color);
    setShowHighlightPicker(false);
    // Post-process: set color of all <span style="background-color: ..."> or <font ...> to dark
    if (contentRef.current) {
      const el = contentRef.current;
      // Find all elements with background color matching the highlight
      el.querySelectorAll('[style*="background-color"]').forEach((node) => {
        (node as HTMLElement).style.color = "#1a1a1a";
      });
      // Also handle <mark> tags but NOT search-highlight marks
      el.querySelectorAll("mark:not(.search-highlight)").forEach((node) => {
        (node as HTMLElement).style.color = "#1a1a1a";
      });
    }
  };

  const insertHorizontalRule = () => {
    formatText("insertHorizontalRule");
  };

  const applyHeading = (option: (typeof headingOptions)[0]) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
      // If text is selected, wrap it in the heading
      const element = document.createElement(option.tag);
      element.className = option.className;
      element.textContent = selectedText;

      range.deleteContents();
      range.insertNode(element);

      // Move cursor after the element
      range.setStartAfter(element);
      range.setEndAfter(element);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // If no text selected, insert a new heading element
      const element = document.createElement(option.tag);
      element.className = option.className;
      element.textContent = option.label;
      element.contentEditable = "true";

      range.insertNode(element);

      // Select the text inside the new element
      const textRange = document.createRange();
      textRange.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(textRange);
    }

    setShowHeadingDropdown(false);
    handleContentChange();
    contentRef.current?.focus();
  };

  const insertLink = () => {
    // For now, insert a placeholder link that users can edit
    const link = `<a href="https://example.com" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">Link Text</a>`;
    formatText("insertHTML", link);
  };

  const insertBlockquote = () => {
    formatText("formatBlock", "blockquote");
    // Apply custom styling
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      const blockquote =
        selection.anchorNode.parentElement?.closest("blockquote");
      if (blockquote) {
        blockquote.style.borderLeft = "4px solid #e5e7eb";
        blockquote.style.paddingLeft = "16px";
        blockquote.style.margin = "16px 0";
        blockquote.style.fontStyle = "italic";
        blockquote.style.color = "#6b7280";
      }
    }
  };

  // Function to highlight search terms in the editor
  const highlightSearchTerm = useCallback((term: string) => {
    if (!term || !term.trim() || !contentRef.current) return;

    const content = contentRef.current;
    const innerHTML = content.innerHTML;

    // Remove existing search highlights only
    const cleanHTML = innerHTML.replace(
      /<mark class="search-highlight"[^>]*>([^<]*)<\/mark>/gi,
      "$1"
    );

    // Escape special regex characters and ensure the term is valid
    const escapedTerm = term.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Only proceed if we have a valid escaped term
    if (!escapedTerm) return;

    // Create a more precise regex that only matches whole words or parts of words
    const regex = new RegExp(`(${escapedTerm})`, "gi");

    // Test if the regex actually finds matches before applying
    if (!regex.test(cleanHTML)) {
      return; // No matches found, don't modify content
    }

    // Reset regex lastIndex since we used test()
    regex.lastIndex = 0;

    const highlightedHTML = cleanHTML.replace(
      regex,
      '<mark class="search-highlight" style="background-color: #fef08a; color: #1a1a1a; padding: 1px 2px; border-radius: 2px;">$1</mark>'
    );

    // Only update if the content actually changed
    if (highlightedHTML !== cleanHTML) {
      content.innerHTML = highlightedHTML;

      // Scroll to first match
      const firstMatch = content.querySelector(".search-highlight");
      if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, []);

  // Clear search highlights
  const clearSearchHighlights = useCallback(() => {
    if (!contentRef.current) return;

    const content = contentRef.current;
    const innerHTML = content.innerHTML;
    const cleanHTML = innerHTML.replace(
      /<mark class="search-highlight"[^>]*>([^<]*)<\/mark>/gi,
      "$1"
    );
    if (cleanHTML !== innerHTML) {
      content.innerHTML = cleanHTML;
    }
  }, []);

  // Handle search term highlighting
  useEffect(() => {
    if (searchTerm && searchTerm.trim() && note) {
      // Close search modal if external search is used
      setShowSearchModal(false);
      setSearchQuery("");
      setMatches([]);
      setTotalMatches(0);
      setCurrentMatchIndex(0);

      // Only highlight if search term is at least 1 character and not just whitespace
      const trimmedTerm = searchTerm.trim();
      if (trimmedTerm.length > 0) {
        // Wait a bit for the content to be loaded
        setTimeout(() => {
          highlightSearchTerm(trimmedTerm);
        }, 100);
      }
    } else {
      clearSearchHighlights();
    }
  }, [searchTerm, note, highlightSearchTerm, clearSearchHighlights]);

  // Search modal functions
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim() || !contentRef.current) {
        setMatches([]);
        setTotalMatches(0);
        setCurrentMatchIndex(0);
        clearSearchHighlights();
        return;
      }

      const content = contentRef.current;
      const innerHTML = content.innerHTML;

      // Remove existing search highlights
      const cleanHTML = innerHTML.replace(
        /<mark class="search-highlight"[^>]*>([^<]*)<\/mark>/gi,
        "$1"
      );

      const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedQuery})`, "gi");

      if (!regex.test(cleanHTML)) {
        setMatches([]);
        setTotalMatches(0);
        setCurrentMatchIndex(0);
        content.innerHTML = cleanHTML;
        return;
      }

      // Reset regex and apply highlights with unique IDs
      regex.lastIndex = 0;
      let matchCount = 0;
      const highlightedHTML = cleanHTML.replace(regex, (match) => {
        matchCount++;
        return `<mark class="search-highlight" data-match-id="${
          matchCount - 1
        }" style="background-color: #fef08a; color: #1a1a1a; padding: 1px 2px; border-radius: 2px;">${match}</mark>`;
      });

      content.innerHTML = highlightedHTML;

      // Get all match elements
      const matchElements = Array.from(
        content.querySelectorAll(".search-highlight")
      );
      setMatches(matchElements);
      setTotalMatches(matchCount);
      setCurrentMatchIndex(0);

      // Highlight first match
      if (matchElements.length > 0) {
        highlightCurrentMatch(0, matchElements);
      }
    },
    [clearSearchHighlights]
  );

  const highlightCurrentMatch = useCallback(
    (index: number, matchElements: Element[]) => {
      // Remove previous current highlight
      matchElements.forEach((el) => {
        (el as HTMLElement).style.backgroundColor = "#fef08a";
      });

      // Highlight current match
      if (matchElements[index]) {
        const currentElement = matchElements[index] as HTMLElement;
        currentElement.style.backgroundColor = "#ff6b35";
        currentElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    []
  );

  const navigateToMatch = useCallback(
    (direction: "next" | "prev") => {
      if (matches.length === 0) return;

      let newIndex;
      if (direction === "next") {
        newIndex =
          currentMatchIndex >= matches.length - 1 ? 0 : currentMatchIndex + 1;
      } else {
        newIndex =
          currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1;
      }

      setCurrentMatchIndex(newIndex);
      highlightCurrentMatch(newIndex, matches);
    },
    [matches, currentMatchIndex, highlightCurrentMatch]
  );

  const closeSearchModal = useCallback(() => {
    setShowSearchModal(false);
    setSearchQuery("");
    clearSearchHighlights();
    setMatches([]);
    setTotalMatches(0);
    setCurrentMatchIndex(0);
  }, [clearSearchHighlights]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if the editor container or its children have focus
      const editorContainer = editorContainerRef.current;
      if (!editorContainer) return;

      const activeElement = document.activeElement;
      const isEditorFocused =
        editorContainer.contains(activeElement) ||
        activeElement === contentRef.current ||
        activeElement === titleInputRef.current ||
        activeElement === categoryInputRef.current ||
        activeElement === searchInputRef.current ||
        // Also check if we're in a contenteditable area within the editor
        (activeElement &&
          activeElement.getAttribute("contenteditable") === "true" &&
          editorContainer.contains(activeElement));

      // Don't handle shortcuts if user is interacting with form elements
      if (
        activeElement &&
        (activeElement.tagName === "SELECT" ||
          activeElement.tagName === "OPTION" ||
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (!isEditorFocused) return;

      // Check for custom shortcuts
      for (const shortcut of shortcuts) {
        if (matchesShortcut(e, shortcut.keys)) {
          e.preventDefault();

          switch (shortcut.id) {
            case "save":
              handleSave();
              break;
            case "search":
              setShowSearchModal(true);
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
              break;
            case "newNote":
              // Add new note functionality here if available
              break;
            case "bold":
              formatText("bold");
              break;
            case "italic":
              formatText("italic");
              break;
            case "underline":
              formatText("underline");
              break;
            case "strikethrough":
              formatText("strikethrough");
              break;
            case "indent":
              formatText("indent");
              break;
            case "outdent":
              formatText("outdent");
              break;
            case "undo":
              document.execCommand("undo");
              break;
            case "redo":
              document.execCommand("redo");
              break;
            case "selectAll":
              document.execCommand("selectAll");
              break;
            case "copy":
              document.execCommand("copy");
              break;
            default:
              break;
          }
          return;
        }
      }

      // Escape to close search modal
      if (e.key === "Escape" && showSearchModal) {
        closeSearchModal();
      }

      // Enter to navigate to next match
      if (e.key === "Enter" && showSearchModal) {
        e.preventDefault();
        if (e.shiftKey) {
          navigateToMatch("prev");
        } else {
          navigateToMatch("next");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    showSearchModal,
    closeSearchModal,
    navigateToMatch,
    shortcuts,
    matchesShortcut,
    handleSave,
    formatText,
  ]);

  // Update search when query changes
  useEffect(() => {
    if (showSearchModal) {
      performSearch(searchQuery);
    }
  }, [searchQuery, showSearchModal, performSearch]);

  // Close search modal when note changes
  useEffect(() => {
    if (showSearchModal) {
      closeSearchModal();
    }
  }, [note?.id]); // Only depend on note ID to avoid infinite loops

  if (!note) {
    return (
      <div
        className="flex-1 flex items-center justify-center min-h-full"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Type
            size={64}
            className="mx-auto mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          />
          <h2
            className="text-xl font-semibold mb-2 text-center"
            style={{ color: "var(--color-text)" }}
          >
            Select a note to edit
          </h2>
          <p
            className="text-center"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Choose a note from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={editorContainerRef}
      className="flex-1 flex flex-col h-full"
      style={{
        background: "var(--bg-primary)",
      }}
      tabIndex={-1} // Make the container focusable
      onClick={(e) => {
        // Only focus the container if clicking on the container itself,
        // not on inputs or contenteditable areas
        const target = e.target as HTMLElement;
        const isInteractiveElement =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "BUTTON" ||
          target.tagName === "SELECT" ||
          target.tagName === "OPTION" ||
          target.getAttribute("contenteditable") === "true" ||
          target.closest('[contenteditable="true"]') ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest("button") ||
          target.closest("select");

        if (!isInteractiveElement) {
          editorContainerRef.current?.focus();
        }
      }}
    >
      {/* Search Modal */}
      {showSearchModal && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center space-x-1 px-1 py-1 rounded-xl shadow-xl border-2"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--accent)",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Search size={16} style={{ color: "var(--text-secondary)" }} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find in note..."
            className="bg-transparent border-none outline-none text-sm min-w-[200px]"
            style={{ color: "var(--text-primary)" }}
          />
          {totalMatches > 0 && (
            <div
              className="flex items-center space-x-1 text-xs px-2 py-1 rounded-xl"
              style={{
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-primary)",
              }}
            >
              <span>
                {currentMatchIndex + 1} of {totalMatches}
              </span>
              <button
                onClick={() => navigateToMatch("prev")}
                className="p-1 rounded transition-colors duration-200"
                style={{
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                title="Previous match (Shift+Enter)"
              >
                <ChevronUp size={12} />
              </button>
              <button
                onClick={() => navigateToMatch("next")}
                className="p-1 rounded transition-colors duration-200"
                style={{
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                title="Next match (Enter)"
              >
                <ChevronDownIcon size={12} />
              </button>
            </div>
          )}
          <button
            onClick={closeSearchModal}
            className="p-1 rounded transition-colors duration-200"
            style={{
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Close (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className="p-2 sticky top-0 z-20 shadow-sm backdrop-blur-md"
        style={{
          backgroundColor: "var(--bg-card)",
        }}
      >
        {/* Main toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 flex-wrap">
            {/* Font selector */}
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                if (contentRef.current) {
                  contentRef.current.style.fontFamily = e.target.value;
                }
              }}
              className="px-2 py-2 rounded-xl mr-2 shadow-sm hover:shadow-md transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--color-text)",
              }}
              title="Font Family"
            >
              {fontOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Heading dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
                className="flex items-center space-x-2 px-2 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-accent)",
                  color: "var(--color-accent)",
                }}
                title="Text Style"
              >
                <Type size={16} style={{ color: "var(--color-accent)" }} />
                <ChevronDown
                  size={14}
                  style={{ color: "var(--color-accent)" }}
                  className="transition-transform duration-200"
                />
              </button>
              {showHeadingDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowHeadingDropdown(false)}
                  />
                  <div
                    className="absolute top-full left-0 mt-2 z-50 backdrop-blur-md border rounded-xl shadow-2xl py-2 min-w-44 animate-in fade-in zoom-in-95 duration-200"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--bg-card)",
                    }}
                  >
                    {headingOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => applyHeading(option)}
                        className="w-full px-2 py-2 text-left flex items-center transition-all duration-200 group"
                        style={{
                          color: "var(--color-text)",
                          backgroundColor: "var(--bg-card)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--bg-card)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--bg-card)";
                        }}
                      >
                        <span
                          className={`${
                            option.className.split(" ")[0]
                          } transition-colors duration-200`}
                          style={{ color: "var(--color-text)" }}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div
              className="w-px h-6 mx-2"
              style={{
                backgroundColor: "var(--color-border)",
              }}
            />

            {/* Text formatting */}
            <button
              onClick={() => formatText("bold")}
              disabled={!note}
              className="p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                backgroundColor: note
                  ? "var(--color-surface)"
                  : "var(--color-background)",
                color: note
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-disabled)",
              }}
              onMouseEnter={(e) => {
                if (note) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-background)";
                }
              }}
              onMouseLeave={(e) => {
                if (note) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface)";
                }
              }}
              title="Bold (Ctrl+B)"
            >
              <Bold
                size={16}
                style={{ color: "var(--color-text-secondary)" }}
                className="transition-colors duration-200"
              />
            </button>
            <button
              onClick={() => formatText("italic")}
              disabled={!note}
              className="p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                backgroundColor: note
                  ? "var(--color-surface)"
                  : "var(--color-background)",
                color: note
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-disabled)",
              }}
              onMouseEnter={(e) => {
                if (note) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-background)";
                }
              }}
              onMouseLeave={(e) => {
                if (note) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface)";
                }
              }}
              title="Italic (Ctrl+I)"
            >
              <Italic
                size={16}
                style={{ color: "var(--color-text-secondary)" }}
                className="transition-colors duration-200"
              />
            </button>
            <button
              onClick={() => formatText("underline")}
              disabled={!note}
              className="p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                backgroundColor: note
                  ? "var(--color-surface)"
                  : "var(--color-background)",
                color: note
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-disabled)",
              }}
              onMouseEnter={(e) => {
                if (note) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-background)";
                }
              }}
              onMouseLeave={(e) => {
                if (note) {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface)";
                }
              }}
              title="Underline (Ctrl+U)"
            >
              <Underline
                size={16}
                style={{ color: "var(--color-text-secondary)" }}
                className="transition-colors duration-200"
              />
            </button>

            <div
              className="w-px h-6 mx-2"
              style={{
                backgroundColor: "var(--color-border)",
              }}
            />

            {/* Lists */}
            <button
              onClick={() => insertList(false)}
              className="p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
              }}
              title="Bullet List"
            >
              <List
                size={16}
                style={{ color: "var(--color-text-secondary)" }}
                className="transition-colors duration-200"
              />
            </button>
            <button
              onClick={() => insertList(true)}
              className="p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
              }}
              title="Numbered List"
            >
              <ListOrdered
                size={16}
                style={{ color: "var(--color-text-secondary)" }}
                className="transition-colors duration-200"
              />
            </button>

            <div
              className="w-px h-6 mx-2"
              style={{
                backgroundColor: "var(--color-border)",
              }}
            />

            {/* Alignment */}
            <button
              onClick={() => setTextAlign("left")}
              className="p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
              }}
              title="Align Left"
            >
              <AlignLeft
                size={16}
                style={{ color: "var(--color-text-secondary)" }}
              />
            </button>
            <button
              onClick={() => setTextAlign("center")}
              className="p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
              }}
              title="Align Center"
            >
              <AlignCenter
                size={16}
                style={{ color: "var(--color-text-secondary)" }}
              />
            </button>
            <button
              onClick={() => setTextAlign("right")}
              className="p-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
              }}
              title="Align Right"
            >
              <AlignRight
                size={16}
                style={{ color: "var(--color-text-secondary)" }}
              />
            </button>

            <div
              className="w-px h-6 mx-2"
              style={{
                backgroundColor: "var(--color-border)",
              }}
            />

            {/* Font size */}
            <div
              className="flex items-center space-x-1 rounded-xl p-1 shadow-sm"
              style={{
                backgroundColor: "var(--color-surface)",
              }}
            >
              <button
                onClick={() => changeFontSize(-1)}
                className="p-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                style={{
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-accent)",
                }}
                title="Decrease Font Size"
              >
                <Minus size={14} style={{ color: "var(--color-accent)" }} />
              </button>
              <span
                className="text-sm min-w-8 text-center font-semibold"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {fontSize}
              </span>
              <button
                onClick={() => changeFontSize(1)}
                className="p-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                style={{
                  backgroundColor: "var(--color-background)",
                  color: "var(--color-accent)",
                }}
                title="Increase Font Size"
              >
                <Plus size={14} style={{ color: "var(--color-accent)" }} />
              </button>
            </div>

            <div className="w-px h-6 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-zinc-600 dark:to-zinc-700 mx-2" />

            {/* Color picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                title="Text Color"
              >
                <Palette
                  size={16}
                  className="text-purple-600 dark:text-purple-400"
                />
              </button>
              {showColorPicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white/95 backdrop-blur-md dark:bg-zinc-900/95 border border-gray-200/50 dark:border-zinc-700/50 rounded-xl shadow-2xl p-4 min-w-64 animate-in fade-in zoom-in-95 duration-200">
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Text Color
                      </p>
                      <div className="grid grid-cols-6 gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setTextColor(color)}
                            className="w-8 h-8 rounded-lg border-2 border-gray-300/50 dark:border-zinc-600/50 hover:scale-125 transition-all duration-200 shadow-sm hover:shadow-lg transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Text highlight */}
            <div className="relative">
              <button
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                className="p-2.5 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 dark:hover:from-yellow-800/30 dark:hover:to-orange-800/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                title="Highlight Text"
              >
                <Highlighter
                  size={16}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </button>
              {showHighlightPicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowHighlightPicker(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white/95 backdrop-blur-md dark:bg-zinc-900/95 border border-gray-200/50 dark:border-zinc-700/50 rounded-xl shadow-2xl p-4 min-w-48 animate-in fade-in zoom-in-95 duration-200">
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Highlight Color
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {highlightColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => highlightText(color)}
                            className="w-8 h-8 rounded-lg border-2 border-gray-300/50 dark:border-zinc-600/50 hover:scale-125 transition-all duration-200 shadow-sm hover:shadow-lg transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-6 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-zinc-600 dark:to-zinc-700 mx-2" />

            {/* Media and content */}

            <button
              onClick={insertLink}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 dark:hover:from-blue-800/30 dark:hover:to-cyan-800/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              title="Insert Link"
            >
              <Link size={16} className="text-blue-600 dark:text-blue-400" />
            </button>
            <button
              onClick={insertBlockquote}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 dark:hover:from-indigo-800/30 dark:hover:to-purple-800/30 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              title="Insert Quote"
            >
              <Quote
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </button>

            {/* Horizontal rule */}
            <button
              onClick={insertHorizontalRule}
              className="p-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 dark:from-zinc-800/50 dark:to-slate-800/50 dark:hover:from-zinc-700/50 dark:hover:to-slate-700/50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              title="Insert Horizontal Line"
            >
              <Minus size={16} className="text-gray-700 dark:text-zinc-300" />
            </button>
          </div>

          <div className="flex items-center space-x-2"></div>
        </div>
      </div>
      {/* Metadata */}
      <div
        className="flex items-center space-x-4 px-6 pb-3 pt-3"
        style={{
          backgroundColor: "var(--bg-card)",
        }}
      >
        <div className="flex items-center space-x-2">
          <Tag size={16} style={{ color: "var(--color-accent)" }} />
          <input
            ref={categoryInputRef}
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }
            }}
            className="px-3 py-2 border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />
        </div>
        <div
          className="flex items-center space-x-3 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Calendar
            size={16}
            style={{ color: "var(--color-text-secondary)" }}
          />
          <span className="font-medium">
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </span>
          <span style={{ color: "var(--color-border)" }}>•</span>
          <span className="font-medium">
            Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>
        {/* Red dot for unsaved changes in manual mode */}
        {!autoSave && !isSaved && (
          <div className="flex items-center space-x-2">
            <span
              className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse shadow-sm"
              title="Unsaved changes"
            ></span>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              Unsaved
            </span>
          </div>
        )}
      </div>
      <div
        className="flex-1 p-6 overflow-auto"
        style={{ backgroundColor: "var(--bg-primary)" }}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={titleInputRef}
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // Focus the content area when Enter is pressed
              if (contentRef.current) {
                contentRef.current.focus();
                // Position cursor at the beginning of the content
                const selection = window.getSelection();
                if (selection) {
                  const range = document.createRange();
                  range.selectNodeContents(contentRef.current);
                  range.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              }
            }
          }}
          className="w-full text-3xl font-bold border-none outline-none bg-transparent mb-6 transition-colors duration-200 placeholder-gray-400"
          style={{
            color: "var(--color-text)",
          }}
        />

        {/* Editor Container with Line Numbers and Minimap */}
        <div className="flex flex-1 relative">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div
              className="flex flex-col text-right pr-4 py-6 select-none text-gray-400 text-sm leading-relaxed"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                fontFamily: "monospace",
                backgroundColor: "var(--color-surface)",
                borderRight: "1px solid var(--color-border)",
              }}
            >
              {/* Line numbers will be generated based on content */}
              {Array.from({ length: Math.max(20, lineCount) }, (_, i) => (
                <div key={i + 1} className="min-h-[1.5em]">
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Main Editor */}
          <div
            ref={contentRef}
            contentEditable
            onInput={handleContentChange}
            onKeyDown={(e) => {
              // Handle Tab key for indentation
              if (e.key === "Tab" && !e.shiftKey) {
                e.preventDefault();
                if (autoIndent) {
                  document.execCommand(
                    "insertText",
                    false,
                    " ".repeat(tabSize)
                  );
                }
                return;
              }

              // Handle Shift+Tab for unindent
              if (e.key === "Tab" && e.shiftKey) {
                e.preventDefault();
                // Simple unindent by removing spaces at the beginning of the line
                const selection = window.getSelection();
                if (selection && selection.rangeCount) {
                  const range = selection.getRangeAt(0);
                  const textNode = range.startContainer;
                  if (textNode.nodeType === Node.TEXT_NODE) {
                    const text = textNode.textContent || "";
                    const lineStart =
                      text.lastIndexOf("\n", range.startOffset - 1) + 1;
                    const spacesToRemove = Math.min(
                      tabSize,
                      text.slice(lineStart).search(/[^ ]/)
                    );
                    if (spacesToRemove > 0) {
                      const newRange = document.createRange();
                      newRange.setStart(textNode, lineStart);
                      newRange.setEnd(textNode, lineStart + spacesToRemove);
                      newRange.deleteContents();
                    }
                  }
                }
                return;
              }

              // Handle Enter key with smart list continuation
              if (e.key === "Enter" && !e.shiftKey) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount) {
                  const range = selection.getRangeAt(0);
                  const currentElement = range.commonAncestorContainer;

                  // Find the closest list item
                  let listItem =
                    currentElement.nodeType === Node.ELEMENT_NODE
                      ? (currentElement as Element)
                      : currentElement.parentElement;

                  while (
                    listItem &&
                    listItem.tagName !== "LI" &&
                    listItem !== contentRef.current
                  ) {
                    listItem = listItem.parentElement;
                  }

                  // If we're inside a non-empty list item, let browser handle it naturally
                  if (
                    listItem &&
                    listItem.tagName === "LI" &&
                    listItem.textContent?.trim() !== ""
                  ) {
                    // Don't prevent default - let browser create new list item
                    handleContentChange();
                    return;
                  }
                }

                // For other cases (empty list items, non-list content), use our custom handler
                handleContentKeyDown(e);
                return;
              }
              handleKeyDown(e);
            }}
            className={`flex-1 min-h-96 outline-none rounded-xl p-6 shadow-sm ${
              showLineNumbers ? "pl-6" : ""
            }`}
            style={{
              minHeight: "400px",
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              lineHeight: lineHeight,
              wordWrap: wordWrap ? "break-word" : "normal",
              overflowWrap: wordWrap ? "break-word" : "normal",
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              maxWidth: "100%",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
              borderColor: "var(--color-border)",
              tabSize: tabSize,
            }}
            data-placeholder="Start writing your note..."
          />

          {/* Minimap */}
          {minimap && (
            <div
              className="w-24 h-full overflow-hidden select-none ml-2 rounded border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="w-full h-full p-2 text-xs leading-tight overflow-hidden"
                style={{
                  fontSize: "6px",
                  fontFamily: fontFamily,
                  color: "var(--color-text)",
                  opacity: 0.6,
                  transform: "scale(0.3)",
                  transformOrigin: "top left",
                  width: "300%",
                  height: "300%",
                }}
              >
                {contentRef.current?.textContent?.slice(0, 2000) ||
                  "Start writing your note..."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
