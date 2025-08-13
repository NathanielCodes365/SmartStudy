document.addEventListener('DOMContentLoaded', () => {
    console.log('Quizzes page loaded'); // Debug 1
    
    loadQuizCategories();
    
    document.getElementById('quizGeneratorForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted'); // Debug 2
        
        const topic = document.getElementById('quizTopic').value.trim();
        const difficulty = document.getElementById('quizDifficulty').value;
        const questionCount = parseInt(document.getElementById('questionCount').value);
        
        console.log('Form values:', {topic, difficulty, questionCount}); // Debug 3

        if (!topic) {
            console.warn('Validation failed: empty topic'); // Debug 4
            alert('Please enter a quiz topic');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating...';
        
        try {
            console.log('Starting quiz generation...'); // Debug 5
            const quiz = await generateQuizWithAI(topic, difficulty, questionCount);
            console.log('Quiz generated:', quiz); // Debug 6
            
            const user = firebase.auth().currentUser;
            if (!user) throw new Error('User not authenticated');
            
            console.log('Saving quiz to Firestore...'); // Debug 7
            const quizRef = await firebase.firestore().collection('users').doc(user.uid)
                .collection('quizzes').add({
                    topic,
                    difficulty,
                    questions: quiz.questions,
                    createdAt: firebase.firestore.Timestamp.now(),
                    completed: false
                });
            
            console.log('Quiz saved, redirecting...', quizRef.id); // Debug 8
            window.location.href = `quiz.html?quizId=${quizRef.id}`;
            
        } catch (error) {
            console.error('Quiz generation failed:', error); // Debug 9
            alert(`Failed to generate quiz: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Quiz';
        }
    });
});

async function generateQuizWithAI(topic, difficulty, questionCount) {
    console.log('Generating quiz with:', {topic, difficulty, questionCount}); // Debug 10
    
    // Mock data generator - replace with real API call when ready
    return {
        questions: Array.from({ length: questionCount }, (_, i) => ({
            question: `Sample question ${i+1} about ${topic} (${difficulty})`,
            options: [
                'Correct answer',
                'Incorrect option 1',
                'Incorrect option 2',
                'Incorrect option 3'
            ],
            correctAnswer: 0,
            timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15
        }))
    };
}