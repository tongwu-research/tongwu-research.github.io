# Tong Wu — Academic homepage

A lightweight, responsive academic homepage for Tong Wu, built with static HTML, CSS, and JavaScript for GitHub Pages. No build step, remote fonts, analytics, or runtime dependencies.

The selected research section includes Gaussian image steganography, an ongoing holographic microscopy project at QCI Lab, and the SLM–MLA real-hardware toolkit.

## Local preview

```bash
python3 -m http.server 8877 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8877`.

## Design and interaction

- Flat publication rows and original research figures, with the uncropped portrait at right.
- Small one-time section reveals, navigation feedback, and animated native disclosures.
- Keyboard-accessible links and disclosures; reduced-motion support; content remains available without JavaScript.
- Motion is inspired by the restraint and clear feedback of ChatGPT and Apple, not a reproduction of either website. Timing values are chosen for this page.

References: [ChatGPT overview](https://openai.com/chatgpt/overview/), [Apple MacBook Pro](https://www.apple.com/macbook-pro/), [Apple motion guidelines](https://developer.apple.com/design/human-interface-guidelines/motion).

## Files and review safety

- `index.html`: content and accessible page structure.
- `styles.css`: responsive layout and visual states.
- `script.js`: optional progressive interaction enhancements.
- `assets/`: individual research illustrations; see `assets/SOURCES.md`.

Review content and figures in the local preview before publication.
