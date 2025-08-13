document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication state
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = '../auth/login.html';
        return;
    }

    // DOM Elements
    const progressCards = document.querySelector('.progress-cards');
    const activityList = document.querySelector('.activity-list');
    const logoutBtn = document.getElementById('logout');

    // Load user data
    await loadDashboardData(user.uid);

    // Logout event listener
    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = '../auth/login.html';
        });
    });

    async function loadDashboardData(userId) {
        try {
            // Get user document
            const userDoc = await firebase.firestore().collection('users').doc(userId).get();
            
            // Get recent quizzes (last 5)
            const quizzesSnapshot = await firebase.firestore()
                .collection('users').doc(userId)
                .collection('quizzes')
                .orderBy('completedAt', 'desc')
                .limit(5)
                .get();
            
            // Get recent notes (last 5)
            const notesSnapshot = await firebase.firestore()
                .collection('users').doc(userId)
                .collection('notes')
                .orderBy('updatedAt', 'desc')
                .limit(5)
                .get();

            // Update UI with data
            updateProgressCards(userDoc.data());
            updateActivityList(quizzesSnapshot, notesSnapshot);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    function updateProgressCards(userData) {
        // Clear existing cards
        progressCards.innerHTML = '';

        // Create progress cards based on user data
        const cardsData = [
            {
                title: 'Quizzes Completed',
                value: userData?.quizCount || 0,
                target: (userData?.quizTarget || 10),
                color: '#4a6fa5'
            },
            {
                title: 'Notes Created',
                value: userData?.noteCount || 0,
                target: (userData?.noteTarget || 20),
                color: '#4fc3f7'
            },
            {
                title: 'Study Streak',
                value: userData?.studyStreak || 0,
                target: 7,
                color: '#27ae60'
            }
        ];

        cardsData.forEach(card => {
            const percentage = Math.min(Math.round((card.value / card.target) * 100), 100);
            
            const cardElement = document.createElement('div');
            cardElement.className = 'progress-card';
            cardElement.innerHTML = `
                <h3>${card.title}</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background: ${card.color};"></div>
                </div>
                <div class="progress-stats">
                    <span>${card.value} ${card.title.includes('Streak') ? 'days' : ''}</span>
                    <span>${card.target} ${card.title.includes('Streak') ? 'day goal' : 'target'}</span>
                </div>
            `;
            progressCards.appendChild(cardElement);
        });
    }

    function updateActivityList(quizzesSnapshot, notesSnapshot) {
        // Clear existing activities
        activityList.innerHTML = '';

        // Combine and sort activities by timestamp
        const activities = [];
        
        quizzesSnapshot.forEach(doc => {
            const quiz = doc.data();
            activities.push({
                type: 'quiz',
                title: `Completed quiz: ${quiz.topic || 'Untitled Quiz'}`,
                score: quiz.score ? `${quiz.score}%` : 'No score',
                time: quiz.completedAt?.toDate() || new Date(),
                icon: '📝'
            });
        });

        notesSnapshot.forEach(doc => {
            const note = doc.data();
            activities.push({
                type: 'note',
                title: `Updated note: ${note.title || 'Untitled Note'}`,
                score: '',
                time: note.updatedAt?.toDate() || new Date(),
                icon: '📓'
            });
        });

        // Sort activities by time (newest first)
        activities.sort((a, b) => b.time - a.time);

        // Display activities
        if (activities.length === 0) {
            activityList.innerHTML = '<div class="no-activity">No recent activity found</div>';
            return;
        }

        activities.slice(0, 5).forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-meta">
                        <span class="activity-score">${activity.score}</span>
                        <span class="activity-time">${formatTime(activity.time)}</span>
                    </div>
                </div>
            `;
            activityList.appendChild(activityElement);
        });
    }

    function formatTime(date) {
        if (!date) return '';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});