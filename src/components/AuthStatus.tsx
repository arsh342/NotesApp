import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from './LoginScreen';

const AuthStatus: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showLoginScreen, setShowLoginScreen] = useState(false);

  if (user) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-white dark:bg-zinc-900 rounded-lg shadow">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user.displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Not signed in
        </p>
        <button
          onClick={() => setShowLoginScreen(true)}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
      
      {showLoginScreen && (
        <LoginScreen onClose={() => setShowLoginScreen(false)} />
      )}
    </>
  );
};

export default AuthStatus;
