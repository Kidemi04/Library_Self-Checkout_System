'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type InterestsFormProps = {
  currentInterests?: string[];
  onComplete?: () => void;
};

type ProgramOption = {
  key: string;
  label: string;
  description: string;
  category: CategoryKey;
};

type CategoryKey = 'cs' | 'engineering' | 'art' | 'business';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  cs: 'Computer Science',
  engineering: 'Engineering',
  art: 'Art & Design',
  business: 'Business',
};

const PROGRAM_OPTIONS: ProgramOption[] = [
  { key: 'bachelor_of_computer_science', category: 'cs', label: 'Bachelor of Computer Science', description: 'Computer Science degree with software and systems foundations.' },
  { key: 'bachelor_of_information_and_communication_technology', category: 'cs', label: 'Bachelor of Information and Communication Technology', description: 'ICT degree focused on networks, systems and digital services.' },
  { key: 'bachelor_of_cyber_security', category: 'cs', label: 'Bachelor of Cyber Security', description: 'Cyber security program for digital protection and risk management.' },
  { key: 'bachelor_of_data_science', category: 'cs', label: 'Bachelor of Data Science', description: 'Data Science program for analytics, AI and data-driven decision making.' },
  { key: 'bachelor_of_engineering_software', category: 'engineering', label: 'Bachelor of Engineering (Software)', description: 'Software engineering with programming, systems and development practices.' },
  { key: 'bachelor_of_engineering_chemical', category: 'engineering', label: 'Bachelor of Engineering (Chemical)', description: 'Chemical engineering for process design and industrial chemistry.' },
  { key: 'bachelor_of_engineering_civil', category: 'engineering', label: 'Bachelor of Engineering (Civil)', description: 'Civil engineering for infrastructure, structures and construction.' },
  { key: 'bachelor_of_engineering_electrical_and_electronic', category: 'engineering', label: 'Bachelor of Engineering (Electrical and Electronic)', description: 'Electrical and electronics engineering for power, circuits and devices.' },
  { key: 'bachelor_of_engineering_mechanical', category: 'engineering', label: 'Bachelor of Engineering (Mechanical)', description: 'Mechanical engineering for machines, mechanics and systems design.' },
  { key: 'bachelor_of_engineering_robotics_and_mechatronics', category: 'engineering', label: 'Bachelor of Engineering (Robotics and Mechatronics)', description: 'Robotics and mechatronics for intelligent automation and systems integration.' },
  { key: 'bachelor_of_quantity_surveying', category: 'engineering', label: 'Bachelor of Quantity Surveying (Honours)', description: 'Quantity surveying for project cost control and construction management.' },
  { key: 'bachelor_of_science_biotechnology', category: 'engineering', label: 'Bachelor of Science (Biotechnology)', description: 'Biotechnology with applied biosciences and laboratory innovation.' },
  { key: 'bachelor_of_science_environmental_science', category: 'engineering', label: 'Bachelor of Science (Environmental Science)', description: 'Environmental science focused on sustainability and natural systems.' },
  { key: 'bachelor_of_design', category: 'art', label: 'Bachelor of Design', description: 'Design degree for creative practice, visual storytelling and product design.' },
  { key: 'bachelor_of_design_multimedia_design', category: 'art', label: 'Bachelor of Design (Multimedia Design)', description: 'Multimedia design with digital media, motion and interactive storytelling.' },
  { key: 'bachelor_of_business_accounting_and_finance', category: 'business', label: 'Bachelor of Business (Accounting and Finance)', description: 'Business degree with accounting and finance expertise.' },
  { key: 'bachelor_of_business_accounting', category: 'business', label: 'Bachelor of Business (Accounting)', description: 'Accounting-focused business degree for finance and reporting.' },
  { key: 'bachelor_of_business_finance', category: 'business', label: 'Bachelor of Business (Finance)', description: 'Finance degree for investment, financial planning and corporate finance.' },
  { key: 'bachelor_of_business_finance_marketing', category: 'business', label: 'Bachelor of Business (Finance and Marketing)', description: 'Business program combining finance with marketing strategy.' },
  { key: 'bachelor_of_business_finance_management', category: 'business', label: 'Bachelor of Business (Finance and Management)', description: 'Business program combining finance with management skills.' },
  { key: 'bachelor_of_business_finance_hrm', category: 'business', label: 'Bachelor of Business (Finance and Human Resource Management)', description: 'Business program combining finance with HR management.' },
  { key: 'bachelor_of_business_finance_international', category: 'business', label: 'Bachelor of Business (Finance and International Business)', description: 'Business program combining finance with global business strategy.' },
];

const CATEGORIES: CategoryKey[] = ['cs', 'engineering', 'art', 'business'];

function getInitialCategory(currentInterests: string[]): CategoryKey {
  if (currentInterests.length > 0) {
    const saved = PROGRAM_OPTIONS.find((o) => o.key === currentInterests[0]);
    if (saved) return saved.category;
  }
  return 'cs';
}

export default function InterestsForm({ currentInterests = [], onComplete }: InterestsFormProps) {
  const router = useRouter();
  const successRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>(currentInterests.slice(0, 1));
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(() => getInitialCategory(currentInterests));
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProgram = useMemo(
    () => PROGRAM_OPTIONS.find((option) => option.key === selected[0]) ?? null,
    [selected],
  );

  const visiblePrograms = useMemo(
    () => PROGRAM_OPTIONS.filter((o) => o.category === activeCategory),
    [activeCategory],
  );

  const handleToggle = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? [] : [key]));
  };

  const handleCategoryChange = (category: CategoryKey) => {
    setActiveCategory(category);
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setPending(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/user/interests', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: selected }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `Request failed with status ${response.status}`);
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error');
      console.error('Failed to save interests:', error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-5 relative">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-swin-charcoal dark:text-white sm:text-2xl">
          {currentInterests.length > 0 ? 'Update Your Program Selection' : 'Choose your bachelor program'}
        </h2>
        <p className="mt-1.5 text-sm text-swin-charcoal/70 dark:text-slate-300">
          Select one program to personalize your recommendations
        </p>
      </div>

      {/* Selected program preview */}
      {selected.length > 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-swin-red/30 bg-swin-red/5 px-4 py-3 dark:border-emerald-400/30 dark:bg-emerald-400/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-swin-red/10 text-swin-red dark:bg-emerald-400/10 dark:text-emerald-300">
            ★
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {selectedProgram?.label ?? selected[0]}
            </div>
            {selectedProgram && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {CATEGORY_LABELS[selectedProgram.category]}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-center text-sm text-slate-400 dark:border-white/10 dark:text-slate-500">
          No program selected yet
        </div>
      )}

      {/* Category tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          const hasSelection = selectedProgram?.category === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryChange(category)}
              className={`relative flex flex-col items-center rounded-2xl border px-3 py-3 text-center transition-all duration-200 ${
                isActive
                  ? 'border-swin-red bg-swin-red text-white shadow-md dark:border-emerald-500 dark:bg-emerald-600 dark:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xs font-semibold leading-tight">{CATEGORY_LABELS[category]}</span>
              {hasSelection && (
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white/70' : 'bg-swin-red dark:bg-emerald-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Program list — filtered by active category */}
      <div className="flex flex-col gap-2">
        {visiblePrograms.map((option) => {
          const isSelected = selected.includes(option.key);
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => handleToggle(option.key)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-swin-red/40 dark:focus:ring-emerald-400/40 ${
                isSelected
                  ? 'border-swin-red bg-swin-red/5 shadow-sm dark:border-emerald-400 dark:bg-emerald-400/10'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800'
              }`}
            >
              <div className="min-w-0 flex-1 pr-3">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{option.label}</div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
              </div>
              <div className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                isSelected
                  ? 'border-swin-red bg-swin-red dark:border-emerald-400 dark:bg-emerald-400'
                  : 'border-slate-300 dark:border-white/20'
              }`}>
                {isSelected && <span className="text-[10px] font-bold text-white">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Success message */}
      {saved && (
        <div ref={successRef} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
          ✓ Program saved successfully.
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100">
          {errorMessage}
        </div>
      )}

      {/* Save button */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 sm:mx-0">
        <button
          onClick={handleSubmit}
          disabled={!selectedProgram || pending}
          className="w-full rounded-xl bg-swin-red px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-swin-red/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {pending ? 'Saving...' : currentInterests.length > 0 ? 'Save' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
