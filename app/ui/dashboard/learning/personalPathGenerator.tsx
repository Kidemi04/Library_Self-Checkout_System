'use client';
import { useState } from 'react';
import { Button } from '@/app/ui/button';

export default function PersonalPathGenerator({ defaultTopic }: { defaultTopic: string }) {
  const [loading, setLoading] = useState(false);
  const [generatedSteps, setGeneratedSteps] = useState<any[]>([]);
  const [topic, setTopic] = useState(defaultTopic);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/learning/generate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (data.ok && data.steps) {
        setGeneratedSteps(data.steps);
      } else {
        alert(data.error || 'Failed to generate path.');
      }
    } catch (err) {
      alert('Generation Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 mb-8 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
             ✨ Custom AI Learning Path
          </h2>
          <p className="text-sm text-swin-charcoal/70 dark:text-slate-300 mt-1">
            Build a unique Beginner \u2192 Intermediate \u2192 Advanced syllabus utilizing LinkedIn Courses and Library Books instantly based on your interests.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="whitespace-nowrap bg-swin-red hover:bg-swin-red/90 text-white">
          {loading ? 'Generating...' : `Suggest Path for ${topic}`}
        </Button>
      </div>

      {generatedSteps.length > 0 && (
        <section className="mt-6 border-t border-slate-100 dark:border-white/10 pt-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generatedSteps.map((step, idx) => (
              <div key={idx} className="border p-4 rounded-xl space-y-3 dark:border-white/10 dark:bg-slate-800">
                <span className="text-xs uppercase tracking-widest text-swin-red font-bold">Phase {idx + 1}: {step.difficulty}</span>
                <div>
                  <p className="text-sm font-semibold dark:text-white">📚 Library Search</p>
                  <p className="text-xs text-swin-charcoal/70 dark:text-slate-300 mt-1">{step.bookTitle}</p>
                </div>
                <hr className="dark:border-white/10" />
                <div>
                  <p className="text-sm font-semibold dark:text-white">💼 LinkedIn Course</p>
                  <p className="text-xs text-swin-charcoal/70 dark:text-slate-300 mt-1">{step.courseTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
