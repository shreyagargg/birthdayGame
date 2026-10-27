# Ray of Love

A Vite + React project structure for the Ray of Love canvas adventure.

## Requirements
- Node.js 20.19+ or 22.12+

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Architecture
- `src/app`: app composition and persisted game state
- `src/features/game`: canvas and real-time game loop
- `src/features/quiz`: level-two memory quiz
- `src/features/story`: HUD, story screens, and utility modals
- `src/features/settings`: personalization UI
- `src/services`: browser audio service
- `src/shared`: shared context and default content
- `src/styles`: global and compatibility CSS

## Notes
The existing gameplay and visual classes have been retained during this structural refactor. Review gameplay in-browser after installing dependencies, especially level transitions, canvas collision behaviour, pause/resume, audio permissions, and local-storage migration before public deployment. Personal notes and configuration are stored in browser local storage and are not encrypted.
