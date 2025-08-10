import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { Note } from '../types/Note';

export interface CloudSyncOptions {
  enableFirestore: boolean;
  enableGoogleDrive: boolean;
  autoSync: boolean;
  syncInterval: number; // in milliseconds
}

export interface SyncStatus {
  issyncing: boolean;
  lastSyncTime: Date | null;
  syncErrors: string[];
  pendingChanges: number;
}

export class CloudSyncService {
  private userId: string | null = null;
  private options: CloudSyncOptions;
  private syncStatus: SyncStatus;
  private syncCallbacks: Array<(status: SyncStatus) => void> = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(options: CloudSyncOptions) {
    this.options = options;
    this.syncStatus = {
      issyncing: false,
      lastSyncTime: null,
      syncErrors: [],
      pendingChanges: 0
    };
  }

  setUserId(userId: string | null) {
    this.userId = userId;
    if (userId && this.options.autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  onSyncStatusChange(callback: (status: SyncStatus) => void) {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyStatusChange() {
    this.syncCallbacks.forEach(callback => callback({ ...this.syncStatus }));
  }

  async syncNotesToFirestore(notes: Note[], folders: any[]): Promise<void> {
    if (!this.userId || !this.options.enableFirestore) return;

    this.syncStatus.issyncing = true;
    this.syncStatus.syncErrors = [];
    this.notifyStatusChange();

    try {
      // Sync user's notes collection
      const userNotesRef = collection(db, 'users', this.userId, 'notes');
      
      // Upload notes
      for (const note of notes) {
        const noteRef = doc(userNotesRef, note.id);
        await setDoc(noteRef, {
          ...note,
          updatedAt: serverTimestamp(),
          syncedAt: serverTimestamp()
        });
      }

      // Upload folders
      const userFoldersRef = collection(db, 'users', this.userId, 'folders');
      for (const folder of folders) {
        const folderRef = doc(userFoldersRef, folder.id);
        await setDoc(folderRef, {
          ...folder,
          updatedAt: serverTimestamp(),
          syncedAt: serverTimestamp()
        });
      }

      // Update user sync metadata
      const userMetaRef = doc(db, 'users', this.userId);
      await setDoc(userMetaRef, {
        lastSyncTime: serverTimestamp(),
        notesCount: notes.length,
        foldersCount: folders.length
      }, { merge: true });

      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.pendingChanges = 0;
    } catch (error) {
      console.error('Firestore sync error:', error);
      this.syncStatus.syncErrors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.syncStatus.issyncing = false;
      this.notifyStatusChange();
    }
  }

  async syncNotesFromFirestore(): Promise<{ notes: Note[], folders: any[] } | null> {
    if (!this.userId || !this.options.enableFirestore) return null;

    this.syncStatus.issyncing = true;
    this.notifyStatusChange();

    try {
      // Get notes
      const userNotesRef = collection(db, 'users', this.userId, 'notes');
      const notesSnapshot = await getDocs(query(userNotesRef, orderBy('updatedAt', 'desc')));
      const notes = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];

      // Get folders
      const userFoldersRef = collection(db, 'users', this.userId, 'folders');
      const foldersSnapshot = await getDocs(userFoldersRef);
      const folders = foldersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      this.syncStatus.lastSyncTime = new Date();
      return { notes, folders };
    } catch (error) {
      console.error('Firestore fetch error:', error);
      this.syncStatus.syncErrors.push(error instanceof Error ? error.message : 'Unknown fetch error');
      return null;
    } finally {
      this.syncStatus.issyncing = false;
      this.notifyStatusChange();
    }
  }

  async syncToGoogleDrive(notes: Note[]): Promise<void> {
    if (!this.userId || !this.options.enableGoogleDrive) return;

    this.syncStatus.issyncing = true;
    this.notifyStatusChange();

    try {
      // Google Drive sync would require additional authentication
      // This is a placeholder for Google Drive API integration
      console.log('Google Drive sync would happen here');
      
      // For now, we'll create a backup file that could be uploaded to Drive
      const backupData = {
        userId: this.userId,
        notes: notes,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      // In a real implementation, this would upload to Google Drive
      console.log('Backup data prepared for Google Drive:', backupData);
      
      this.syncStatus.lastSyncTime = new Date();
    } catch (error) {
      console.error('Google Drive sync error:', error);
      this.syncStatus.syncErrors.push(error instanceof Error ? error.message : 'Google Drive sync failed');
    } finally {
      this.syncStatus.issyncing = false;
      this.notifyStatusChange();
    }
  }

  async performFullSync(notes: Note[], folders: any[]): Promise<void> {
    if (!this.userId) return;

    this.syncStatus.pendingChanges = notes.length + folders.length;
    this.notifyStatusChange();

    const promises: Promise<void>[] = [];

    if (this.options.enableFirestore) {
      promises.push(this.syncNotesToFirestore(notes, folders));
    }

    if (this.options.enableGoogleDrive) {
      promises.push(this.syncToGoogleDrive(notes));
    }

    await Promise.allSettled(promises);
  }

  private startAutoSync() {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      // This would trigger a sync of any pending changes
      console.log('Auto sync triggered');
    }, this.options.syncInterval);
  }

  private stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  updateOptions(newOptions: Partial<CloudSyncOptions>) {
    this.options = { ...this.options, ...newOptions };
    
    if (this.userId) {
      if (this.options.autoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }
}

// Create a singleton instance
export const cloudSyncService = new CloudSyncService({
  enableFirestore: true,
  enableGoogleDrive: false, // Disabled by default until properly configured
  autoSync: false,
  syncInterval: 30000 // 30 seconds
});
