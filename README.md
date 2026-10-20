# Cozy Sweep

A pastel, Snake-inspired 2D game. Steer the broom into dirt and trash to grow its handle. Avoid the handle; in Classic mode, avoid the walls too.

## Files

| File | What to edit |
| --- | --- |
| `public/index.html` | Page structure, text, buttons, and menus |
| `public/css/styles.css` | Pastel colors, spacing, layout, and mobile styles |
| `public/js/game.js` | Broom movement, drawing, scoring, sound, and controls |
| `backend/server.js` | Node.js server that serves the game files |
| `package.json` | Start command and project information |

HTML, CSS, browser JavaScript, and backend code are separate files. There are no package dependencies to install.

## Quickest way to play

Extract the ZIP first. Open `public/index.html` in a browser. Keep the CSS and JS folders in place. The game works without running the backend. The Google Fonts stylesheet needs internet; fallback fonts work offline.

## Run with the backend

1. Install Node.js 18 or later if needed.
2. Open a terminal in the extracted `cozy-sweep-code` folder (the folder containing `package.json`).
3. Run `npm start`.
4. Visit `http://localhost:3000` on your laptop.
5. Press Ctrl+C in the terminal to stop the server.

## Play on a phone through your laptop

Connect both devices to the same Wi-Fi. Start the server with a network binding:

Windows PowerShell:

```powershell
$env:HOST="0.0.0.0"
npm start
```

macOS/Linux:

```bash
HOST=0.0.0.0 npm start
```

Find your laptop's local IPv4 address in network settings (or `ipconfig` on Windows). On your phone, open `http://YOUR-LAPTOP-IP:3000`, replacing YOUR-LAPTOP-IP with that address. Allow local/private-network access if your firewall asks. Keep the laptop and server running. This server is intended for local use.

## Controls

- Laptop: arrow keys or WASD. Space pauses/resumes. Escape pauses.
- Phone: swipe on the floor or use the arrow buttons.
- Dirt: 10 points and one extra handle segment.
- Trash: 30 points and three extra segments, added over subsequent moves.
- Cozy: gentle pace, wraparound edges.
- Classic: solid walls and increasing speed.
- Switching modes or pressing restart resets the current run.

## Where data lives

The backend serves files only. It does not store scores or run the game logic. The best score is stored in the browser's localStorage under `cozy-sweep-best` (existing scores from the previous name are imported automatically on the same browser and site address), so it is separate for each browser and site address. No account, database, API, or shared leaderboard is needed for this version.

## Simple customizations

- Colors and layout: edit `public/css/styles.css`.
- Wording: edit `public/index.html`.
- Board size: `N=20` in `public/js/game.js` (canvas dimensions and cell size must stay consistent).
- Game speeds: search for `const speed` in `public/js/game.js`.
- Scoring and handle growth: edit the `tick()` function.

## Verification

The original game passed automated checks for scoring, handle growth, reverse protection, turn queuing, wraparound edges, wall and self collisions, and pause/resume. This export also checks JavaScript syntax and backend file routes. Visual layout and touch behavior have not been checked in a browser here.
