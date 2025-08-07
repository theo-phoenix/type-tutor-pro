/**
 * Sharp Typing Tutor - Complete JavaScript Implementation
 * 
 * This typing tutor implements several key typing science principles:
 * 1. Spaced Repetition: Keys with higher error rates appear more frequently
 * 2. Adaptive Difficulty: Text complexity adjusts to maintain 80-90% accuracy
 * 3. Muscle Memory Training: Progressive curriculum builds from home row outward
 * 4. Real-time Feedback: Immediate visual and performance feedback
 * 5. Motivational Psychology: Rewards, badges, and strategic criticism
 */

// ============================================================================
// TYPING METRICS MODULE
// ============================================================================

const TypingMetrics = (function() {
    'use strict';
    
    let startTime = null;
    let endTime = null;
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;
    let errorsByKey = {};
    let reactionTimes = [];
    let lastKeystrokeTime = null;
    let currentWPM = 0;
    let currentAccuracy = 100;
    
    /**
     * Calculate Words Per Minute using the standard formula
     * WPM = (Total Characters Typed / 5) / (Time in Minutes)
     * We use 5 characters as the average word length
     */
    function calculateWPM(characters, timeInSeconds) {
        if (timeInSeconds === 0) return 0;
        const minutes = timeInSeconds / 60;
        const words = characters / 5;
        return Math.round(words / minutes);
    }
    
    /**
     * Calculate accuracy percentage
     * Accuracy = (Correct Keystrokes / Total Keystrokes) * 100
     */
    function calculateAccuracy(correct, total) {
        if (total === 0) return 100;
        return Math.round((correct / total) * 100);
    }
    
    /**
     * Record a keystroke and update metrics
     */
    function recordKeystroke(key, isCorrect, targetChar) {
        const now = Date.now();
        
        if (!startTime) {
            startTime = now;
        }
        
        // Record reaction time (time between keystrokes)
        if (lastKeystrokeTime) {
            reactionTimes.push(now - lastKeystrokeTime);
        }
        lastKeystrokeTime = now;
        
        totalKeystrokes++;
        if (isCorrect) {
            correctKeystrokes++;
        } else {
            // Track errors by key for spaced repetition
            if (!errorsByKey[targetChar]) {
                errorsByKey[targetChar] = 0;
            }
            errorsByKey[targetChar]++;
        }
        
        // Update real-time metrics
        const elapsedSeconds = (now - startTime) / 1000;
        currentWPM = calculateWPM(correctKeystrokes, elapsedSeconds);
        currentAccuracy = calculateAccuracy(correctKeystrokes, totalKeystrokes);
    }
    
    /**
     * Get current metrics
     */
    function getCurrentMetrics() {
        return {
            wpm: currentWPM,
            accuracy: currentAccuracy,
            totalKeystrokes,
            correctKeystrokes,
            errorsByKey: { ...errorsByKey },
            averageReactionTime: reactionTimes.length > 0 ? 
                reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0
        };
    }
    
    /**
     * Finish typing session and get final metrics
     */
    function finishSession() {
        endTime = Date.now();
        const totalTime = endTime - startTime;
        const finalMetrics = {
            ...getCurrentMetrics(),
            totalTimeMs: totalTime,
            totalTimeSeconds: Math.round(totalTime / 1000),
            finalWPM: calculateWPM(correctKeystrokes, totalTime / 1000),
            finalAccuracy: calculateAccuracy(correctKeystrokes, totalKeystrokes)
        };
        return finalMetrics;
    }
    
    /**
     * Reset all metrics for new session
     */
    function reset() {
        startTime = null;
        endTime = null;
        totalKeystrokes = 0;
        correctKeystrokes = 0;
        errorsByKey = {};
        reactionTimes = [];
        lastKeystrokeTime = null;
        currentWPM = 0;
        currentAccuracy = 100;
    }
    
    return {
        recordKeystroke,
        getCurrentMetrics,
        finishSession,
        reset
    };
})();

// ============================================================================
// ADAPTIVE DIFFICULTY ENGINE
// ============================================================================

const AdaptiveEngine = (function() {
    'use strict';
    
    const TARGET_ACCURACY_MIN = 80;
    const TARGET_ACCURACY_MAX = 90;
    
    /**
     * Adjust text difficulty based on current performance
     * This implements adaptive difficulty to maintain optimal challenge level
     */
    function adjustDifficulty(currentAccuracy, currentLevel) {
        let newLevel = currentLevel;
        
        if (currentAccuracy > TARGET_ACCURACY_MAX) {
            // Too easy - increase difficulty
            if (currentLevel === 'beginner') newLevel = 'intermediate';
            else if (currentLevel === 'intermediate') newLevel = 'advanced';
            else if (currentLevel === 'advanced') newLevel = 'master';
        } else if (currentAccuracy < TARGET_ACCURACY_MIN) {
            // Too hard - decrease difficulty
            if (currentLevel === 'master') newLevel = 'advanced';
            else if (currentLevel === 'advanced') newLevel = 'intermediate';
            else if (currentLevel === 'intermediate') newLevel = 'beginner';
        }
        
        return newLevel;
    }
    
    /**
     * Generate spaced repetition text focusing on problematic keys
     * This implements the spaced repetition algorithm for muscle memory training
     */
    function generateSpacedRepetitionText(errorsByKey, length = 100) {
        const problematicKeys = Object.keys(errorsByKey)
            .sort((a, b) => errorsByKey[b] - errorsByKey[a])
            .slice(0, 5); // Focus on top 5 problematic keys
        
        if (problematicKeys.length === 0) {
            return generateRandomText(length);
        }
        
        let text = '';
        const words = [];
        
        // Create words that emphasize problematic keys
        for (let i = 0; i < length / 10; i++) {
            let word = '';
            for (let j = 0; j < Math.random() * 6 + 3; j++) {
                if (Math.random() < 0.7 && problematicKeys.length > 0) {
                    // 70% chance to use a problematic key
                    word += problematicKeys[Math.floor(Math.random() * problematicKeys.length)];
                } else {
                    // 30% chance to use a random letter
                    word += String.fromCharCode(97 + Math.floor(Math.random() * 26));
                }
            }
            words.push(word);
        }
        
        return words.join(' ').substring(0, length);
    }
    
    /**
     * Generate random text for practice
     */
    function generateRandomText(length) {
        const commonWords = [
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
            'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
            'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
            'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'
        ];
        
        let text = '';
        while (text.length < length) {
            const word = commonWords[Math.floor(Math.random() * commonWords.length)];
            text += word + ' ';
        }
        
        return text.trim().substring(0, length);
    }
    
    return {
        adjustDifficulty,
        generateSpacedRepetitionText,
        generateRandomText
    };
})();

// ============================================================================
// CURRICULUM DATA
// ============================================================================

const CurriculumData = {
    beginner: [
        {
            id: 'home-row-1',
            title: 'Home Row Basics',
            description: 'Learn the foundation: ASDF JKL;',
            text: 'asdf jkl; asdf jkl; sad lad ask flask dad fad lass fall sass'
        },
        {
            id: 'home-row-2', 
            title: 'Home Row Words',
            description: 'Simple words using home row keys',
            text: 'ask dad sad lad fall lass flask salad falls asks dads lads'
        },
        {
            id: 'top-row-1',
            title: 'Top Row Introduction', 
            description: 'Add QWER TYUI OP to your skills',
            text: 'qwer tyui op quit port type write query power tower report'
        },
        {
            id: 'top-row-2',
            title: 'Top Row Practice',
            description: 'Combine home and top rows',
            text: 'quest report tower power write query type port quit poetry'
        },
        {
            id: 'bottom-row-1',
            title: 'Bottom Row Basics',
            description: 'Master ZXCV BNM',
            text: 'zxcv bnm zoom cave move barn calm zone vibe next mix'
        }
    ],
    intermediate: [
        {
            id: 'numbers-1',
            title: 'Number Row',
            description: 'Learn to type numbers 1234567890',
            text: '1234567890 phone 555-0123 year 2024 price $19.99 code 4567'
        },
        {
            id: 'punctuation-1',
            title: 'Basic Punctuation',
            description: 'Master common punctuation marks',
            text: 'Hello, world! How are you? I am fine. Let us go; it is time.'
        },
        {
            id: 'capitals-1',
            title: 'Capital Letters',
            description: 'Practice proper capitalization',
            text: 'John Smith lives in New York. He works at Apple Inc. on Monday.'
        },
        {
            id: 'mixed-practice-1',
            title: 'Mixed Practice',
            description: 'Combine letters, numbers, and punctuation',
            text: 'The meeting is at 3:30 PM on March 15th, 2024. Call (555) 123-4567.'
        },
        {
            id: 'common-words',
            title: 'Common Words',
            description: 'Practice frequently used English words',
            text: 'about after again against all almost alone along already also although always among'
        }
    ],
    advanced: [
        {
            id: 'symbols-1',
            title: 'Special Symbols',
            description: 'Master special characters and symbols',
            text: 'Email: user@domain.com Password: P@ssw0rd! Cost: $29.99 (tax included)'
        },
        {
            id: 'programming-1',
            title: 'Programming Syntax',
            description: 'Practice common programming patterns',
            text: 'function calculateTotal(price, tax) { return price * (1 + tax); }'
        },
        {
            id: 'business-text',
            title: 'Business Writing',
            description: 'Professional communication practice',
            text: 'Dear Mr. Johnson, Thank you for your inquiry regarding our services. We would be pleased to schedule a consultation at your convenience.'
        },
        {
            id: 'technical-text',
            title: 'Technical Documentation',
            description: 'Practice technical writing patterns',
            text: 'The API endpoint accepts HTTP POST requests with JSON payload containing user credentials and returns authentication tokens with 24-hour expiration.'
        },
        {
            id: 'speed-drill',
            title: 'Speed Building',
            description: 'Focus on increasing typing speed',
            text: 'the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs'
        }
    ],
    master: [
        {
            id: 'literature-1',
            title: 'Classic Literature',
            description: 'Type excerpts from famous works',
            text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.'
        },
        {
            id: 'scientific-text',
            title: 'Scientific Writing',
            description: 'Practice complex scientific terminology',
            text: 'The mitochondria, often referred to as the powerhouse of the cell, are responsible for producing adenosine triphosphate (ATP) through cellular respiration.'
        },
        {
            id: 'legal-text',
            title: 'Legal Documents',
            description: 'Master formal legal language',
            text: 'Whereas the parties hereto desire to enter into this agreement, and whereas each party has the requisite corporate power and authority to enter into this agreement.'
        },
        {
            id: 'code-complex',
            title: 'Complex Programming',
            description: 'Advanced programming constructs',
            text: 'const asyncFunction = async (data) => { try { const result = await fetch("/api/data", { method: "POST", body: JSON.stringify(data) }); return result.json(); } catch (error) { console.error(error); } };'
        },
        {
            id: 'speed-master',
            title: 'Master Speed Test',
            description: 'Ultimate speed and accuracy challenge',
            text: 'Mastery requires dedication, practice, and persistence. Every keystroke builds muscle memory. Every error teaches precision. Speed without accuracy is meaningless. Accuracy without speed is incomplete. True mastery balances both.'
        }
    ]
};

// ============================================================================
// FEEDBACK SYSTEM
// ============================================================================

const FeedbackSystem = (function() {
    'use strict';
    
    let sessionCount = 0;
    let stagnantSessions = 0;
    let lastWPM = 0;
    let earnedBadges = new Set();
    
    const badges = {
        'first-lesson': { name: '🎯 First Steps', description: 'Completed your first lesson' },
        'wpm-20': { name: '🚀 20 WPM Club', description: 'Achieved 20 WPM' },
        'wpm-40': { name: '⚡ 40 WPM Club', description: 'Achieved 40 WPM' },
        'wpm-60': { name: '🔥 60 WPM Club', description: 'Achieved 60 WPM' },
        'wpm-80': { name: '💨 80 WPM Club', description: 'Achieved 80 WPM' },
        'accuracy-90': { name: '🎯 Sharp Shooter', description: '90% accuracy achieved' },
        'accuracy-95': { name: '🏆 Precision Master', description: '95% accuracy achieved' },
        'perfectionist': { name: '💎 Perfectionist', description: '100% accuracy on a lesson' },
        'persistent': { name: '💪 Persistent', description: 'Completed 10 lessons' },
        'dedicated': { name: '🌟 Dedicated', description: 'Completed 25 lessons' },
        'master': { name: '👑 Typing Master', description: 'Reached Master level' }
    };
    
    /**
     * Nigerian Pidgin + English caustic remarks for motivation
     * These are delivered after 3 stagnant sessions to encourage improvement
     */
    const causticRemarks = [
        "Omo, you dey slow like snail—try small jare!",
        "Accuracy don fall o—no dull yourself abeg!",
        "No be slack, make those keystrokes sharp sharp!",
        "Your fingers dey sleep? Wake them up make we see fire!",
        "This typing speed no good at all—you fit do better!",
        "Wetin happen to your accuracy? Focus small na!",
        "You dey type like say na first time—sharpen up!",
        "Speed don reduce o—where the energy wey you get before?",
        "Make you no give up now—practice makes perfect!",
        "Your typing game weak—time to level up seriously!"
    ];
    
    const encouragingRemarks = [
        "Sharp! Well done—you're improving steadily!",
        "Excellent progress! Your fingers are getting sharper!",
        "Outstanding accuracy! Keep up the fantastic work!",
        "Impressive speed improvement! You're on fire!",
        "Perfect! Your muscle memory is developing beautifully!",
        "Brilliant typing! You're becoming a true master!",
        "Superb performance! Your dedication is paying off!",
        "Magnificent! Your typing skills are truly sharp!",
        "Exceptional work! You're reaching new heights!",
        "Phenomenal! You've mastered this level completely!"
    ];
    
    /**
     * Check for new badges based on performance
     */
    function checkForBadges(metrics, level) {
        const newBadges = [];
        
        // Session-based badges
        if (sessionCount === 1 && !earnedBadges.has('first-lesson')) {
            newBadges.push('first-lesson');
            earnedBadges.add('first-lesson');
        }
        
        if (sessionCount === 10 && !earnedBadges.has('persistent')) {
            newBadges.push('persistent');
            earnedBadges.add('persistent');
        }
        
        if (sessionCount === 25 && !earnedBadges.has('dedicated')) {
            newBadges.push('dedicated');
            earnedBadges.add('dedicated');
        }
        
        // WPM badges
        const wpmBadges = [
            { threshold: 20, id: 'wpm-20' },
            { threshold: 40, id: 'wpm-40' },
            { threshold: 60, id: 'wpm-60' },
            { threshold: 80, id: 'wpm-80' }
        ];
        
        wpmBadges.forEach(badge => {
            if (metrics.wpm >= badge.threshold && !earnedBadges.has(badge.id)) {
                newBadges.push(badge.id);
                earnedBadges.add(badge.id);
            }
        });
        
        // Accuracy badges
        if (metrics.accuracy >= 90 && !earnedBadges.has('accuracy-90')) {
            newBadges.push('accuracy-90');
            earnedBadges.add('accuracy-90');
        }
        
        if (metrics.accuracy >= 95 && !earnedBadges.has('accuracy-95')) {
            newBadges.push('accuracy-95');
            earnedBadges.add('accuracy-95');
        }
        
        if (metrics.accuracy === 100 && !earnedBadges.has('perfectionist')) {
            newBadges.push('perfectionist');
            earnedBadges.add('perfectionist');
        }
        
        // Level badges
        if (level === 'master' && !earnedBadges.has('master')) {
            newBadges.push('master');
            earnedBadges.add('master');
        }
        
        return newBadges;
    }
    
    /**
     * Generate performance feedback message
     */
    function generateFeedbackMessage(metrics, improvement) {
        sessionCount++;
        
        // Check for stagnation (no improvement in WPM)
        if (Math.abs(metrics.wpm - lastWPM) < 2) {
            stagnantSessions++;
        } else {
            stagnantSessions = 0;
        }
        lastWPM = metrics.wpm;
        
        // Deliver caustic remark after 3 stagnant sessions
        if (stagnantSessions >= 3) {
            stagnantSessions = 0; // Reset counter
            return causticRemarks[Math.floor(Math.random() * causticRemarks.length)];
        }
        
        // Positive feedback for good performance
        if (metrics.accuracy >= 90 || improvement > 5) {
            return encouragingRemarks[Math.floor(Math.random() * encouragingRemarks.length)];
        }
        
        // Standard feedback
        if (metrics.accuracy >= 85) {
            return "Good work! Keep practicing to improve your speed.";
        } else if (metrics.accuracy >= 70) {
            return "Focus on accuracy first, then speed will follow naturally.";
        } else {
            return "Take your time and focus on hitting the right keys.";
        }
    }
    
    /**
     * Create confetti animation
     */
    function showConfetti() {
        const container = document.getElementById('confetti-container');
        container.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
        }
        
        // Clean up after animation
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
    
    /**
     * Show badge notification
     */
    function showBadgeNotification(badgeId) {
        const badge = badges[badgeId];
        if (!badge) return;
        
        const notification = document.getElementById('badge-notification');
        const text = document.getElementById('badge-text');
        
        text.textContent = badge.name;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    return {
        checkForBadges,
        generateFeedbackMessage,
        showConfetti,
        showBadgeNotification,
        getBadges: () => badges,
        getEarnedBadges: () => Array.from(earnedBadges)
    };
})();

// ============================================================================
// MAIN APPLICATION
// ============================================================================

const TypingTutor = (function() {
    'use strict';
    
    let currentLevel = 'beginner';
    let currentLessonIndex = 0;
    let currentText = '';
    let currentPosition = 0;
    let isTyping = false;
    let typingTimer = null;
    
    // DOM Elements
    const elements = {
        levelButtons: document.querySelectorAll('.level-btn'),
        lessonList: document.getElementById('lesson-list'),
        textContent: document.getElementById('text-content'),
        typingInput: document.getElementById('typing-input'),
        startBtn: document.getElementById('start-btn'),
        resetBtn: document.getElementById('reset-btn'),
        nextBtn: document.getElementById('next-btn'),
        resultsPanel: document.getElementById('results-panel'),
        
        // Metrics displays
        wpmDisplay: document.getElementById('wpm-display'),
        accuracyDisplay: document.getElementById('accuracy-display'),
        timeDisplay: document.getElementById('time-display'),
        errorsDisplay: document.getElementById('errors-display'),
        currentWpm: document.getElementById('current-wpm'),
        currentAccuracy: document.getElementById('current-accuracy'),
        currentLevel: document.getElementById('current-level'),
        
        // Results
        finalWpm: document.getElementById('final-wpm'),
        finalAccuracy: document.getElementById('final-accuracy'),
        finalTime: document.getElementById('final-time'),
        finalErrors: document.getElementById('final-errors'),
        performanceMessage: document.getElementById('performance-message'),
        
        // Progress
        badgesContainer: document.getElementById('badges-container'),
        weakKeysList: document.getElementById('weak-keys-list')
    };
    
    /**
     * Initialize the application
     */
    function init() {
        setupEventListeners();
        loadLevel(currentLevel);
        updateUI();
        loadProgress();
    }
    
    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Level selection
        elements.levelButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = e.target.dataset.level;
                selectLevel(level);
            });
        });
        
        // Control buttons
        elements.startBtn.addEventListener('click', startLesson);
        elements.resetBtn.addEventListener('click', resetLesson);
        elements.nextBtn.addEventListener('click', nextLesson);
        
        // Typing input
        elements.typingInput.addEventListener('input', handleTyping);
        elements.typingInput.addEventListener('keydown', handleKeyDown);
        
        // Prevent context menu on typing area
        elements.typingInput.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Select a difficulty level
     */
    function selectLevel(level) {
        currentLevel = level;
        currentLessonIndex = 0;
        
        // Update UI
        elements.levelButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        
        elements.currentLevel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        
        loadLevel(level);
        resetLesson();
    }
    
    /**
     * Load lessons for the current level
     */
    function loadLevel(level) {
        const lessons = CurriculumData[level] || [];
        elements.lessonList.innerHTML = '';
        
        lessons.forEach((lesson, index) => {
            const lessonElement = document.createElement('div');
            lessonElement.className = 'lesson-item';
            lessonElement.innerHTML = `
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-description">${lesson.description}</div>
            `;
            
            lessonElement.addEventListener('click', () => {
                selectLesson(index);
            });
            
            elements.lessonList.appendChild(lessonElement);
        });
        
        selectLesson(0);
    }
    
    /**
     * Select a specific lesson
     */
    function selectLesson(index) {
        currentLessonIndex = index;
        const lessons = CurriculumData[currentLevel] || [];
        const lesson = lessons[index];
        
        if (!lesson) return;
        
        currentText = lesson.text;
        currentPosition = 0;
        
        // Update lesson selection UI
        document.querySelectorAll('.lesson-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        
        displayText();
        resetLesson();
    }
    
    /**
     * Display the current text with highlighting
     */
    function displayText() {
        if (!currentText) return;
        
        let html = '';
        for (let i = 0; i < currentText.length; i++) {
            const char = currentText[i];
            let className = '';
            
            if (i < currentPosition) {
                className = 'correct';
            } else if (i === currentPosition) {
                className = 'current';
            }
            
            html += `<span class="char ${className}">${char === ' ' ? '&nbsp;' : char}</span>`;
        }
        
        elements.textContent.innerHTML = html;
    }
    
    /**
     * Start a typing lesson
     */
    function startLesson() {
        if (!currentText) return;
        
        isTyping = true;
        currentPosition = 0;
        
        elements.typingInput.disabled = false;
        elements.typingInput.value = '';
        elements.typingInput.focus();
        elements.startBtn.style.display = 'none';
        elements.resetBtn.style.display = 'inline-block';
        elements.resultsPanel.style.display = 'none';
        elements.nextBtn.style.display = 'none';
        
        TypingMetrics.reset();
        displayText();
        startTimer();
    }
    
    /**
     * Reset the current lesson
     */
    function resetLesson() {
        isTyping = false;
        currentPosition = 0;
        
        elements.typingInput.disabled = true;
        elements.typingInput.value = '';
        elements.startBtn.style.display = 'inline-block';
        elements.resetBtn.style.display = 'none';
        elements.resultsPanel.style.display = 'none';
        elements.nextBtn.style.display = 'none';
        
        TypingMetrics.reset();
        displayText();
        updateMetricsDisplay();
        stopTimer();
    }
    
    /**
     * Move to the next lesson
     */
    function nextLesson() {
        const lessons = CurriculumData[currentLevel] || [];
        if (currentLessonIndex < lessons.length - 1) {
            selectLesson(currentLessonIndex + 1);
        } else {
            // Try to advance to next level
            const levels = ['beginner', 'intermediate', 'advanced', 'master'];
            const currentLevelIndex = levels.indexOf(currentLevel);
            if (currentLevelIndex < levels.length - 1) {
                selectLevel(levels[currentLevelIndex + 1]);
            }
        }
    }
    
    /**
     * Handle typing input
     */
    function handleTyping(e) {
        if (!isTyping) return;
        
        const inputValue = e.target.value;
        const inputLength = inputValue.length;
        
        // Handle backspace (input is shorter than position)
        if (inputLength < currentPosition) {
            currentPosition = inputLength;
            displayText();
            return;
        }
        
        // Process new characters
        for (let i = currentPosition; i < inputLength && i < currentText.length; i++) {
            const typedChar = inputValue[i];
            const targetChar = currentText[i];
            const isCorrect = typedChar === targetChar;
            
            TypingMetrics.recordKeystroke(typedChar, isCorrect, targetChar);
            
            // Update character display
            const charElement = elements.textContent.children[i];
            if (charElement) {
                charElement.className = `char ${isCorrect ? 'correct' : 'incorrect'}`;
            }
            
            currentPosition = i + 1;
        }
        
        // Update current position highlighting
        displayText();
        updateMetricsDisplay();
        
        // Check if lesson is complete
        if (currentPosition >= currentText.length) {
            finishLesson();
        }
    }
    
    /**
     * Handle special key presses
     */
    function handleKeyDown(e) {
        if (!isTyping) return;
        
        // Prevent certain keys that might interfere
        if (e.key === 'Tab') {
            e.preventDefault();
        }
    }
    
    /**
     * Finish the current lesson
     */
    function finishLesson() {
        isTyping = false;
        elements.typingInput.disabled = true;
        
        const finalMetrics = TypingMetrics.finishSession();
        
        // Check for adaptive difficulty adjustment
        const newLevel = AdaptiveEngine.adjustDifficulty(finalMetrics.finalAccuracy, currentLevel);
        if (newLevel !== currentLevel) {
            // Level adjustment logic could be implemented here
        }
        
        // Check for badges
        const newBadges = FeedbackSystem.checkForBadges(finalMetrics, currentLevel);
        
        // Show results
        displayResults(finalMetrics);
        
        // Show feedback
        const improvement = finalMetrics.finalWPM - (localStorage.getItem('lastWPM') || 0);
        const feedbackMessage = FeedbackSystem.generateFeedbackMessage(finalMetrics, improvement);
        elements.performanceMessage.textContent = feedbackMessage;
        
        // Show confetti for good performance
        if (finalMetrics.finalAccuracy >= 90 || finalMetrics.finalWPM >= 40) {
            FeedbackSystem.showConfetti();
        }
        
        // Show badge notifications
        newBadges.forEach(badgeId => {
            setTimeout(() => {
                FeedbackSystem.showBadgeNotification(badgeId);
            }, 1000);
        });
        
        // Save progress
        saveProgress(finalMetrics);
        updateProgressDisplay();
        
        // Show next lesson button
        elements.nextBtn.style.display = 'inline-block';
        elements.resetBtn.style.display = 'none';
        
        stopTimer();
    }
    
    /**
     * Display lesson results
     */
    function displayResults(metrics) {
        elements.finalWpm.textContent = metrics.finalWPM;
        elements.finalAccuracy.textContent = metrics.finalAccuracy + '%';
        elements.finalTime.textContent = formatTime(metrics.totalTimeSeconds);
        elements.finalErrors.textContent = metrics.totalKeystrokes - metrics.correctKeystrokes;
        
        elements.resultsPanel.style.display = 'block';
    }
    
    /**
     * Update real-time metrics display
     */
    function updateMetricsDisplay() {
        const metrics = TypingMetrics.getCurrentMetrics();
        
        elements.wpmDisplay.textContent = metrics.wpm;
        elements.accuracyDisplay.textContent = metrics.accuracy + '%';
        elements.errorsDisplay.textContent = metrics.totalKeystrokes - metrics.correctKeystrokes;
        
        // Update header stats
        elements.currentWpm.textContent = metrics.wpm;
        elements.currentAccuracy.textContent = metrics.accuracy;
    }
    
    /**
     * Start the typing timer
     */
    function startTimer() {
        let seconds = 0;
        typingTimer = setInterval(() => {
            seconds++;
            elements.timeDisplay.textContent = formatTime(seconds);
        }, 1000);
    }
    
    /**
     * Stop the typing timer
     */
    function stopTimer() {
        if (typingTimer) {
            clearInterval(typingTimer);
            typingTimer = null;
        }
    }
    
    /**
     * Format time in MM:SS format
     */
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Save progress to localStorage
     */
    function saveProgress(metrics) {
        const progress = JSON.parse(localStorage.getItem('typingProgress') || '{}');
        
        progress.lastWPM = metrics.finalWPM;
        progress.lastAccuracy = metrics.finalAccuracy;
        progress.totalSessions = (progress.totalSessions || 0) + 1;
        progress.bestWPM = Math.max(progress.bestWPM || 0, metrics.finalWPM);
        progress.bestAccuracy = Math.max(progress.bestAccuracy || 0, metrics.finalAccuracy);
        progress.currentLevel = currentLevel;
        progress.currentLessonIndex = currentLessonIndex;
        progress.earnedBadges = FeedbackSystem.getEarnedBadges();
        
        // Merge error data for spaced repetition
        const errorsByKey = metrics.errorsByKey;
        if (!progress.errorsByKey) progress.errorsByKey = {};
        
        Object.keys(errorsByKey).forEach(key => {
            progress.errorsByKey[key] = (progress.errorsByKey[key] || 0) + errorsByKey[key];
        });
        
        localStorage.setItem('typingProgress', JSON.stringify(progress));
    }
    
    /**
     * Load progress from localStorage
     */
    function loadProgress() {
        const progress = JSON.parse(localStorage.getItem('typingProgress') || '{}');
        
        if (progress.currentLevel) {
            selectLevel(progress.currentLevel);
        }
        
        if (progress.currentLessonIndex) {
            selectLesson(progress.currentLessonIndex);
        }
        
        if (progress.earnedBadges) {
            progress.earnedBadges.forEach(badgeId => {
                FeedbackSystem.getEarnedBadges().push(badgeId);
            });
        }
        
        updateProgressDisplay();
    }
    
    /**
     * Update progress display
     */
    function updateProgressDisplay() {
        const progress = JSON.parse(localStorage.getItem('typingProgress') || '{}');
        
        // Update badges display
        const earnedBadges = FeedbackSystem.getEarnedBadges();
        const badges = FeedbackSystem.getBadges();
        
        elements.badgesContainer.innerHTML = '';
        earnedBadges.forEach(badgeId => {
            const badge = badges[badgeId];
            if (badge) {
                const badgeElement = document.createElement('div');
                badgeElement.className = 'badge';
                badgeElement.innerHTML = `${badge.name}`;
                badgeElement.title = badge.description;
                elements.badgesContainer.appendChild(badgeElement);
            }
        });
        
        // Update weak keys display
        const errorsByKey = progress.errorsByKey || {};
        const weakKeys = Object.keys(errorsByKey)
            .sort((a, b) => errorsByKey[b] - errorsByKey[a])
            .slice(0, 5);
        
        elements.weakKeysList.innerHTML = '';
        weakKeys.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.className = 'weak-key';
            keyElement.textContent = key;
            keyElement.title = `${errorsByKey[key]} errors`;
            elements.weakKeysList.appendChild(keyElement);
        });
    }
    
    /**
     * Update UI elements
     */
    function updateUI() {
        updateMetricsDisplay();
        updateProgressDisplay();
    }
    
    return {
        init
    };
})();

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    TypingTutor.init();
});

// Add some additional utility functions for enhanced user experience
document.addEventListener('keydown', function(e) {
    // Prevent accidental page refresh during typing
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        const typingInput = document.getElementById('typing-input');
        if (document.activeElement === typingInput && !typingInput.disabled) {
            e.preventDefault();
            alert('Lesson in progress! Use the Reset button if you want to restart.');
        }
    }
});

// Prevent accidental navigation away during typing
window.addEventListener('beforeunload', function(e) {
    const typingInput = document.getElementById('typing-input');
    if (document.activeElement === typingInput && !typingInput.disabled) {
        e.preventDefault();
        e.returnValue = 'You have a typing lesson in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
});

console.log('Sharp Typing Tutor loaded successfully! 🚀');

