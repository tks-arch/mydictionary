// Function to check if current position is inside quotes or parentheses
function isInsideContainer(text, currentIndex) {
    let quoteCount = 0;
    let parenDepth = 0;
    
    for (let i = 0; i < currentIndex; i++) {
        if (text[i] === '"') {
            quoteCount++;
        } else if (text[i] === '(') {
            parenDepth++;
        } else if (text[i] === ')') {
            parenDepth--;
        }
    }
    
    return (quoteCount % 2 === 1) || (parenDepth > 0);
}

// Function to check if we're inside parentheses
function isInsideParentheses(text, currentIndex) {
    let parenDepth = 0;
    
    for (let i = 0; i < currentIndex; i++) {
        if (text[i] === '(') {
            parenDepth++;
        } else if (text[i] === ')') {
            parenDepth--;
        }
    }
    
    return parenDepth > 0;
}

// Global variable to store vocabulary
let vocabulary = {};

// Constants for word boundary and word character patterns
// Underscore is treated as a boundary character, not part of the word
const BOUNDARY_CHARS = /[\s,;.!?()\[\]{}"\'-_]/;
const WORD_CHARS = /[a-zA-Z0-9]/;

// Helper function to check if position is inside an HTML tag
function isInsideHtmlTag(text, position) {
    // Look backwards for '<' or '>'
    for (let i = position - 1; i >= 0; i--) {
        if (text[i] === '>') {
            return false; // Found closing tag first, we're not inside
        }
        if (text[i] === '<') {
            return true; // Found opening tag first, we're inside
        }
    }
    return false;
}

// Helper function to check if position is at a word boundary
function isAtWordBoundary(text, position) {
    if (position === 0) return true;
    
    const prevChar = text[position - 1];
    const currentChar = text[position];
    
    // Check if previous char is a boundary and current char is a word char
    // Underscore is now treated as a boundary, not part of the word
    return (BOUNDARY_CHARS.test(prevChar) || prevChar === '>') && 
           WORD_CHARS.test(currentChar);
}

// Helper function to try matching a vocabulary word at a specific position
function tryMatchAtPosition(text, startPos, vocabEntry) {
    const wordToMatch = vocabEntry.original;
    
    // Extract potential match from text (underscores are NOT part of the word)
    let endPos = startPos;
    let extractedText = '';
    let wordIndex = 0;
    
    // Try to match the vocabulary word character by character
    while (wordIndex < wordToMatch.length && endPos < text.length) {
        const textChar = text[endPos];
        const wordChar = wordToMatch[wordIndex];
        
        // Match character (case-insensitive)
        if (textChar.toLowerCase() === wordChar.toLowerCase()) {
            extractedText += textChar;
            endPos++;
            wordIndex++;
        } else {
            // No match
            return null;
        }
    }
    
    // Check if we matched the entire word
    if (wordIndex !== wordToMatch.length) {
        return null;
    }
    
    // Check if the match ends at a word boundary
    if (endPos < text.length) {
        const nextChar = text[endPos];
        
        // Next char should be a boundary (including underscore) or HTML tag
        if (WORD_CHARS.test(nextChar)) {
            return null; // Not at word boundary
        }
    }
    
    return {
        start: startPos,
        end: endPos,
        matched: extractedText,
        meaning: vocabEntry.meaning
    };
}

// Read the JSON file and display its content
fetch('data.json')
    .then(response => response.json())
    .then(jsonData => {
        const data = jsonData.text;
        vocabulary = jsonData.vocab || {};
        // Process text to handle quotes, line breaks, and alternating backgrounds
        let sentences = [];
        let currentSentence = '';
        
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            const isInside = isInsideContainer(data, i);
            
            if (char === '"') {
                // Only break line if not inside parentheses
                if (!isInsideParentheses(data, i)) {
                    // Opening quote - save current sentence and start new one
                    if (!isInside) {
                        if (currentSentence.trim()) {
                            sentences.push(currentSentence.trim());
                        }
                        currentSentence = char;
                    } 
                    // Closing quote - add to current sentence and save it
                    else {
                        currentSentence += char;
                        if (currentSentence.trim()) {
                            sentences.push(currentSentence.trim());
                        }
                        currentSentence = '';
                    }
                } else {
                    // Inside parentheses - just add quote to current sentence
                    currentSentence += char;
                }
            } else if (char === '(') {
                // Opening parenthesis - save current sentence and start new one
                if (currentSentence.trim()) {
                    sentences.push(currentSentence.trim());
                }
                currentSentence = char;
            } else if (char === ')') {
                // Closing parenthesis - add to current sentence and save it
                currentSentence += char;
                if (currentSentence.trim()) {
                    sentences.push(currentSentence.trim());
                }
                currentSentence = '';
            } else if ((char === '.' || char === '!' || char === '?') && !isInside) {
                currentSentence += char;
                
                // Check if we should break line (inside quotes or parentheses)
                if (isInside) {
                    // Don't end sentence yet, continue to next character
                    continue;
                }
                
                // End of sentence - save it
                if (currentSentence.trim()) {
                    sentences.push(currentSentence.trim());
                }
                currentSentence = '';
            } else if (char === '\n' || char === '\r') {
                // Skip existing line breaks
                continue;
            } else {
                currentSentence += char;
            }
        }
        
        // Add any remaining text as a sentence
        if (currentSentence.trim()) {
            sentences.push(currentSentence.trim());
        }
        
        // Create HTML with alternating backgrounds
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = '';
        
        // Pre-process vocabulary: create normalized map and sort by length
        const vocabEntries = Object.keys(vocabulary).map(word => ({
            original: word,
            normalized: word.toLowerCase(),
            meaning: vocabulary[word],
            length: word.length
        })).sort((a, b) => b.length - a.length);
        
        sentences.forEach((sentence, index) => {
            const div = document.createElement('div');
            div.className = 'sentence ' + (index % 2 === 0 ? 'bg-light' : 'bg-dark');
            
            // Wrap quotes in blue spans
            let processedSentence = sentence.replace(/"([^"]*)"/g, '<span class="quote">"$1"</span>');
            
            // Track which positions have been marked (to avoid overlapping matches)
            const markedPositions = new Set();
            const matches = [];
            
            // Scan through the sentence once, looking for vocabulary matches
            for (let i = 0; i < processedSentence.length; i++) {
                // Skip if this position is already marked or inside an HTML tag
                if (markedPositions.has(i) || isInsideHtmlTag(processedSentence, i)) {
                    continue;
                }
                
                // Check if we're at a word boundary
                if (!isAtWordBoundary(processedSentence, i)) {
                    continue;
                }
                
                // Try to match vocabulary words at this position (longest first)
                for (const vocabEntry of vocabEntries) {
                    const matchResult = tryMatchAtPosition(processedSentence, i, vocabEntry);
                    
                    if (matchResult) {
                        // Check if any position in this range is already marked
                        let hasOverlap = false;
                        for (let j = matchResult.start; j < matchResult.end; j++) {
                            if (markedPositions.has(j)) {
                                hasOverlap = true;
                                break;
                            }
                        }
                        
                        if (!hasOverlap) {
                            // Mark all positions in this range
                            for (let j = matchResult.start; j < matchResult.end; j++) {
                                markedPositions.add(j);
                            }
                            matches.push(matchResult);
                            break; // Found a match, move to next position
                        }
                    }
                }
            }
            
            // Apply matches in reverse order (to maintain correct positions)
            matches.sort((a, b) => b.start - a.start);
            for (const match of matches) {
                const before = processedSentence.substring(0, match.start);
                const matched = processedSentence.substring(match.start, match.end);
                const after = processedSentence.substring(match.end);
                
                // Check if matched word contains a space (multi-word)
                const isMultiWord = matched.includes(' ');
                const wordClass = isMultiWord ? 'word multi-word' : 'word';
                
                processedSentence = before + 
                    `<span class="${wordClass}" data-meaning="${match.meaning}">${matched}</span>` + 
                    after;
            }
            
            div.innerHTML = processedSentence;
            contentDiv.appendChild(div);
        });

        // Add click event listeners to vocabulary words
        document.querySelectorAll('.word').forEach(wordElement => {
            wordElement.addEventListener('click', function(e) {
                e.preventDefault();
                const meaning = this.getAttribute('data-meaning');
                showTranslation(this, meaning);
            });
        });
    })
    .catch(error => {
        document.getElementById('content').innerHTML = 'Error loading JSON file: ' + error.message;
    });

// Function to show translation in the bottom area
function showTranslation(element, meaning) {
    const translationDiv = document.getElementById('translation');
    const word = element.textContent;
    
    // Create a formatted translation display
    const translationHTML = `
        <div style="margin-bottom: 10px; padding: 10px; background-color: white; border-radius: 4px; border-left: 4px solid #007bff;">
            <strong style="color: #007bff;">${word}</strong><br>
            <span style="color: #333;">${meaning}</span>
        </div>
    `;
    
    // Add to the top of the translation area
    translationDiv.innerHTML = translationHTML + translationDiv.innerHTML;
}

// Clear translation area when clicking elsewhere
document.addEventListener('click', function(e) {
    if (!e.target.classList.contains('word')) {
        // Optional: You can add logic here to clear the translation area if needed
        // For now, we'll keep the translations visible
    }
});

