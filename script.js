document.getElementById('play-audio').addEventListener('click', function() {
    const passageText = document.getElementById('passage').innerText;
    const apiUrl = "https://otts.api.zwei.de.eu.org/v1/audio/speech";
    const apiKey = CONFIG.ZWEI_API_KEY;

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "en-US-AvaMultilingualNeural",
            voice: "",
            input: passageText
        })
    })
    .then(response => response.blob())
    .then(blob => {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to play audio. Please try again later.');
    });
});

document.getElementById('lookup-word').addEventListener('click', function() {
    const word = prompt("Enter a word to look up:");
    if (!word) return;

    const dictionaryApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    fetch(dictionaryApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.title === "No Definitions Found") {
                alert("No definitions found for the word.");
                return;
            }

            const wordData = data[0];
            const definition = wordData.meanings[0].definitions[0].definition;
            const audioUrl = wordData.phonetics.find(p => p.audio)?.audio;

            alert(`Definition of ${word}: ${definition}`);

            if (audioUrl) {
                const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `https:${audioUrl}`;
                console.log('Audio URL:', fullAudioUrl); // Debugging: Log the audio URL
                const audio = new Audio(fullAudioUrl);
                audio.play().catch(error => {
                    console.error('Audio playback error:', error);
                    alert('Failed to play audio. Please check the console for more details.');
                });
            } else {
                console.log('No audio URL found for this word.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to fetch the word definition. Please try again later.');
        });
});

document.querySelectorAll('.word').forEach(wordElement => {
    wordElement.addEventListener('mouseenter', function(event) {
        if (document.querySelector('input[name="dictionary"]:checked').value === 'english') {
            const word = event.target.innerText.toLowerCase();
            const dictionaryApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

            fetch(dictionaryApiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.title === "No Definitions Found") {
                        showTooltip(event, "No definition found.");
                        return;
                    }

                    const definition = data[0].meanings[0].definitions[0].definition;
                    showTooltip(event, definition);
                })
                .catch(error => {
                    console.error('Error:', error);
                    showTooltip(event, "Error fetching definition.");
                });
        }
    });

    wordElement.addEventListener('mouseleave', function() {
        if (document.querySelector('input[name="dictionary"]:checked').value === 'english') {
            hideTooltip();
        }
    });
});

function showTooltip(event, text) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerText = text;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
}

function hideTooltip() {
    setTimeout(() => {
        const tooltip = document.getElementById('tooltip');
        tooltip.style.display = 'none';
    }, 100);
}

document.getElementById('translate').addEventListener('click', async function() {
    const paragraphs = document.querySelectorAll('#passage p');
    const loadingDiv = document.getElementById('loading');
    const translationDiv = document.getElementById('translation');
    
    loadingDiv.style.display = 'block';
    translationDiv.innerHTML = ''; // Clear previous translation
    
    try {
        const passage = Array.from(paragraphs).map(p => p.innerText).join('\n\n');
        const prompt = `將以下這段文字寫成中文，保持段落格式。只輸出該段中文，不要輸出其他東西：${passage}`;
        
        const url = `https://api-proxy.me/gemini/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts[0]) {
            const translation = result.candidates[0].content.parts[0].text;
            const translatedParagraphs = translation.split('\n').filter(p => p.trim());
            translationDiv.innerHTML = translatedParagraphs.map(para => `<p>${para}</p>`).join('');
        } else {
            throw new Error('Unexpected API response structure');
        }
    } catch (error) {
        console.error('Translation error:', error);
        translationDiv.innerHTML = '<p>Error during translation. Please try again later.</p>';
    } finally {
        loadingDiv.style.display = 'none';
    }
});

let selectedText = '';
let currentParagraph = '';

// Function to handle text selection
function handleTextSelection() {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();
    
    if (selectedText && document.querySelector('input[name="dictionary"]:checked').value === 'chinese') {
        // Find the paragraph containing the selected text
        const paragraphElement = selection.anchorNode.parentElement.closest('p');
        if (paragraphElement) {
            currentParagraph = paragraphElement.textContent;
            showChineseLookupButton(selection);
        }
    }
}

// Function to show a small popup button for Chinese lookup
function showChineseLookupButton(selection) {
    let lookupButton = document.getElementById('chinese-lookup-button');
    if (!lookupButton) {
        lookupButton = document.createElement('button');
        lookupButton.id = 'chinese-lookup-button';
        lookupButton.textContent = 'Look up in Chinese';
        lookupButton.style.position = 'absolute';
        lookupButton.style.zIndex = '1000';
        lookupButton.onclick = function(event) {
            lookupChineseMeaning(event);
        };
        document.body.appendChild(lookupButton);
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    lookupButton.style.left = `${rect.left}px`;
    lookupButton.style.top = `${rect.bottom + window.scrollY + 5}px`;
    lookupButton.style.display = 'block';
}

// Function to lookup Chinese meaning using Gemini AI
async function lookupChineseMeaning(event) {
    if (!selectedText || !currentParagraph) return;

    const prompt = `${currentParagraph}這段文字中${selectedText}的中文意思是甚麼？`;
    const loadingDiv = document.getElementById('loading');
    const tooltip = document.getElementById('tooltip');
    
    try {
        loadingDiv.style.display = 'block';
        tooltip.style.display = 'none';
        
        const url = `https://api-proxy.me/gemini/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]) {
            const meaning = result.candidates[0].content.parts[0].text;
            const button = document.getElementById('chinese-lookup-button');
            const rect = button.getBoundingClientRect();
            showTooltip({
                pageX: rect.left,
                pageY: rect.top + window.scrollY
            }, meaning);
        }
    } catch (error) {
        console.error('Error:', error);
        showTooltip(event, "Error fetching meaning");
    } finally {
        loadingDiv.style.display = 'none';
        document.getElementById('chinese-lookup-button')?.remove();
    }
}

// Add event listener for text selection
document.getElementById('passage').addEventListener('mouseup', handleTextSelection);

// Add event listener to hide Chinese lookup button when clicking elsewhere
document.addEventListener('mousedown', function(event) {
    if (event.target.id !== 'chinese-lookup-button') {
        document.getElementById('chinese-lookup-button')?.remove();
    }
});

// Add this new event listener to hide tooltip when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('#tooltip') && !event.target.closest('#chinese-lookup-button')) {
        hideTooltip();
    }
});

// Add these lines at the end of script.js to make the functions globally accessible
window.handleWordHover = async function(event) {
    if (document.querySelector('input[name="dictionary"]:checked').value === 'english') {
        const word = event.target.innerText.toLowerCase();
        const dictionaryApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        try {
            const response = await fetch(dictionaryApiUrl);
            const data = await response.json();

            if (data.title === "No Definitions Found") {
                showTooltip(event, "No definition found.");
                return;
            }

            const definition = data[0].meanings[0].definitions[0].definition;
            showTooltip(event, definition);
        } catch (error) {
            console.error('Error:', error);
            showTooltip(event, "Error fetching definition.");
        }
    }
};

window.handleWordLeave = function() {
    if (document.querySelector('input[name="dictionary"]:checked').value === 'english') {
        hideTooltip();
    }
}; 