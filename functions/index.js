const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const OWNER_ADMIN_EMAILS = new Set([
  'me@damiennichols.com',
  'damienlovemusic@gmail.com',
]);

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const isOwnerAdminEmail = (email) => OWNER_ADMIN_EMAILS.has(normalizeEmail(email));

const ensureOwnerClaims = async (uid) => {
  const userRecord = await admin.auth().getUser(uid);
  const claims = userRecord.customClaims || {};
  if (claims.admin === true && claims.owner === true) {
    return;
  }
  await admin.auth().setCustomUserClaims(uid, { ...claims, admin: true, owner: true });
};

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const userRef = admin.firestore().doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  const isOwnerAdmin = isOwnerAdminEmail(user.email);
  const ownerFields = isOwnerAdmin ? {
    role: 'admin',
    plan: 'pro',
    isPro: true,
    isAdmin: true,
  } : {};

  if (isOwnerAdmin) {
    await ensureOwnerClaims(user.uid);
  }
  if (snapshot.exists) {
    await userRef.set({
      email: user.email || null,
      displayName: user.displayName || null,
      ...ownerFields,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return;
  }

  await userRef.set({
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    role: isOwnerAdmin ? 'admin' : 'member',
    plan: isOwnerAdmin ? 'pro' : 'free',
    isPro: isOwnerAdmin,
    isAdmin: isOwnerAdmin,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
  await admin.firestore().doc(`users/${user.uid}`).delete();
});
