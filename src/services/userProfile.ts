import { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'member';
  plan: 'pro' | 'free';
  isPro: boolean;
  isAdmin: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
}

export const ensureUserProfile = async (user: User): Promise<void> => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      role: 'member',
      plan: 'free',
      isPro: false,
      isAdmin: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    return;
  }

  const existing = snap.data() as Partial<UserProfile>;
  await updateDoc(ref, {
    email: user.email || existing.email || null,
    displayName: user.displayName || existing.displayName || null,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
};
