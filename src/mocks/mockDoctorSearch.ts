export type SearchType =
  | "all"
  | "patient"
  | "dementia"
  | "prescription"
  | "allergy"
  | "mobility"
  | "activity"
  | "preference"
  | "exclusion"
  | "recommendation"
  | "problemCategory"
  | "gameTitle"
  | "gameCategory";

export const searchTypes: { value: SearchType; text: string }[] = [
  { value: "all", text: "All" },
  { value: "patient", text: "Patient's name" },
  { value: "dementia", text: "Dementia name" },
  { value: "prescription", text: "Prescription Name" },
  { value: "allergy", text: "Allergy item name" },
  { value: "mobility", text: "Mobility aid name" },
  { value: "activity", text: "Activity title" },
  { value: "preference", text: "Patient's preference" },
  { value: "exclusion", text: "Activity exclusion" },
  { value: "recommendation", text: "Activity recommendation" },
  { value: "problemCategory", text: "Problem category" },
  { value: "gameTitle", text: "Game title" },
  { value: "gameCategory", text: "Game category" },
];

export const radioOptionsByType: Partial<
  Record<SearchType, { label: string; value: number }[]>
> = {
  preference: [
    { label: "Neutral", value: 0 },
    { label: "Like", value: 1 },
    { label: "Dislike", value: -1 },
  ],
  exclusion: [
    { label: "Not Excluded", value: 0 },
    { label: "Excluded", value: 1 },
  ],
  recommendation: [
    { label: "Neutral", value: 0 },
    { label: "Recommended", value: 1 },
    { label: "Not Recommended", value: -1 },
  ],
};

export const fieldLabelByType: Record<SearchType, string> = {
  all: "Keyword",
  patient: "Patient Name",
  dementia: "Dementia Name",
  prescription: "Prescription Name",
  allergy: "Allergy Item Name",
  mobility: "Mobility Aid Name",
  activity: "Activity Title",
  preference: "Activity Title (Preference)",
  exclusion: "Activity Title (Exclusion)",
  recommendation: "Activity Title (Recommendation)",
  problemCategory: "Problem Category",
  gameTitle: "Game Title",
  gameCategory: "Game Category",
};

export type SearchResult = {
  id: string;
  patientId: number;
  patientName: string;
  isActive: boolean | null;
  type: string;
  name: string;
  message?: string;
};

type PatientRecord = {
  id: number;
  name: string;
  isActive: boolean;
  dementias: string[];
  prescriptions: string[];
  allergies: string[];
  mobilityAids: string[];
  activities: { title: string }[];
  preferences: Record<string, -1 | 0 | 1>;
  exclusions: string[];
  recommendations: Record<string, -1 | 0 | 1>;
  problems: string[];
  games: { title: string; category: string }[];
};

const P: PatientRecord[] = [
  {
    id: 101,
    name: "Bi Gong",
    isActive: true,
    dementias: ["Alzheimer’s (Mild)"],
    prescriptions: ["Galantamine", "Simvastatin"],
    allergies: ["Peanuts"],
    mobilityAids: ["Cane"],
    activities: [{ title: "Daily Lunch" }, { title: "Board Games" }],
    preferences: { "Board Games": 1, "Daily Lunch": 0 },
    exclusions: ["Brisk Walking"],
    recommendations: { "Breathing + Vital Check": 1 },
    problems: ["Memory"],
    games: [{ title: "Sudoku", category: "Puzzles" }],
  },
  {
    id: 102,
    name: "Jon Ong",
    isActive: true,
    dementias: ["Vascular (Moderate)"],
    prescriptions: ["Donepezil"],
    allergies: ["Milk", "Shellfish"],
    mobilityAids: ["Wheelchair"],
    activities: [{ title: "Movie Screening" }, { title: "Daily Lunch" }],
    preferences: { "Movie Screening": -1, "Daily Lunch": 1 },
    exclusions: [],
    recommendations: { "Brisk Walking": -1 },
    problems: ["Mobility"],
    games: [{ title: "Pairs", category: "Memory" }],
  },
  {
    id: 103,
    name: "Yan Yi",
    isActive: true,
    dementias: ["Lewy Body (Mild)"],
    prescriptions: ["Paracetamol", "Salbutamol"],
    allergies: ["Eggs"],
    mobilityAids: ["Walker"],
    activities: [{ title: "Brisk Walking" }],
    preferences: { "Brisk Walking": 1 },
    exclusions: [],
    recommendations: { "Board Games": 0 },
    problems: ["Respiratory"],
    games: [{ title: "Tetris", category: "Arcade" }],
  },
  {
    id: 104,
    name: "Alicee",
    isActive: false,
    dementias: ["Frontotemporal"],
    prescriptions: ["Rivastigmine"],
    allergies: ["Soy"],
    mobilityAids: ["None"],
    activities: [{ title: "Yoga" }],
    preferences: { Yoga: 0 },
    exclusions: ["Movie Screening"],
    recommendations: { Yoga: 1 },
    problems: ["Behavioral"],
    games: [{ title: "Word Search", category: "Language" }],
  },
];

const typeLabel = (t: SearchType) =>
  searchTypes.find((s) => s.value === t)?.text ?? t;

// All types included in the “All” search
const ALL_TYPES: SearchType[] = [
  "patient",
  "dementia",
  "prescription",
  "allergy",
  "mobility",
  "activity",
  "preference",
  "exclusion",
  "recommendation",
  "problemCategory",
  "gameTitle",
  "gameCategory",
];

export function localSearch(
  type: SearchType,
  query: string,
  opt?: number
): SearchResult[] {
  const q = (query ?? "").trim().toLowerCase();

  const push = (
    acc: SearchResult[],
    p: PatientRecord,
    matchedType: SearchType,
    matchedName: string,
    message?: string
  ) => {
    acc.push({
      id: `${p.id}-${matchedType}-${matchedName}`,
      patientId: p.id,
      patientName: p.name,
      isActive: p.isActive,
      type: typeLabel(matchedType),
      name: matchedName,
      message,
    });
  };

  const handleOneType = (
    acc: SearchResult[],
    p: PatientRecord,
    t: SearchType
  ) => {
    switch (t) {
      case "patient": {
        if (!q || p.name.toLowerCase().includes(q)) {
          push(
            acc,
            p,
            "patient",
            p.name,
            q ? `Name contains "${query}"` : undefined
          );
        }
        break;
      }
      case "dementia": {
        for (const d of p.dementias) {
          if (!q || d.toLowerCase().includes(q)) {
            push(
              acc,
              p,
              "dementia",
              d,
              q ? `${d} contains "${query}"` : undefined
            );
          }
        }
        break;
      }
      case "prescription": {
        for (const rx of p.prescriptions) {
          if (!q || rx.toLowerCase().includes(q)) {
            push(
              acc,
              p,
              "prescription",
              rx,
              q ? `${rx} contains "${query}"` : undefined
            );
          }
        }
        break;
      }
      case "allergy": {
        for (const a of p.allergies) {
          if (!q || a.toLowerCase().includes(q)) {
            push(
              acc,
              p,
              "allergy",
              a,
              q ? `${a} contains "${query}"` : undefined
            );
          }
        }
        break;
      }
      case "mobility": {
        for (const m of p.mobilityAids) {
          if (!q || m.toLowerCase().includes(q)) {
            push(
              acc,
              p,
              "mobility",
              m,
              q ? `${m} contains "${query}"` : undefined
            );
          }
        }
        break;
      }
      case "activity": {
        for (const act of p.activities) {
          if (!q || act.title.toLowerCase().includes(q)) {
            push(
              acc,
              p,
              "activity",
              act.title,
              q ? `${act.title} contains "${query}"` : undefined
            );
          }
        }
        break;
      }
      case "preference": {
        const entries = Object.entries(p.preferences);
        for (const [title, val] of entries) {
          const titleMatch = !q || title.toLowerCase().includes(q);
          const optMatch = typeof opt === "number" ? val === opt : true; // 'all' passes undefined
          if (titleMatch && optMatch) {
            const label =
              val === 1 ? "Like" : val === -1 ? "Dislike" : "Neutral";
            push(acc, p, "preference", title, `Preference: ${label}`);
          }
        }
        break;
      }
      case "exclusion": {
        const candidates = q
          ? p.activities
              .map((a) => a.title)
              .filter((tl) => tl.toLowerCase().includes(q))
          : p.activities.map((a) => a.title);
        for (const title of candidates) {
          const excluded = p.exclusions.includes(title) ? 1 : 0;
          const optMatch = typeof opt === "number" ? excluded === opt : true;
          if (optMatch) {
            push(
              acc,
              p,
              "exclusion",
              title,
              excluded ? "Excluded" : "Not excluded"
            );
          }
        }
        break;
      }
      case "recommendation": {
        const entries = Object.entries(p.recommendations);
        for (const [title, val] of entries) {
          const titleMatch = !q || title.toLowerCase().includes(q);
          const optMatch = typeof opt === "number" ? val === opt : true;
          if (titleMatch && optMatch) {
            const label =
              val === 1
                ? "Recommended"
                : val === -1
                  ? "Not recommended"
                  : "Neutral";
            push(acc, p, "recommendation", title, `Doctor: ${label}`);
          }
        }
        break;
      }
      case "problemCategory": {
        for (const c of p.problems) {
          if (!q || c.toLowerCase().includes(q)) {
            push(
              acc,
              p,
              "problemCategory",
              c,
              q ? `${c} contains "${query}"` : undefined
            );
          }
        }
        break;
      }
      case "gameTitle": {
        for (const g of p.games) {
          if (!q || g.title.toLowerCase().includes(q)) {
            push(
              acc,
              p,
              "gameTitle",
              g.title,
              q ? `${g.title} contains "${query}"` : undefined
            );
          }
        }
        break;
      }
      case "gameCategory": {
        for (const g of p.games) {
          if (!q || g.category.toLowerCase().includes(q)) {
            push(
              acc,
              p,
              "gameCategory",
              g.category,
              q ? `${g.category} contains "${query}"` : undefined
            );
          }
        }
        break;
      }
    }
  };

  const results: SearchResult[] = [];

  if (type === "all") {
    // Search across every category; ignore radio filters in "all"
    for (const p of P) {
      for (const t of ALL_TYPES) {
        handleOneType(results, p, t);
      }
    }
    return results;
  }

  // Single-type search (respect 'opt' where relevant)
  for (const p of P) {
    handleOneType(results, p, type);
  }
  return results;
}
