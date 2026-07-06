const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.production' });

async function checkFirebase() {
  try {
    console.log('Initializing Firebase Admin...');
    
    // Check if the user even provided the private key in Vercel envs
    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.log('Error: FIREBASE_ADMIN_PRIVATE_KEY is missing from Vercel envs!');
      // Fallback to check local .env.local
      dotenv.config({ path: '.env.local' });
      if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
         console.log('Error: Missing locally too.');
      }
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    console.log('Checking Firestore...');
    const testDoc = await db.collection('system_test').add({ timestamp: admin.firestore.FieldValue.serverTimestamp() });
    console.log('Firestore works! Doc ID:', testDoc.id);
    await testDoc.delete();

    console.log('Checking Storage...');
    const testFile = bucket.file('system_test.txt');
    await testFile.save('test');
    console.log('Storage works!');
    await testFile.delete();

  } catch (error) {
    console.error('Firebase Check Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
  }
}

checkFirebase();
