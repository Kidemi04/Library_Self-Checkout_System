'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveUserInterests } from '@/app/lib/recommendations/user-context';

type InterestsFormProps = {
  userId: string;
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

export default function InterestsForm({ userId, currentInterests = [], onComplete }: InterestsFormProps) {
  const [selected, setSelected] = useState<string[]>(currentInterests);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const selectedCategories = useMemo(() => {
    const categories = new Set<CategoryKey>();
    selected.forEach((key) => {
      const program = PROGRAM_OPTIONS.find((option) => option.key === key);
      if (program) categories.add(program.category);
    });
    return categories;
  }, [selected]);

  const handleToggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : prev.length < 3
          ? [...prev, key]
          : prev,
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setPending(true);
    try {
      await saveUserInterests(userId, selected);
      onComplete?.();
      router.refresh();
    } catch (error) {
      console.error('Failed to save interests:', error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-swin-charcoal dark:text-white">
          {currentInterests.length > 0 ? 'Update Your Program Selection' : 'Welcome! Choose your bachelor program'}
        </h2>
        <p className="mt-2 text-swin-charcoal/70 dark:text-slate-300">
          {currentInterests.length > 0
            ? 'Select up to 3 bachelor programs to personalize recommendations'
            : 'Choose up to 3 bachelor programs to personalize book and learning recommendations'
          }
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((category) => {
          const active = selectedCategories.has(category);
          return (
            <span
              key={category}
              className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
                active
                  ? 'border-swin-red bg-swin-red/10 text-swin-red dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-200'
                  : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </span>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition dark:border-white/10 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-base font-semibold text-swin-charcoal transition hover:bg-slate-50 dark:text-white dark:hover:bg-slate-900"
        >
          <div>
            <div>Choose bachelor programs</div>
            <div className="mt-1 text-sm font-normal text-slate-500 dark:text-slate-400">
              {selected.length > 0
                ? `${selected.length} program${selected.length === 1 ? '' : 's'} selected`
                : 'Tap to expand and choose programs'}
            </div>
          </div>
          <span className={`text-xl transition-transform ${open ? 'rotate-180' : ''}`}>&#x25BC;</span>
        </button>
        {open && (
          <div className="space-y-3 border-t border-slate-200 px-4 py-4 dark:border-white/10">
            {CATEGORIES.map((category) => {
              const programs = PROGRAM_OPTIONS.filter((option) => option.category === category);
              return (
                <div key={category} className="space-y-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {CATEGORY_LABELS[category]}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {programs.map((option) => {
                      const isSelected = selected.includes(option.key);
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleToggle(option.key)}
                          className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-swin-red/40 dark:focus:ring-emerald-400/40 ${
                            isSelected
                              ? 'border-swin-red bg-swin-red/5 dark:border-emerald-400 dark:bg-emerald-400/10'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:hover:border-white/20 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-900 dark:text-white">{option.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              isSelected
                                ? 'bg-swin-red text-white dark:bg-emerald-400 dark:text-slate-950'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {isSelected ? 'Selected' : 'Choose'}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected.length === 0 || pending}
        className="w-full rounded-lg bg-swin-red px-6 py-3 text-white font-semibold transition-all hover:bg-swin-red/90 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        {pending ? 'Saving...' : 'Continue'}
      </button>
    </div>
  );
}