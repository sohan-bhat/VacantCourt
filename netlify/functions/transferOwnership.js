import admin from 'firebase-admin';

if (admin.apps.length === 0) {
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
}

const db = admin.firestore();

export const handler = async function(event, context) {

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'You must be logged in to perform this action. (No token found)' }) };
  }
  const idToken = authHeader.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Invalid token:', error);
    return { statusCode: 403, body: JSON.stringify({ error: 'Invalid or expired credentials. Please log in again.' }) };
  }

  const requestingUserId = decodedToken.uid;



  const { courtId, newOwnerEmail } = JSON.parse(event.body);
  if (!courtId || !newOwnerEmail) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Court ID and new owner email are required.' }) };
  }

  try {
    let newOwner;
    try {
        newOwner = await admin.auth().getUserByEmail(newOwnerEmail);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return { statusCode: 404, body: JSON.stringify({ error: 'No user found with that email address.' }) };
        } else if (error.code === 'auth/invalid-email') {
            return { statusCode: 400, body: JSON.stringify({ error: 'Please use a valid email address.' }) }
        }
        throw error;
    }

    const courtRef = db.collection('Courts').doc(courtId);
    const courtDoc = await courtRef.get();

    if (!courtDoc.exists) {
        return { statusCode: 404, body: JSON.stringify({ error: 'Court not found.' }) };
    }

    const courtData = courtDoc.data();

    if (courtData.ownerId !== requestingUserId) {
        console.error(`Authorization failed: Owner is ${courtData.ownerId}, Requester is ${requestingUserId}`);
        return { statusCode: 403, body: JSON.stringify({ error: 'You are not the owner of this court.' }) };
    }
    
    if (newOwner.uid === requestingUserId) {
        return { statusCode: 400, body: JSON.stringify({ error: 'You cannot transfer ownership to yourself.' }) };
    }

    await courtRef.update({
        ownerId: newOwner.uid
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Ownership transferred successfully.' }) };

  } catch (error) {
    console.error('Error transferring ownership:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'An internal error occurred.' }) };
  }
};