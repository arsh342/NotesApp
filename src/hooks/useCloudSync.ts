import { useState, useEffect, useCallback } from "react";
import {
  cloudSyncService,
  CloudSyncOptions,
  SyncStatus,
} from "../services/CloudSyncService";
import { useAuth } from "./useAuth";
import { Note } from "../types/Note";

export interface UseCloudSyncReturn {
  syncStatus: SyncStatus;
  syncOptions: CloudSyncOptions;
  isCloudEnabled: boolean;
  syncToCloud: (notes: Note[], folders: any[]) => Promise<void>;
  syncFromCloud: () => Promise<{ notes: Note[]; folders: any[] } | null>;
  updateSyncOptions: (options: Partial<CloudSyncOptions>) => void;
  toggleCloudSync: () => void;
}

export const useCloudSync = (): UseCloudSyncReturn => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    cloudSyncService.getSyncStatus()
  );
  const [syncOptions, setSyncOptions] = useState<CloudSyncOptions>({
    enableFirestore: true,
    enableGoogleDrive: false,
    autoSync: false,
    syncInterval: 30000,
  });

  const isCloudEnabled = Boolean(
    user && (syncOptions.enableFirestore || syncOptions.enableGoogleDrive)
  );

  // Update cloud sync service when user changes
  useEffect(() => {
    cloudSyncService.setUserId(user?.uid || null);
  }, [user]);

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = cloudSyncService.onSyncStatusChange(setSyncStatus);
    return unsubscribe;
  }, []);

  const syncToCloud = useCallback(
    async (notes: Note[], folders: any[]) => {
      if (!user) return;
      await cloudSyncService.performFullSync(notes, folders);
    },
    [user]
  );

  const syncFromCloud = useCallback(async () => {
    if (!user) return null;
    return await cloudSyncService.syncNotesFromFirestore();
  }, [user]);

  const updateSyncOptions = useCallback(
    (options: Partial<CloudSyncOptions>) => {
      const newOptions = { ...syncOptions, ...options };
      setSyncOptions(newOptions);
      cloudSyncService.updateOptions(newOptions);
    },
    [syncOptions]
  );

  const toggleCloudSync = useCallback(() => {
    // Toggle the main cloud sync services (Firestore in this case)
    const newEnableFirestore = !syncOptions.enableFirestore;
    updateSyncOptions({
      enableFirestore: newEnableFirestore,
      // When disabling cloud sync, also disable auto-sync
      autoSync: newEnableFirestore ? syncOptions.autoSync : false,
    });
  }, [syncOptions.enableFirestore, syncOptions.autoSync, updateSyncOptions]);

  return {
    syncStatus,
    syncOptions,
    isCloudEnabled,
    syncToCloud,
    syncFromCloud,
    updateSyncOptions,
    toggleCloudSync,
  };
};
