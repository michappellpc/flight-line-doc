// Flight Line Doc: tests, upgrades, flights, events, story beats and glossary.
// Flights and the incident include teaching content: review alongside cases.js.
window.FLD = window.FLD || {};

FLD.TESTS = {
  strep:   { name: 'Rapid strep test',         cost: 3, time: 10 },
  orth:    { name: 'Orthostatic vitals',       cost: 0, time: 10 },
  glucose: { name: 'Fingerstick glucose',      cost: 1, time: 5 },
  bac:     { name: 'Breath alcohol test',      cost: 1, time: 5 },
  ecg:     { name: '12-lead ECG',              cost: 4, time: 10 },
  tymp:    { name: 'Tympanometry',             cost: 3, time: 10, needs: 'booth' },
  ua:      { name: 'Urinalysis',               cost: 3, time: 10, needs: 'lab' },
  cbc:     { name: 'Blood counts and thyroid', cost: 5, time: 15, needs: 'lab' },
};

FLD.DISPO = {
  fly:    { label: 'Return to duty: cleared to fly',        short: 'cleared to fly' },
  down:   { label: 'Down slip: temporary, until resolved',  short: 'temporary down slip' },
  waiver: { label: 'Down slip + aeromedical workup/waiver', short: 'down slip with workup/waiver' },
  evac:   { label: 'Emergency: send to the ER now',         short: 'emergency transfer' },
};

FLD.UPGRADES = [
  { id: 'espresso', name: 'Espresso machine',          cost: 30, desc: '+15 energy every morning. The old coffee pot retires with honors.' },
  { id: 'vision',   name: 'New vision tester',         cost: 50, desc: 'Enables detailed vision testing at FDMEs.' },
  { id: 'booth',    name: 'Fix the hearing booth',     cost: 60, desc: 'Enables audiograms and tympanometry.' },
  { id: 'okafor',   name: 'Triage course for SSG Okafor', cost: 70, desc: 'Okafor pre-screens each patient and gets the honest version of one key answer.' },
  { id: 'lab',      name: 'Point-of-care lab',         cost: 80, desc: 'Enables urinalysis, blood counts and FDME labs.' },
  { id: 'room2',    name: 'Second exam room',          cost: 90, desc: '+1 history question and +1 exam step per patient.' },
];
FLD.NEEDS_NAME = { booth: 'the hearing booth', lab: 'the point-of-care lab', vision: 'the new vision tester' };

// Scripted flights, flown in order. After these, flights are generated.
// Lines: [speaker id or 'narr', text]. A choice can schedule a sick-call visit or set a story flag.
FLD.FLIGHTS = [
  {
    id: 'nvg', unit: 'assault', crew: ['rivera', 'ruiz'], title: 'Dusk NVG training, UH-60 Black Hawk',
    lines: [
      ['rivera', `Strap in, Doc. Helmet on, goggles up until I say so.`],
      ['narr', `The Black Hawk lifts off as the sun goes down. Through the goggles, the world turns green and grainy.`],
      ['rivera', `Depth perception is the first thing to go with these. You learn to scan, scan, scan.`],
      ['narr', `In the back, SGT Ruiz keeps rolling their neck and wincing.`],
    ],
    choice: {
      prompt: `SGT Ruiz is clearly uncomfortable.`,
      options: [
        { label: 'Ask Ruiz about it after landing', result: `Ruiz: "Neck's been killing me since NVG training started. We ran out of counterweights." You tell Ruiz to come to sick call tomorrow.`, schedule: { pid: 'ruiz', caseId: 'nvg-neck' }, trust: { ruiz: 8 } },
        { label: 'Let it go. Ruiz seems fine.', result: `Ruiz says nothing. Stoic types rarely do.` },
      ],
    },
    teach: 'NVGs add weight forward on the helmet. Without a counterweight, neck strain is common, and limited neck rotation is a real scanning hazard.',
  },
  {
    id: 'hoist', unit: 'dustoff', crew: ['fischer', 'brooks', 'wallace'], title: 'Hoist training, HH-60 Dustoff',
    lines: [
      ['fischer', `Welcome aboard, Doc. Today we practice lifting someone out of a place a helicopter can't land.`],
      ['brooks', `Today, that someone is a 180-pound dummy named Gerald. Be nice to Gerald.`],
      ['narr', `The hoist cable whines. Brooks rides it down into the trees, packages Gerald, and comes back up grinning.`],
      ['narr', `SPC Wallace, running the hoist, is pale and sweating heavily. Their water bottle is still full.`],
    ],
    choice: {
      prompt: `Wallace doesn't look good.`,
      options: [
        { label: 'Hand Wallace your water and make them drink', result: `Wallace drinks it all and color comes back. Wallace: "Thanks, Doc. Forgot to drink with all the hoist cycles."`, trust: { wallace: 8 } },
        { label: 'It\'s a training day. They\'ll manage.', result: `Wallace finishes the flight, barely.`, schedule: { pid: 'wallace', caseId: 'heat-exh' } },
      ],
    },
    teach: 'Crews concentrating on a task forget to drink. Heat illness prevention is about routines: scheduled water, rest cycles and watching each other.',
  },
  {
    id: 'gunnery', unit: 'attack', crew: ['nguyen', 'patel'], title: 'Gunnery range, AH-64 Apache',
    lines: [
      ['patel', `Doc! You get the observation seat. Please don't touch anything that says "arm".`],
      ['narr', `You watch from the range tower as the Apaches run their gunnery tables.`],
      ['nguyen', `Afterward, Nguyen climbs down and yawns. "Sorry. Four hours of sleep. Late cycle, then this."`],
      ['patel', `Nguyen's the best pilot in the battalion. Also the worst at sleeping.`],
    ],
    choice: {
      prompt: `Nguyen is running on very little sleep.`,
      options: [
        { label: 'Talk with Nguyen about crew rest', result: `Nguyen listens, mostly. "Fine. I'll try. But the schedule is the schedule, Doc." Something to keep in mind.`, flag: 'nguyenTalk', trust: { nguyen: 6 }, friend: { nguyen: 40 } },
        { label: 'Leave it. Everyone is tired.', result: `Nguyen heads off to the next brief, coffee in hand.` },
      ],
    },
    teach: 'Fatigue builds quietly. Crew endurance programs limit duty days and protect sleep because tired crews make mistakes they don\'t notice.',
  },
];

FLD.GENERIC_FLIGHT_LINES = {
  assault: [`The Black Hawk sweeps low over the training area.`, `The crew runs through approaches to a dusty landing zone.`],
  attack: [`The Apaches move in pairs, scanning the tree lines.`, `The crew talks you through their sensor picture.`],
  dustoff: [`The Dustoff crew runs a simulated patient pickup.`, `You help package a training patient in the cabin.`],
};

// Saturday events. day is day of year (1-56). loc is a station id.
FLD.EVENTS = [
  { day: 6,  id: 'softball', loc: 'gym',    from: 540, to: 900,  title: 'Brigade softball game', text: `You play right field and catch exactly one fly ball. The crowd goes wild. COL Park pitches.` },
  { day: 13, id: 'bbq',      loc: 'dfac',   from: 660, to: 960,  title: 'Organization day BBQ',  text: `The DFAC staff fire up the grills. You learn that the Dustoff crew has strong opinions about potato salad.` },
  { day: 20, id: 'family',   loc: 'ops',    from: 600, to: 900,  title: 'Family day on the flight line', text: `Kids climb into the Black Hawk cockpit. A five-year-old tells you they want to be a doctor who flies.` },
  { day: 27, id: 'run',      loc: 'gym',    from: 420, to: 660,  title: 'Heat-safe 5K fun run', text: `An early start, water every mile, and Brooks running in a hotdog costume. Nobody gets a heat injury.` },
  { day: 34, id: 'chili',    loc: 'dfac',   from: 660, to: 960,  title: 'Chili cook-off', text: `CW4 Sutton's chili wins again. Sutton says the secret is "experience." Patel says the secret is ghost peppers.` },
  { day: 41, id: 'fest',     loc: 'chapel', from: 600, to: 960,  title: 'Fall festival', text: `Chaplain Bell runs a pie table. People who haven't talked since the hard landing end up laughing together.` },
  { day: 48, id: 'lights',   loc: 'hq',     from: 960, to: 1200, title: 'Holiday tree lighting', text: `The whole airfield gathers in the cold. Someone strings lights on the windsock.` },
  { day: 55, id: 'ball',     loc: 'hq',     from: 1080, to: 1380, title: 'Aviation ball', text: `Dress uniforms, a terrible DJ, and a toast "to the crews, and to the doc." You weren't expecting that.` },
];

FLD.STORY = {
  intro: [
    { text: `Kestrel Army Airfield. Spring. A small airfield, a big brigade, and a clinic nobody has run properly in a while.` },
    { who: 'park', text: `COL Park: "Welcome to the 1st Talon Aviation Brigade, Doc. Our last flight surgeon moved on in the fall. The clinic has been... resting."` },
    { who: 'okafor', text: `SSG Okafor: "Morning, Doc! I'm your aviation medic. The hearing booth is broken, the vision tester is ancient, and the coffee pot is a war veteran. But we're glad you're here."` },
    { who: 'park', text: `COL Park: "Keep my crews healthy and flying. Safely. And brief me every Friday afternoon at Brigade HQ."` },
    { text: `Sick call is weekday mornings. FDMEs and flights are in the afternoon. The top-left box always shows what to do next, and J opens your journal.` },
  ],
  heatAsk: `COL Park wants a heat injury prevention brief for the brigade. Give it at Brigade HQ by Wednesday.`,
  heatBrief: [
    { text: `You stand in front of the whole brigade with a slide titled "Don't Cook Yourself."` },
    { text: `You cover work/rest cycles, water, the buddy system, and the difference between heat exhaustion and heat stroke: confusion means emergency, cool first, transport second.` },
    { who: 'park', text: `COL Park: "Good brief, Doc. Short, too. My favorite kind."` },
  ],
  fatigueNote: `SSG Okafor mentions that the Attack battalion has been flying back-to-back late cycles. "Their pilots look like zombies, Doc."`,
  crewRest: [
    { text: `You tell COL Park that the Attack crews are flying on very little sleep.` },
    { who: 'park', text: `COL Park: "We're short pilots and long on missions. But you're right. I'll have the battalion fix the cycle."` },
  ],
  incidentAlert: `The crash phone rings. "Hard landing at the training area. Apache. Two aboard." You grab the aid bag and ride out with the Dustoff crew.`,
  incident: [
    {
      text: `The Apache sits tilted on a broken landing gear. The rotor is still winding down. Two pilots are inside.`,
      options: [
        { label: 'Wait for the rotor to stop and the fire crew to clear the aircraft, then approach', good: true, result: `Scene safety first. A minute later the fire crew waves you in.` },
        { label: 'Run straight to the cockpit', good: false, result: `Brooks grabs your vest and pulls you back. "Rotor, Doc!" The fire crew clears the aircraft a minute later.` },
      ],
    },
    {
      text: `CPT Nguyen is still strapped in, complaining of back pain and tingling in both legs.`,
      options: [
        { label: 'Spinal motion restriction, careful extraction, urgent evacuation', good: true, result: `Brooks hands you the board before you ask. Nguyen is packaged carefully and flown out.` },
        { label: 'Help Nguyen climb out and walk to the Dustoff', good: false, result: `Brooks stops you: "Back pain and tingling legs, Doc. Board first." You package Nguyen properly.` },
      ],
    },
    {
      text: `CW2 Patel walked away from the aircraft and keeps asking what happened. They have a headache and don't remember the landing.`,
      options: [
        { label: 'Treat as a concussion: evaluate, monitor, and keep off flying duty', good: true, result: `Patel goes with the second aircraft for evaluation.` },
        { label: 'Patel seems fine. Send them back to the unit.', good: false, result: `On second look, Patel can't recall your name twice in a row. You send them for evaluation.` },
      ],
    },
  ],
  incidentEnd: `Both pilots will recover. Nguyen has a compression fracture and will be off flying for a while. Patel has a concussion. Nobody died. The brigade exhales.`,
  board: [
    {
      text: `The safety investigation board asks what you know about the crew's schedule before the hard landing.`,
      options: [
        { label: 'Back-to-back late cycles. They\'d had about five hours of sleep a night', good: true, result: `The board writes it down. Fatigue is listed as a contributing factor.` },
        { label: 'The pilot just made a mistake', good: false, result: `The board points to the schedule anyway. Fatigue is listed as a contributing factor.` },
      ],
    },
    {
      text: `What do you recommend?`,
      options: [
        { label: 'Enforce crew rest and fix the cycle schedule', good: true, result: `The board adopts your recommendation.` },
        { label: 'Discipline the crew', good: false, result: `The board notes that punishment does not fix a schedule. They recommend crew rest changes instead.` },
      ],
    },
  ],
  winterNote: `The brigade's year-end readiness inspection is on the last day of winter. Rumor has it a deployment is coming next year.`,
  inspectionNote: `Inspection day. Report to Brigade HQ between 0900 and 1700.`,
};

FLD.EPILOGUES = {
  okafor: { good: `SSG Okafor was accepted to PA school, with your letter in the packet. The new espresso machine was named after them.`, ok: `SSG Okafor keeps running the clinic like clockwork, and is thinking about PA school.` },
  rivera: { good: `CW3 Rivera finally got the numb hands checked, kept flying, and now tells every new pilot to "just go see the doc."`, ok: `CW3 Rivera keeps flying and keeps grumbling, in roughly equal amounts.` },
  nguyen: { good: `CPT Nguyen got the instructor slot, and wrote "sleep" into the training plan.`, ok: `CPT Nguyen is back in the front seat, still learning to say "I'm tired."` },
  brooks: { good: `SGT Brooks was named Flight Medic of the Year and spent the award money on donuts for the whole clinic.`, ok: `SGT Brooks is still the best hoist medic on the airfield, and still owes you a donut.` },
  park: { good: `COL Park told the next brigade commander: "Listen to your flight surgeon."`, ok: `COL Park moved on to a new job, with a firm handshake for you on the way out.` },
  bell: { good: `Chaplain Bell still makes two cups of tea every afternoon. One is always for you.`, ok: `Chaplain Bell's door is still open, and the bench is still there.` },
};

FLD.GLOSSARY = [
  ['APL', 'Aeromedical Policy Letter. Army guidance on how conditions and medications affect flying duty.'],
  ['Down slip', 'DA Form 4186 recommendation removing someone from flying duty.'],
  ['Up slip', 'DA Form 4186 recommendation returning someone to flying duty.'],
  ['FDME', 'Flight Duty Medical Examination: the annual aircrew physical.'],
  ['Waiver', 'An exception to the medical standard, requested through the Army aeromedical system.'],
  ['Ground trial', 'Taking a new medication while not flying, to make sure there are no side effects.'],
  ['Crew rest', 'Protected rest time before flying duty, to prevent fatigue.'],
  ['NVG', 'Night vision goggles.'],
  ['Dustoff', 'Army aeromedical evacuation (medevac) units and their call sign.'],
  ['IP', 'Instructor pilot.'],
  ['CW2 / CW3 / CW4', 'Chief warrant officer ranks. Most Army pilots are warrant officers.'],
  ['DFAC', 'Dining facility.'],
  ['TM', 'Tympanic membrane (eardrum).'],
  ['Valsalva', 'Blowing gently against a pinched nose to equalize ear pressure.'],
  ['Barotrauma', 'Injury from pressure changes, usually in the ears or sinuses.'],
  ['Readiness', 'The share of aircrew available to fly.'],
];
