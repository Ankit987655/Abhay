# From me to you — plain HTML, CSS, and JavaScript

This standalone copy has no React, build step, package manager, or external JavaScript dependencies. It recreates the welcome screen, a photo-selection game featuring the nine supplied personal photos, a full-screen opening envelope animation, a flower-bloom animation before the love note, the note, selectable checklist, and a separate affectionate ending page. The bloom plays through and then opens the note automatically; it can also be skipped. The opening can be skipped as well. Motion is reduced when the device asks for reduced motion.

## Run it

Open `index.html` in a current desktop or mobile browser. You can also serve this folder with any static web server. No install command is needed.

## Files

- `index.html` — semantic page content and controls
- `styles.css` — layout, responsive styles, colors, and transitions
- `script.js` — screen navigation, puzzle state, progress, checklist, and synthesized music playback
- `assets/` — the nine supplied photos used in the memory game
- `love-you.html` — destination after selecting “Send me a hug”
- `final.css` — styling and animations for the final love-you page

The sample letter and checklist choices are illustrative local mock content. The original audio was not available; the Music button plays a soft, locally synthesized instrumental phrase using the browser's Web Audio API. No music file or external audio service is required.
