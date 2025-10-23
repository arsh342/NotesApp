import { useState, useCallback, useEffect } from "react";
import {
  auth,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
} from "../config/firebase-config";
import type { User } from "firebase/auth";

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true for initial auth check
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    // If Firebase is not configured, just set loading to false
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Auth state determined, stop loading
    });

    return () => unsubscribe();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setError(
        "Authentication service not available. Please check your Firebase configuration."
      );
      return;
    }

    if (!window.electronAPI) {
      setError("Electron API not available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenData = await window.electronAPI.loginWithGoogle();

      if (!tokenData.access_token) {
        throw new Error("No access token received");
      }

      const credential = GoogleAuthProvider.credential(
        null,
        tokenData.access_token
      );
      const userCredential = await signInWithCredential(auth, credential);

      setUser(userCredential.user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Google sign-in error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth) {
        setError(
          "Authentication service not available. Please check your Firebase configuration."
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser(userCredential.user);
      } catch (err: any) {
        let errorMessage = "Sign in failed";
        if (err.code === "auth/user-not-found") {
          errorMessage = "No account found with this email address";
        } else if (err.code === "auth/wrong-password") {
          errorMessage = "Incorrect password";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "Invalid email address";
        } else if (err.code === "auth/too-many-requests") {
          errorMessage = "Too many failed attempts. Please try again later";
        }
        setError(errorMessage);
        console.error("Email sign-in error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!auth) {
        setError(
          "Authentication service not available. Please check your Firebase configuration."
        );
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });

        setUser(userCredential.user);
      } catch (err: any) {
        let errorMessage = "Sign up failed";
        if (err.code === "auth/email-already-in-use") {
          errorMessage = "An account with this email already exists";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "Invalid email address";
        } else if (err.code === "auth/weak-password") {
          errorMessage = "Password should be at least 6 characters";
        }
        setError(errorMessage);
        console.error("Email sign-up error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    if (!auth) {
      setError(
        "Authentication service not available. Please check your Firebase configuration."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      let errorMessage = "Password reset failed";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      }
      setError(errorMessage);
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) {
      setError(
        "Authentication service not available. Please check your Firebase configuration."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Sign-out error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    clearError,
  };
};
