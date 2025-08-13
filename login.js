document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // Firebase authentication for the user login
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Redirects user to dashboard
        window.location.href = '../dashboard/dashboard.html';
    } catch (error) {
        alert(error.message);
    }
});