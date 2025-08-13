document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordStrengthBar = document.getElementById('passwordStrengthBar');

    // Password strength indicator
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
    });

    // Form submission handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const fullName = document.getElementById('fullName').value.trim();
        const userType = document.getElementById('userType').value;

        // Validate inputs
        if (!email || !password || !fullName) {
            alert('Please fill in all required fields');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
            // Create user with Firebase Authentication
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Save additional user data to Firestore
            await firebase.firestore().collection('users').doc(user.uid).set({
                fullName,
                email,
                userType,
                createdAt: firebase.firestore.Timestamp.now(),
                quizCount: 0,
                noteCount: 0,
                studyStreak: 0
            });

            // Send email verification
            await user.sendEmailVerification();
            
            // Redirect to dashboard
            window.location.href = '../dashboard/dashboard.html';
            
        } catch (error) {
            console.error('Signup error:', error);
            handleSignupError(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    });

    // Password strength calculation
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return Math.min(strength, 4); // Max strength of 4
    }

    // Update password strength visual indicator
    function updatePasswordStrengthIndicator(strength) {
        const colors = ['#e74c3c', '#f39c12', '#3498db', '#27ae60'];
        const width = (strength / 4) * 100;
        
        passwordStrengthBar.style.width = `${width}%`;
        passwordStrengthBar.style.backgroundColor = colors[strength - 1] || '#e74c3c';
    }

    // Handle different signup error cases
    function handleSignupError(error) {
        let message = 'Signup failed. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email is already registered.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters.';
                break;
            case 'auth/operation-not-allowed':
                message = 'Email/password accounts are not enabled.';
                break;
        }
        
        alert(message);
    }
});