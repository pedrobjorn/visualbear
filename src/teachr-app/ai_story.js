/* SPEC workstream L — the demo story: a choose-your-own-adventure script
 * for the Teachr Assistant. Conversations open on chapter 0 (the empty
 * state with prompt options — the assistant never speaks first); the first
 * prompt starts P0, the broad headline. The drawer resumes the standing
 * beat (shared progress pointer in wizard.js). Nodes are data; the engine
 * (storySeed / storyAnswerFor) lives in wizard.js.
 * Every text quotes dataset numbers only (window.TEACHR_DATA — the D3 rule). */
window.TEACHR_STORY = (() => {
    const D = window.TEACHR_DATA;
    const byPct = [...D.MARKET_COMPLETION].sort((a, b) => b.pct - a.pct);
    const top = byPct[0];
    const bottom = byPct[byPct.length - 1];
    const weakestMsg = [...D.KEY_MESSAGE_SCORES].sort((a, b) => a.pct - b.pct)[0];
    const overdueTop = D.OVERDUE_TEAMS[0];
    const trend = D.MONTHLY_TREND;
    const gain = trend[trend.length - 1][1] - trend[0][1];
    const course = D.LESSONS.find((l) => l.title === "Course 01") || D.LESSONS[0];

    /* Graph: spine P0 → P1 → P2 → P3, two rejoining branch points (P0's
     * doors; P1/P2a's doors). "Start over" is a plain edge back to P0. */
    const nodes = {
        P0: {
            text: `Training completion is at ${D.AVG_COMPLETION}% across your sites this period, up ${gain} points since ${trend[0][0]}. Where would you like to dig in?`,
            chart: "weekly",
            chips: [
                { label: "Who is behind?", next: "P1" },
                { label: "How is the trend?", next: "T1" },
            ],
        },
        T1: {
            text: `Here's the trend: ${trend[0][1]}% in ${trend[0][0]} to ${trend[trend.length - 1][1]}% in ${trend[trend.length - 1][0]} — ${gain} points over six months. Want the markets behind it, or the weakest key message?`,
            chart: "trend",
            chips: [
                { label: "Who is behind?", next: "P1" },
                { label: "Weakest key message", next: "P2a" },
            ],
        },
        P1: {
            text: `${top.market} leads at ${top.pct}% completion; ${bottom.market} trails at ${bottom.pct}%. From here: the weakest key message, or the teams with overdue learners.`,
            chart: "markets",
            chips: [
                { label: "Weakest key message", next: "P2a" },
                { label: "Overdue teams", next: "P2b" },
            ],
        },
        P2a: {
            text: `${weakestMsg.message} is the weakest key message at ${weakestMsg.pct}% — the class average is ${D.AVG_PERFORMANCE}%. Meet the teams behind the overdue list, or act on it.`,
            chart: "messages",
            chips: [
                { label: "Who is behind on it?", next: "P2b" },
                { label: "What can I do?", next: "P3" },
            ],
        },
        P2b: {
            text: `${overdueTop.team} tops the overdue list with ${overdueTop.overdue} learners; ${bottom.market} carries ${bottom.overdue}. Keep digging, or act on it?`,
            chart: "rank",
            chips: [
                { label: "What can I do?", next: "P3" },
            ],
        },
        P3: {
            text: `I can open Share training with ${course.title} (${course.subtitle}) preloaded — a refresher for the teams behind these numbers.`,
            chart: null,
            chips: [
                { label: "Open Share training", next: "ACT", act: "share" },
                { label: "Start over", next: "P0" },
            ],
        },
        ACT: {
            text: `Done — Share training is open with ${course.title} preselected. Pick a channel and send it when you're ready.`,
            chart: null,
            chips: [],
        },
    };

    return { start: "P0", nodes, courseId: course.id };
})();
