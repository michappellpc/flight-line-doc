# Flight Line Doc

A small pixel-art life-sim for the browser. You're the new flight surgeon at a fictional Army airfield. Run sick call, do annual FDMEs, fly with the crews, write down slips and up slips, restore a run-down aviation medicine clinic, and earn the trust of your aircrews over one year.

**Play:** https://michappellpc.github.io/flight-line-doc/

## Design
See [DESIGN.md](DESIGN.md) for the game design: pillars, systems, story, content targets and the medical accuracy policy.

## Controls
- Move: WASD or arrow keys (on-screen d-pad on touch devices)
- Interact: E, Space, or the on-screen E button
- Pick options: click, or press 1–9
- Journal: J (aircrew roster, friends, skills, glossary, settings, sound)
- Mute: M
- Walk into the clinic, Brigade HQ, the chapel and your quarters through their doors; walk out the door at the bottom
- Progress saves in your browser when you sleep

## Project layout
| Path | What it is |
|---|---|
| `index.html` | Page shell and styles |
| `js/game.js` | Game engine and systems |
| `js/art.js` | All pixel art, drawn in code: map, seasons, interiors, characters, aircraft |
| `js/audio.js` | Procedural sound effects, ambience and music (Web Audio, no files) |
| `js/data/cases*.js` | Sick-call cases (50, across four files) |
| `js/data/fdme*.js` | FDME findings (20) |
| `js/data/flights-more.js` | Additional scripted flights |
| `js/data/people.js` | Aircrew roster, cast, dialogue and heart scenes |
| `js/data/story.js` | Tests, upgrades, flights, events, story beats, glossary |
| `review.html` | Readable, printable view of all medical content for clinical review |
| `tests/playthrough.js` | Automated full-year playthrough |
| `tests/validate-content.js` | Schema check for every data file |

No build step. Open `index.html` in a browser to play locally.

## Clinical review
Open `review.html` to see every case, answer, distractor, disposition, teaching point and source note in one place. Yellow boxes are the authors' notes on things they were unsure of. When an item is checked, set its `reviewed` field to the date in the matching file in `js/data/`, then run `node tests/validate-content.js`.

## Testing
The playthrough test plays a full year through the real UI and fails on any page error. `random` mode clicks randomly; `smart` mode plays every case correctly.

```
NODE_PATH=$(npm root -g) node tests/playthrough.js 62 - random
NODE_PATH=$(npm root -g) node tests/playthrough.js 62 - smart
NODE_PATH=$(npm root -g) node tests/save-migration.js
```
Needs Playwright with Chromium. Set `CHROMIUM` to a browser path if Playwright's own isn't installed. Replace `-` with a folder path to save screenshots.

## Notes
- All cases, art and text are original and fictional. This is a game for fun and learning, **not medical advice**.
- All people, units and places are fictional. Not affiliated with or endorsed by the U.S. Army, the Department of Defense, or any other game or publisher.
