import { useCallback, useEffect, useRef, useState } from 'react';
import { Award, BookOpen, Crown, Play, RotateCcw, Sparkles, Volume2, X } from 'lucide-react';
import {
  BADGES,
  HADITH_DATA,
  STATION_LIST,
  type AvatarId,
  type StationId,
} from './data/adabContent';
import { soundEngine } from './audio/soundEngine';
import { SunnahWorldScene, type AvatarAnimAction } from './game/SunnahWorldScene';
import { TitleOverlay } from './components/TitleOverlay';
import { GameHUD } from './components/GameHUD';
import { MissionModal } from './components/MissionModal';
import { BadgesAndCertModal } from './components/BadgesAndCertModal';

const TOTAL_WORLD_STARS = 6;
const TOTAL_MISSION_STARS = STATION_LIST.length * 3; // 15
const MAX_STARS = TOTAL_WORLD_STARS + TOTAL_MISSION_STARS; // 21

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SunnahWorldScene | null>(null);

  const [started, setStarted] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('amir');
  const [muted, setMuted] = useState(false);

  const [stars, setStars] = useState(0);
  const [completedStations, setCompletedStations] = useState<StationId[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [nearStation, setNearStation] = useState<StationId | null>(null);

  const [activeMission, setActiveMission] = useState<StationId | null>(null);
  const [rewardsModalTab, setRewardsModalTab] = useState<'badges' | 'cert' | null>(null);
  const [showHadithModal, setShowHadithModal] = useState(false);
  const [paused, setPaused] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3600);
  }, []);

  // Stable callback refs for the Three.js scene
  const callbacksRef = useRef({
    onNearStation: (id: StationId | null) => setNearStation(id),
    onOpenStation: (id: StationId) => setActiveMission(id),
    onCollectWorldStar: () => {
      setStars((s) => s + 1);
    },
  });

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const world = new SunnahWorldScene(mount, selectedAvatar, {
      onNearStation: (id) => callbacksRef.current.onNearStation(id),
      onOpenStation: (id) => callbacksRef.current.onOpenStation(id),
      onCollectWorldStar: () => callbacksRef.current.onCollectWorldStar(),
    });
    sceneRef.current = world;

    return () => {
      world.dispose();
      sceneRef.current = null;
    };
    // Mount WebGL once cleanly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync phase to Three.js scene
  useEffect(() => {
    const world = sceneRef.current;
    if (!world) return;
    if (!started) {
      world.setPhase('title');
    } else if (activeMission || rewardsModalTab || showHadithModal || paused) {
      world.setPhase('modal');
    } else {
      world.setPhase('playing');
    }
  }, [started, activeMission, rewardsModalTab, showHadithModal, paused]);

  // Sync completed stations
  useEffect(() => {
    sceneRef.current?.setCompletedStations(completedStations);
  }, [completedStations]);

  // Escape key handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Escape') return;
      if (activeMission) {
        setActiveMission(null);
        soundEngine.stopSpeech();
      } else if (rewardsModalTab) {
        setRewardsModalTab(null);
      } else if (showHadithModal) {
        setShowHadithModal(false);
        soundEngine.stopSpeech();
      } else if (started) {
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeMission, rewardsModalTab, showHadithModal, started]);

  const handleSelectAvatar = (id: AvatarId) => {
    setSelectedAvatar(id);
    sceneRef.current?.setAvatar(id);
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setMuted(next);
  };

  const handleStartGame = () => {
    setStarted(true);
    soundEngine.speak(
      'Selamat datang ke Taman Bintang Sunnah! Gerakkan watak ke Stesen Satu untuk memulakan misi Adab Makan dan Minum.'
    );
  };

  const handleMissionComplete = (stationId: StationId, badgeId: string, starsEarned: number) => {
    setActiveMission(null);
    if (starsEarned > 0) {
      setStars((s) => s + starsEarned);
    }

    const nextStations = completedStations.includes(stationId)
      ? completedStations
      : [...completedStations, stationId];
    setCompletedStations(nextStations);

    const nextBadges = [...unlockedBadges];
    if (!nextBadges.includes(badgeId)) {
      nextBadges.push(badgeId);
    }

    const allDone = nextStations.length >= STATION_LIST.length;
    if (allDone && !nextBadges.includes('bintang_sunnah')) {
      nextBadges.push('bintang_sunnah');
    }
    setUnlockedBadges(nextBadges);

    const badgeTitle = BADGES.find((b) => b.id === badgeId)?.title ?? 'Lencana Sunnah';

    if (allDone) {
      soundEngine.playVictoryFanfare();
      soundEngine.speak(
        'Tahniah! Kamu kini Bintang Sunnah Sejati! Sijil Kejayaan dan Jubah Bintang Sunnah telah dibuka!'
      );
      showToast('Tahniah! Semua misi selesai & Sijil Kejayaan dibuka!');
      setRewardsModalTab('cert');
    } else {
      showToast(`Syabas! Lencana "${badgeTitle}" & +${starsEarned} Bintang Emas diperoleh!`);
    }
  };

  const handleAvatarAction = useCallback((action: AvatarAnimAction) => {
    sceneRef.current?.triggerAvatarAction(action);
  }, []);

  const allMissionsDone = completedStations.length >= STATION_LIST.length;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-sky-100">
      {/* Dedicated isolated WebGL canvas container */}
      <div ref={canvasMountRef} className="absolute inset-0 h-full w-full" />

      {/* Title Screen */}
      {!started && (
        <TitleOverlay
          selectedAvatar={selectedAvatar}
          onSelectAvatar={handleSelectAvatar}
          onStart={handleStartGame}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Playing HUD */}
      {started && (
        <GameHUD
          stars={stars}
          maxStars={MAX_STARS}
          completedStations={completedStations}
          unlockedBadgesCount={unlockedBadges.length}
          nearStation={nearStation}
          muted={muted}
          onToggleMute={handleToggleMute}
          onOpenStation={(id) => {
            sceneRef.current?.focusStation(id);
            setActiveMission(id);
          }}
          onFocusStation={(id) => sceneRef.current?.focusStation(id)}
          onOpenRewards={() => setRewardsModalTab(allMissionsDone ? 'cert' : 'badges')}
          onOpenHadith={() => {
            setShowHadithModal(true);
            soundEngine.speak(HADITH_DATA.audioText);
          }}
          onPause={() => setPaused(true)}
          onVirtualMove={(x, y) => sceneRef.current?.setVirtualMove(x, y)}
          onJump={() => sceneRef.current?.triggerJump()}
        />
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="pointer-events-none fixed left-1/2 top-20 z-40 -translate-x-1/2 rounded-2xl border-2 border-amber-400 bg-amber-50 px-5 py-2.5 font-display text-sm sm:text-base font-bold text-amber-950 shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Active Station Mission Modal */}
      {activeMission && (
        <MissionModal
          stationId={activeMission}
          alreadyCompleted={completedStations.includes(activeMission)}
          onClose={() => setActiveMission(null)}
          onComplete={handleMissionComplete}
          onAvatarAction={handleAvatarAction}
        />
      )}

      {/* Badges & Certificate Modal */}
      {rewardsModalTab && (
        <BadgesAndCertModal
          stars={stars}
          maxStars={MAX_STARS}
          unlockedBadges={unlockedBadges}
          allMissionsDone={allMissionsDone}
          initialTab={rewardsModalTab}
          onClose={() => setRewardsModalTab(null)}
        />
      )}

      {/* Hadith Reference Modal */}
      {showHadithModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="relative w-full max-w-lg rounded-3xl border-4 border-amber-400 bg-white p-6 shadow-2xl text-center">
            <button
              type="button"
              onClick={() => {
                soundEngine.stopSpeech();
                setShowHadithModal(false);
              }}
              className="btn-toy absolute right-4 top-4 rounded-xl border-2 border-slate-200 bg-slate-100 p-2 text-slate-600"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <BookOpen className="h-7 w-7" />
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-amber-950">
              {HADITH_DATA.title}
            </h2>

            <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
              <p className="font-arabic text-2xl sm:text-3xl font-bold text-amber-950 leading-loose">
                {HADITH_DATA.arabic}
              </p>
              <p className="mt-3 text-sm sm:text-base font-bold text-slate-700">
                "{HADITH_DATA.translation}"
              </p>
              <p className="mt-1 text-xs font-extrabold text-amber-700">
                ({HADITH_DATA.source})
              </p>
            </div>

            <button
              type="button"
              onClick={() => soundEngine.speak(HADITH_DATA.audioText)}
              className="btn-toy mt-4 inline-flex items-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-5 py-2.5 font-display text-base font-bold text-white"
            >
              <Volume2 className="h-5 w-5" /> Dengar Audio Hadith
            </button>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {paused && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/55 p-4">
          <div className="w-full max-w-sm rounded-3xl border-4 border-sky-400 bg-white p-6 text-center shadow-2xl">
            <h2 className="font-display text-2xl font-bold text-slate-800">Permainan Dijeda</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Rehat sebentar! Teruskan pengembaraan Bintang Sunnah kamu.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPaused(false);
                }}
                className="btn-toy flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3 font-display text-lg font-bold text-white"
              >
                <Play className="h-5 w-5 fill-current" /> Sambung Main
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPaused(false);
                  setRewardsModalTab('badges');
                }}
                className="btn-toy flex items-center justify-center gap-2 rounded-2xl border-b-4 border-violet-700 bg-violet-500 py-3 font-display text-base font-bold text-white"
              >
                <Award className="h-5 w-5" /> Lihat Lencana &amp; Sijil
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPaused(false);
                  setStarted(false);
                }}
                className="btn-toy flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-slate-100 py-2.5 font-display text-base font-bold text-slate-700"
              >
                <RotateCcw className="h-4 w-4" /> Kembali ke Skrin Utama
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
