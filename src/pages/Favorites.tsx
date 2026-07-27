import React, { useMemo, useState } from 'react';
import { Heart, Clock, Flame, Download, Trash2, X } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useWorkoutStore } from '../hooks/useWorkoutHistory';
import { ExerciseData } from '../types';
import { EXERCISES } from '../data/exercises';
import { calculatePerformanceStats } from '../lib/performanceAnalytics';
import { getAiCoachAdvice, AiSuggestion } from '../lib/aiCoach';

export function Favorites({ onLaunchActivity }: { onLaunchActivity?: (ex?: ExerciseData) => void }) {
  const { favoriteExercises, toggleFavorite } = useFavorites();
  const { history } = useWorkoutStore();
  const [showAiModal, setShowAiModal] = useState(false);

  const stats = useMemo(() => calculatePerformanceStats(history, EXERCISES), [history]);
  const aiCoach = useMemo(() => getAiCoachAdvice(stats), [stats]);

  const handleExport = () => {
    // Generate CSV data
    let csv = 'Date,Exercise ID,Sets,Reps,Duration (s),Calories,Accuracy\n';
    history.forEach(s => {
      csv += `${new Date(s.date).toISOString()},${s.exerciseId},${s.sets},${s.reps},${s.durationSeconds},${s.calories},${s.accuracy}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `workout_routine_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-gutter relative">
      <div className="flex-1 space-y-stack-lg">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight uppercase">Favorite Workouts</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Refine your peak performance with curated routines.</p>
        </div>

        {favoriteExercises.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-outline rounded-3xl pb-12">
            <Heart className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary mb-2">No Favorites Yet</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto">Explore workouts and tap the heart icon to build your custom collection of routines.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {favoriteExercises.map((w) => (
              <div 
                key={w.id} 
                className="theme-card theme-card-hover overflow-hidden flex flex-col group transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden bg-slate-900 border-b border-outline">
                  <img 
                    src={w.image} 
                    alt={w.title} 
                    loading="lazy"
                    onError={(e) => { 
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'; 
                    }}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/60 border border-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wider">{w.muscle}</span>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(w.id)}
                    className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                    style={{ cursor: 'pointer' }}
                  >
                    <Heart className="w-4 h-4 fill-error text-error" />
                  </button>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-primary mb-3">{w.title}</h3>
                  <div className="flex mb-6">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                      <Clock className="w-4 h-4" /> Recommended Form
                    </span>
                  </div>
                  <div className="mt-auto flex justify-between gap-3">
                    <button
                      onClick={() => onLaunchActivity && onLaunchActivity(w)}
                      className="w-max px-4 py-2.5 bg-primary hover:bg-[#334155] dark:hover:bg-[#E2E8F0] text-white dark:text-[#1E293B] rounded-xl text-sm font-bold active:scale-95 transition-all cursor-pointer"
                    >
                      Launch Detection
                    </button>
                    <button 
                      onClick={() => toggleFavorite(w.id)} 
                      className="w-10 h-10 shrink-0 border border-outline text-on-surface-variant rounded-xl flex items-center justify-center hover:bg-error/10 hover:text-error hover:border-error/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Panel */}
      <aside className="w-full lg:w-[320px] space-y-gutter">
        <div className="theme-card p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-primary mb-6">Performance Statistics</h3>
          
          <div className="space-y-4 mb-8">
            <div className="p-5 bg-background rounded-2xl border border-outline-variant shadow-sm">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Total Workouts Saved</span>
              <span className="text-5xl font-bold text-primary">{stats.totalWorkouts}</span>
            </div>
          </div>

          <div className="mb-6">
             <h4 className="text-sm font-bold text-primary mb-4">Muscle Focus Distribution</h4>
             {stats.muscleDistribution.length > 0 ? (
               <div className="space-y-4">
                  {stats.muscleDistribution.slice(0, 4).map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-on-surface-variant">{m.label}</span>
                        <span className="text-xs font-bold text-primary">{m.val}</span>
                      </div>
                      <div className="h-1.5 w-full bg-outline-variant rounded-full overflow-hidden">
                        <div className="h-full bg-secondary transition-all duration-1000" style={{ width: m.val }}></div>
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
               <p className="text-xs text-on-surface-variant">No data to display yet.</p>
             )}
          </div>
          
          <button 
            onClick={handleExport}
            className="w-full mt-auto py-3.5 border border-outline bg-surface text-primary rounded-xl font-bold text-sm hover:bg-hover-bg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
             <Download className="w-4 h-4" /> Export Routine Data
          </button>
        </div>

        {/* AI Advice Card */}
        <div 
          className="p-8 rounded-3xl text-white shadow-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(30, 41, 59, 0.15)',
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <h3 className="text-xl font-bold mb-3 relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Coach AI Advice
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed mb-6 font-medium relative z-10 min-h-[60px]">
            "{aiCoach.advice}"
          </p>
          <button 
            onClick={() => setShowAiModal(true)}
            className="px-5 py-2.5 rounded-full text-xs font-bold transition-all relative z-10 border border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            View Suggestions
          </button>
        </div>
      </aside>

      {/* AI Suggestion Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl border border-outline overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline flex justify-between items-center bg-background">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Flame className="w-6 h-6 text-error" /> AI Recommended Routine
              </h3>
              <button 
                onClick={() => setShowAiModal(false)}
                className="w-10 h-10 rounded-full bg-outline/20 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-outline transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <p className="text-on-surface-variant text-sm font-medium">{aiCoach.advice}</p>
              
              <div className="space-y-4">
                {aiCoach.suggestedExercises.map((s, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border border-outline rounded-2xl bg-background hover:border-primary/30 transition-colors">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <img src={s.exercise.image} alt={s.exercise.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-lg font-bold text-primary">{s.exercise.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary">
                          {s.level}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant mb-3">{s.exercise.muscle}</span>
                      <div className="flex gap-3 mt-auto">
                        <div className="px-3 py-1.5 bg-outline/20 rounded-lg text-xs font-bold text-primary">
                          {s.sets} Sets
                        </div>
                        <div className="px-3 py-1.5 bg-outline/20 rounded-lg text-xs font-bold text-primary">
                          {s.reps} Reps
                        </div>
                        <div className="px-3 py-1.5 bg-outline/20 rounded-lg text-xs font-bold text-primary">
                          {s.rest} Rest
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-outline bg-background flex justify-end">
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
