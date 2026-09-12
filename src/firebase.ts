import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom databaseId from config if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface SavedPrediction {
  id?: string;
  userId: string;
  patientName: string;
  patientId?: string;
  timestamp: string;
  metrics: {
    pregnancies: number;
    glucose: number;
    bloodPressure: number;
    skinThickness: number;
    insulin: number;
    bmi: number;
    dpf: number;
    age: number;
  };
  engineered: {
    glucoseBmi: number;
    ageBmi: number;
    glucoseAge: number;
    bmiCategory: string;
    ageCategory: string;
  };
  prediction: number;
  riskPercentage: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  factors: string[];
  notes?: string;
}

// User sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Update user profile in firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Clinician / User',
      photoURL: user.photoURL || '',
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Sign out
export async function logOut() {
  return signOut(auth);
}

// Save a patient assessment record to Firestore
export async function savePredictionRecord(record: Omit<SavedPrediction, 'id'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated to save predictions.');

  const predictionsCol = collection(db, 'users', user.uid, 'predictions');
  const docRef = await addDoc(predictionsCol, {
    ...record,
    userId: user.uid,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

// Fetch prediction history for current user
export async function fetchUserPredictions(): Promise<SavedPrediction[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const predictionsCol = collection(db, 'users', user.uid, 'predictions');
  const q = query(predictionsCol, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<SavedPrediction, 'id'>)
  }));
}

// Delete a prediction record
export async function deletePredictionRecord(predictionId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated.');

  const docRef = doc(db, 'users', user.uid, 'predictions', predictionId);
  await deleteDoc(docRef);
}

// Real-time listener for user prediction history
export function subscribeUserPredictions(
  userId: string,
  onUpdate: (records: SavedPrediction[]) => void,
  onError?: (error: any) => void
): () => void {
  const predictionsCol = collection(db, 'users', userId, 'predictions');
  const q = query(predictionsCol, orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<SavedPrediction, 'id'>)
    }));
    onUpdate(records);
  }, (err) => {
    console.error('Firestore real-time snapshot error:', err);
    if (onError) onError(err);
  });
}

