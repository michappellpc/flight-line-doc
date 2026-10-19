# Flight Line Doc: Design Document

Version 0.1 (Phase 0). This is the reference every feature gets checked against. If a feature doesn't serve the pillars below, it waits or gets cut.

---

## Status

**Phase 0 (design): done.** **Phase 1 (core loop): done.** **Phase 2 (content): done, pending clinical review.**

Phase 2 added:
- 30 new cases (50 total): flight-specific, common sick call, medications and fitness for duty, behavioral health and fatigue, emergencies
- 10 new FDME findings (20 total) and 5 new scripted flights (8 total)
- Heart scenes at 6 and 8 hearts for every character (24 total), with one-time perks
- 16 more named aircrew (30 total), so sick call no longer grounds the same few people
- Economy and friendship retuned; `reviewNote` flags on every item the authors were unsure of
- `tests/validate-content.js` checks every data file

Built in Phase 1:
- Army conversion: Kestrel AAF map, UH-60/AH-64/HH-60 aircraft, CPT player, down/up slips
- Character creation (name, skin, hair, pronouns)
- Structured sick-call cases (history, exam, tests, diagnosis, disposition) with low-trust answers that hide key facts
- Trust per aircrew member and per battalion, Aviation Readiness, command confidence
- Delayed consequences: unsafe clearances cause safety reports days later; overcautious groundings cost trust and readiness
- FDMEs with checks and hidden findings, overdue FDMEs ground aircrew
- Flying with crews (3 scripted flights, then generated ones)
- Clinic budget and 6 upgrades, personal wallet, payday, DFAC gifts
- 3 skill tracks with unlocks, 6 cast members with 2 heart scenes and a perk each
- Weekly brief, Saturday events, and the full story arc: heat brief, fatigue warning, hard landing, safety board, year-end inspection with graded ending and epilogues, then Year 2
- Journal, glossary, objective hints, autosave on sleep, touch controls
- `review.html` for clinical review and an automated full-year playthrough test

Content now meets the §11 targets for cases, FDME findings, flights, heart scenes and events. Down slips last a quarter of their real-world length because a year is 56 days. Interiors and sound are deferred to Phase 3.

## 1. Pitch

You're a newly minted Army flight surgeon assigned to an aviation brigade at a sleepy Army airfield. Over one year you keep your aircrews healthy and flying, earn their trust one sick call at a time, fly with the crews, build up a run-down aviation medicine clinic, and get through the brigade's toughest year in a long time.

It's a cozy life sim in the Stardew tradition, with real aeromedicine underneath, written by and for people who know what a down slip is.

## 2. Decisions (locked in Phase 0)

| Question | Decision |
|---|---|
| Service | **U.S. Army** aviation (rotary-wing focus) |
| Primary audience | **Medical professionals**: flight surgeons, aerospace medicine residents, flight docs in training, aviation medics, PAs. Cozy-sim players are a welcome secondary audience. |
| Scope | **Small and finished**: one in-game year, 3–5 hours, a real ending |
| Tone | **Warm, with light humor**. Heartfelt and funny, with occasional real stakes |
| Platform | Browser first (desktop + mobile). App stores are out of scope for 1.0 |
| Price | Free |

## 3. Design pillars

1. **Your aircrew are people, not cases.** Every patient on the flight roster has a name, a job, a personality and a history. The same CW3 comes back in spring with the same back that they "definitely didn't hurt playing softball."
2. **Medicine that a flight surgeon would nod at.** Dispositions follow real Army aeromedical logic (FDMEs, up/down slips, APLs, waivers). It's simplified for pacing, never wrong in a way that would teach a bad habit.
3. **Every decision has a cost.** Time, energy, readiness and trust are always in tension. Grounding someone is safe for them and hard on the unit. Thoroughness is right and slow. There's rarely a free answer.
4. **Cozy first, stakes second.** Most days are calm and pleasant. Big moments are rare enough to land. Mistakes cost trust and create story; the game never punishes you with a game-over.

## 4. Audience

**Primary: medical professionals around Army aviation.** They'll forgive simple art but not wrong medicine. They want:
- Cases that feel like the real job, including the boring and the absurd
- Inside jokes (the motor-pool coffee, the endless FDMEs, the pilot hiding a symptom)
- Short sessions: a day should take about 4 minutes, so they can play on a break

**Secondary: cozy-sim players.** They need:
- An optional in-game glossary for every acronym (hover or tap)
- Teaching points after each case that make sense without a medical degree
- No hard fail states

**Non-goal:** replacing a study resource. The game teaches judgment and vocabulary. It is not a board-prep tool and makes no such claim.

## 5. Core fantasy and player goal

**Fantasy:** "I'm the doc the crews trust, the one they actually tell the truth to."

**Goal over the year:** raise the brigade's **Aviation Readiness** and earn the crews' **Trust**, while getting the clinic in shape before the brigade's year-end readiness inspection.

**Why trust matters mechanically:** low-trust patients hide symptoms. Your history-taking gets less information from them, so cases get harder. High-trust patients come in early, tell you everything, and bring their friends. This is the central system; most other systems feed it.

## 6. Setting

All names below are **fictional**. No real units, people, installations or insignia.

- **Place:** *Kestrel Army Airfield*, a small, slightly forgotten airfield attached to a larger post.
- **Unit:** *1st Talon Aviation Brigade*, with three battalions the player gets to know:
  - **Assault battalion**: UH-60 Black Hawks (utility, air assault)
  - **Attack battalion**: AH-64 Apaches (two-seat, high workload)
  - **Medevac company**: HH-60 "Dustoff" crews (flight medics, the player's natural allies)
  - Optional later: a CH-47 Chinook detachment for heavy-lift humor
- **Your clinic:** the *Aviation Medicine Clinic*: a run-down building with a broken hearing booth, an ancient vision tester and a coffee pot older than some of the pilots. Restoring it is this game's version of rebuilding the farm.
- **Base locations:** Clinic, Flight Line and hangars, Battalion HQ, Motor Pool, DFAC, Gym, Quarters, Chapel, PX, and the Airfield Fire Station.

### Army terminology the game uses

These should be checked against current regulations before content is written (see §12).

| In game | Meaning |
|---|---|
| **FDME** | Flight Duty Medical Examination, the annual aircrew physical |
| **Down slip / Up slip** | DA Form 4186 recommendation removing or returning someone to flying duty. Replaces "DNIF" in the prototype |
| **APL** | Army Aeromedical Policy Letters, the rules for conditions and medications |
| **Waiver** | Exception to the standard, requested through the Army aeromedical system |
| **Crew endurance / crew rest** | Fatigue management, a recurring theme |
| **Flight surgeon badge** | Basic, Senior, Master. The player starts Basic |
| **Flight minimums** | Flight surgeons fly with crews; the game rewards this |

**Rank:** the player starts as a **CPT** (Captain), which is realistic for a new Army flight surgeon. One year doesn't give the player rank progression, so **progression is through responsibility**: Battalion Flight Surgeon → acting Brigade Surgeon, with an optional promotion-board epilogue to MAJ.

## 7. Core loop

### Moment to moment (seconds)
Walk, talk, examine, choose. Every interaction is short and readable.

### Daily (about 4 minutes real time)
- **0600–0900 PT and morning.** Optional gym, DFAC, quick talk with NPCs.
- **0900–1200 Sick call.** The heart of the game: a queue of 3–6 patients, each a short multi-step case.
- **1300–1700 Afternoon choice.** One major activity: FDMEs, fly with a crew, flight line safety walk, clinic project, or a battalion meeting.
- **Evening.** Free time: relationships, studying, a social event, or rest.
- **Sleep.** Saves the game. Energy carries consequences into tomorrow.

### Weekly
- A **weekly brief** to the brigade commander summarizes readiness, trust and any incidents.
- One **event day** per week (range day, mass-casualty exercise, VIP visit, softball game).

### Seasonal (4 seasons × 14 days = 56 days)
Each season has its own case mix, weather, events and one story beat (§9).

## 8. Systems

### 8.1 Time and energy
Kept from the prototype. Energy limits how much you can do in a day; skipping meals and sleep reduces your performance in cases (fewer hints, more time cost), so self-care is a game mechanic. It mirrors the crew-endurance theme.

### 8.2 Cases (sick call)
Replace the single multiple-choice question with a **short structured case**:

1. **Chief complaint** (what they say, filtered by Trust)
2. **History**: choose 2–3 questions from a list; each costs time
3. **Exam**: pick relevant exam steps
4. **Tests** (optional): cost time and clinic budget; only some are available until the clinic is upgraded
5. **Diagnosis and treatment**
6. **Aeromedical disposition**: return to flying, down slip, or down slip with waiver workup

Scoring considers the medicine **and** the disposition **and** the efficiency. A perfect diagnosis with a wrong flying disposition is still a problem, because that's the real job.

Each case has a **teaching point** and a **source note** (which reference supports it) shown after resolution.

### 8.3 FDMEs
Batches of annual physicals. Mostly routine: quick, satisfying throughput with an occasional hidden finding (a high BP, a new medication, a hearing threshold shift). Missing findings has delayed consequences.

### 8.4 Flying with crews
The flight surgeon's secret weapon. A short, mostly cinematic flight sequence with dialogue during the flight. It builds Trust with the whole crew, reveals hidden health issues ("the crew chief keeps rubbing their neck"), and teaches flight hazards (noise, vibration, NVGs, heat, fatigue). Costs most of an afternoon.

### 8.5 Trust (replaces "reputation")
- Tracked **per person** and rolled up **per battalion**.
- Rises with good care, fair dispositions, flying with crews, showing up at events, and keeping confidences.
- Falls with unnecessary groundings, careless errors, and broken promises.
- High trust makes patients come in early with honest histories. Low trust makes them hide symptoms.

### 8.6 Aviation Readiness
A brigade-wide number: the share of aircrew available to fly. Grounding people lowers it in the short term. Missing a problem that later causes an incident lowers it far more. This is the push and pull with Trust and with safety.

### 8.7 Relationships
6 core NPCs with 8 heart levels and a short personal arc each (§10). Hearts unlock scenes, small perks and story options at the finale. Gifts exist but are minor; time spent together matters more.

### 8.8 Clinic restoration (the "farm")
Uses **clinic budget** (granted weekly, based on readiness and trust) and occasional favors from NPCs. Upgrades unlock new tests and capabilities:
- Fix the hearing booth: audiograms during FDMEs
- New vision tester: catches vision changes
- Point-of-care labs: faster diagnoses
- Exam room 2: bigger sick-call queue
- Med tech training: a tech pre-screens patients and gives hints
- Better coffee: morale and a running joke

**Money:** Army doctors aren't paid per patient, so per-patient pay from the prototype is removed. The player has a small **personal wallet** for DFAC, PX gifts and coffee. The **clinic budget** is the main resource.

### 8.9 Skills
Three skill tracks that unlock helpful hints and options:
- **Clinical**: better differentials and test interpretation
- **Aeromedical**: knowledge of the regs; unlocks waiver work and faster dispositions
- **Leadership**: briefing the commander, training medics, handling the mishap board

## 9. Story: one year at Kestrel AAF

| Season | Story beat | New mechanics |
|---|---|---|
| **Spring: Arrival** | You inherit a clinic nobody has run properly in a while. Meet the crews, earn first trust, learn the routine. | Sick call, FDMEs, first flight with a crew |
| **Summer: Heat** | Long training days in the heat. A series of heat injuries tests your prevention work. | Heat-injury prevention briefs, field exercise week |
| **Fall: The Incident** | A hard landing during training. Nobody dies, but you sit on the investigation, and a crew member you know is involved. Fatigue is a factor. | Mishap investigation sequence (fatigue, crew rest) |
| **Winter: Inspection** | The brigade prepares for its year-end readiness inspection, and rumors of a deployment circulate. | Year-end inspection, finale |

**Ending:** a year-end ceremony. The commander's speech and epilogues for each NPC reflect your Trust, Readiness, clinic state and relationships. No bad ending, only better and more bittersweet ones. A post-game "next year" mode lets the player keep playing with harder cases.

## 10. Core cast (fictional)

| Character | Role | Arc |
|---|---|---|
| **CW3 Rivera** | Instructor pilot, Black Hawk | Hiding a symptom to keep flying. Learns to trust the doc |
| **SSG Okafor** | Senior aviation medic in your clinic | Wants to go to PA school; you help or hinder |
| **CPT Nguyen** | Apache pilot, ambitious | Burnout and fatigue, ties into the Fall incident |
| **SGT Brooks** | Dustoff flight medic | Your ally on the flight line; a comic foil with stakes |
| **COL Park** | Brigade commander | Skeptical of doctors who ground pilots; won over by results |
| **CH (MAJ) Bell** | Brigade chaplain | Quiet support, the place to talk about the hard days |

## 11. Content targets for 1.0

| Content | Target |
|---|---|
| Sick-call cases | 50, across 4 seasonal pools |
| FDME findings | 20 |
| Flights with crews | 8 scripted flights |
| NPC heart scenes | 6 NPCs × 4 scenes = 24 |
| Weekly events | 8 |
| Story sequences | 4 (one per season) + ending |
| Locations | 10 exterior areas, 4 interiors |

### Case mix guidance
- **40%** common sick call with an aeromedical twist (URI and ear blocks, allergy medication choices, musculoskeletal pain from vibration and armor)
- **20%** flight-specific (barotrauma, hypoxia, spatial disorientation, noise-induced hearing loss, NVG and visual issues)
- **15%** fitness for duty and medications (new prescriptions, supplements, sleep aids)
- **15%** behavioral health and fatigue (stress, sleep, alcohol, after the incident)
- **10%** emergencies (heat stroke, chest pain, anaphylaxis, crash response)

## 12. Medical accuracy policy

1. Every case has a written **source note** pointing to the reference it's built on (Army APLs, AR 40-501, standard clinical guidelines).
2. Content gets a **clinical review** by the project owner before release.
3. Where the regulation is complicated, the game **simplifies but doesn't contradict**, and the teaching point says it's simplified.
4. Regulations change. Content records the date it was last checked, and cases citing changed policy get updated.
5. A permanent, visible disclaimer: *fictional game, not medical advice, not affiliated with the U.S. Army or Department of Defense.*
6. All case text is original. Nothing is copied from question banks or copyrighted course material, including your own other products, to keep this project legally and commercially separate.

## 13. Tone and writing guide

- **Warm:** characters like each other, even when they argue
- **Light humor:** military and medical humor that insiders recognize, never mean-spirited, never punching down at patients
- **Real stakes, used sparingly:** the Fall incident is serious and written with care
- **Short text:** dialogue boxes of two lines or fewer. Players are on a break
- **Acronyms:** used naturally, with the glossary for newcomers

Example lines:
- *"Doc, it's not a back injury. It's a back opinion."*
- *"I took one Benadryl. Like, a small one."*
- *"The hearing booth isn't broken. It's just very, very quiet about working."*

## 14. Art and audio direction

- **Pixel art:** 16×16 tiles, 4-direction character sprites with idle and walk animations, and portraits for dialogue.
- **Palette:** muted Army greens and tans with warm interiors; seasonal palette swaps.
- **Readability over detail:** the player should always see where to go and what is interactive.
- **Audio:** soft ambient loops per location (rotor wash in the distance, clinic hum, evening crickets), gentle UI sounds, and a short warm theme.
- **Avoid:** real unit patches and insignia, real aircraft tail numbers, gore.

## 15. Non-goals for 1.0

- Combat or a deployment campaign (maybe a sequel)
- Multiplayer or leaderboards
- Monetization, ads or accounts
- Real units, installations or people
- Being an exam-prep tool
- Fully simulated regulations (simplify for play, cite for learning)

## 16. Success criteria

**Phase 1 (core loop) is done when:**
- A new playtester, given no instructions, plays 30 minutes and wants to continue
- At least 3 of 5 med-pro testers say the cases "feel like the real job"
- A full in-game day takes 3–5 real minutes

**1.0 is done when:**
- A full year can be played start to finish in 3–5 hours
- All content targets in §11 are met and clinically reviewed
- It plays well on desktop and on a phone
- No known crash or save-loss bugs

## 17. Changes needed in the current prototype

| Prototype (now) | Change for the design |
|---|---|
| Air Force flavor (2nd Lt → Colonel, DNIF, jets) | Army: CPT, down/up slips, helicopters |
| Reputation number | Trust per person and per battalion, plus Readiness |
| Pay per patient | Clinic budget plus a small personal wallet |
| Single multiple-choice cases | Structured multi-step cases (§8.2) |
| Flight Physicals station | FDMEs, plus flying with crews |
| Library for XP | Study in the clinic office; three skill tracks |
| Supply as a shop | Clinic restoration and budget |
| Generic buildings | Kestrel AAF layout with clinic interior |
| 4 NPCs | 6 core cast with heart arcs |
| Endless play | One year with an ending and a post-game mode |

## 18. Decisions and open questions

### Decided
1. **Clinical review:** the project owner reviews all case content before release.
2. **Player character:** customizable, kept simple (name, appearance, pronouns).
3. **Fall incident:** hard landing with injuries only. No deaths.
4. **Art:** original pixel art made in-project (sprites drawn in code, as in the prototype), in the style set out in §14. No commissioned artist or third-party tilesets for now.

### Open
1. **Release:** itch.io plus GitHub Pages at 1.0, or GitHub Pages only? Decide before Phase 6.
