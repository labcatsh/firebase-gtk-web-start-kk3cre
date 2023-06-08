// Import stylesheets
import './style.css';

// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import {
  getAuth,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import {
  getFirestore,
  addDoc, 
  collection,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');
const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

let rsvpListener = null;
let guestbookListener = null;

let db, auth;

async function main() {
  // Add Firebase project configuration object here
  const firebaseConfig = {
    apiKey: 'AIzaSyCBJ49vIuQeP3F068KV5NTT9EjlAcua4sY',
    authDomain: 'fir-web-codelab-47e0e.firebaseapp.com',
    projectId: 'fir-web-codelab-47e0e',
    storageBucket: 'fir-web-codelab-47e0e.appspot.com',
    messagingSenderId: '695728001741',
    appId: '1:695728001741:web:900c4e6a110096d9134f84',
  };

  //initialize firebase
  const app = initializeApp(firebaseConfig);
  auth = getAuth();
  db = getFirestore();

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      },
    },
  };

  // Initialize the FirebaseUI widget using Firebase
  const ui = new firebaseui.auth.AuthUI(auth);

  // Listen to RSVP button clicks
  startRsvpButton.addEventListener('click', () => {
    //replace the code with this code
    if (auth.currentUser) {
      signOut(auth);
    } else {
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  //listen to the current Auth State
  onAuthStateChanged(auth, (user) => {
    if (user) {
      startRsvpButton.textContent = 'Logout';
        // Show guestbook to logged-in users
        guestbookContainer.style.display = 'block';
        subscribeGuestbook();
    } else {
      startRsvpButton.textContent = 'RSVP';
        // Hide guestbook for non-logged-in users
        guestbookContainer.style.display = 'none';
        unsubscribeGuestbook();
    }
  });

  // Listen to the form submission
  form.addEventListener('submit', async e => {
    // Prevent the default form redirect
    e.preventDefault();
    // Write a new message to the database collection "guestbook"
    addDoc(collection(db, 'guestbook'), {
      text: input.value,
      timestamp: Date.now(),
      name: auth.currentUser.displayName,
      userId: auth.currentUser.uid
    });
    // clear message input field
    input.value = '';
    // Return false to avoid redirect
    return false;
  });

}
main();

  //create query for message
  function subscribeGuestbook() {
    const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
    onSnapshot(q, snaps => {
      guestbookListener = guestbook.innerHTML='';
      snaps.forEach(doc => {
        const entry = document.createElement('p');
        entry.textContent = doc.data().name + ': ' + doc.data().text;
        guestbook.appendChild(entry);
      });
    });
  }

  function unsubscribeGuestbook() {
    if (guestbookListener != null) {
      guestbookListener();
      guestbookListener = null;
    }
  }
