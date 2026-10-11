import admin from 'firebase-admin';
import emailjs from '@emailjs/nodejs';

let firebaseInitialized = false;
try {
  if (admin.apps.length === 0) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set.");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log("SUCCESS: Firebase Admin SDK initialized.");
    firebaseInitialized = true;
  } else {
    firebaseInitialized = true;
  }
} catch (error) {
  console.error('CRITICAL: Firebase Admin SDK initialization failed!', error);
}

const db = firebaseInitialized ? admin.firestore() : null;

export const handler = async function(event, context) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting precise notification check...`);

  if (!firebaseInitialized || !db) {
    console.error(`[${timestamp}] Exiting: Firebase not initialized.`);
    return { statusCode: 500, body: 'Firebase not initialized.' };
  }

  const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
  const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
  const SITE_BASE_URL = process.env.SITE_BASE_URL;

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !PRIVATE_KEY || !SITE_BASE_URL) {
    console.error(`[${timestamp}] Exiting: Missing one or more EmailJS environment variables.`);
    return { statusCode: 500, body: 'EmailJS environment variables not fully configured.' };
  }

  try {
    const requestsSnapshot = await db.collection('notificationRequests').get();
    if (requestsSnapshot.empty) {
      console.log(`[${timestamp}] No pending requests found. Exiting.`);
      return { statusCode: 200, body: 'No pending requests.' };
    }
    console.log(`[${timestamp}] Found ${requestsSnapshot.size} total requests to process.`);

    const successfulDeletes = [];
    let emailsSent = 0;
    
    for (const requestDoc of requestsSnapshot.docs) {
      const requestData = requestDoc.data();
      const { courtId, userEmail } = requestData;

      if (!courtId || !userEmail) {
        console.log(`Skipping invalid request document: ${requestDoc.id}`);
        continue;
      }
      
      console.log(`\n--- Checking request for User: ${userEmail} | Court ID: ${courtId} ---`);

      const courtRef = db.collection('Courts').doc(courtId);
      const courtDoc = await courtRef.get();

      if (!courtDoc.exists) {
        console.log(`Court ${courtId} does not exist. Deleting stale request.`);
        successfulDeletes.push(requestDoc.ref.delete());
        continue;
      }

      const courtData = courtDoc.data();
      const availableSubCourts = (courtData.courts || []).filter(sc => sc.isConfigured && sc.status === 'available');

      if (availableSubCourts.length > 0) {
        const availableSubCourtNames = availableSubCourts.map(sc => sc.name);
        console.log(`CONDITION MET: Court "${courtData.name}" is available. Sub-courts: [${availableSubCourtNames.join(', ')}].`);
        
        const templateParams = {
          to_email: userEmail,
          court_name: courtData.name,
          sub_court_names: availableSubCourtNames.join(', '),
          court_url: `${SITE_BASE_URL}/court/${courtId}`,
        };

        try {
          console.log(`Attempting to send email via EmailJS to: ${userEmail}`);
          await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
            publicKey: PUBLIC_KEY,
            privateKey: PRIVATE_KEY,
          });

          console.log(`SUCCESS sending email to ${userEmail}.`);
          emailsSent++;
          successfulDeletes.push(requestDoc.ref.delete());

        } catch (err) {
          console.error(`ERROR sending EmailJS email to ${userEmail}:`, err);
        }

      } else {
        console.log(`Condition NOT met: Court "${courtData.name}" is still in-use. Request will remain.`);
      }
    }

    if (successfulDeletes.length > 0) {
      await Promise.all(successfulDeletes);
      console.log(`\n[${timestamp}] Cleaned up ${successfulDeletes.length} fulfilled requests.`);
    }
    
    console.log(`[${timestamp}] Finished run. Sent ${emailsSent} emails.`);
    return { statusCode: 200, body: `Processed ${requestsSnapshot.size} requests. Sent ${emailsSent} emails.` };

  } catch (error) {
    console.error(`[${timestamp}] FATAL ERROR during execution:`, error);
    return { statusCode: 500, body: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};