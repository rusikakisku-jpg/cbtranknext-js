import Link from 'next/link';

interface RelatedExamsSectionProps {
  currentSlug: string;
}

const POPULAR_EXAMS = [
  { slug: 'rrb-group-d-2026-answer-key', title: 'RRB Group D 2026 Answer Key' },
  { slug: 'rrb-ntpc-ug-2026-cbt-1', title: 'RRB NTPC UG 2026 CBT-1' },
  { slug: 'ssc-chsl-mains-2025', title: 'SSC CHSL Mains 2025' },
  { slug: 'ssc-je-mains-2025', title: 'SSC JE Mains 2025' },
  { slug: 'rrb-ntpc-cbt-i-graduate-level-2025-26', title: 'RRB NTPC CBT-I Graduate Level' },
  { slug: 'rrb-technician-grade-i-2025-26', title: 'RRB Technician Grade-I' },
  { slug: 'rrb-paramedical-exam-2025-26', title: 'RRB Paramedical Exam' },
  { slug: 'ossc-physical-measurement-and-physical-efficiencytest-2025', title: 'OSSC Physical Measurement Test' },
];

export default function RelatedExamsSection({ currentSlug }: RelatedExamsSectionProps) {
  const filteredExams = POPULAR_EXAMS.filter((e) => e.slug !== currentSlug).slice(0, 6);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto 60px', padding: '0 16px' }}>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
        }}
      >
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📌</span> Popular &amp; Related Answer Key Calculators
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
          }}
        >
          {filteredExams.map((exam) => (
            <Link
              key={exam.slug}
              href={`/${exam.slug}/answerkey`}
              style={{
                display: 'block',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                color: '#1e293b',
                fontSize: '0.86rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {exam.title}
                </span>
                <span style={{ color: '#0044cc', fontWeight: 800 }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        <div
          style={{
            marginTop: '18px',
            paddingTop: '14px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '0.82rem',
          }}
        >
          <span style={{ color: '#64748b' }}>Looking for a different test or shift?</span>
          <Link
            href="/answerkey"
            style={{
              color: '#0044cc',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Universal Answerkey Calculator →
          </Link>
        </div>
      </div>
    </div>
  );
}
