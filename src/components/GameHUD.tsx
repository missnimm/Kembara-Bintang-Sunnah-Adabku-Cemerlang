import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  Pause,
  Star,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { STATION_LIST, type StationId } from '../data/adabContent';
import { soundEngine } from '../audio/soundEngine';

interface GameHUDProps {
  stars: number;
  maxStars: number;
  completedStations: StationId[];
  unlockedBadgesCount: number;
  nearStation: StationId | null;
  muted: boolean;
  onToggleMute: () => void;
  onOpenStation: (id: StationId) => void;
  onFocusStation: (id: StationId) => void;
  onOpenRewards: () => void;
  onOpenHadith: () => void;
  onPause: () => void;
  onVirtualMove: (x: number, y: number) => void;
  onJump: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stars,
  maxStars,
  completedStations,
  unlockedBadgesCount,
  nearStation,
  muted,
  onToggleMute,
  onOpenStation,
  onFocusStation,
  onOpenRewards,
  onOpenHadith,
  onPause,
  onVirtualMove,
  onJump,
}) => {
  const [dockOpen, setDockOpen] = useState(true);
  const [showTouchPad, setShowTouchPad] = useState(false);

  const nearMeta = nearStation ? STATION_LIST.find((s) => s.id === nearStation) : null;
  const allComplete = completedStations.length >= STATION_LIST.length;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
      {/* Top Perimeter Status Row (Zero backdrop-filter, high-contrast solid surfaces) */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* Left Status Cluster: Stars & Mission Progress */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-400 bg-white/95 px-3.5 py-1.5 shadow-md">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            <span className="font-display text-lg font-bold text-amber-900 tabular-nums">
              {stars}
              <span className="text-xs font-bold text-amber-600">/{maxStars}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border-2 border-emerald-400 bg-white/95 px-3.5 py-1.5 shadow-md">
            <Compass className="h-5 w-5 text-emerald-600" />
            <span className="font-display text-sm sm:text-base font-bold text-emerald-900 tabular-nums">
              Misi: {completedStations.length}/{STATION_LIST.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenRewards();
            }}
            className={`btn-toy flex items-center gap-1.5 rounded-2xl border-2 px-3.5 py-1.5 font-display text-sm font-bold shadow-md ${
              allComplete
                ? 'border-amber-500 bg-amber-400 text-amber-950 hover:bg-amber-300'
                : 'border-violet-300 bg-white/95 text-violet-900 hover:bg-violet-50'
            }`}
          >
            <Award className="h-5 w-5" />
            <span>Lencana ({unlockedBadgesCount}/6) &amp; Sijil</span>
          </button>
        </div>

        {/* Right Quick Utility Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenHadith();
            }}
            className="btn-toy flex items-center gap-1.5 rounded-2xl border-2 border-sky-300 bg-white/95 px-3 py-1.5 text-sm font-bold text-sky-900 shadow-md hover:bg-sky-50"
          >
            <BookOpen className="h-4 w-4 text-sky-600" />
            <span className="hidden sm:inline">Nota Hadith</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTouchPad((v) => !v)}
            className="btn-toy rounded-2xl border-2 border-slate-300 bg-white/95 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 shadow-md hover:bg-slate-50"
          >
            {showTouchPad ? 'Tutup Pad' : 'Pad Sentuh'}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="btn-toy rounded-2xl border-2 border-slate-300 bg-white/95 p-2 text-slate-700 shadow-md hover:bg-slate-50"
            aria-label="Audio"
          >
            {muted ? <VolumeX className="h-5 w-5 text-rose-500" /> : <Volume2 className="h-5 w-5 text-sky-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onPause();
            }}
            className="btn-toy rounded-2xl border-2 border-slate-300 bg-white/95 p-2 text-slate-700 shadow-md hover:bg-slate-50"
            aria-label="Jeda"
          >
            <Pause className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Optional Touch Virtual Controls on left/right bottom corners */}
      {showTouchPad && (
        <div className="flex items-end justify-between px-2 pb-20 pointer-events-none">
          <div className="pointer-events-auto grid grid-cols-3 gap-1.5 rounded-2xl border-2 border-slate-300 bg-white/90 p-2 shadow-lg">
            <div />
            <button
              type="button"
              onPointerDown={() => onVirtualMove(0, 1)}
              onPointerUp={() => onVirtualMove(0, 0)}
              onPointerLeave={() => onVirtualMove(0, 0)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white active:bg-sky-600"
            >
              <ArrowUp className="h-6 w-6" />
            </button>
            <div />
            <button
              type="button"
              onPointerDown={() => onVirtualMove(-1, 0)}
              onPointerUp={() => onVirtualMove(0, 0)}
              onPointerLeave={() => onVirtualMove(0, 0)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white active:bg-sky-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onPointerDown={() => onVirtualMove(0, -1)}
              onPointerUp={() => onVirtualMove(0, 0)}
              onPointerLeave={() => onVirtualMove(0, 0)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white active:bg-sky-600"
            >
              <ArrowDown className="h-6 w-6" />
            </button>
            <button
              type="button"
              onPointerDown={() => onVirtualMove(1, 0)}
              onPointerUp={() => onVirtualMove(0, 0)}
              onPointerLeave={() => onVirtualMove(0, 0)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white active:bg-sky-600"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>

          <button
            type="button"
            onPointerDown={() => onJump()}
            className="pointer-events-auto btn-toy flex h-16 w-20 items-center justify-center rounded-2xl border-b-4 border-amber-600 bg-amber-400 font-display text-base font-bold text-amber-950 shadow-lg"
          >
            LOMPAT
          </button>
        </div>
      )}

      {/* Bottom Dock Area (Centered, Collapsible, Zero Viewport Clutter) */}
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2">
        {/* Contextual Proximity Action Prompt */}
        {nearMeta && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenStation(nearMeta.id);
            }}
            className="pointer-events-auto btn-toy flex items-center gap-2.5 rounded-2xl border-2 border-amber-400 bg-amber-400 px-5 py-2.5 font-display text-base font-bold text-amber-950 shadow-xl hover:bg-amber-300"
          >
            <Sparkles className="h-5 w-5" />
            <span>
              Tekan [E] atau Klik: {nearMeta.fullTitle}
            </span>
          </button>
        )}

        {/* Collapse/Expand Toggle Tab */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setDockOpen((o) => !o);
          }}
          className="pointer-events-auto flex items-center gap-1.5 rounded-t-xl border-2 border-b-0 border-slate-300 bg-white/95 px-4 py-1 text-xs font-extrabold text-slate-700 shadow"
        >
          {dockOpen ? (
            <>
              <ChevronDown className="h-4 w-4" /> Sembunyi Peta Misi
            </>
          ) : (
            <>
              <ChevronUp className="h-4 w-4" /> Tunjuk Peta Misi
            </>
          )}
        </button>

        {dockOpen && (
          <div className="pointer-events-auto w-full rounded-2xl border-2 border-slate-300 bg-white/95 p-2 shadow-xl">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {STATION_LIST.map((st) => {
                const done = completedStations.includes(st.id);
                const active = nearStation === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      onFocusStation(st.id);
                      onOpenStation(st.id);
                    }}
                    className={`btn-toy flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs sm:text-sm font-bold transition-colors ${
                      done
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        : active
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: st.accent }}
                      />
                    )}
                    <span>{st.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
