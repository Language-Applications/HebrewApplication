let currentCategory = "sentences";
let data = [];
let currentIndex = 0;
let isRevealed = false;
let isEnglishToHebrew = true;

// Load initial category
document.addEventListener("DOMContentLoaded", () => {
    loadData(currentCategory);
});

// Handle category selection change
document.getElementById("category-select").addEventListener("change", function() {
    currentCategory = this.value;
    currentIndex = 0;
    isRevealed = false;
    document.getElementById("show-continue").innerText = "Show";
    loadData(currentCategory);
});

// Handle direction switching
document.getElementById("switch-direction").addEventListener("click", function() {
    isEnglishToHebrew = !isEnglishToHebrew;
    this.innerText = isEnglishToHebrew ? "English → Hebrew" : "Hebrew → English";
    updateUI();
});

// Handle "Show / Continue" button
document.getElementById("show-continue").addEventListener("click", function() {
    if (!isRevealed) {
        if(isEnglishToHebrew){
            showHebrew();
        }
        else{
            showEnglish();
        }
        this.innerText = "Continue";
        isRevealed = true;
    } else {
        nextCard();
        this.innerText = "Show";
        isRevealed = false;
    }
});

// Load JSON data
function loadData(category) {
    fetch(`input_data/${category}.json`)
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            updateUI();
        });
}

// // Update UI with current data
// function updateUI() {
//     if (data.length === 0) return;

//     let entry = data[currentIndex];
//     document.getElementById("english-text").innerText = isEnglishToHebrew ? entry.english : getHebrewText(entry);
//     document.getElementById("hebrew-content").innerHTML = "";
// }

function updateUI() {
    if (data.length === 0) return;

    let entry = data[currentIndex];
    console.log("Current Entry:", entry); // Debugging log

    if (isEnglishToHebrew) {
        document.getElementById("english-text").innerText = entry.english;
        document.getElementById("hebrew-content").innerHTML = "";
    } else {
        document.getElementById("english-text").innerText = ""; // Keep English box empty
        document.getElementById("hebrew-content").innerHTML = formatHebrewContent(entry);
    }
}

// Show Hebrew content
function showHebrew() {
    let entry = data[currentIndex];
    let hebrewDiv = document.getElementById("hebrew-content");
    hebrewDiv.innerHTML = formatHebrewContent(entry);
}

// Show Hebrew content
function showEnglish() {
    let entry = data[currentIndex];
    let englishDiv = document.getElementById("english-content");
    englishDiv.innerHTML = entry.english;
}

// Move to the next card
function nextCard() {
    currentIndex = (currentIndex + 1) % data.length;
    updateUI();
}

// Get Hebrew text based on category
function getHebrewText(entry) {
    switch (currentCategory) {
        case "sentences":
            return entry.hebrew_spoken;
        case "nouns":
            return entry.hebrew_spoken_singular;
        case "verbs":
            return entry.hebrew_spoken_general;
        case "adjectives":
            return entry.hebrew_spoken_male;
        default:
            return "";
    }
}

// Format Hebrew content for different categories
function formatHebrewContent(entry) {
    switch (currentCategory) {
        case "sentences":
            return `<p>${entry.hebrew_spoken}</p><p>${entry.hebrew_letters}</p>`;
        case "nouns":
            return `<div><strong>Singular:</strong> ${entry.hebrew_spoken_singular} (${entry.hebrew_letters_singular})</div>
                    <div><strong>Plural:</strong> ${entry.hebrew_spoken_plural} (${entry.hebrew_letters_plural})</div>`;
        case "verbs":
            return `<div><strong>General:</strong> ${entry.hebrew_spoken_general} (${entry.hebrew_letters_general})</div>
                    <div><strong>He:</strong> ${entry.hebrew_spoken_he} (${entry.hebrew_letters_he})</div>
                    <div><strong>She:</strong> ${entry.hebrew_spoken_she} (${entry.hebrew_letters_she})</div>`;
        case "adjectives":
            return `<div><strong>Male:</strong> ${entry.hebrew_spoken_male} (${entry.hebrew_letters_male})</div>
                    <div><strong>Female:</strong> ${entry.hebrew_spoken_female} (${entry.hebrew_letters_female})</div>`;
        default:
            return "";
    }
}