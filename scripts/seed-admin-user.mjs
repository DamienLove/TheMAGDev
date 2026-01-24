import admin from 'firebase-admin';
import fs from 'fs';

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT
  || 'C:/Projects/TheMAGDev/secrets/themagdev-a4363-firebase-adminsdk-fbsvc-dd52087a55.json';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'me@damiennichols.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`Service account key not found: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const ensureAdmin = async () => {
  let user;
  try {
    user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
  } catch (err) {
    if (!ADMIN_PASSWORD) {
      console.error('Admin user does not exist. Set ADMIN_PASSWORD to create the user.');
      process.exit(1);
    }
    user = await admin.auth().createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      emailVerified: true,
    });
  }

  await admin.auth().setCustomUserClaims(user.uid, {
    admin: true,
    plan: 'pro',
    pro: true,
  });

  const userRef = admin.firestore().doc(`users/${user.uid}`);
  await userRef.set({
    uid: user.uid,
    email: user.email || ADMIN_EMAIL,
    displayName: user.displayName || 'TheMAG.dev Admin',
    role: 'admin',
    plan: 'pro',
    isAdmin: true,
    isPro: true,
    proStatus: 'permanent',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`Admin user ready: ${ADMIN_EMAIL} (uid: ${user.uid})`);
};

ensureAdmin().catch((err) => {
  console.error('Failed to seed admin user:', err);
  process.exit(1);
});
