const API_BASE_URL = "https://high-boa-36.deno.dev"; // Replace with your Deno Deploy URL

document.getElementById('play-audio').addEventListener('click', async function() {
    const passageText = document.getElementById('passage').innerText;
    const button = this;
    
    try {
        button.disabled = true;
        button.textContent = 'Loading...';
        
        const response = await fetch(`${API_BASE_URL}/zwei`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "en-US-AvaMultilingualNeural",
                voice: "",
                input: passageText
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            button.disabled = false;
            button.textContent = 'Play Audio';
        };

        audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            button.disabled = false;
            button.textContent = 'Play Audio';
            console.error('Audio playback error');
        };

        await audio.play();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to play audio. Please try again later.');
        button.disabled = false;
        button.textContent = 'Play Audio';
    }
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

function attachWordListeners() {
    document.querySelectorAll('.word').forEach(wordElement => {
        wordElement.addEventListener('mouseenter', async function(event) {
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
        });

        wordElement.addEventListener('mouseleave', function() {
            if (document.querySelector('input[name="dictionary"]:checked').value === 'english') {
                hideTooltip();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    attachWordListeners();
});

document.getElementById('translate').addEventListener('click', async function() {
    const paragraphs = document.querySelectorAll('#passage p');
    const loadingDiv = document.getElementById('loading');
    const translationDiv = document.getElementById('translation');
    
    loadingDiv.style.display = 'block';
    translationDiv.innerHTML = ''; // Clear previous translation
    
    try {
        const passage = Array.from(paragraphs).map(p => p.innerText).join('\n\n');
        const prompt = `將以下這段文字寫成中文，保持段落格式。只輸出該段中文，不要輸出其他東西：${passage}`;
        
        const response = await fetch(`${API_BASE_URL}/gemini`, {
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
        
        const response = await fetch(`${API_BASE_URL}/gemini`, {
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

// Add image analysis related code
const imageModal = document.getElementById('imageModal');
const confirmModal = document.getElementById('confirmModal');
const closeBtn = document.querySelector('.close');
let ocrResult = '';

document.getElementById('analyzeImage').onclick = function() {
    imageModal.style.display = 'block';
}

closeBtn.onclick = function() {
    imageModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == imageModal) {
        imageModal.style.display = 'none';
    }
    if (event.target == confirmModal) {
        confirmModal.style.display = 'none';
    }
}

document.getElementById('analyzeButton').onclick = async function() {
    const fileInput = document.getElementById('imageFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select an image file first');
        return;
    }
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const prompt = mode === 'ocr' 
        ? "请识别图片中的所有文字，并按段落格式整理输出。"
        : "请详细描述这张图片的内容，包括主要对象、场景、动作和氛围等细节。";
    const button = this;
    const resultDiv = document.getElementById('analysisResult');
    
    button.disabled = true;
    button.textContent = 'Analyzing...';
    resultDiv.textContent = 'Processing image...';
    try {
        const dataUrl = await fileToDataUrl(file);
        const response = await fetch(`${API_BASE_URL}/dashscope`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": "qwen-vl-max-latest",
                "input": {
                    "messages": [
                        {
                            "role": "system",
                            "content": [
                                {"text": "You are a helpful assistant."}
                            ]
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "image": dataUrl
                                },
                                {
                                    "text": prompt
                                }
                            ]
                        }
                    ]
                }
            })
        });
        const data = await response.json();
        const result = data.output.choices[0].message.content[0].text;
        if (mode === 'ocr') {
            ocrResult = result;
            confirmModal.style.display = 'block';
            imageModal.style.display = 'none';
        } else {
            resultDiv.textContent = result;
        }
    } catch (error) {
        console.error('Error:', error);
        resultDiv.textContent = 'Error analyzing image: ' + error.message;
    } finally {
        button.disabled = false;
        button.textContent = 'Analyze';
    }
}

document.getElementById('confirmYes').onclick = function() {
    const passageDiv = document.getElementById('passage');
    const paragraphs = ocrResult.split('\n').filter(p => p.trim());
    passageDiv.innerHTML = paragraphs.map(p => 
        `<p>${p.split(' ').map(word => 
            `<span class="word">${word}</span>`
        ).join(' ')}</p>`
    ).join('');
    confirmModal.style.display = 'none';
    attachWordListeners();
}

document.getElementById('confirmNo').onclick = function() {
    confirmModal.style.display = 'none';
    imageModal.style.display = 'block';
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
} 