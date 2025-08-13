document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.getElementById('resetForm');
    const resetBtn = document.getElementById('resetBtn');
    const resetFormContainer = document.getElementById('resetFormContainer');
    const resetSuccess = document.getElementById('resetSuccess');

    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        resetBtn.disabled = true;
        resetBtn.textContent = 'Sending...';
        
        try {
            // Send password reset email
            await firebase.auth().sendPasswordResetEmail(email);
            
            // Show success message
            resetFormContainer.classList.add('hidden');
            resetSuccess.classList.remove('hidden');
        } catch (error) {
            alert(error.message);
            resetBtn.disabled = false;
            resetBtn.textContent = 'Send Reset Link';
        }
    });
});