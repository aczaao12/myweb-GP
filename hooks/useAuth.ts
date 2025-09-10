import { useState, useEffect } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

export const useAuth = (isFirebaseInitialized: boolean) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseInitialized) {
        setIsLoading(false);
        return;
    }
    
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setIsLoading(false);
        } else {
          // If no user, sign in anonymously
          signInAnonymously(auth).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
            setIsLoading(false);
          });
        }
      });
      return () => unsubscribe();
    } catch (error) {
        console.warn("useAuth: Firebase not initialized. Waiting for config.");
        setIsLoading(false);
    }
  }, [isFirebaseInitialized]);

  return { user, isLoading };
};
