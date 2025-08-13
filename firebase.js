// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Firebase auth state observer
auth.onAuthStateChanged(user => {
    if (!user && !window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/login.html';
    }
});

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
    const logoutElements = document.querySelectorAll('#logout');
    logoutElements.forEach(element => {
        element.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = '/auth/login.html';
            });
        });
    });
});