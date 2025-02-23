# English Learning Web Application

A web-based application designed to help students learn English through interactive reading comprehension. The application provides features like text-to-speech, word definitions in both English and Chinese, and interactive word exploration with Chinese translation.

## Current Features (v1.2.0)

- Interactive reading passage with 5 paragraphs
- Text-to-speech functionality for the entire passage
- Dual dictionary mode:
  - English dictionary (hover to see definition)
  - Chinese dictionary (select text to look up)
- Hover functionality on words:
  - Visual highlighting effect
  - Definition tooltip display
- Word pronunciation audio (from dictionary API)
- Side-by-side Chinese translation using Google Gemini AI
- Table layout for aligned bilingual display

## Technical Details

### APIs Used
- Text-to-Speech API: `https://otts.api.zwei.de.eu.org/v1/audio/speech`
- Dictionary API: `https://api.dictionaryapi.dev/api/v2/entries/en`
- Google Gemini AI API: `https://generativelanguage.googleapis.com/v1beta`

### Components
- HTML: Structure and content with table-based layout
- CSS: Styling, animations, and responsive design
- JavaScript: API integration and interactive features

## Changelog

### Version 1.2.0 (Latest)
- Added dual dictionary mode (English/Chinese)
- Implemented text selection for Chinese word lookup
- Added context-aware Chinese definitions using Gemini AI
- Improved tooltip system for both dictionary modes
- Enhanced UI for dictionary selection
- Fixed tooltip positioning and display issues

### Version 1.1.0
- Added Chinese translation feature using Google Gemini AI
- Implemented table layout for parallel text display
- Enhanced styling for better readability
- Added loading indicator for translation
- Improved paragraph spacing and alignment
- Updated API key management with config file

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
3. Add your API keys to `config.js`:
   - GEMINI_API_KEY for Google Gemini AI
   - ZWEI_API_KEY for text-to-speech
4. Open index.html in a web browser

## Notes
- API keys are stored in config.js (not included in git repository)
- Make sure to keep your API keys secure and never commit them to version control
- Consider rate limiting for API calls
- Browser compatibility: Tested on modern browsers (Chrome, Firefox, Safari)

## Security
- API keys are stored in a separate config file
- config.js is included in .gitignore
- Template configuration file provided for reference 