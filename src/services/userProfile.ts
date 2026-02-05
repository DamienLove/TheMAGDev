import { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const OWNER_ADMIN_EMAILS = new Set([
  'me@damiennichols.com',
  'damienlovemusic@gmail.com',
]);

const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase();
const isOwnerAdminEmail = (email?: string | null) => OWNER_ADMIN_EMAILS.has(normalizeEmail(email));

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
  const isOwnerAdmin = isOwnerAdminEmail(user.email);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      role: isOwnerAdmin ? 'admin' : 'member',
      plan: isOwnerAdmin ? 'pro' : 'free',
      isPro: isOwnerAdmin,
      isAdmin: isOwnerAdmin,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    return;
  }

  const existing = snap.data() as Partial<UserProfile>;
  const updates: any = {
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (isOwnerAdmin) {
    if (existing.role !== 'admin') {
      updates.role = 'admin';
    }
    if (existing.plan !== 'pro') {
      updates.plan = 'pro';
    }
    if (existing.isPro !== true) {
      updates.isPro = true;
    }
    if (existing.isAdmin !== true) {
      updates.isAdmin = true;
    }
  }

  if (user.email && user.email !== existing.email) {
    updates.email = user.email;
  }
  if (user.displayName && user.displayName !== existing.displayName) {
    updates.displayName = user.displayName;
  }

  await updateDoc(ref, updates);
};
