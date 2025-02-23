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
    });

    wordElement.addEventListener('mouseleave', function() {
        hideTooltip();
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
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
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
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
        
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