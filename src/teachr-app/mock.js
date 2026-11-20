/* Teachr mock dataset (SPEC D1). Single source for every number the app
 * shows — the dashboard charts (charts.jsx), the assistant's drills (E1)
 * and the copy all read from here, so a number can never drift between
 * panels. Loaded as a classic script before charts.js/wizard.js; consumed
 * via window.TEACHR_DATA.
 *
 * Consistency rules (D3 probe enforces):
 *   - market learners == the demographics chart's per-market totals
 *   - gender split is computed from the market rows, not hand-written
 *   - age and migrant rows sum to the same total headcount
 *   - averages (completion, performance) are computed, never typed */
window.TEACHR_DATA = (() => {

const LANGUAGES = [
    { id: "en",  label: "English", native: "English" },
    { id: "hi",  label: "Hindi",   native: "हिंदी" },
    { id: "ta",  label: "Tamil",   native: "தமிழ்" },
];

// Top 20 factory production countries (by manufacturing output).
const COUNTRIES = [
    { flag: "🇨🇳", label: "China" },
    { flag: "🇺🇸", label: "United States" },
    { flag: "🇯🇵", label: "Japan" },
    { flag: "🇩🇪", label: "Germany" },
    { flag: "🇮🇳", label: "India" },
    { flag: "🇰🇷", label: "South Korea" },
    { flag: "🇮🇹", label: "Italy" },
    { flag: "🇫🇷", label: "France" },
    { flag: "🇬🇧", label: "United Kingdom" },
    { flag: "🇧🇷", label: "Brazil" },
    { flag: "🇮🇩", label: "Indonesia" },
    { flag: "🇲🇽", label: "Mexico" },
    { flag: "🇷🇺", label: "Russia" },
    { flag: "🇹🇷", label: "Turkey" },
    { flag: "🇧🇩", label: "Bangladesh" },
    { flag: "🇻🇳", label: "Vietnam" },
    { flag: "🇹🇭", label: "Thailand" },
    { flag: "🇵🇭", label: "Philippines" },
    { flag: "🇪🇬", label: "Egypt" },
    { flag: "🇵🇰", label: "Pakistan" },
];

/* Demographics — people trained per market (D1), split by gender. Row
 * totals equal MARKET_COMPLETION.learners market by market, and the four
 * demographic views (market, gender, age, migrant) all sum to the same
 * total headcount. */
const MARKET_DEMOGRAPHICS = [
    { country: "Vietnam",     female: 2350, male: 480,  other: 30 },
    { country: "Indonesia",   female: 1950, male: 620,  other: 25 },
    { country: "Philippines", female: 505,  male: 125,  other: 10 },
    { country: "India",       female: 950,  male: 580,  other: 15 },
    { country: "Thailand",    female: 310,  male: 95,   other: 6 },
    { country: "Bangladesh",  female: 980,  male: 330,  other: 10 },
    { country: "Cambodia",    female: 240,  male: 55,   other: 5 },
    { country: "Türkiye",     female: 130,  male: 230,  other: 8 },
];

/* Demographics — age group (rows sum to the total headcount). */
const AGE_GROUPS = [
    { age: "15-19", female: 150,  male: 100, other: 4 },
    { age: "20-24", female: 1630, male: 605, other: 30 },
    { age: "25-29", female: 1410, male: 530, other: 24 },
    { age: "30-34", female: 1260, male: 475, other: 20 },
    { age: "35-39", female: 1040, male: 350, other: 14 },
    { age: "40-44", female: 815,  male: 255, other: 9 },
    { age: "45-49", female: 665,  male: 150, other: 5 },
    { age: "50-54", female: 445,  male: 50,  other: 3 },
];

/* Demographics — migrant status (rows sum to the total headcount). */
const MIGRANT_STATUS = [
    { status: "Domestic workers",         female: 7100, male: 1950, other: 100 },
    { status: "Domestic migrant workers", female: 225,  male: 260,  other: 5 },
    { status: "Foreign migrant workers",  female: 88,   male: 299,  other: 3 },
    { status: "Unknown",                  female: 2,    male: 6,    other: 1 },
];

/* Activity — 12 weeks of lessons completed (D1). The dashboard chart and
 * the assistant's weekly diagram both read this; the assistant shows the
 * last 6 weeks. */
const WEEKS = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
const WEEKLY_ACTIVITY = [
    180, 205, 210, 240, 260, 240, 270, 295, 310, 330, 350, 330,
];
const NEW_LEARNERS_30D = 340;

/* Series colours — one definition shared by the Nivo charts and the HTML
 * legends (the C3 dimming matches on these exact values). */
const GENDER_COLORS = { female: "#14A08D", male: "#8AD8CC", other: "#E5E7EB" };

// Registration wizard — 11 steps, matching the reference screenshots.
const REG_STEPS = [
    {
        id: "name",
        label: "Name",
        type: "text",
        title: "What is your name?",
        subtitle: "It will be printed on your certificate.",
        placeholder: "Pedro",
    },
    {
        // R8 B17: the Worker ID step — the same text treatment, validated
        // (min 3, max 30, no special symbols).
        id: "workerId",
        label: "Worker ID",
        type: "text",
        title: "What is your Worker ID?",
        subtitle: "It's on your factory badge.",
        placeholder: "WP-2049",
    },
    {
        id: "age",
        label: "Age",
        type: "choice",
        title: "How old are you?",
        options: [
            { label: "15-19" }, { label: "20-24" }, { label: "25-29" },
            { label: "30-34" }, { label: "35-39" }, { label: "40-49" }, { label: "50+" },
        ],
    },
    {
        id: "country",
        label: "Country",
        type: "search",
        title: "Which country are you from?",
        searchPlaceholder: "Search country",
        options: COUNTRIES,
    },
    {
        id: "education",
        label: "Education",
        type: "choice",
        title: "What is your highest education?",
        options: [
            { label: "Primary school", sub: "Basic education" },
            { label: "Secondary school", sub: "High school or equivalent" },
            { label: "Vocational training", sub: "Trade or technical school" },
            { label: "University degree", sub: "Bachelor or higher" },
        ],
    },
    {
        id: "experience",
        label: "Experience",
        type: "choice",
        title: "How long have you worked in this industry?",
        options: [
            { label: "Less than 1 year" },
            { label: "1-3 years" },
            { label: "4-10 years" },
            { label: "More than 10 years" },
        ],
    },
    {
        id: "jobLevel",
        label: "Job level",
        type: "choice",
        title: "What is your job level?",
        options: [
            { label: "Junior staff", sub: "New worker or just starting out" },
            { label: "Senior staff", sub: "Experienced worker, not a manager" },
            { label: "Team leader / supervisor / manager", sub: "You guide or manage other people" },
            { label: "Director / senior manager", sub: "Executive or top manager" },
        ],
    },
    {
        id: "department",
        label: "Department",
        type: "choice",
        title: "What is your department?",
        options: [
            { label: "Production", sub: "Operations, factory worker, field or farm worker" },
            { label: "Facility management", sub: "Janitorial technicians, security staff, front desk worker" },
            { label: "Human resources (HR)", sub: "Recruiter, HR specialist, talent manager" },
            { label: "Logistics & shipping", sub: "Driver, warehouse worker, transport staff, fulfillment manager" },
        ],
    },
    {
        id: "site",
        label: "Workplace",
        type: "choice",
        title: "Where do you usually work?",
        options: [
            { label: "On site", sub: "Factory, warehouse, field or store" },
            { label: "In an office", sub: "Desk-based workplace" },
            { label: "Mixed", sub: "Both on site and in an office" },
            { label: "Remote / on the road", sub: "Travelling or home-based" },
        ],
    },
    {
        id: "shift",
        label: "Shift",
        type: "choice",
        title: "What shift do you usually work?",
        options: [
            { label: "Day shift" },
            { label: "Night shift" },
            { label: "Rotating shifts" },
            { label: "Flexible hours" },
        ],
    },
    {
        id: "priorTraining",
        label: "Prior training",
        type: "choice",
        title: "Have you completed a training like this before?",
        options: [
            { label: "Yes", sub: "I have completed workplace training before" },
            { label: "No", sub: "This is my first time" },
        ],
    },
    {
        id: "review",
        type: "review",
        title: "You are all set!",
        subtitle: "Check your details before starting your training.",
    },
];

const LESSONS = [
    {
        id: "access",
        // R9 IMG-0: cover — Unsplash, free license, photo by EqualStock
        cover: "https://images.unsplash.com/photo-1748944079305-8d2a86e7ad32?auto=format&fit=crop&w=1200&q=80",
        title: "Course 01",
        subtitle: "Site Access & Visitors",
        description: "Learn who can enter the factory, how visitors are registered, and why badges are personal.",
        duration: "5 min",
        videos: [
            // R8 B9: real names + honest durations (the "0:02" two-second
            // read was a placeholder lie; the display runs minutes now).
            // R9 IMG: poster field — Unsplash, free license; the player
            // renders it over the owl field (onerror → the placeholder).
            { before: 0, name: "Watch: Badges and gate access", duration: "2:40",
              // photo by Jakub Żerdzicki — an access card reader at a door
              // R11-2: portrait crops (9:16, w=810&h=1440) — the vertical
              // player (DR-T22) needs a vertical field.
              poster: "https://images.unsplash.com/photo-1754494977436-a5c202306fe4?auto=format&fit=crop&w=810&h=1440&q=80" },
            { before: 2, name: "Watch: Visitors on site", duration: "3:15",
              // photo by Zac Durant — people walking a hallway
              poster: "https://images.unsplash.com/photo-1542471439908-03b26eb34f45?auto=format&fit=crop&w=810&h=1440&q=80" },
            { before: 4, name: "Watch: If something looks wrong", duration: "2:05",
              // photo by Centre for Ageing Better — warehouse workers, one with a clipboard (reporting)
              poster: "https://images.unsplash.com/photo-1664382953403-fc1ac77073a0?auto=format&fit=crop&w=810&h=1440&q=80" },
        ],
        status: "active",
        questions: [
            {
                title: "Who is allowed to let visitors into the factory?",
                correct: 1,
                options: [
                    { label: "Any employee who has completed the site induction — escorts are only needed for first-time visitors." },
                    { label: "Only authorised escorts — visitors must be registered and accompanied at all times." },
                    { label: "Any colleague with a spare badge." },
                    { label: "Nobody — visitors are never allowed in the factory." },
                ],
            },
            {
                title: "A stranger follows you through the staff entrance. What should you do?",
                correct: 1,
                options: [
                    { label: "Let them in and mention it at the next shift handover — extra people walk through all day anyway." },
                    { label: "Close the door, do not let them in, and report it to security." },
                    { label: "Ask them to sign a paper note." },
                ],
            },
            {
                title: "When is it OK to lend your access badge to a colleague?",
                correct: 0,
                options: [
                    { label: "Never — badges are personal and must not be shared." },
                    { label: "During lunch breaks." },
                    { label: "If a colleague forgot theirs and asks before the shift starts." },
                ],
            },
            {
                title: "You see an unattended bag in the corridor. What should you do?",
                correct: 2,
                options: [
                    { label: "Ignore it, someone will come back for it." },
                    { label: "Put it in the lost and found." },
                    { label: "Do not touch it and inform security immediately." },
                ],
            },
            {
                title: "Who is responsible for internal security in the factory?",
                correct: 1,
                options: [
                    { label: "Only the security guards." },
                    { label: "Everyone, every day." },
                    { label: "Only the site manager." },
                ],
            },
        ],
    },
    {
        id: "storage",
        // R9 IMG-0: cover — Unsplash, free license, photo by Vida Huang (@rebylulu)
        cover: "https://images.unsplash.com/photo-1741655262435-4890ab9918fa?auto=format&fit=crop&w=1200&q=80",
        title: "Course 01",
        subtitle: "Machines & Storage Security",
        description: "Keep tools, chemicals and storage areas secure — and know what to do when something is missing.",
        duration: "7 min",
        status: "locked",
        questions: [
            {
                title: "You finish your shift and your machine is still running. What do you do?",
                correct: 1,
                options: [
                    { label: "Leave it — the next shift will use it anyway." },
                    { label: "Lock it out and tag it before handing over." },
                    { label: "Ask a colleague to watch it until someone comes." },
                ],
            },
            {
                title: "A chemical container has no label. What is the right move?",
                correct: 2,
                options: [
                    { label: "Label it yourself from the drum’s colour." },
                    { label: "Pour it into a spare drum and label it yourself from the delivery note." },
                    { label: "Do not use it and report the unlabelled container to your supervisor." },
                ],
            },
            {
                title: "Tools go missing from the shared tool wall. What helps most?",
                correct: 0,
                options: [
                    { label: "A check-out sheet so every tool has an owner at all times." },
                    { label: "Ordering more tools so there is always a spare set on hand." },
                    { label: "Locking the tool wall and stopping shared use." },
                ],
            },
            {
                title: "Who may enter the chemical storage room?",
                correct: 1,
                options: [
                    { label: "Anyone who has first-aid training and works inside the production area." },
                    { label: "Only trained and authorised staff — the door stays locked otherwise." },
                    { label: "Anyone accompanied by any colleague." },
                ],
            },
        ],
    },
    {
        id: "information",
        // R9 IMG-0: cover — Unsplash, free license, photo by Hennie Stander
        cover: "https://images.unsplash.com/photo-1619037318263-5899a359e504?auto=format&fit=crop&w=1200&q=80",
        title: "Course 01",
        subtitle: "Passwords & Information",
        description: "Protect workstations, shared screens and passwords from people who should not see them.",
        duration: "6 min",
        status: "locked",
        questions: [
            {
                title: "You leave your workstation for a break. What do you do with your screen?",
                correct: 1,
                options: [
                    { label: "Leave it open — the break is short and someone is waiting." },
                    { label: "Lock it — every time, even for a minute." },
                    { label: "Turn the monitor off only." },
                ],
            },
            {
                title: "A caller says they are from IT and asks for your password. What do you do?",
                correct: 0,
                options: [
                    { label: "Refuse — IT never asks for your password — and report the call." },
                    { label: "Give it — the caller already knows your employee number and sounds credible." },
                    { label: "Write it down and keep it in your drawer." },
                ],
            },
            {
                title: "What makes a strong password?",
                correct: 2,
                options: [
                    { label: "Your name, your birth year, and the site where you work." },
                    { label: "The same one everywhere, so you remember it." },
                    { label: "Long, unique, and not guessable from your personal details." },
                ],
            },
            {
                title: "Production data is left printed on the shared printer. What now?",
                correct: 1,
                options: [
                    { label: "Leave it for now — whoever printed it is probably coming back for it." },
                    { label: "Remove it, keep it safe, and tell the owner or your supervisor." },
                    { label: "Bin it — printed paper is not sensitive." },
                ],
            },
        ],
    },
    {
        id: "contractors",
        // R9 IMG-0: cover — Unsplash, free license, photo by shraga kopstein
        cover: "https://images.unsplash.com/photo-1653280662710-1cac52cde6d7?auto=format&fit=crop&w=1200&q=80",
        title: "Course 01",
        subtitle: "Contractors & Third Parties",
        description: "Working safely alongside contractors, suppliers and auditors — and holding them to the same rules.",
        duration: "6 min",
        status: "locked",
        questions: [
            {
                title: "A contractor arrives to repair a machine. What must happen first?",
                correct: 1,
                options: [
                    { label: "They start at once and sign the visitor sheet afterwards — the repair cannot wait." },
                    { label: "Check-in, badge issue, and a safety briefing with their escort." },
                    { label: "A verbal OK from anyone on the floor." },
                ],
            },
            {
                title: "A supplier asks to photograph the production line. Who decides?",
                correct: 0,
                options: [
                    { label: "Only authorised management — after the visitor rules are followed." },
                    { label: "The line supervisor on the spot." },
                    { label: "Anyone, as long as no workers are in the shot." },
                ],
            },
            {
                title: "Contractor workers bypass a safety barrier to work faster. What do you do?",
                correct: 2,
                options: [
                    { label: "Nothing — they are not your colleagues." },
                    { label: "Wait and bring it up at the next weekly safety meeting." },
                    { label: "Stop them if safe, and report it to your supervisor immediately." },
                ],
            },
        ],
    },
    {
        id: "incident",
        // R9 IMG-0: cover — Unsplash, free license, photo by Jakub Żerdzicki
        cover: "https://images.unsplash.com/photo-1754039985017-92baef8ae63b?auto=format&fit=crop&w=1200&q=80",
        title: "Course 01",
        subtitle: "Incident Reporting",
        description: "See it, report it: near-misses, accidents and unsafe conditions — and why every report counts.",
        duration: "5 min",
        status: "locked",
        questions: [
            {
                title: "A near-miss happens — nobody is hurt. Is reporting it worth it?",
                correct: 0,
                options: [
                    { label: "Yes — near-misses are the earliest warning of the next accident." },
                    { label: "No — only real accidents need reports." },
                    { label: "Only if a manager or the safety officer saw it happen too." },
                ],
            },
            {
                title: "What belongs in an incident report?",
                correct: 2,
                options: [
                    { label: "Only the name of the person to blame." },
                    { label: "The names of everyone involved, what happened, and who you think was really at fault." },
                    { label: "What happened, when, where, who was involved, and what was done — facts, not blame." },
                ],
            },
            {
                title: "You report an unsafe condition. Nothing changes for a week. What now?",
                correct: 1,
                options: [
                    { label: "Drop it — the report was already filed and chasing it is not your job." },
                    { label: "Follow up with your supervisor — an unresolved report is still a live risk." },
                    { label: "Fix it yourself, even without training or authorisation." },
                ],
            },
        ],
    },
    {
        id: "emergency",
        // R9 IMG-0: cover — Unsplash, free license, photo by sol
        // (re-curated twice at user review: a group on the stairs — the
        // evacuation / office-drill reading)
        cover: "https://images.unsplash.com/photo-1516216628859-9bccecab13ca?auto=format&fit=crop&w=1200&q=80",
        title: "Course 01",
        subtitle: "Emergency Response",
        description: "Know the alarm signals, exits and assembly points — before you need them.",
        duration: "4 min",
        status: "done",
        questions: [
            {
                title: "The evacuation alarm sounds. What do you do first?",
                correct: 1,
                options: [
                    { label: "Take your personal belongings with you and leave by the main entrance." },
                    { label: "Stop work, leave by the nearest exit, go to the assembly point." },
                    { label: "Wait for instructions on the loudspeaker." },
                ],
            },
            {
                title: "A colleague cannot find the assembly point. What helps them most?",
                correct: 2,
                options: [
                    { label: "A map emailed once a year." },
                    { label: "Exit signs are for visitors — staff follow the marked routes." },
                    { label: "Practised drills and clearly signed routes to the assembly point." },
                ],
            },
            {
                title: "The exit route is blocked by stacked pallets. What is this?",
                correct: 0,
                options: [
                    { label: "A live hazard — report it now; a blocked exit costs minutes in a fire." },
                    { label: "Normal during peak production weeks — pallets are moved again as soon as the shift ends." },
                    { label: "Only a problem during a drill." },
                ],
            },
        ],
    },
];

const MARKET_COMPLETION = [
    { market: "Vietnam",     pct: 90, learners: 2860, overdue: 4 },
    { market: "Indonesia",   pct: 87, learners: 2595, overdue: 6 },
    { market: "Philippines", pct: 83, learners: 640,  overdue: 9 },
    { market: "India",       pct: 80, learners: 1545, overdue: 11 },
    { market: "Thailand",    pct: 81, learners: 411,  overdue: 3 },
    { market: "Bangladesh",  pct: 79, learners: 1320, overdue: 14 },
    { market: "Cambodia",    pct: 78, learners: 300,  overdue: 5 },
    { market: "Türkiye",     pct: 58, learners: 368,  overdue: 22 },
];
const AVG_COMPLETION = Math.round(
    MARKET_COMPLETION.reduce((s, m) => s + m.pct * m.learners, 0) /
    MARKET_COMPLETION.reduce((s, m) => s + m.learners, 0)
);
const SHIFT_COMPLETION = [
    { shift: "Day shifts",      pct: 89 },
    { shift: "Rotating shifts", pct: 82 },
    { shift: "Night shifts",    pct: 71 },
];
const OVERDUE_TEAMS = [
    { team: "Machines & Storage, night shift",    overdue: 12 },
    { team: "Site Access, contractors",           overdue: 9 },
    { team: "Passwords & Information, warehouse", overdue: 7 },
];
const MONTHLY_TREND = [["May", 78], ["Jun", 79], ["Jul", 80], ["Aug", 81], ["Sep", 82], ["Oct", 84]];
const LESSON_AVG = [
    { lesson: "Site Access & Visitors",         pct: 92 },
    { lesson: "Emergency Response",             pct: 90 },
    { lesson: "Machines & Storage Security",    pct: 87 },
    { lesson: "Passwords & Information",        pct: 84 },
    { lesson: "Contractors & Third Parties",    pct: 81 },
    { lesson: "Incident Reporting",             pct: 78 },
];
const JOB_LEVELS = [
    { level: "Junior staff",            pct: 46 },
    { level: "Senior staff",            pct: 31 },
    { level: "Team leads & managers",   pct: 17 },
    { level: "Directors",               pct: 6 },
];
const KEY_MESSAGE_SCORES = [
    { message: "Child labour remediation & grievance", pct: 91 },
    { message: "Child rights",                         pct: 90 },
    { message: "Young workers",                        pct: 89 },
    { message: "Age verification",                     pct: 88 },
    { message: "Minimum age of employment",            pct: 87 },
    { message: "Recruitment of young workers",         pct: 86 },
    { message: "Understanding child labor",            pct: 85 },
];
const AVG_PERFORMANCE = Math.round(
    KEY_MESSAGE_SCORES.reduce((s, m) => s + m.pct, 0) / KEY_MESSAGE_SCORES.length
);

/* Derived values — computed once, here, so no consumer re-derives (or
 * mis-derives) them. */
const TOTAL_LEARNERS = MARKET_DEMOGRAPHICS.reduce(
    (s, m) => s + m.female + m.male + m.other, 0);
const GENDER_SPLIT = {
    female: Math.round((MARKET_DEMOGRAPHICS.reduce((s, m) => s + m.female, 0) / TOTAL_LEARNERS) * 100),
    male: Math.round((MARKET_DEMOGRAPHICS.reduce((s, m) => s + m.male, 0) / TOTAL_LEARNERS) * 100),
    other: 100 - Math.round((MARKET_DEMOGRAPHICS.reduce((s, m) => s + m.female, 0) / TOTAL_LEARNERS) * 100)
        - Math.round((MARKET_DEMOGRAPHICS.reduce((s, m) => s + m.male, 0) / TOTAL_LEARNERS) * 100),
};

/* Per-lesson completion history (D1): 12 weeks per lesson, generated from
 * the lesson's current average with a deterministic week/market wobble —
 * no hand-typed matrices. The heatmap renders the last 6 weeks. */
const LESSON_COMPLETION_HISTORY = LESSON_AVG.map((l, i) => ({
    lesson: l.lesson,
    weeks: WEEKS.map((w, j) => {
        const wobble = ((i * 5 + j * 7) % 11) - 5;
        return Math.max(50, Math.min(100, l.pct - 6 + wobble + (j > 6 ? 4 : 0)));
    }),
}));

/* Training plans (SPEC M3/M4). A plan groups courses for an audience, with
 * a deadline; progress rolls up from REQUIRED courses only (M4) — optional
 * courses are documented supplementally, never counted. `done` per course
 * is the share of the cohort that finished it (0–100). Deadlines are ISO
 * dates computed at load (day offsets), so the seeded on-track/overdue
 * states stay deterministic on any run date. */
const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays) => new Date(Date.now() + offsetDays * day).toISOString().slice(0, 10);
const PLANS = [
    {
        id: "onboarding-security",
        title: "New hire onboarding — security basics",
        audience: "Warehouse staff, first 90 days",
        deadline: iso(45),
        courses: [
            { lesson: "access", required: true, done: 78 },
            { lesson: "information", required: true, done: 54 },
            { lesson: "storage", required: false, done: 31 },
        ],
    },
    {
        id: "contractor-refresh",
        title: "Contractor & incident refresher",
        audience: "Site access teams — annual refresh",
        deadline: iso(-3),
        courses: [
            { lesson: "contractors", required: true, done: 66 },
            { lesson: "incident", required: true, done: 22 },
        ],
    },
];

return window.TEACHR_DATA = {
    LANGUAGES, COUNTRIES, REG_STEPS, LESSONS,
    MARKET_COMPLETION, AVG_COMPLETION, MARKET_DEMOGRAPHICS, AGE_GROUPS,
    MIGRANT_STATUS, GENDER_SPLIT, TOTAL_LEARNERS,
    SHIFT_COMPLETION, OVERDUE_TEAMS, JOB_LEVELS,
    MONTHLY_TREND, WEEKS, WEEKLY_ACTIVITY, NEW_LEARNERS_30D,
    LESSON_AVG, LESSON_COMPLETION_HISTORY,
    KEY_MESSAGE_SCORES, AVG_PERFORMANCE, GENDER_COLORS,
    PLANS,
};
})();
