// Game elements
const promptEl = document.getElementById('prompt');
const inputEl = document.getElementById('input');
const playerCar = document.getElementById('playerCar');
const aiCars = [
    document.getElementById('ferrari'),
    document.getElementById('porsche'),
    document.getElementById('lambo')
];
const wpmStat = document.getElementById('wpmStat');
const accuracyStat = document.getElementById('accuracyStat');
const timeStat = document.getElementById('timeStat');
const progressStat = document.getElementById('progressStat');
const timerDisplay = document.getElementById('timerDisplay');
const positionIndicator = document.getElementById('positionIndicator');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const modalPlayAgainBtn = document.getElementById('modalPlayAgainBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const timeBtns = document.querySelectorAll('.time-btn');
const timeSelector = document.getElementById('timeSelector');
const resultsModal = document.getElementById('resultsModal');
const winnerEl = document.getElementById('winner');
const finalWpm = document.getElementById('finalWpm');
const finalAccuracy = document.getElementById('finalAccuracy');
const finalTime = document.getElementById('finalTime');
const finalRank = document.getElementById('finalRank');
const rankPosition = document.getElementById('rankPosition');

// Game data
const paragraphs = [
    "The quick brown fox jumps over the lazy dog while typing fast improves your coding skills dramatically.",
    "Programming is the process of creating instructions that tell a computer how to perform tasks efficiently.",
    "Racing against supercars makes typing practice more engaging and competitive for everyone involved.",
    "JavaScript is a versatile programming language used for web development to create interactive effects.",
    "Consistent practice is key to mastering typing speed and accuracy for programmers and developers.",
    "Web development involves creating websites using technologies like HTML, CSS, and JavaScript.",
    "Frontend development focuses on user interfaces and experiences that users interact with directly.",
    "Backend development involves server-side programming that powers functionality behind websites.",
    "Full stack developers build complete web applications using both frontend and backend technologies.",
    "Typing speed is measured in words per minute, with a word standardized as five characters."
];

// Game state
let gameMode = 'race'; // 'race' or 'timed'
let gameActive = false;
let gameTime = 60;
let timeLeft = 0;
let timerInterval;
let aiIntervals = [];
let aiSpeeds = [0.22, 0.25, 0.28];
let currentText = "";
let startTime = 0;
let correctChars = 0;
let totalChars = 0;
let playerPosition = 0;
let aiPositions = [0, 0, 0];
let currentParagraphIndex = 0;
let elapsedTime = 0;
let finishedCars = [false, false, false, false]; // [player, ferrari, porsche, lambo]
let finishTimes = [0, 0, 0, 0]; // Finish times for each car

// Initialize game
function initGame() {
    resetGame();
    generateParagraph();
    positionCars();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    modalPlayAgainBtn.addEventListener('click', resetGame);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => selectMode(btn.dataset.mode));
    });
    
    timeBtns.forEach(btn => {
        btn.addEventListener('click', () => setTime(parseInt(btn.dataset.time)));
    });
    
    inputEl.addEventListener('input', handleInput);
}

// Generate a random paragraph
function generateParagraph() {
    currentParagraphIndex = Math.floor(Math.random() * paragraphs.length);
    currentText = paragraphs[currentParagraphIndex];
    renderPrompt();
}

// Load next paragraph
function loadNextParagraph() {
    currentParagraphIndex = (currentParagraphIndex + 1) % paragraphs.length;
    currentText = paragraphs[currentParagraphIndex];
    renderPrompt();
}

// Render the prompt with proper styling
function renderPrompt() {
    promptEl.innerHTML = "";
    currentText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.id = `char${index}`;
        span.textContent = char;
        promptEl.appendChild(span);
    });
}

// Position cars at start line
function positionCars() {
    playerCar.style.left = '0px';
    aiCars.forEach((car, index) => {
        car.style.left = '0px';
        car.style.top = `${30 + index * 80}px`;
    });
    playerPosition = 0;
    aiPositions = [0, 0, 0];
    finishedCars = [false, false, false, false];
    finishTimes = [0, 0, 0, 0];
}

// Start the game
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    inputEl.disabled = false;
    inputEl.value = "";
    inputEl.focus();
    startBtn.textContent = "Racing...";
    startBtn.disabled = true;
    startTime = Date.now();
    correctChars = 0;
    totalChars = 0;
    elapsedTime = 0;
    resultsModal.style.display = 'none';
    
    // Start timer based on mode
    if (gameMode === 'timed') {
        timeLeft = gameTime;
        timerDisplay.textContent = `${timeLeft}s`;
        timerDisplay.style.color = '#ffdd59';
    } else {
        timerDisplay.textContent = "00.00s";
        timerDisplay.style.color = '#70a1ff';
    }
    
    // Start updating timer
    timerInterval = setInterval(updateTimer, 50);
    
    // Start AI cars
    startAICars();
}

// Update the timer
function updateTimer() {
    const currentTime = Date.now();
    elapsedTime = (currentTime - startTime) / 1000;
    
    if (gameMode === 'timed') {
        timeLeft = gameTime - elapsedTime;
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(timerInterval);
            finishGame();
        }
        
        // Update display with countdown
        timerDisplay.textContent = `${timeLeft.toFixed(1)}s`;
        
        // Change color when time is running out
        if (timeLeft < 5) {
            timerDisplay.style.color = '#ff6b81';
        }
    } else {
        // Race mode - count up
        timerDisplay.textContent = `${elapsedTime.toFixed(2)}s`;
    }
    
    timeStat.textContent = gameMode === 'timed' ? 
        `${timeLeft.toFixed(1)}s` : 
        `${elapsedTime.toFixed(2)}s`;
}

// Start AI cars movement
function startAICars() {
    aiIntervals = aiSpeeds.map((speed, index) => {
        return setInterval(() => {
            if (gameActive && !finishedCars[index + 1]) {
                // Add some randomness to AI movement
                const variation = (Math.random() * 0.08) - 0.04;
                aiPositions[index] += speed + variation;
                
                // Check if AI car has finished
                if (aiPositions[index] >= 95) {
                    aiPositions[index] = 95;
                    finishedCars[index + 1] = true;
                    finishTimes[index + 1] = elapsedTime;
                    clearInterval(aiIntervals[index]);
                }
                
                aiCars[index].style.left = `${Math.min(aiPositions[index], 95)}%`;
                
                // Update stats
                updateStats();
            }
        }, 100);
    });
}

// Handle user input
function handleInput() {
    if (!gameActive) startGame();
    
    const typed = inputEl.value;
    totalChars = typed.length;
    
    // Update character styling
    let correctCount = 0;
    for (let i = 0; i < currentText.length; i++) {
        const charEl = document.getElementById(`char${i}`);
        if (i < typed.length) {
            if (typed[i] === currentText[i]) {
                charEl.className = 'char correct';
                correctCount++;
            } else {
                charEl.className = 'char incorrect';
            }
        } else {
            charEl.className = 'char';
        }
        
        // Add active class to current character
        if (i === typed.length) {
            charEl.classList.add('active');
        } else {
            charEl.classList.remove('active');
        }
    }
    
    correctChars = correctCount;
    
    // Check if player has finished
    if (gameMode === 'race' && correctCount === currentText.length && !finishedCars[0]) {
        finishedCars[0] = true;
        finishTimes[0] = elapsedTime;
        playerPosition = 95;
        playerCar.style.left = "95%";
        finishGame();
    }
    
    // Update player position based on accuracy
    const progress = correctCount / currentText.length;
    playerPosition = progress * 95; // 95% to account for car width
    playerCar.style.left = `${playerPosition}%`;
    
    // Update progress
    progressStat.textContent = `${Math.round(progress * 100)}%`;
    
    // Update stats
    updateStats();
    
    // For timed mode, load next paragraph when current one is completed
    if (gameMode === 'timed' && correctCount === currentText.length) {
        inputEl.value = "";
        loadNextParagraph();
    }
}

// Update game stats
function updateStats() {
    // Calculate WPM
    const elapsedMinutes = elapsedTime / 60;
    const words = correctChars / 5;
    const wpm = elapsedMinutes > 0 ? Math.floor(words / elapsedMinutes) : 0;
    wpmStat.textContent = wpm;
    
    // Calculate accuracy
    const accuracy = totalChars > 0 ? Math.floor((correctChars / totalChars) * 100) : 100;
    accuracyStat.textContent = `${accuracy}%`;
    
    // Update position ranking
    const positions = [playerPosition, ...aiPositions];
    const sortedPositions = [...positions].sort((a, b) => b - a);
    const rank = positions.indexOf(playerPosition) + 1;
    positionIndicator.textContent = `${rank}${getOrdinalSuffix(rank)}`;
}

// Get ordinal suffix (st, nd, rd, th)
function getOrdinalSuffix(number) {
    if (number > 3 && number < 21) return 'th';
    switch (number % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Finish the game
function finishGame() {
    gameActive = false;
    inputEl.disabled = true;
    clearInterval(timerInterval);
    aiIntervals.forEach(clearInterval);
    
    startBtn.textContent = "Start Race";
    startBtn.disabled = false;
    
    // Final stats update
    updateStats();
    
    // Show results modal
    showResults();
}

// Show race results
function showResults() {
    const wpm = parseInt(wpmStat.textContent);
    const accuracy = accuracyStat.textContent;
    const time = gameMode === 'timed' ? `${gameTime}s` : `${elapsedTime.toFixed(2)}s`;
    
    // Compute actual rank based on finish times
    const positions = [
        {id: 0, position: playerPosition, time: finishTimes[0], finished: finishedCars[0]},
        {id: 1, position: aiPositions[0], time: finishTimes[1], finished: finishedCars[1]},
        {id: 2, position: aiPositions[1], time: finishTimes[2], finished: finishedCars[2]},
        {id: 3, position: aiPositions[2], time: finishTimes[3], finished: finishedCars[3]}
    ];
    
    // Filter out cars that didn't finish and sort by time
    const finishedPositions = positions.filter(car => car.finished);
    finishedPositions.sort((a, b) => a.time - b.time);
    
    // Find player's rank
    const playerRank = finishedPositions.findIndex(car => car.id === 0) + 1;
    const rankStr = playerRank > 0 ? `${playerRank}${getOrdinalSuffix(playerRank)}` : "DNF";
    
    // Update winner message based on rank
    if (playerRank === 1) {
        winnerEl.innerHTML = `You Won! 🏆 <br>1st Place`;
        winnerEl.style.color = "#FFD700"; // gold
    } else if (playerRank === 2) {
        winnerEl.innerHTML = `You Finished 2nd! 🥈`;
        winnerEl.style.color = "#C0C0C0"; // silver
    } else if (playerRank === 3) {
        winnerEl.innerHTML = `You Finished 3rd! 🥉`;
        winnerEl.style.color = "#CD7F32"; // bronze
    } else {
        winnerEl.innerHTML = `You Finished ${rankStr}!`;
        winnerEl.style.color = "#70a1ff";
    }

    // Update rank display
    rankPosition.textContent = rankStr;
    
    // Add special medal for 1st place
    const medal = document.querySelector('.rank-medal');
    if (playerRank === 1) {
        medal.innerHTML = '<i class="fas fa-trophy"></i>';
        medal.style.color = '#FFD700';
    } else if (playerRank === 2) {
        medal.innerHTML = '<i class="fas fa-medal"></i>';
        medal.style.color = '#C0C0C0';
    } else if (playerRank === 3) {
        medal.innerHTML = '<i class="fas fa-medal"></i>';
        medal.style.color = '#CD7F32';
    } else {
        medal.innerHTML = '<i class="fas fa-flag-checkered"></i>';
        medal.style.color = '#70a1ff';
    }

    finalWpm.textContent = wpm;
    finalAccuracy.textContent = accuracy;
    finalTime.textContent = time;
    finalRank.textContent = rankStr;
    
    // Show modal
    resultsModal.style.display = 'flex';
}

// Reset the game
function resetGame() {
    gameActive = false;
    inputEl.disabled = true;
    inputEl.value = "";
    clearInterval(timerInterval);
    aiIntervals.forEach(clearInterval);
    
    playerPosition = 0;
    aiPositions = [0, 0, 0];
    positionCars();
    
    wpmStat.textContent = "0";
    accuracyStat.textContent = "100%";
    timeStat.textContent = "0.00s";
    progressStat.textContent = "0%";
    timerDisplay.textContent = "00.00s";
    timerDisplay.style.color = "#70a1ff";
    positionIndicator.textContent = "1st";
    
    startBtn.textContent = "Start Race";
    startBtn.disabled = false;
    
    resultsModal.style.display = 'none';
    
    generateParagraph();
}

// Select game mode
function selectMode(mode) {
    gameMode = mode;
    
    // Update active button
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide time selector
    if (mode === 'timed') {
        timeSelector.style.display = 'flex';
    } else {
        timeSelector.style.display = 'none';
    }
    
    resetGame();
}

// Set time for timed mode
function setTime(seconds) {
    gameTime = seconds;
    
    // Update active button
    timeBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    resetGame();
}

// Initialize the game
window.addEventListener('DOMContentLoaded', initGame);