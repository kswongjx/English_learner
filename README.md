# English Learning Web Application

A web-based application designed to help students learn English through interactive reading comprehension. The application provides features like text-to-speech, word definitions in both English and Chinese, and interactive word exploration with Chinese translation.

## Current Features (v2.0.0)

- Interactive reading passage with 5 paragraphs
- Image Analysis functionality:
  - OCR (Optical Character Recognition) for text extraction
  - Image description in Chinese
  - Option to replace current passage with OCR results
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

### Architecture
- Frontend: Pure HTML/CSS/JavaScript
- Backend: Deno Deploy for API proxying
- APIs: Multiple third-party services for various functionalities

### APIs Used
- Text-to-Speech API: `https://otts.api.zwei.de.eu.org/v1/audio/speech`
- Dictionary API: `https://api.dictionaryapi.dev/api/v2/entries/en`
- Google Gemini AI API (via proxy): `https://api-proxy.me/gemini/v1beta`
- Qwen VL API: `https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation`

### Components
- HTML: Structure and content with table-based layout
- CSS: Styling, animations, and responsive design
- JavaScript: API integration and interactive features
- Deno: API proxy server for secure key management

## Changelog

### Version 2.0.0 (Latest)
- Migrated to serverless architecture using Deno Deploy
- Removed client-side API key requirements
- Implemented secure API proxy for all third-party services
- Fixed CORS issues with API requests
- Improved error handling across all API calls
- Enhanced audio playback reliability
- Fixed word hover functionality after OCR text replacement
- Improved Chinese translation reliability
- Added proper binary data handling for audio responses

### Version 1.3.1 (Latest)
- Updated Gemini API endpoint to use proxy service
- Fixed CORS issues with API requests
- Improved Chinese translation reliability
- Enhanced error handling for API calls
- Fixed word hover functionality after OCR text replacement

### Version 1.3.0
- Added image analysis feature with dual functionality:
  - OCR for text extraction from images
  - Chinese description of image content
- Implemented modal dialogs for image analysis workflow
- Added confirmation dialog for passage replacement
- Enhanced UI with new image analysis button
- Improved error handling for image processing
- Maintained word-level interactivity after OCR text replacement

### Version 1.2.0
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
- Basic features and layout implementation

## Setup

### Local Development
1. Clone the repository
2. Install Deno if developing locally
3. Create `api_proxy.ts` for the Deno server
4. Set up environment variables in Deno Deploy:
   - GEMINI_API_KEY
   - ZWEI_API_KEY
   - DASHSCOPE_API_KEY

### Production Deployment
1. Deploy proxy server to Deno Deploy
2. Update `API_BASE_URL` in script.js with your Deno Deploy URL
3. Host the frontend files on any web server
4. Access the application through the web server URL

## Notes
- No API keys needed in frontend code
- All API requests are proxied through Deno Deploy
- Browser compatibility: Tested on modern browsers (Chrome, Firefox, Safari)
- Image analysis supports common image formats (JPEG, PNG)
- OCR works best with clear, well-lit images of text
- Uses proxy service for Gemini API to avoid CORS issues
- Audio playback requires browser support for MP3 format

## Security
- All API keys securely stored in Deno Deploy environment
- CORS headers properly configured
- No sensitive data exposed to client
- Request validation implemented in proxy server

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License - see LICENSE file for details

## Planned Features
- Multiple passages for different reading levels
- User progress tracking
- Vocabulary list creation
- Quiz functionality
- Mobile-responsive design improvements
- Loading indicators for API requests
- Offline functionality
- User authentication system

## Notes
- API keys are stored in config.js (not included in git repository)
- Make sure to keep your API keys secure and never commit them to version control
- Consider rate limiting for API calls
- Browser compatibility: Tested on modern browsers (Chrome, Firefox, Safari)
- Image analysis supports common image formats (JPEG, PNG)
- OCR works best with clear, well-lit images of text
- Uses proxy service for Gemini API to avoid CORS issues

## Security
- API keys are stored in a separate config file
- config.js is included in .gitignore
- Template configuration file provided for reference 