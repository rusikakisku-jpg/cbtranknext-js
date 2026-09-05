export interface Exam {
  id?: number;
  slug: string;
  title: string;
  subtitle?: string;
  is_latest?: number | string;
  set_on_top?: number | string;
  is_visible?: number | boolean;
  marks_right?: number | string;
  marks_wrong?: number | string;
  location_type_id?: string;
  location_id?: string[] | string;
  description?: string;
}

export const ALL_EXAMS_FALLBACK: Exam[] = [
  {
    "id": 47,
    "slug": "ossc-physical-measurement-and-physical-efficiencytest-2025",
    "title": "OSSC Physical Measurement and Physical EfficiencyTest - 2025",
    "subtitle": "Check Your Answer Key of OSSC Physical Measurement and Physical EfficiencyTest - 2025",
    "is_latest": 1,
    "set_on_top": 1,
    "marks_right": 1,
    "marks_wrong": 0.25,
    "location_id": ["Odisha"]
  },
  {
    "id": 46,
    "slug": "rrb-group-d-2026-answer-key",
    "title": "RRB Group D 2026 Answer Key",
    "subtitle": "Check Your Answer Key of RRB Group D 2026 Answer Key",
    "is_latest": 1,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 45,
    "slug": "osssc-ri-ari-amin-icds-sfs-junior-assistant",
    "title": "OSSSC RI,ARI,AMIN,ICDS,SFS,Junior Assistant",
    "subtitle": "Check Your Answer Key of OSSSC RI,ARI,AMIN,ICDS,SFS,Junior Assistant",
    "is_latest": 1,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["Odisha"]
  },
  {
    "id": 44,
    "slug": "rrb-ntpc-ug-2026-cbt-1",
    "title": "RRB NTPC UG 2026 CBT-1",
    "subtitle": "Check Your Answer Key of RRB NTPC UG 2026 CBT-1",
    "is_latest": 1,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 43,
    "slug": "ssc-chsl-mains-2025",
    "title": "SSC CHSL Mains 2025",
    "subtitle": "Check Your Answer Key of SSC CHSL Mains 2025",
    "is_latest": 1,
    "set_on_top": 0,
    "marks_right": 3,
    "marks_wrong": 1,
    "location_id": ["All India"]
  },
  {
    "id": 42,
    "slug": "ssc-je-mains-2025",
    "title": "SSC JE Mains 2025",
    "subtitle": "Check Your Answer Key of SSC JE Mains 2025",
    "is_latest": 1,
    "set_on_top": 0,
    "marks_right": 3,
    "marks_wrong": 1,
    "location_id": ["All India"]
  },
  {
    "id": 41,
    "slug": "rrb-ntpc-cbt-i-graduate-level-2025-26",
    "title": "RRB NTPC CBT-I Graduate Level 2025-26",
    "subtitle": "Check Your Answer Key of RRB NTPC CBT-I Graduate Level 2025-26",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 40,
    "slug": "rrb-technician-grade-i-2025-26",
    "title": "RRB Technician Grade-I 2025-26",
    "subtitle": "Check Your Answer Key of RRB Technician Grade-I 2025-26",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 39,
    "slug": "rrb-paramedical-exam-2025-26",
    "title": "RRB Paramedical Exam 2025-26",
    "subtitle": "Check Your Answer Key of RRB Paramedical Exam 2025-26",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 38,
    "slug": "rrb-technician-grade-3-2025-26",
    "title": "RRB Technician Grade-3 2025-26",
    "subtitle": "Check Your Answer Key of RRB Technician Grade-3 2025-26",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 37,
    "slug": "rrb-alp-cbt-1-2025-26-2",
    "title": "RRB ALP CBT-1 2025-26",
    "subtitle": "Check Your Answer Key of RRB ALP CBT-1 2025-26",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 36,
    "slug": "rrb-section-controller-cbt-i-2026",
    "title": "RRB Section Controller CBT-I 2026",
    "subtitle": "Check Your Answer Key of RRB Section Controller CBT-I 2026",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 35,
    "slug": "ssc-mts-2025-26",
    "title": "SSC MTS 2025-26",
    "subtitle": "Check Your Answer Key of SSC MTS 2025-26",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 3,
    "marks_wrong": 1,
    "location_id": ["All India"]
  },
  {
    "id": 34,
    "slug": "rrb-group-d-2024-25-2",
    "title": "RRB Group-D 2024-25",
    "subtitle": "Check Your Answer Key of RRB Group-D 2024-25",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 33,
    "slug": "rrb-alp-cbt-1-2025-26",
    "title": "RRB ALP CBT-1 2025-26",
    "subtitle": "Check Your Answer Key of RRB ALP CBT-1 2025-26",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 32,
    "slug": "rrb-je-cbt-1-2025-26",
    "title": "RRB JE CBT-1 2025-26",
    "subtitle": "Check Your Answer Key of RRB JE CBT-1 2025-26",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 31,
    "slug": "rrb-section-controller-cbt-1",
    "title": "RRB Section Controller CBT-1",
    "subtitle": "Check Your Answer Key of RRB Section Controller CBT-1",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 30,
    "slug": "rrb-group-d-2024-25",
    "title": "RRB Group-D 2024-25",
    "subtitle": "Check Your Answer Key of RRB Group-D 2024-25",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 29,
    "slug": "ssc-delhi-police-awo-tpo-2025",
    "title": "SSC Delhi Police AWO/TPO 2025",
    "subtitle": "Check Your Answer Key of SSC Delhi Police AWO/TPO 2025",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.25,
    "location_id": ["Delhi"]
  },
  {
    "id": 28,
    "slug": "ssc-delhi-police-head-constable-2025",
    "title": "SSC Delhi Police Head Constable 2025",
    "subtitle": "Check Your Answer Key of SSC Delhi Police Head Constable 2025",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.5,
    "location_id": ["Delhi"]
  },
  {
    "id": 27,
    "slug": "ssc-cgl-mains-2025",
    "title": "SSC CGL Mains 2025",
    "subtitle": "Check Your Answer Key of SSC CGL Mains 2025",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 3,
    "marks_wrong": 1,
    "location_id": ["All India"]
  },
  {
    "id": 26,
    "slug": "ssc-delhi-police-constable-2025",
    "title": "SSC Delhi Police Constable 2025",
    "subtitle": "Check Your Answer Key of SSC Delhi Police Constable 2025",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.25,
    "location_id": ["Delhi"]
  },
  {
    "id": 25,
    "slug": "ssc-delhi-police-driver-2025",
    "title": "SSC Delhi Police Driver 2025",
    "subtitle": "Check Your Answer Key of SSC Delhi Police Driver 2025",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.25,
    "location_id": ["Delhi"]
  },
  {
    "id": 23,
    "slug": "rrb-ntpc-ug-cbt-ii-2024-25",
    "title": "RRB NTPC UG CBT-II  2024-25",
    "subtitle": "Check Your Answer Key of RRB NTPC UG CBT-II  2024-25",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 22,
    "slug": "rrb-ntpc-2025-cbt-2",
    "title": "RRB NTPC 2025 CBT 2",
    "subtitle": "Check Your Answer Key of RRB NTPC 2025 CBT 2.",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 21,
    "slug": "rrb-ministerial-isolated-categories-2025",
    "title": "RRB Ministerial & Isolated Categories 2025",
    "subtitle": "Check Your Answer Key of RRB Ministerial & Isolated Categories 2025",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  },
  {
    "id": 20,
    "slug": "rrb-ntpc-ug-under-graduate-2025",
    "title": "RRB NTPC UG (Under Graduate) 2025",
    "subtitle": "Check Your Answer Key of RRB NTPC UG (Under Graduate) 2025",
    "is_latest": 0,
    "set_on_top": 0,
    "marks_right": 1,
    "marks_wrong": 0.33,
    "location_id": ["All India"]
  }
];

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  if (!slug) return null;

  try {
    const res = await fetch('https://api.cbtrank.com/exams', {
      headers: { 'User-Agent': 'CBTRank-Web/2.0' },
      next: { revalidate: 60 }
    });
    if (res.ok) {
      const exams = await res.json();
      if (Array.isArray(exams)) {
        const found = exams.find((e: Exam) => e && e.slug === slug);
        if (found) return found;
      }
    }
  } catch (err) {
    // API error fallback
  }

  const fallback = ALL_EXAMS_FALLBACK.find((e) => e.slug === slug);
  if (fallback) return fallback;

  return null;
}
