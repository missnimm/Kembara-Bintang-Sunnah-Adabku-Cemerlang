import React, { useEffect, useState } from 'react';
import { Volume2, Play, Sparkles, BookOpen, Star } from 'lucide-react';
import { HADITH_DATA, type AvatarId } from '../data/adabContent';
import { soundEngine } from '../audio/soundEngine';

interface TitleOverlayProps {
  selectedAvatar: AvatarId;
  onSelectAvatar: (id: AvatarId) => void;
  onStart: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  selectedAvatar,
  onSelectAvatar,
  onStart,
  muted,
  onToggleMute,
}) => {
  const [showHadith, setShowHadith] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        soundEngine.playClick();
        onStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);

  const handlePlayHadith = () => {
    soundEngine.playClick();
    setShowHadith(true);
    soundEngine.speak(HADITH_DATA.audioText);
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 pointer-events-none">
      {/* Top Row: Subject Pill + Audio Toggle */}
      <div className="flex items-center justify-between">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border-2 border-amber-400 bg-amber-50/95 px-4 py-2 shadow-md">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="font-display text-sm sm:text-base font-bold text-amber-900">
            Pendidikan Islam Tahun 2
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onToggleMute();
          }}
          className="pointer-events-auto btn-toy flex items-center gap-2 rounded-2xl border-2 border-sky-300 bg-white/95 px-4 py-2 font-bold text-sky-900 shadow-md hover:bg-sky-50"
          aria-label="Tukar Audio"
        >
          <Volume2 className={`h-5 w-5 ${muted ? 'text-slate-400' : 'text-sky-600'}`} />
          <span className="text-sm">{muted ? 'Audio Senyap' : 'Audio Aktif'}</span>
        </button>
      </div>

      {/* Center Card: Title Lockup + Avatar Picker + Start CTA (leaving upper/side 3D world visible) */}
      <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center gap-4 pointer-events-auto">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="w-full rounded-3xl border-4 border-amber-400 bg-white/95 px-5 py-5 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <svg
              viewBox="0 0 520 112"
              className="h-20 sm:h-24 w-full max-w-md"
              role="img"
              aria-label="Kembara Bintang Sunnah"
            >
              <defs>
                <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              {/* Left & Right Gold Stars */}
              <polygon
                points="38,16 45,32 62,34 49,46 53,63 38,54 23,63 27,46 14,34 31,32"
                fill="#facc15"
                stroke="#b45309"
                strokeWidth="2.5"
              />
              <polygon
                points="482,16 489,32 506,34 493,46 497,63 482,54 467,63 471,46 458,34 475,32"
                fill="#facc15"
                stroke="#b45309"
                strokeWidth="2.5"
              />
              <text
                x="260"
                y="46"
                textAnchor="middle"
                fontFamily="Fredoka, sans-serif"
                fontWeight="700"
                fontSize="36"
                fill="url(#titleGrad)"
              >
                KEMBARA BINTANG SUNNAH
              </text>
              <rect x="115" y="64" width="290" height="32" rx="14" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
              <text
                x="260"
                y="85"
                textAnchor="middle"
                fontFamily="Nunito, sans-serif"
                fontWeight="800"
                fontSize="16.5"
                fill="#92400e"
              >
                Adab Makan &amp; Minum Cara Rasulullah SAW
              </text>
            </svg>

            {/* Avatar Selector */}
            <p className="mt-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-500">
              Pilih Watak Roblox 3D Kamu
            </p>
            <div className="mt-2 grid w-full grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onSelectAvatar('amir');
                }}
                className={`btn-toy flex items-center gap-3 rounded-2xl border-3 p-3 text-left ${
                  selectedAvatar === 'amir'
                    ? 'border-sky-500 bg-sky-50 shadow-md ring-2 ring-sky-300'
                    : 'border-slate-200 bg-slate-50 hover:border-sky-300'
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow">
                  <svg viewBox="0 0 40 40" className="h-8 w-8">
                    <rect x="8" y="6" width="24" height="9" rx="2" fill="#0f172a" />
                    <rect x="8" y="13" width="24" height="2" fill="#facc15" />
                    <rect x="10" y="15" width="20" height="18" rx="4" fill="#fbd3b4" />
                    <circle cx="16" cy="23" r="2" fill="#1e293b" />
                    <circle cx="24" cy="23" r="2" fill="#1e293b" />
                    <path d="M16 28 Q20 31 24 28" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-display text-base font-bold text-slate-800">Adik Amir</div>
                  <div className="text-xs font-semibold text-sky-700">Songkok &amp; Baju Melayu</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onSelectAvatar('aisyah');
                }}
                className={`btn-toy flex items-center gap-3 rounded-2xl border-3 p-3 text-left ${
                  selectedAvatar === 'aisyah'
                    ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-300'
                    : 'border-slate-200 bg-slate-50 hover:border-pink-300'
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white shadow">
                  <svg viewBox="0 0 40 40" className="h-8 w-8">
                    <path d="M7 22 Q7 7 20 7 Q33 7 33 22 L35 34 L5 34 Z" fill="#f472b6" />
                    <rect x="12" y="15" width="16" height="16" rx="4" fill="#fbd3b4" />
                    <circle cx="17" cy="22" r="1.8" fill="#1e293b" />
                    <circle cx="23" cy="22" r="1.8" fill="#1e293b" />
                    <path d="M17 27 Q20 29.5 23 27" stroke="#7c2d12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="font-display text-base font-bold text-slate-800">Adik Aisyah</div>
                  <div className="text-xs font-semibold text-pink-700">Tudung &amp; Baju Kurung</div>
                </div>
              </button>
            </div>

            {/* Interactive Hadith Quick-Listen */}
            {showHadith && (
              <div className="mt-3 w-full rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-center">
                <p className="font-arabic text-xl sm:text-2xl font-bold text-amber-900 leading-relaxed">
                  {HADITH_DATA.arabic}
                </p>
                <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700">{HADITH_DATA.translation}</p>
              </div>
            )}

            {/* Primary Actions */}
            <div className="mt-4 flex w-full flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onStart();
                }}
                className="btn-toy flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3.5 font-display text-lg sm:text-xl font-bold text-white shadow-lg hover:bg-emerald-400"
              >
                <Play className="h-6 w-6 fill-current" />
                Mula Kembara!
              </button>

              <button
                type="button"
                onClick={handlePlayHadith}
                className="btn-toy flex items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-4 py-3.5 font-display text-sm sm:text-base font-bold text-amber-950 shadow-md hover:bg-amber-300"
              >
                <BookOpen className="h-5 w-5" />
                Dengar Hadith
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Single flat control hint line */}
      <div className="mx-auto flex items-center gap-2 rounded-xl bg-slate-900/80 px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow">
        <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
        <span>WASD / Anak Panah Gerak · Space Lompat · E / Klik Stesen Misi · Seret Tetikus Pusing Kamera</span>
      </div>
    </div>
  );
};
