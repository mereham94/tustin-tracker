window.REPORTS = [
  "School Checkpoints Report",
  "Teacher Checkpoints Report",
];

window.REPORT_CODES = {
  "School Checkpoints Report": "SCR",
  "Teacher Checkpoints Report": "TCR",
};

window.STATUSES = [
  { key: "shipped", label: "Published" },
  { key: "in-progress", label: "In progress" },
  { key: "planned", label: "Planned" },
];

window.STATUS_EMOJI = {
  shipped: "✅",
  "in-progress": "🛠️",
  planned: "🗓️",
};
window.CATEGORY_EMOJI = {
  "New feature": "✨",
  "UX": "🎨",
  "Bug fix": "🐛",
  "Performance": "⚡",
};
window.IMPACT_EMOJI = {
  "Teachers": "🍎",
  "Site leaders": "🏫",
  "District leaders": "🏛️",
};
window.REPORT_EMOJI = {
  "School Checkpoints Report": "🏫",
  "Teacher Checkpoints Report": "🧑‍🏫",
};

window.REACTIONS = [
  { emoji: "❤️", label: "Love it" },
  { emoji: "⭐", label: "Great work" },
  { emoji: "🚀", label: "Game changer" },
  { emoji: "👍", label: "Helpful" },
  { emoji: "💡", label: "Insightful" },
];

window.IMPROVEMENTS = [
  {
    id: "imp-016",
    title: "Individual Student Reports",
    report: ["School Checkpoints Report", "Teacher Checkpoints Report"],
    status: "planned",
    date: "2026-06-02",
    requester: { name: "", role: "", initials: "" },
    category: "New feature",
    impact: ["Teachers", "Site leaders", "District leaders"],
    what: "A drill-down view that surfaces checkpoint performance data for each student individually — not just at the class or school aggregate level. Teachers will be able to click into any student and see their performance across all checkpoints in one place.",
    why: "Aggregate data hides individual student needs. Teachers need to quickly identify who is struggling or excelling so they can provide targeted support — especially for EL students whose needs can get lost inside class-level averages.",
    detail: "",
    reactions: { "❤️": 0, "⭐": 0, "🚀": 0, "👍": 0, "💡": 0 },
    comments: [],
  },
  {
    id: "imp-015",
    title: "Rigor Framework Correlation",
    report: ["School Checkpoints Report", "Teacher Checkpoints Report"],
    status: "planned",
    date: "2026-06-02",
    requester: { name: "", role: "", initials: "" },
    category: "New feature",
    impact: ["Teachers", "Site leaders", "District leaders"],
    what: "An analysis layer that maps checkpoint results to a rigor framework — showing how student performance aligns with different levels of cognitive demand. Results will be tagged and visualized by rigor level alongside existing performance data.",
    why: "Getting answers right isn't the full picture. Site and district leaders need to understand whether assessments are measuring surface recall or deeper thinking. This helps instructional coaches pinpoint exactly where to focus professional development and where curriculum may need strengthening.",
    detail: "",
    reactions: { "❤️": 0, "⭐": 0, "🚀": 0, "👍": 0, "💡": 0 },
    comments: [],
  },
  {
    id: "imp-014",
    title: "Added a 10-percentile performance bucket breakdown",
    report: ["School Checkpoints Report", "Teacher Checkpoints Report"],
    status: "shipped",
    date: "2026-05-28",
    requester: { name: "Judy Park", role: "", initials: "JP" },
    category: "New feature",
    impact: ["Teachers", "Site leaders", "District leaders"],
    what: "Added a second Performance bucket section that breaks results into 10-percentile-point bands (60–70%, 50–60%, 40–50%, …) alongside the original 25% buckets.",
    why: "The 25% buckets were too coarse to act on. Finer bands let coordinators more accurately place EL students into the right support tier and surface instructional gaps that were previously hidden inside a single large bucket.",
    detail: "Both bucket tables now share a sortable header and respect the active Checkpoint, Teacher, and Class filters. The 10% breakdown sits directly beneath the 25% table so educators can move from a broad read to a precise one without leaving the page. The same change was applied to both the School and Teacher Checkpoints reports so they stay consistent.",
    reactions: { "❤️": 0, "⭐": 0, "🚀": 0, "👍": 0, "💡": 0 },
    comments: [],
  },
];
