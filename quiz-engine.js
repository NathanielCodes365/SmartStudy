class QuizEngine {
    constructor(quizData, containerId, resultsCallback) {
        this.quizData = quizData;
        this.container = document.getElementById(containerId);
        this.resultsCallback = resultsCallback;
        this.currentQuestion = 0;
        this.score = 0;
        this.userAnswers = [];
        this.timer = null;
        this.timeRemaining = 0;
    }

    init() {
        this.startTime = new Date();
        this.renderQuestion();
    }

    renderQuestion() {
        if (this.currentQuestion >= this.quizData.questions.length) {
            this.showResults();
            return;
        }

        const question = this.quizData.questions[this.currentQuestion];
        this.container.innerHTML = '';

        // Create question element
        const questionEl = document.createElement('div');
        questionEl.className = 'quiz-question';
        questionEl.innerHTML = `
            <div class="quiz-progress">
                Question ${this.currentQuestion + 1} of ${this.quizData.questions.length}
            </div>
            <h3>${question.question}</h3>
            <div class="quiz-options" id="quizOptions"></div>
            <div class="quiz-timer" id="quizTimer"></div>
        `;
        this.container.appendChild(questionEl);

        // Create options
        const optionsContainer = document.getElementById('quizOptions');
        question.options.forEach((option, index) => {
            const optionEl = document.createElement('div');
            optionEl.className = 'quiz-option';
            optionEl.innerHTML = option;
            optionEl.dataset.index = index;
            optionEl.addEventListener('click', () => this.selectAnswer(index));
            optionsContainer.appendChild(optionEl);
        });

        // Start timer if time limit exists
        if (question.timeLimit) {
            this.timeRemaining = question.timeLimit;
            this.updateTimerDisplay();
            this.timer = setInterval(() => {
                this.timeRemaining--;
                this.updateTimerDisplay();
                if (this.timeRemaining <= 0) {
                    clearInterval(this.timer);
                    this.selectAnswer(null); // No answer selected
                }
            }, 1000);
        }
    }

    updateTimerDisplay() {
        const timerEl = document.getElementById('quizTimer');
        if (timerEl) {
            timerEl.innerHTML = `Time remaining: ${this.timeRemaining}s`;
            if (this.timeRemaining <= 5) {
                timerEl.style.color = '#e74c3c';
            }
        }
    }

    selectAnswer(selectedIndex) {
        clearInterval(this.timer);
        
        const question = this.quizData.questions[this.currentQuestion];
        const isCorrect = selectedIndex === question.correctAnswer;
        
        // Update score
        if (isCorrect) {
            this.score++;
        }

        // Store user answer
        this.userAnswers.push({
            question: question.question,
            selectedOption: selectedIndex !== null ? question.options[selectedIndex] : 'Time expired',
            correctOption: question.options[question.correctAnswer],
            isCorrect
        });

        // Show feedback
        this.showFeedback(isCorrect, question.correctAnswer);
    }

    showFeedback(isCorrect, correctIndex) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            option.style.cursor = 'default';
            if (index === correctIndex) {
                option.style.backgroundColor = '#27ae60';
                option.style.color = 'white';
            } else if (index !== correctIndex && option.classList.contains('selected')) {
                option.style.backgroundColor = '#e74c3c';
                option.style.color = 'white';
            }
        });

        // Add continue button
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn quiz-continue';
        continueBtn.textContent = 'Continue';
        continueBtn.addEventListener('click', () => {
            this.currentQuestion++;
            this.renderQuestion();
        });
        this.container.appendChild(continueBtn);
    }

    showResults() {
        const endTime = new Date();
        const timeTaken = Math.floor((endTime - this.startTime) / 1000);
        const percentage = Math.round((this.score / this.quizData.questions.length) * 100);

        // Prepare results data
        const results = {
            quizId: this.quizData.quizId,
            topic: this.quizData.topic,
            score: this.score,
            totalQuestions: this.quizData.questions.length,
            percentage,
            timeTaken,
            answers: this.userAnswers,
            completedAt: firebase.firestore.Timestamp.now()
        };

        // Callback with results (to save to database)
        if (this.resultsCallback) {
            this.resultsCallback(results);
        }

        // Redirect to results page
        window.location.href = `quiz-results.html?score=${this.score}&total=${this.quizData.questions.length}&percentage=${percentage}&time=${timeTaken}`;
    }
}

// Utility function to initialize a quiz
function initQuiz(quizId, containerId, resultsCallback) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Fetch quiz from Firestore
    firebase.firestore().collection('users').doc(user.uid)
        .collection('quizzes').doc(quizId)
        .get()
        .then(doc => {
            if (doc.exists) {
                const quizData = doc.data();
                quizData.quizId = quizId;
                const quizEngine = new QuizEngine(quizData, containerId, resultsCallback);
                quizEngine.init();
            } else {
                console.error('Quiz not found');
            }
        })
        .catch(error => {
            console.error('Error loading quiz:', error);
        });
}