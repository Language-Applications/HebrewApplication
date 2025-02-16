// Animation configuration
const FADE_DURATION = 300;

// Enhanced state management
const state = {
    currentCategory: "sentences",
    data: [],
    currentIndex: 0,
    isRevealed: false,
    isEnglishToHebrew: true
};

// Initialize animations
const fadeIn = (element) => {
    element.style.opacity = 0;
    element.style.transition = `opacity ${FADE_DURATION}ms ease`;
    setTimeout(() => element.style.opacity = 1, 50);
};

const fadeOut = (element) => {
    element.style.opacity = 0;
    element.style.transition = `opacity ${FADE_DURATION}ms ease`;
};

// Enhanced UI updates
const updateUI = () => {
    if (state.data.length === 0) return;

    const entry = state.data[state.currentIndex];
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
    }, FADE_DURATION);
};

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    loadData(state.currentCategory);
    initializeEventListeners();
});

const initializeEventListeners = () => {
    // Category selection
    document.getElementById("category-select").addEventListener("change", function() {
        state.currentCategory = this.value;
        state.currentIndex = 0;
        state.isRevealed = false;
        updateButtonText("Show");
        loadData(state.currentCategory);
    });

    // Direction switching
    document.getElementById("switch-direction").addEventListener("click", function() {
        state.isEnglishToHebrew = !state.isEnglishToHebrew;
        this.querySelector('.button-text').innerText = 
            state.isEnglishToHebrew ? "English → Hebrew" : "Hebrew → English";
        updateUI();
    });

    // Show/Continue button
    document.getElementById("show-continue").addEventListener("click", function() {
        if (!state.isRevealed) {
            if(state.isEnglishToHebrew) {
                showHebrew();
            } else {
                showEnglish();
            }
            updateButtonText("Continue");
            state.isRevealed = true;
        } else {
            nextCard();
            updateButtonText("Show");
            state.isRevealed = false;
        }
    });
};

// Helper functions
const updateButtonText = (text) => {
    const button = document.getElementById("show-continue");
    fadeOut(button);
    setTimeout(() => {
        button.querySelector('.button-text').innerText = text;
        fadeIn(button);
    }, FADE_DURATION);
};

const loadData = async (category) => {
    try {
        const response = await fetch(`input_data/${category}.json`);
        state.data = await response.json();
        updateUI();
    } catch (error) {
        console.error('Error loading data:', error);
    }
};

const showHebrew = () => {
    const hebrewDiv = document.getElementById("hebrew-content");
    const content = formatHebrewContent(state.data[state.currentIndex]);
    fadeOut(hebrewDiv);
    setTimeout(() => {
        hebrewDiv.innerHTML = content;
        fadeIn(hebrewDiv);
    }, FADE_DURATION);
};

const showEnglish = () => {
    const englishDiv = document.getElementById("english-text");
    const content = state.data[state.currentIndex].english;
    fadeOut(englishDiv);
    setTimeout(() => {
        englishDiv.innerHTML = content;
        fadeIn(englishDiv);
    }, FADE_DURATION);
};

const nextCard = () => {
    state.currentIndex = (state.currentIndex + 1) % state.data.length;
    updateUI();
};

// Format Hebrew content based on category
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