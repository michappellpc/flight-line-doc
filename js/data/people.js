// Flight Line Doc: people. All names, units and people are fictional.
window.FLD = window.FLD || {};

FLD.UNITS = {
  assault: { name: '2-1 Assault Battalion', short: 'Assault', aircraft: 'UH-60 Black Hawk' },
  attack:  { name: '3-1 Attack Battalion',  short: 'Attack',  aircraft: 'AH-64 Apache' },
  dustoff: { name: 'C Company, Dustoff',    short: 'Dustoff', aircraft: 'HH-60 medevac' },
};

// Trait sets a patient's starting trust and how they open a visit.
FLD.TRAITS = {
  stoic:     { trust: 35, open: [`SSG Okafor made me come in.`, `It's probably nothing, Doc.`] },
  proud:     { trust: 32, open: [`Let's make this quick. I've got a flight at 1400.`, `I'm only here so the IP stops nagging me. Wait. I am the IP.`] },
  chatty:    { trust: 55, open: [`Doc! Did you hear the DFAC ran out of bacon? Anyway.`, `Morning, Doc! So, funny story.`] },
  worrier:   { trust: 58, open: [`I looked it up online and now I'm scared.`, `Sorry to bother you, Doc. I just want to be sure.`] },
  eager:     { trust: 45, open: [`Doc, I really don't want this to affect my flight status.`, `I can still fly today, right?`] },
  joker:     { trust: 48, open: [`Doc, I'd like a second opinion. Also a first one.`, `Is this covered under warranty?`] },
  calm:      { trust: 50, open: [`Morning, Doc. Something's been bugging me.`, `Thanks for seeing me.`] },
  driven:    { trust: 36, open: [`I don't have time to be sick.`, `Can we keep this short? I've got a mission brief.`] },
  oldschool: { trust: 30, open: [`Back in my day, we walked it off.`, `Twenty-five years flying and I've never needed a doctor. Until, apparently, today.`] },
};

// Aircrew on the flight roster. These count toward Aviation Readiness and can be patients.
FLD.ROSTER = [
  { id: 'rivera',  rank: 'CW3', name: 'Ana Rivera',    unit: 'assault', role: 'pilot', job: 'Instructor pilot',          age: 41, trait: 'proud',     look: { skin: '#d9a77c', hair: '#3a2414' } },
  { id: 'hale',    rank: 'CPT', name: 'Marcus Hale',   unit: 'assault', role: 'pilot', job: 'Pilot, company commander',  age: 31, trait: 'chatty' },
  { id: 'price',   rank: 'WO1', name: 'Jenna Price',   unit: 'assault', role: 'pilot', job: 'Pilot, new from flight school', age: 24, trait: 'eager' },
  { id: 'ruiz',    rank: 'SGT', name: 'Tomas Ruiz',    unit: 'assault', role: 'crew',  job: 'Crew chief',                age: 27, trait: 'stoic' },
  { id: 'dunn',    rank: 'SPC', name: 'Kayla Dunn',    unit: 'assault', role: 'crew',  job: 'Crew chief',                age: 22, trait: 'worrier' },
  { id: 'mendez',  rank: 'SGT', name: 'Carl Mendez',   unit: 'assault', role: 'crew',  job: 'Crew chief',                age: 34, trait: 'calm' },
  { id: 'nguyen',  rank: 'CPT', name: 'Lin Nguyen',    unit: 'attack',  role: 'pilot', job: 'Apache pilot',              age: 30, trait: 'driven',    look: { skin: '#e8c29a', hair: '#1c1c1c' } },
  { id: 'patel',   rank: 'CW2', name: 'Dev Patel',     unit: 'attack',  role: 'pilot', job: 'Apache pilot',              age: 33, trait: 'joker' },
  { id: 'sutton',  rank: 'CW4', name: 'Gary Sutton',   unit: 'attack',  role: 'pilot', job: 'Standardization pilot',     age: 49, trait: 'oldschool' },
  { id: 'ortiz',   rank: '1LT', name: 'Sam Ortiz',     unit: 'attack',  role: 'pilot', job: 'Apache pilot',              age: 26, trait: 'eager' },
  { id: 'brooks',  rank: 'SGT', name: 'Jordan Brooks', unit: 'dustoff', role: 'medic', job: 'Flight medic',              age: 29, trait: 'joker',     look: { skin: '#8d5a3b', hair: '#2b1b10' } },
  { id: 'fischer', rank: 'CW2', name: 'Ellie Fischer', unit: 'dustoff', role: 'pilot', job: 'Medevac pilot',             age: 35, trait: 'calm' },
  { id: 'wallace', rank: 'SPC', name: 'Andre Wallace', unit: 'dustoff', role: 'crew',  job: 'Crew chief',                age: 23, trait: 'stoic' },
  { id: 'shah',    rank: 'SSG', name: 'Priya Shah',    unit: 'dustoff', role: 'medic', job: 'Flight medic',              age: 32, trait: 'worrier' },
  { id: 'okoye',   rank: 'CW2', name: 'Grace Okoye',   unit: 'assault', role: 'pilot', job: 'Pilot',                     age: 29, trait: 'calm' },
  { id: 'lindqvist', rank: 'CW4', name: 'Erik Lindqvist', unit: 'assault', role: 'pilot', job: 'Maintenance test pilot', age: 46, trait: 'oldschool' },
  { id: 'baptiste', rank: '1LT', name: 'Rene Baptiste', unit: 'assault', role: 'pilot', job: 'Pilot, platoon leader',      age: 25, trait: 'eager' },
  { id: 'kim',     rank: 'SPC', name: 'Joon Kim',      unit: 'assault', role: 'crew',  job: 'Crew chief',                age: 21, trait: 'joker' },
  { id: 'abara',   rank: 'SSG', name: 'Tobi Abara',    unit: 'assault', role: 'crew',  job: 'Flight engineer, standardization', age: 38, trait: 'proud' },
  { id: 'harlan',  rank: 'CW3', name: 'Beth Harlan',   unit: 'attack',  role: 'pilot', job: 'Instructor pilot',          age: 40, trait: 'calm' },
  { id: 'reyes',   rank: 'WO1', name: 'Mateo Reyes',   unit: 'attack',  role: 'pilot', job: 'Apache pilot, new to the unit', age: 24, trait: 'worrier' },
  { id: 'novak',   rank: 'CPT', name: 'Ivana Novak',   unit: 'attack',  role: 'pilot', job: 'Apache pilot, company commander', age: 32, trait: 'driven' },
  { id: 'whitfield', rank: 'CW2', name: 'Cole Whitfield', unit: 'attack', role: 'pilot', job: 'Apache pilot',            age: 34, trait: 'chatty' },
  { id: 'mbeki',   rank: 'CW3', name: 'Sipho Mbeki',   unit: 'attack',  role: 'pilot', job: 'Safety officer pilot',      age: 43, trait: 'stoic' },
  { id: 'tran',    rank: 'CW3', name: 'Huy Tran',      unit: 'dustoff', role: 'pilot', job: 'Medevac pilot in command',  age: 39, trait: 'stoic' },
  { id: 'castillo', rank: 'WO1', name: 'Lucia Castillo', unit: 'dustoff', role: 'pilot', job: 'Medevac pilot',           age: 25, trait: 'eager' },
  { id: 'foster',  rank: 'SGT', name: 'Dana Foster',   unit: 'dustoff', role: 'crew',  job: 'Crew chief',                age: 28, trait: 'chatty' },
  { id: 'yazzie',  rank: 'SGT', name: 'Nathan Yazzie', unit: 'dustoff', role: 'medic', job: 'Flight medic',              age: 30, trait: 'calm' },
  { id: 'greer',   rank: 'SPC', name: 'Molly Greer',   unit: 'dustoff', role: 'medic', job: 'Flight medic in training',  age: 22, trait: 'worrier' },
  { id: 'haddad',  rank: 'SFC', name: 'Omar Haddad',   unit: 'dustoff', role: 'crew',  job: 'Senior crew chief',         age: 42, trait: 'oldschool' },
];

// The core cast walk around the airfield. Rivera, Nguyen and Brooks are also on the roster.
// sched: [start minute, zone]. Zones are defined in game.js.
FLD.CAST = {
  okafor: {
    title: 'SSG Okafor', sub: 'Senior aviation medic, your clinic',
    look: { skin: '#5c3a24', hair: '#1c1c1c', uniform: 'ocp' },
    sched: [[360, 'clinic'], [1080, 'dfac'], [1260, 'quarters']],
    lines: {
      any: [`The coffee pot has been here longer than I have. We don't talk about the filter.`, `Sick call starts at 0730, Doc. The line starts at 0715.`, `If a pilot says "it's nothing," it's usually something.`],
      spring: [`Want a secret? The hearing booth just needs a new door seal. And about sixty budget points.`],
      summer: [`Hydrate, Doc. I'm telling you because nobody else listens.`],
      fall: [`People come in earlier since you started. That means they trust you.`],
      winter: [`Inspection's coming. I've started labeling things that already had labels.`],
    },
    scenes: [
      { hearts: 2, title: 'The application', lines: [`A stack of forms sits on the clinic counter.`, `Okafor: "Physician assistant program. I keep starting the essay and deleting it."`, `You offer to read a draft.`, `Okafor: "Really? Okay. Don't laugh at the part about the coffee pot."`] },
      { hearts: 4, title: 'The letter', lines: [`Okafor: "Doc. Would you write my letter of recommendation?"`, `You say yes before Okafor finishes the sentence.`, `Okafor: "I owe you a coffee. A real one. Not from that pot."`], perk: `Okafor has fresh coffee waiting every morning: +10 energy at the start of each day.` },
      { hearts: 6, title: 'The interview', lines: [`Okafor bursts into your office waving a printout.`, `Okafor: "They want to interview me! For PA school! Me!"`, `You spend the evening running mock interviews. Asked "why medicine," Okafor tells a story about talking a crew chief out of flying sick. It's a good answer.`] },
      { hearts: 8, title: 'One more year', lines: [`Okafor: "Report date is next fall. So I've got one more year to train my replacement."`, `Okafor: "I'm going to make them read every APL. Twice. Then clean the coffee pot."`, `Okafor: "Thanks, Doc. For treating me like part of the team, not part of the furniture."`], perk: `Okafor's triage is so good that you can ask one more history question per patient.` },
    ],
  },
  rivera: {
    title: 'CW3 Rivera', sub: 'Instructor pilot, Black Hawk',
    sched: [[360, 'gym'], [480, 'flight'], [1080, 'dfac'], [1200, 'gym']],
    lines: {
      any: [`Black Hawks don't fly themselves, Doc. Some days they try.`, `Come fly with us sometime. Flight Ops has the schedule.`],
      spring: [`Spring winds at Kestrel. Keeps the new pilots humble.`],
      summer: [`The cockpit hits 110 in summer. Bring water if you fly with us.`],
      fall: [`Everyone's tired since the schedule went to back-to-back cycles.`],
      winter: [`Cold mornings. Thick air. The aircraft love it.`],
    },
    scenes: [
      { hearts: 2, title: 'The logbook', lines: [`Rivera is sitting on the hangar steps with a worn logbook.`, `Rivera: "Four thousand hours. My first IP signed this page. Grumpiest person I ever met."`, `Rivera: "Now I'm the grumpy one. Funny how that works."`] },
      { hearts: 4, title: 'The honest answer', lines: [`Rivera: "Okay. Truth? My hands go numb on long flights. Has been for a while."`, `Rivera: "I didn't say anything. Figured you'd pull my wings."`, `You tell Rivera to come to sick call tomorrow. You'll look at it properly.`, `Rivera: "Huh. I should've said something a year ago."`], perk: `Flying with crews costs you less energy.`, schedule: { pid: 'rivera', caseId: 'hand-numb' } },
      { hearts: 6, title: 'The checkride', lines: [`Rivera: "I give checkrides all year. Taking my own still makes my palms sweat."`, `You quiz Rivera on emergency procedures over coffee until it's automatic.`, `Rivera passes the next day. Rivera: "Don't tell the students I was nervous."`] },
      { hearts: 8, title: 'Old wings', lines: [`Rivera pins a worn pair of aviator wings to your desk lamp.`, `Rivera: "My first IP gave me these. Said to pass them on to someone who keeps crews flying."`, `Rivera: "You're not a pilot. But you get it."`], perk: `The whole Assault battalion heard about the wings: their trust in you rises.`, effect: { unitTrust: ['assault', 6] } },
    ],
  },
  nguyen: {
    title: 'CPT Nguyen', sub: 'Apache pilot',
    sched: [[360, 'flight'], [1020, 'hq'], [1140, 'dfac']],
    lines: {
      any: [`I'm going for the instructor slot next year. So no, I can't be sick.`, `Apache pilots don't get tired, Doc. We get "mission focused."`],
      spring: [`New pilots in the battalion. They look twelve. Was I ever that young?`],
      summer: [`Gunnery in July. The front seat is a greenhouse.`],
      fall: [`Third late cycle this week. I'm fine. Totally fine.`],
      winter: [`After this year, I'm learning to say when I'm tired.`],
    },
    scenes: [
      { hearts: 2, title: 'Two seats', lines: [`Nguyen shows you the Apache's tandem cockpit.`, `Nguyen: "Gunner up front, pilot in back. You have to trust the person behind you completely."`, `Nguyen: "Kind of like with a doctor, I guess."`] },
      { hearts: 4, title: 'Off the clock', lines: [`Nguyen: "I booked leave. Actual leave. My mom cried."`, `Nguyen: "You were right about the sleep thing. Don't let it go to your head."`], perk: `Trust grows faster with the Attack battalion.` },
      { hearts: 6, title: 'The sleep log', lines: [`Nguyen shows you a battered notebook.`, `Nguyen: "Sleep log. Seven hours, three nights straight. Don't make a big deal out of it."`, `You make a small deal out of it. Nguyen pretends to be annoyed and fails.`] },
      { hearts: 8, title: 'Instructor', lines: [`Nguyen: "I got the instructor slot."`, `Nguyen: "First thing I'm teaching the new pilots: if the doc says you're tired, you're tired."`], perk: `The Attack battalion starts taking crew rest seriously: their trust in you rises.`, effect: { unitTrust: ['attack', 6] } },
    ],
  },
  brooks: {
    title: 'SGT Brooks', sub: 'Dustoff flight medic',
    sched: [[360, 'dfac'], [450, 'flight'], [1050, 'gym'], [1200, 'dfac']],
    lines: {
      any: [`Dustoff! The only taxi service with a hoist.`, `Need a hand at sick call? I'm cheaper than a med tech. I accept payment in donuts.`],
      summer: [`Hoist training in this heat should count as a sauna.`],
      fall: [`Mass-casualty drills next week. I hate how good we're getting at them.`],
      spring: [`Spring means bees on the flight line. I've got the EpiPens. Just saying.`],
      winter: [`Cold-weather kit check. I found three left gloves and zero right ones.`],
    },
    scenes: [
      { hearts: 2, title: 'The aid bag', lines: [`Brooks: "Want to see the aid bag? Everything has a place. Even the tape has a place."`, `Brooks shows you every pocket, proudly.`, `Brooks: "If we're ever on scene together, I'll hand you stuff before you ask."`] },
      { hearts: 4, title: 'The first call', lines: [`Brooks, quietly: "First medevac I ever flew, I froze for a second."`, `Brooks: "My instructor said a second is fine. It's the next one that counts."`, `Brooks: "I think about that a lot. Anyway. Donut?"`], perk: `Trust grows faster with Dustoff company.` },
      { hearts: 6, title: 'Meet Gerald', lines: [`Brooks formally introduces you to Gerald, the hoist training dummy.`, `Brooks: "Gerald has been rescued 412 times. Gerald has never once said thank you."`, `Brooks: "The Dustoff crews voted. You're an honorary member. You get a patch and Gerald's respect."`] },
      { hearts: 8, title: 'Why the jokes', lines: [`Brooks: "You know why I joke all the time?"`, `Brooks: "Because the calls that aren't funny are really not funny. Laughing keeps the bag packed."`, `Brooks: "Thanks for laughing at my bad jokes, Doc. Even the Gerald ones."`], perk: `Dustoff company trusts you like one of their own.`, effect: { unitTrust: ['dustoff', 6] } },
    ],
  },
  park: {
    title: 'COL Park', sub: 'Brigade commander',
    look: { skin: '#e0ac85', hair: '#d8d8d8', uniform: 'ocp' },
    sched: [[360, 'gym'], [480, 'hqdesk'], [1140, 'quarters']],
    lines: {
      any: [`Readiness is a number, Doc. Behind it are people. Don't let me forget that.`, `Brief me Fridays. Bring the truth, not just slides.`],
      spring: [`This brigade is proud. Sometimes too proud to see a doctor.`],
      summer: [`Heat is my number one worry this summer. Keep them safe.`],
      fall: [`The ops tempo is high. I know. We're short pilots.`],
      winter: [`The inspection is on the last day of winter. Make me proud. Or at least make me look prepared.`],
    },
    scenes: [
      { hearts: 2, title: 'The old photo', lines: [`COL Park is looking at a framed photo of an old aircrew.`, `Park: "My first platoon. Our flight surgeon grounded me once, and I was furious for a week."`, `Park: "Turned out to be a kidney stone. They were right."`] },
      { hearts: 4, title: 'Straight talk', lines: [`Park: "When you got here, I thought you'd ground half my brigade."`, `Park: "You grounded the right ones. I've told the battalion commanders to listen to you."`], perk: `+10 clinic budget at each weekly brief.` },
      { hearts: 6, title: 'The red pen', lines: [`COL Park has the flight schedule spread across the desk, red pen in hand.`, `Park: "You keep telling me sleep is a safety system. Show me where to cut."`, `You spend an hour moving cycles around. Park signs it without changing a line.`], perk: `Command confidence rises.`, effect: { command: 5 } },
      { hearts: 8, title: 'An appointment', lines: [`Park: "This is my last command. I retire next summer."`, `Park: "Thirty years of being too proud to see a doctor. I made an appointment for a real physical."`, `Park: "Don't look so smug, Doc."`], effect: { command: 5 } },
    ],
  },
  bell: {
    title: 'Chaplain Bell', sub: 'Brigade chaplain',
    look: { skin: '#c68863', hair: '#7a7a7a', uniform: 'ocp' },
    sched: [[360, 'chapel'], [720, 'dfac'], [800, 'chapel']],
    lines: {
      any: [`The chapel is open to everyone, Doc. Even just for sitting.`, `I hear a lot of things. I keep all of them.`],
      spring: [`Spring is a good season for fresh starts. Even for clinics.`],
      summer: [`Hot days make short tempers. My door is cool and quiet.`],
      fall: [`Since the hard landing, a lot of people have stopped by. You can too.`],
      winter: [`The holidays are hard for some of our folks. Keep an eye out.`],
    },
    scenes: [
      { hearts: 2, title: 'Two cups', lines: [`Chaplain Bell is on the chapel bench with two cups of tea.`, `Bell: "I always make two. Someone usually turns up."`, `You sit. Neither of you says much. It's nice.`] },
      { hearts: 4, title: 'Who heals the healer', lines: [`Bell: "You carry a lot of other people's worries, Doc."`, `Bell: "Where do you put yours?"`, `You talk for a while. It helps more than you expected.`], perk: `Quiet moments at the chapel restore more energy.` },
      { hearts: 6, title: 'An unsigned card', lines: [`Bell: "Somebody left this on the bench for you."`, `It's a thank-you card addressed to "the doc." Unsigned.`, `Bell: "I don't know who it's from. I suspect it's from a few people."`] },
      { hearts: 8, title: 'Your mug', lines: [`Bell hands you tea in a mug with your name painted on it.`, `Bell: "You're a regular now. Regulars get mugs."`, `Bell: "Rest isn't a reward for finishing the work, Doc. It's part of the work."`], perk: `Your max energy goes up by 10.`, effect: { maxE: 10 } },
    ],
  },
};
