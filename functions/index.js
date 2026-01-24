const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const userRef = admin.firestore().doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  if (snapshot.exists) {
    await userRef.set({
      email: user.email || null,
      displayName: user.displayName || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return;
  }

  await userRef.set({
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    role: 'member',
    plan: 'free',
    isPro: false,
    isAdmin: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
  await admin.firestore().doc(`users/${user.uid}`).delete();
});
