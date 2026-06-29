# Ayah Canvas

Ayah Canvas is a polished web app for creating Qur'an reflection cards. Users enter an ayah reference, the app fetches the Arabic text and English translation automatically, and the reflection card updates live for journaling, sharing, or exporting.

## Features

- Automatic Qur'an lookup from references like `2:255`, `18:10`, and `55:13`
- Surah and Ayah dropdown selection
- Arabic text, English translation, Surah name, and ayah number populated automatically
- Local cache for previously loaded ayahs
- Friendly loading and error states
- Reflection-only writing workflow with 600 character counter
- Sage, Cream, Sand, Sky, and Blossom pastel themes
- Classic, Editorial, and Minimal card layouts
- Autosave for the current ayah, reflection, theme, layout, and square-card mode
- High-resolution PNG export with `ayah-canvas-YYYY-MM-DD.png` filenames
- Copy reflection, copy full card text, random prompts, undo clear, autosizing textareas, and keyboard shortcuts
- Fully client-side static app with no backend, authentication, or database
- Chrome extension prototype for quick reminders and notes

## Tech Stack

- HTML
- Tailwind CSS CDN
- Vanilla JavaScript
- html2canvas CDN
- alquran.cloud public Qur'an API
- Custom CSS
- Chrome Extension Manifest V3 prototype

## Installation

Open `index.html` in a browser. No build step is required.

For automatic lookup and PNG export, keep an internet connection available so the Qur'an API and html2canvas CDN can load.

To try the Chrome extension prototype, open `chrome://extensions`, enable Developer mode, select `Load unpacked`, and choose the `chrome-extension` folder.

## Screenshots

Add screenshots here after capturing the finished interface.

## Future Improvements

- Add offline Qur'an text and translation bundles
- Add more export sizes for social platforms
- Add a print stylesheet
- Add import and export for saved reflections
- Add more translation options

## License

MIT