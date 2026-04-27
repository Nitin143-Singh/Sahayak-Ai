/* =============================================
   SAHAYAK AI — FIREBASE CONFIG
   Uses CDN scripts, no ES modules needed
   ============================================= */

// Firebase CDN scripts are loaded synchronously before this file in index.html,
// so firebase is already available — NO need for window 'load' wrapper.

const firebaseConfig = {
  apiKey:            "AIzaSyDyGfBY7xP46GZs6Fjz_GXhc89AaCaTvsM",
  authDomain:        "sahayak-ai-5b078.firebaseapp.com",
  projectId:         "sahayak-ai-5b078",
  storageBucket:     "sahayak-ai-5b078.firebasestorage.app",
  messagingSenderId: "281321197692",
  appId:             "1:281321197692:web:41c5a74097e66dda8e39f9",
  measurementId:     "G-8PRB12SSJ1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

// ──────── AUTH ────────

window.firebaseRegister = async function(first, last, email, password, role) {
  const cred = await auth.createUserWithEmailAndPassword(email, password);
  await cred.user.updateProfile({ displayName: first + ' ' + last });
  await db.collection('users').doc(cred.user.uid).set({
    uid:       cred.user.uid,
    name:      first + ' ' + last,
    email:     email,
    role:      role,
    avatar:    first[0].toUpperCase(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return cred.user;
};

window.firebaseLogin = async function(email, password) {
  const cred = await auth.signInWithEmailAndPassword(email, password);
  const snap = await db.collection('users').doc(cred.user.uid).get();
  if (!snap.exists) throw new Error('User profile not found.');
  return snap.data();
};

window.firebaseLogout = async function() {
  await auth.signOut();
};

window.firebaseAuthListener = function(callback) {
  auth.onAuthStateChanged(async function(firebaseUser) {
    if (firebaseUser) {
      const snap = await db.collection('users').doc(firebaseUser.uid).get();
      callback(snap.exists ? snap.data() : null);
    } else {
      callback(null);
    }
  });
};

// ──────── HELP REQUESTS ────────

window.firebaseSubmitRequest = async function(type, desc, city, address, urgency, people) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated.');
  const ref = await db.collection('helpRequests').add({
    userId:   user.uid,
    userName: user.displayName || 'Anonymous',
    type, desc,
    location: city + (address ? ', ' + address : ''),
    urgency:  urgency || 'medium',
    people:   parseInt(people) || 1,
    status:   'pending',
    date:     firebase.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
};

window.firebaseGetMyRequests = async function() {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await db.collection('helpRequests').where('userId', '==', user.uid).orderBy('date', 'desc').get();
  return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
};

window.firebaseGetAllRequests = async function() {
  const snap = await db.collection('helpRequests').orderBy('date', 'desc').limit(50).get();
  return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
};

window.firebaseListenRequests = function(callback) {
  return db.collection('helpRequests').where('status', '!=', 'resolved').onSnapshot(function(snap) {
    callback(snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); }));
  });
};

// ──────── DONATIONS ────────

window.firebaseSaveDonation = async function(amount, category, paymentMethod) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated.');
  const txnId = 'SAH-' + Date.now().toString().slice(-8);
  await db.collection('donations').add({
    userId:        user.uid,
    userName:      user.displayName || 'Anonymous',
    amount:        parseFloat(amount),
    category,
    paymentMethod: paymentMethod || 'unknown',
    txnId,
    status:        'completed',
    date:          firebase.firestore.FieldValue.serverTimestamp(),
  });
  return txnId;
};

window.firebaseGetMyDonations = async function() {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await db.collection('donations').where('userId', '==', user.uid).orderBy('date', 'desc').get();
  return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
};

// ──────── CONTACT ────────

window.firebaseSendContactMessage = async function(name, email, message) {
  await db.collection('contactMessages').add({
    name, email, message,
    sentAt: firebase.firestore.FieldValue.serverTimestamp(),
    read:   false,
  });
};

console.log('Firebase ready!');