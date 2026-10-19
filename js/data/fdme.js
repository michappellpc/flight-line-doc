// Flight Line Doc: FDME (annual Flight Duty Medical Examination) findings.
//
// FOR CLINICAL REVIEW. Set reviewed to a date once checked.
// About half of FDMEs are normal. The rest get one of these findings.
//   q          what the aviator says on the questionnaire (always visible)
//   key        the check that reveals the finding (null = the questionnaire already gives it away)
//   needs      clinic upgrade required to do that check
//   checks     results that differ from normal for this finding
//   correct    'fly' (qualified) | 'down' (short down slip, fix and recheck) | 'waiver' (down slip + workup/waiver)
//   ok         other acceptable decisions
window.FLD = window.FLD || {};

FLD.FDME_CHECKS = {
  bp:      { name: 'Recheck blood pressure' },
  vision:  { name: 'Detailed vision test', needs: 'vision' },
  hearing: { name: 'Audiogram', needs: 'booth' },
  meds:    { name: 'Medication and supplement review' },
  labs:    { name: 'Labs', needs: 'lab' },
  sleep:   { name: 'Sleep questionnaire' },
};

FLD.FDME_NORMAL = {
  q: `"No changes since last year."`,
  checks: {
    bp: 'BP 122/78, recheck 120/76.',
    vision: '20/20 in each eye. Normal color and depth perception.',
    hearing: 'Within standards in both ears.',
    meds: 'No medications or supplements.',
    labs: 'All normal.',
    sleep: 'Sleeps about 7 hours. No snoring or daytime sleepiness.',
  },
  teach: 'Most FDMEs are routine. A careful normal exam is still valuable: it is the baseline for next year.',
};

FLD.FDME = [
  {
    id: 'htn', title: 'High blood pressure', key: 'bp',
    q: `"No complaints. Maybe some headaches."`,
    checks: { bp: 'BP 158/98, recheck 154/96.' },
    correct: 'waiver', ok: ['down'],
    teach: 'Blood pressure above aeromedical limits needs evaluation and control before an up slip. Controlled hypertension on approved medications is commonly waivered.',
    source: 'Hypertension in aircrew. Check the current Army APL for limits and approved medications.',
    reviewed: null,
  },
  {
    id: 'diphen', title: 'Nightly sedating sleep aid', key: 'meds',
    q: `"Sleep has been rough. I take a little something."`,
    checks: { meds: 'Diphenhydramine every night for a month, "to sleep."' },
    correct: 'down',
    teach: 'Sedating medications must be stopped, with a washout before flying. Then deal with the sleep problem itself.',
    source: 'Sedating medications in aircrew. Check Army APLs.',
    reviewed: null,
  },
  {
    id: 'ssri', title: 'New antidepressant', key: 'meds',
    q: `"I started a new medication from my family doctor last month."`,
    checks: { meds: 'Sertraline 50 mg daily, started 4 weeks ago by an off-post provider.' },
    correct: 'waiver', ok: ['down'],
    teach: 'Starting an antidepressant requires grounding, a stability period and an aeromedical waiver. Certain SSRIs are waiverable once stable. Thank them for being honest.',
    source: 'Antidepressant (SSRI) waiver policy. Check the current Army APL.',
    reviewed: null,
  },
  {
    id: 'lorat', title: 'Approved allergy medicine', key: 'meds',
    q: `"Same as last year. I take my allergy pill in the spring."`,
    checks: { meds: 'Loratadine daily in spring. Ground-tested last year with no side effects.' },
    correct: 'fly',
    teach: 'An approved non-sedating antihistamine with a successful ground trial is compatible with flying.',
    source: 'Approved antihistamines. Check the current Army APL list.',
    reviewed: null,
  },
  {
    id: 'glasses', title: 'Vision decline, correctable', key: 'vision', needs: 'vision',
    q: `"Road signs have been blurrier lately."`,
    checks: { vision: 'Uncorrected 20/40 in each eye. Corrects to 20/20 with lenses.' },
    correct: 'fly',
    teach: 'Vision that corrects to standard is usually qualifying, with a requirement to wear corrective lenses while flying. Order aviation spectacles.',
    source: 'Visual acuity standards for aircrew. Check AR 40-501 and the APLs for the exact class limits.',
    reviewed: null,
  },
  {
    id: 'hearing', title: 'Hearing threshold shift', key: 'hearing', needs: 'booth',
    q: `"Nothing new. My spouse says I have the TV loud."`,
    checks: { hearing: 'Significant threshold shift at 4000 Hz in both ears.' },
    correct: 'waiver', ok: ['down'],
    teach: 'Hearing loss beyond standards needs audiology evaluation and possibly a waiver. Re-emphasize hearing protection: rotor noise is relentless.',
    source: 'Hearing standards and noise-induced hearing loss. Check AR 40-501 and the APLs.',
    reviewed: null,
  },
  {
    id: 'a1c', title: 'High blood sugar', key: 'labs', needs: 'lab',
    q: `"I'm thirsty a lot. Probably the energy drinks."`,
    checks: { labs: 'Fasting glucose 142 mg/dL, HbA1c 6.9%.' },
    correct: 'waiver', ok: ['down'],
    teach: 'A new diabetes diagnosis needs workup and grounding. Some aviators return on diet control or approved medications with a waiver.',
    source: 'Diabetes in aircrew. Check the current Army APL.',
    reviewed: null,
  },
  {
    id: 'osa', title: 'Possible sleep apnea', key: 'sleep',
    q: `"I'm always tired. Probably just getting old."`,
    checks: { sleep: 'Loud snoring, witnessed pauses in breathing, dozes off in briefs.', bp: 'BP 138/88, recheck 136/86.' },
    correct: 'waiver', ok: ['down'],
    teach: 'Suspected sleep apnea needs a sleep study and treatment. Untreated, it causes daytime sleepiness, a real flight hazard.',
    source: 'Obstructive sleep apnea in aircrew. Check the current Army APL.',
    reviewed: null,
  },
  {
    id: 'dmaa', title: 'Banned supplement', key: 'meds',
    q: `"Just my pre-workout. Got it online."`,
    checks: { meds: 'Pre-workout powder listing DMAA (1,3-dimethylamylamine).', bp: 'BP 136/86, recheck 134/84.' },
    correct: 'down',
    teach: 'DMAA is prohibited for service members and linked to serious cardiac events. Stop it, recheck, and talk about supplements. Operation Supplement Safety (OPSS) is a good resource.',
    source: 'DMAA and dietary supplements (DoD Operation Supplement Safety). Check current guidance.',
    reviewed: null,
  },
  {
    id: 'stone-hx', title: 'Recent kidney stone', key: null,
    q: `"I passed a kidney stone over Christmas leave. All good now."`,
    checks: {},
    correct: 'waiver', ok: ['down'],
    teach: 'A history of kidney stones in an aviator needs imaging and aeromedical review, even if the stone passed.',
    source: 'Nephrolithiasis in aircrew. Check the current Army APL.',
    reviewed: null,
  },
];
