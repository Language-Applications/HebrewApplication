// Experimental Parameters
const FADE_DURATION = 300;
const AUDIO_PATHS = {
    correct: 'resources/audio/pitchup.aiff',
    mistake: 'resources/audio/pitchdown.aiff'
};

// State Management Protocol
const state = {
    currentCategory: "sentences",
    data: [],
    currentIndex: 0,
    isRevealed: false,
    isEnglishToHebrew: true,
    randomizedIndices: [],
    completedItems: 0,
    remainingIndices: [],
    showingFeedback: false,
    audioContext: null,
    audioBuffers: {}
};

// Audio System Initialization
const initializeAudioSystem = async () => {
    try {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBufferPromises = Object.entries(AUDIO_PATHS).map(async ([key, path]) => {
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await state.audioContext.decodeAudioData(arrayBuffer);
            state.audioBuffers[key] = audioBuffer;
        });
        await Promise.all(audioBufferPromises);
    } catch (error) {
        console.error('Audio initialization error:', error);
    }
};

// Acoustic Feedback Implementation
const playAudioFeedback = (type) => {
    if (!state.audioContext || !state.audioBuffers[type]) return;
    
    const source = state.audioContext.createBufferSource();
    source.buffer = state.audioBuffers[type];
    source.connect(state.audioContext.destination);
    source.start(0);
};

// Randomization Algorithm
const shuffleArray = (array) => {
    const shuffled = [...Array(array.length).keys()];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const initializeRandomization = () => {
    state.randomizedIndices = shuffleArray(state.data);
    state.remainingIndices = [...state.randomizedIndices];
    state.currentIndex = 0;
    state.completedItems = 0;
    updateProgressDisplay();
};

// UI Control Methods
const fadeIn = (element) => {
    element.style.opacity = 0;
    element.style.transition = `opacity ${FADE_DURATION}ms ease`;
    setTimeout(() => element.style.opacity = 1, 50);
};

const fadeOut = (element) => {
    element.style.opacity = 0;
    element.style.transition = `opacity ${FADE_DURATION}ms ease`;
};

const updateProgressDisplay = () => {
    const progressElement = document.getElementById("progress-display");
    progressElement.innerText = `${state.completedItems + 1}/${state.data.length}`;
};

const createFeedbackButtons = () => {
    const footerElement = document.querySelector('footer');
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'feedback-buttons';
    buttonContainer.style.display = 'none';
    buttonContainer.className = 'feedback-container';

    const correctButton = document.createElement('button');
    correctButton.className = 'direction-button feedback-button correct';
    correctButton.innerHTML = '<span class="button-text">Correct</span>';
    correctButton.onclick = handleCorrect;

    const mistakeButton = document.createElement('button');
    mistakeButton.className = 'direction-button feedback-button mistake';
    mistakeButton.innerHTML = '<span class="button-text">Mistake</span>';
    mistakeButton.onclick = handleMistake;

    buttonContainer.appendChild(correctButton);
    buttonContainer.appendChild(mistakeButton);
    footerElement.insertBefore(buttonContainer, document.getElementById('show-continue'));
};

const toggleFeedbackButtons = (show) => {
    const feedbackButtons = document.getElementById('feedback-buttons');
    const showButton = document.getElementById('show-continue');
    
    if (show) {
        feedbackButtons.style.display = 'flex';
        showButton.style.display = 'none';
    } else {
        feedbackButtons.style.display = 'none';
        showButton.style.display = 'block';
    }
    state.showingFeedback = show;
};

// Event Handlers
const handleCorrect = () => {
    playAudioFeedback('correct');
    
    state.completedItems++;
    const previousIndex = state.remainingIndices[state.currentIndex];
    state.remainingIndices = state.remainingIndices.filter((_, index) => index !== state.currentIndex);
    
    if (state.remainingIndices.length === 0) {
        initializeRandomization();
    } else {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * state.remainingIndices.length);
        } while (state.remainingIndices[newIndex] === previousIndex && state.remainingIndices.length > 1);
        state.currentIndex = newIndex;
    }
    
    state.isRevealed = false;
    toggleFeedbackButtons(false);
    updateUI();
};

const handleMistake = () => {
    playAudioFeedback('mistake');
    
    const currentValue = state.remainingIndices[state.currentIndex];
    state.remainingIndices.splice(state.currentIndex, 1);
    const newPosition = Math.floor(Math.random() * (state.remainingIndices.length - 1)) + 1;
    state.remainingIndices.splice(newPosition, 0, currentValue);
    
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * state.remainingIndices.length);
    } while (state.remainingIndices[newIndex] === currentValue && state.remainingIndices.length > 1);
    
    state.currentIndex = newIndex;
    state.isRevealed = false;
    toggleFeedbackButtons(false);
    updateUI();
};

// UI Update Protocol
const updateUI = () => {
    if (state.data.length === 0) return;

    const entry = state.data[state.remainingIndices[state.currentIndex]];
    const englishText = document.getElementById("english-text");
    const hebrewContent = document.getElementById("hebrew-content");

    fadeOut(englishText);
    fadeOut(hebrewContent);

    setTimeout(() => {
        if (state.isEnglishToHebrew) {
            englishText.innerText = entry.english;
            hebrewContent.innerHTML = "";
        } else {
            englishText.innerText = "";
            hebrewContent.innerHTML = formatHebrewContent(entry);
        }

        fadeIn(englishText);
        fadeIn(hebrewContent);
        updateProgressDisplay();
    }, FADE_DURATION);
};

// Initialization Protocol
document.addEventListener("DOMContentLoaded", async () => {
    await initializeAudioSystem();
    
    const categorySelect = document.getElementById("category-select");
    categorySelect.value = "sentences";
    state.currentCategory = "sentences";
    
    const footerElement = document.querySelector('footer');
    const progressDisplay = document.createElement('div');
    progressDisplay.id = 'progress-display';
    progressDisplay.style.textAlign = 'center';
    progressDisplay.style.marginTop = '8px';
    progressDisplay.style.color = '#333';
    footerElement.appendChild(progressDisplay);

    createFeedbackButtons();
    loadData(state.currentCategory);
    initializeEventListeners();
});

// Event Listener Configuration
const initializeEventListeners = () => {
    document.getElementById("category-select").addEventListener("change", function() {
        state.currentCategory = this.value;
        state.isRevealed = false;
        toggleFeedbackButtons(false);
        loadData(state.currentCategory);
    });

    document.getElementById("switch-direction").addEventListener("click", function() {
        state.isEnglishToHebrew = !state.isEnglishToHebrew;
        this.querySelector('.button-text').innerText = 
            state.isEnglishToHebrew ? "English → Hebrew" : "Hebrew → English";
        updateUI();
    });

    document.getElementById("show-continue").addEventListener("click", function() {
        if (!state.isRevealed) {
            if(state.isEnglishToHebrew) {
                showHebrew();
            } else {
                showEnglish();
            }
            state.isRevealed = true;
            toggleFeedbackButtons(true);
        }
    });
};

// Data Management Protocol
const loadData = async (category) => {
    try {
        const response = await fetch(`input_data/${category}.json`);
        state.data = await response.json();
        initializeRandomization();
        updateUI();
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

const showHebrew = () => {
    const hebrewDiv = document.getElementById("hebrew-content");
    const content = formatHebrewContent(state.data[state.remainingIndices[state.currentIndex]]);
    fadeOut(hebrewDiv);
    setTimeout(() => {
        hebrewDiv.innerHTML = content;
        fadeIn(hebrewDiv);
    }, FADE_DURATION);
};

const showEnglish = () => {
    const englishDiv = document.getElementById("english-text");
    const content = state.data[state.remainingIndices[state.currentIndex]].english;
    fadeOut(englishDiv);
    setTimeout(() => {
        englishDiv.innerHTML = content;
        fadeIn(englishDiv);
    }, FADE_DURATION);
};


// Content Formatting Protocol
const formatHebrewContent = (entry) => {
    const templates = {
        sentences: () => `
            <div class="hebrew-text">
                <p class="spoken">${entry.hebrew_spoken}</p>
                <p class="letters">${entry.hebrew_letters}</p>
            </div>`,
        nouns: () => `
            <div class="hebrew-text">
                <div class="form-group">
                    <span class="label">Singular:</span>
                    <span class="spoken">${entry.hebrew_spoken_singular}</span>
                    <span class="letters">(${entry.hebrew_letters_singular})</span>
                </div>
                <div class="form-group">
                    <span class="label">Plural:</span>
                    <span class="spoken">${entry.hebrew_spoken_plural}</span>
                    <span class="letters">(${entry.hebrew_letters_plural})</span>
                </div>
            </div>`,
        verbs: () => `
            <div class="hebrew-text">
                <div class="form-group">
                    <span class="label">General:</span>
                    <span class="spoken">${entry.hebrew_spoken_general}</span>
                    <span class="letters">(${entry.hebrew_letters_general})</span>
                </div>
                <div class="form-group">
                    <span class="label">He:</span>
                    <span class="spoken">${entry.hebrew_spoken_he}</span>
                    <span class="letters">(${entry.hebrew_letters_he})</span>
                </div>
                <div class="form-group">
                    <span class="label">She:</span>
                    <span class="spoken">${entry.hebrew_spoken_she}</span>
                    <span class="letters">(${entry.hebrew_letters_she})</span>
                </div>
            </div>`,
        adjectives: () => `
            <div class="hebrew-text">
                <div class="form-group">
                    <span class="label">Male:</span>
                    <span class="spoken">${entry.hebrew_spoken_male}</span>
                    <span class="letters">(${entry.hebrew_letters_male})</span>
                </div>
                <div class="form-group">
                    <span class="label">Female:</span>
                    <span class="spoken">${entry.hebrew_spoken_female}</span>
                    <span class="letters">(${entry.hebrew_letters_female})</span>
                </div>
            </div>`
    };

    return templates[state.currentCategory]?.() || "";
};