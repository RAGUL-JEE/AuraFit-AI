import React from 'react';
import { Video, Clock, Cpu, Book } from 'lucide-react';

export function HowItWorks({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  return (
    <div className="max-w-[1200px] mx-auto py-12 px-4">
      {/* HERO */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
        <div>
          <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">SCIENTIFIC PROTOCOL</span>
          <h1 className="text-4xl md:text-5xl font-black text-[#091426] leading-tight mb-4">Lab-Grade Performance
            <br />
            at Home
          </h1>
          <p className="text-lg text-on-surface-variant mb-8 max-w-lg">Precision Coach uses high-fidelity computer vision to analyze every millimeter of your movement, bringing elite-level biomechanics coaching to your living room.</p>
          <div className="flex gap-4">
            <button onClick={() => onNavigate && onNavigate('workouts')} className="px-6 py-3 bg-[#091426] text-white font-semibold rounded-full shadow">Start Your First Workout</button>
            <button onClick={() => onNavigate && onNavigate('home')} className="px-6 py-3 bg-transparent border border-outline rounded-full font-semibold">Return to home</button>
          </div>
        </div>

        <div className="relative group">
          <div className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-xl transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] hover-shine-effect">
            <img 
              src="/images/how_it_works_hero.png" 
              alt="Hero" 
              className="w-full h-72 object-cover object-center transition-transform duration-1000 group-hover:scale-103" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
          <div className="absolute -bottom-6 left-6 bg-white rounded-2xl p-4 shadow-xl border border-outline-variant/20 w-64 hover:scale-103 transition-transform duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#091426] flex items-center justify-center relative overflow-hidden shadow-inner border border-white/10">
                {/* Active pulsating radar background */}
                <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                {/* Center glowing green active node */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981] relative z-10">
                  <div className="absolute inset-0 rounded-full bg-[#10B981] animate-ping opacity-75" />
                </div>
                {/* High tech grid accents */}
                <div className="absolute inset-0 flex items-center justify-center opacity-25">
                  <div className="border border-dashed border-white/20 w-8 h-8 rounded-full animate-[spin_12s_linear_infinite]" />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">TRACKING STATUS</p>
                <p className="font-bold text-sm text-[#091426]">17 Points Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRECISION PROTOCOL */}
      <section className="mb-12">
        <h2 className="text-center text-xl font-bold text-[#091426] mb-2">The Precision Protocol</h2>
        <div className="w-24 mx-auto mb-8 h-1 bg-[#091426] rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* Card 1 */}
          <div className="text-center group">
            <div className="relative mx-auto w-36 h-36 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-md hover:border-blue-400/60 hover:shadow-[0_12px_24px_rgba(59,130,246,0.25)] hover:-translate-y-1.5 transition-all duration-300 ease-out mb-4 hover-shine-effect">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-200 text-sm font-bold text-[#091426] shadow z-10">01</div>
              <img 
                src="/images/setup_workout_space.png" 
                alt="Set Up Your Space" 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
            </div>
            <h3 className="font-extrabold text-primary mb-2">Set Up Your Space</h3>
            <p className="text-sm text-secondary leading-relaxed">Position your device 6–8 feet away. Our AI maps your floor and detects the optimal field of view for full-body tracking.</p>
          </div>

          {/* Card 2 */}
          <div className="text-center group">
            <div className="relative mx-auto w-36 h-36 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-md hover:border-blue-400/60 hover:shadow-[0_12px_24px_rgba(59,130,246,0.25)] hover:-translate-y-1.5 transition-all duration-300 ease-out mb-4 hover-shine-effect">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-200 text-sm font-bold text-[#091426] shadow z-10">02</div>
              <img 
                src="/images/start_workout_set.png" 
                alt="Start Your Set" 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
            </div>
            <h3 className="font-extrabold text-primary mb-2">Start Your Set</h3>
            <p className="text-sm text-secondary leading-relaxed">Begin your movement. Aura AI tracks 32 kinetic points in real-time, monitoring depth, speed, and path consistency with 99.8% accuracy.</p>
          </div>

          {/* Card 3 */}
          <div className="text-center group">
            <div className="relative mx-auto w-36 h-36 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-md hover:border-blue-400/60 hover:shadow-[0_12px_24px_rgba(59,130,246,0.25)] hover:-translate-y-1.5 transition-all duration-300 ease-out mb-4 hover-shine-effect">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-200 text-sm font-bold text-[#091426] shadow z-10">03</div>
              <img 
                src="/images/refine_workout_form.png" 
                alt="Refine Your Form" 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
            </div>
            <h3 className="font-extrabold text-primary mb-2">Refine Your Form</h3>
            <p className="text-sm text-secondary leading-relaxed">Receive instant haptic or audio feedback for adjustments. If form breaks down, the session pauses to show an expert correction tutorial.</p>
          </div>

          {/* Card 4 */}
          <div className="text-center group">
            <div className="relative mx-auto w-36 h-36 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-md hover:border-blue-400/60 hover:shadow-[0_12px_24px_rgba(59,130,246,0.25)] hover:-translate-y-1.5 transition-all duration-300 ease-out mb-4 hover-shine-effect">
              <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-200 text-sm font-bold text-[#091426] shadow z-10">04</div>
              <img 
                src="/images/track_workout_progress.png" 
                alt="Track Progress" 
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" 
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
            </div>
            <h3 className="font-extrabold text-primary mb-2">Track Progress</h3>
            <p className="text-sm text-secondary leading-relaxed">Review comprehensive velocity charts and range-of-motion maps. Data is synced to your profile to adjust your next training phase.</p>
          </div>
        </div>
      </section>

      {/* TECH BEHIND THE GAINS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-[#091426]">The Tech Behind the Gains</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tech card with custom badge */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(37,99,235,0.12)', border: '1.5px solid rgba(37,99,235,0.25)' }}>
              <Cpu className="w-5 h-5" style={{ color: '#2563EB' }} />
            </div>
            <div>
              <h4 className="font-extrabold text-primary mb-2">Neural Kinetic Engine</h4>
              <p className="text-sm text-secondary">Proprietary AI models trained on 50,000+ professional athlete movement patterns. Our engine doesn't just see you—it understands the physics of your exertion.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.12)', border: '1.5px solid rgba(124,58,237,0.25)' }}>
              <Video className="w-5 h-5" style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <h4 className="font-extrabold text-primary mb-2">Real-time Analysis</h4>
              <p className="text-sm text-secondary">Every rep is dissected into three phases: Eccentric, Isometric, and Concentric. Optimize your tempo for maximum hypertrophy.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-emerald-100 hover:border-emerald-300 transition-all duration-300 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(5,150,105,0.12)', border: '1.5px solid rgba(5,150,105,0.25)' }}>
              <Book className="w-5 h-5" style={{ color: '#059669' }} />
            </div>
            <div>
              <h4 className="font-extrabold text-primary mb-2">Expert Guides</h4>
              <p className="text-sm text-secondary">Library of over 1,200 tutorials mapped to your specific biomechanical weaknesses identified by the AI.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-amber-100 hover:border-amber-300 transition-all duration-300 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(217,119,6,0.12)', border: '1.5px solid rgba(217,119,6,0.25)' }}>
              <Clock className="w-5 h-5" style={{ color: '#D97706' }} />
            </div>
            <div>
              <h4 className="font-extrabold text-primary mb-2">Privacy-First Processing</h4>
              <p className="text-sm text-secondary">We value your privacy as much as your performance. All video data is processed locally on your device; only anonymized numerical data points are synced to the cloud.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12">
        <div className="rounded-3xl bg-[#091426] p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to elevate your training?</h3>
          <p className="mb-6">Join 40,000+ athletes who have replaced guesswork with precision.</p>
            <div className="flex justify-center gap-4">
            <button onClick={() => onNavigate && onNavigate('workouts')} className="px-6 py-3 bg-white text-[#091426] font-bold rounded-full">Start Your First Workout</button>
            <button onClick={() => onNavigate && onNavigate('home')} className="px-6 py-3 bg-transparent border border-white rounded-full">Return to home</button>
          </div>
        </div>
      </section>
    </div>
  );
}
