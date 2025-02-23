# English Learning Web Application

A web-based application designed to help students learn English through interactive reading comprehension. The application provides features like text-to-speech, word definitions, and interactive word exploration.

## Current Features (v1.0.0)

- Interactive reading passage with 5 paragraphs
- Text-to-speech functionality for the entire passage
- Word definition lookup through dictionary API
- Hover functionality on words:
  - Visual highlighting effect
  - Definition tooltip display
- Word pronunciation audio (from dictionary API)

## Technical Details

### APIs Used
- Text-to-Speech API: `https://otts.api.zwei.de.eu.org/v1/audio/speech`
- Dictionary API: `https://api.dictionaryapi.dev/api/v2/entries/en`

### Components
- HTML: Structure and content
- CSS: Styling and animations
- JavaScript: API integration and interactive features

## Changelog

### Version 1.0.0 (Initial Release)
- Added basic HTML structure with a 5-paragraph reading passage
- Implemented text-to-speech functionality for the entire passage
- Added word lookup feature with dictionary integration
- Implemented hover effect on words with CSS transitions
- Added tooltip functionality for word definitions on hover
- Integrated dictionary API for word definitions and pronunciations
- Added basic styling and layout
- Implemented error handling for API requests

## Planned Features
- Multiple passages for different reading levels
- User progress tracking
- Vocabulary list creation
- Quiz functionality
- Mobile-responsive design improvements
- Loading indicators for API requests
- Offline functionality
- User authentication system

## Setup
1. Clone the repository
2. Copy `config.template.js` to `config.js`
3. Add your API keys to `config.js`
4. Open index.html in a web browser
5. No additional setup required (APIs are called directly from the frontend)

## Notes
- API keys are stored in config.js (not included in git repository)
- Make sure to keep your API keys secure and never commit them to version control
- Consider rate limiting for API calls
- Browser compatibility: Tested on modern browsers (Chrome, Firefox, Safari) 