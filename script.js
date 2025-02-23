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