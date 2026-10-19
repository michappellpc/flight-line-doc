// Flight Line Doc: more scripted flights (Phase 2). Same schema as FLD.FLIGHTS in story.js.
// Flights include teaching content: review alongside cases.js.
FLD.FLIGHTS.push(
  {
    id: 'brownout', unit: 'assault', crew: ['price', 'mendez'], title: 'Dust landings, UH-60 Black Hawk',
    lines: [
      ['mendez', `Dust landings today, Doc. Hold on to something that isn't a lever.`],
      ['narr', `WO1 Price brings the Black Hawk down into a dry field. At the last moment the rotor wash kicks up a wall of dust and the ground disappears.`],
      ['mendez', `Drifting left! Hold it... hold it... down. Nice.`],
      ['price', `After landing, Price stares at the instruments. "I had no idea which way was up. I'd have sworn we were level."`],
    ],
    choice: {
      prompt: `Price is rattled.`,
      options: [
        { label: 'Talk it through: brownout, the inner ear, and trusting instruments and crew calls', result: `Price nods slowly. "So feeling wrong is normal. Trusting it is the mistake." Exactly.`, trust: { price: 6, mendez: 3 } },
        { label: 'Tell Price everyone gets used to it', result: `Price laughs, but looks unsure for the rest of the day.` },
      ],
    },
    teach: 'In brownout the eyes lose the horizon and the inner ear gives false signals. Spatial disorientation is normal physiology; the defense is instruments, crew calls and practice, not willpower.',
    reviewNote: 'Check the brownout and spatial disorientation teaching against current Army aviation guidance and USAARL material.',
  },
  {
    id: 'cold', unit: 'dustoff', crew: ['fischer', 'wallace'], title: 'Cold-weather training, HH-60 Dustoff',
    lines: [
      ['fischer', `Cabin doors open for this one, Doc. Bundle up. The rotor wash makes it twenty degrees colder back there.`],
      ['narr', `The crew practices patient loading in the freezing wind. SPC Wallace works bare-handed for a better grip on the litter straps.`],
      ['narr', `Between runs, you notice Wallace's fingertips are white and waxy. Wallace keeps shoving their hands into their armpits.`],
      ['wallace', `I'm fine, Doc. Can't feel them, but I'm fine.`],
    ],
    choice: {
      prompt: `Wallace's fingers look like frostnip.`,
      options: [
        { label: 'Rewarm Wallace\'s hands now and get gloves on before the next run', result: `Color and feeling come back, with some angry tingling. Wallace: "Okay. That's worse than I thought. Gloves from now on."`, trust: { wallace: 8 } },
        { label: 'Wallace says they\'re fine. Trust them.', result: `Wallace finishes the session with numb fingers and fumbles a strap on the last run. Fischer notices and sends Wallace inside.` },
      ],
    },
    teach: 'Rotor wash and open doors add serious wind chill. Frostnip (pale, numb skin) is the warning before frostbite: rewarm gently and protect the skin before it becomes an injury.',
    reviewNote: 'Check the frostnip versus frostbite teaching and the rewarming advice against TB MED 508 (cold injury); confirm the current version.',
  },
  {
    id: 'nightmedevac', unit: 'dustoff', crew: ['fischer', 'brooks', 'shah'], title: 'Night medevac mission, HH-60 Dustoff',
    lines: [
      ['narr', `The radio crackles just after dark: a soldier fell from a vehicle at the training area. Leg injury. You're on the aircraft for a ride-along.`],
      ['fischer', `Dustoff is up. Eight minutes to the pickup zone.`],
      ['brooks', `On the ground, Brooks and SSG Shah splint the leg and keep the soldier talking. Brooks gives the hospital a crisp report: what happened, injuries, vitals, treatment.`],
      ['shah', `After the handoff, Shah sits quietly in the back of the aircraft, staring at a blood-stained glove.`],
    ],
    choice: {
      prompt: `The mission went well, but Shah is quiet.`,
      options: [
        { label: 'Hold a short crew debrief and check in with Shah', result: `Shah admits it was the soldier's age that got to them. The crew talks it out. Brooks: "Good call, Doc. We don't do this enough."`, trust: { shah: 8, brooks: 4 }, friend: { brooks: 30 } },
        { label: 'It\'s late. Everyone just needs sleep.', result: `Everyone heads home. Shah stays in the hangar a while longer, alone.` },
      ],
    },
    teach: 'A clear, structured handoff report keeps patients safe. And a short debrief after a hard mission is how crews notice stress reactions early. Reactions like Shah\'s are normal and usually pass with support.',
  },
  {
    id: 'testflight', unit: 'attack', crew: ['sutton', 'ortiz'], title: 'Maintenance test flight, AH-64 Apache',
    lines: [
      ['sutton', `Test flight, Doc. We check everything the mechanics touched. Lieutenant, read me the checklist.`],
      ['ortiz', `CW4 Sutton, it's your checklist. You're holding it.`],
      ['narr', `Sutton holds the checklist at arm's length, then farther, squinting.`],
      ['sutton', `My arms got shorter. That's the only explanation.`],
    ],
    choice: {
      prompt: `Sutton is struggling to read up close.`,
      options: [
        { label: 'Suggest a near-vision check at the clinic, gently', result: `Sutton grumbles for a full minute, then agrees. A week later Sutton is flying with aviation spectacles and admits the gauges are "suddenly very crisp."`, trust: { sutton: 6, ortiz: 2 } },
        { label: 'Make a joke about it and move on', result: `Everyone laughs. Ortiz quietly reads the checklist aloud for the rest of the flight.` },
      ],
    },
    teach: 'Presbyopia, losing near focus, starts in most people in their 40s. Aircrew must read instruments, maps and checklists, so near vision is checked and corrected with approved lenses.',
  },
  {
    id: 'crosscountry', unit: 'assault', crew: ['rivera', 'hale'], title: 'Long cross-country flight, UH-60 Black Hawk',
    lines: [
      ['rivera', `Four hours to the other side of the state, Doc. Hope you brought snacks.`],
      ['hale', `CPT Hale didn't bring water. "If I don't drink, I don't need a bathroom. Simple math."`],
      ['narr', `By hour three, Hale is rubbing their temples and squinting at the sun.`],
      ['rivera', `Your face is the color of the checklist, Hale.`],
    ],
    choice: {
      prompt: `Hale skipped water on purpose to avoid needing a bathroom.`,
      options: [
        { label: 'Share your water and talk about planning fluids and relief on long flights', result: `Hale drinks, and the headache fades. Rivera: "Relief bags are in the back. We're all adults here." Hale promises to plan better.`, trust: { hale: 6 }, friend: { rivera: 20 } },
        { label: 'Not your business. Hale is an adult.', result: `Hale lands with a pounding headache and spends the evening on the clinic couch with a bottle of water.` },
      ],
    },
    teach: 'Aircrew sometimes skip fluids to avoid needing to urinate in flight. Dehydration worsens fatigue, headache, heat tolerance and kidney stone risk. Plan fluids and relief instead.',
  },
);
