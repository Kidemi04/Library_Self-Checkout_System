'use client';
import { useState, useEffect } from 'react';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import { Button } from '@/app/ui/button';

export default function AdminPathsPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedSteps, setGeneratedSteps] = useState<any[]>([]);

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
    <main className="space-y-8 p-6">
      <DashboardTitleBar title="Learning Path Manager" subtitle="Admin Actions" description="Draft or generate new comprehensive learning pathways for students." />
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold dark:text-white">AI Path Generator</h2>
        <p className="text-sm text-swin-charcoal/70 dark:text-slate-300">
          Enter a unified topic (e.g., "React.js" or "Network Administration"). The AI will generate a strict 3-tier sequence mapping one library book and one LinkedIn Course per difficulty tier.
        </p>
        
        <div className="flex flex-row gap-4 items-center">
          <input 
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 flex-1"
            placeholder="Topic keywords..." 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleGenerate} disabled={!topic || loading}>
            {loading ? 'Generating...' : 'Auto-Generate Path'}
          </Button>
        </div>
      </div>

      {generatedSteps.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-swin-charcoal dark:text-white">Generated Curriculum Draft</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generatedSteps.map((step, idx) => (
              <div key={idx} className="border p-4 rounded-xl space-y-3 dark:border-white/10 dark:bg-slate-800">
                <span className="text-xs uppercase tracking-widest text-[#E14327] font-bold">Step {idx + 1}: {step.difficulty}</span>
                <div>
                  <p className="text-sm font-semibold dark:text-white">Library Book Target</p>
                  <p className="text-xs text-swin-charcoal/70 dark:text-slate-300">Title: {step.bookTitle}</p>
                  <p className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded inline-block mt-1">Query: {step.bookQuery}</p>
                </div>
                <hr className="dark:border-white/10" />
                <div>
                  <p className="text-sm font-semibold dark:text-white">LinkedIn Course Target</p>
                  <p className="text-xs text-swin-charcoal/70 dark:text-slate-300">Title: {step.courseTitle}</p>
                  <p className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded inline-block mt-1">Query: {step.courseQuery}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => alert('Supabase insertion binding would be wired here for physical path generation!')}>
            Save to Database
          </Button>
        </section>
      )}
    </main>
  );
}
