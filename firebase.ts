// FIX: The file name `firebase.ts` can cause module resolution conflicts with the 'firebase' package.
// The named imports were failing to resolve. Using a namespace import (`import * as ...`) 
// helps the resolver distinguish between the local file and the node module.
import * as firebaseApp from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import type { FirebaseApp } from 'firebase/app';


interface FirebaseHandles {
  // FIX: Use the FirebaseApp type from the namespaced import.
  app: firebaseApp.FirebaseApp;
  auth: Auth;
  database: Database;
}

// A function to initialize Firebase, ensuring it's only done once.
export const initializeFirebase = (config: any): FirebaseHandles | null => {
  if (!config || !config.apiKey) {
    console.warn("Firebase config is missing or invalid. App will not connect to Firebase.");
    return null;
  }
  
  try {
    // FIX: Use the functions from the namespaced import to avoid resolution errors.
    const app = firebaseApp.getApps().length === 0 ? firebaseApp.initializeApp(config) : firebaseApp.getApp();
    const auth = getAuth(app);
    const database = getDatabase(app);
    return { app, auth, database };
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return null;
  }
};
