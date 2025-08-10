import { useState, useEffect } from 'react';
import { Note, Folder } from '../types/Note';
import { useCloudSync } from './useCloudSync';

const STORAGE_KEY = 'notes-app-data';
const FOLDERS_STORAGE_KEY = 'notes-app-folders';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  const { syncToCloud, syncFromCloud, isCloudEnabled } = useCloudSync();

  useEffect(() => {
    // Load notes
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error parsing saved notes:', error);
      }
    }

    // Load folders
    const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (savedFolders) {
      try {
        const parsedFolders = JSON.parse(savedFolders).map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt),
        }));
        setFolders(parsedFolders);
      } catch (error) {
        console.error('Error parsing saved folders:', error);
      }
    }
  }, []);

  const saveNotesToStorage = (notesToSave: Note[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notesToSave));
  };

  const saveFoldersToStorage = (foldersToSave: Folder[]) => {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(foldersToSave));
  };

  const createNote = (folderId: string | null = null): Note => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      category: '',
      folderId: folderId || selectedFolderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setSelectedNote(newNote);
    saveNotesToStorage(updatedNotes);
    
    return newNote;
  };

  const updateNote = (updatedNote: Note) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    setSelectedNote(updatedNote);
    saveNotesToStorage(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    if (selectedNote?.id === id) {
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    }
    
    saveNotesToStorage(updatedNotes);
  };

  const createFolder = (name: string, parentId: string | null = null): Folder => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      isExpanded: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    saveFoldersToStorage(updatedFolders);
    
    return newFolder;
  };

  const updateFolder = (updatedFolder: Folder) => {
    const updatedFolders = folders.map(folder => 
      folder.id === updatedFolder.id ? updatedFolder : folder
    );
    setFolders(updatedFolders);
    saveFoldersToStorage(updatedFolders);
  };

  const deleteFolder = (id: string) => {
    // Move notes from deleted folder to root
    const updatedNotes = notes.map(note => 
      note.folderId === id ? { ...note, folderId: null } : note
    );
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);

    // Delete folder and its subfolders
    const deleteFolderRecursive = (folderId: string) => {
      const childFolders = folders.filter(f => f.parentId === folderId);
      childFolders.forEach(child => deleteFolderRecursive(child.id));
      return folders.filter(f => f.id !== folderId);
    };

    const updatedFolders = deleteFolderRecursive(id);
    setFolders(updatedFolders);
    saveFoldersToStorage(updatedFolders);

    if (selectedFolderId === id) {
      setSelectedFolderId(null);
    }
  };

  const moveNote = (noteId: string, targetFolderId: string | null) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, folderId: targetFolderId } : note
    );
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
  };

  const toggleFolder = (folderId: string) => {
    const updatedFolders = folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    );
    setFolders(updatedFolders);
    saveFoldersToStorage(updatedFolders);
  };

  // Cloud sync functions
  const syncNotesToCloud = async () => {
    if (!isCloudEnabled) return;
    try {
      await syncToCloud(notes, folders);
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
    }
  };

  const loadNotesFromCloud = async () => {
    if (!isCloudEnabled) return;
    try {
      const cloudData = await syncFromCloud();
      if (cloudData) {
        setNotes(cloudData.notes);
        setFolders(cloudData.folders);
        // Also save to local storage as backup
        saveNotesToStorage(cloudData.notes);
        saveFoldersToStorage(cloudData.folders);
      }
    } catch (error) {
      console.error('Failed to load from cloud:', error);
    }
  };

  return {
    notes,
    folders,
    selectedNote,
    selectedFolderId,
    setSelectedNote,
    setSelectedFolderId,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    updateFolder,
    deleteFolder,
    moveNote,
    toggleFolder,
    // Cloud sync functions
    syncNotesToCloud,
    loadNotesFromCloud,
    isCloudEnabled,
  };
};