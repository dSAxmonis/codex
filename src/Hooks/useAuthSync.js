import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import api from '../Utils/api';

/**
 * useAuthSync — call this once in App.js or a top-level component.
 * When the user signs in, it syncs their Clerk profile to MongoDB.
 */
export default function useAuthSync() {
  const { isSignedIn, user } = useUser();
  const { getToken }         = useAuth();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const sync = async () => {
      try {
        const token = await getToken();
        await api.auth.sync(token, {
          email:    user.primaryEmailAddress?.emailAddress || '',
          fullName: user.fullName || '',
          username: user.username || '',
        });
      } catch (err) {
        // Sync failure is non-critical — app still works
        console.warn('Auth sync failed:', err.message);
      }
    };

    sync();
  }, [isSignedIn, user, getToken]);
}