import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Droplets,
  Heart,
  Shield,
  Sparkles,
  Star,
  Umbrella,
  Volume2,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  DOA_SEBELUM_MAKAN,
  DOA_SELEPAS_MAKAN,
  LAMPU_MERAH_CHALLENGES,
  POKOK_APPLES,
  UJI_MINDA_QUESTIONS,
  type StationId,
} from '../data/adabContent';
import { soundEngine } from '../audio/soundEngine';
import type { AvatarAnimAction } from '../game/SunnahWorldScene';

interface MissionModalProps {
  stationId: StationId;
  alreadyCompleted: boolean;
  onClose: () => void;
  onComplete: (stationId: StationId, badgeId: string, starsEarned: number) => void;
  onAvatarAction: (action: AvatarAnimAction) => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  stationId,
  alreadyCompleted,
  onClose,
  onComplete,
  onAvatarAction,
}) => {
  // Stesen 1 state
  const [s1Step, setS1Step] = useState<1 | 2 | 3>(1);
  const [bubblesPopped, setBubblesPopped] = useState<number[]>([]);
  const [s1Feedback, setS1Feedback] = useState<string>('');

  // Stesen 2 state
  const [s2Step, setS2Step] = useState<1 | 2 | 3>(1);
  const [s2Feedback, setS2Feedback] = useState<string>('');
  const [chewCount, setChewCount] = useState(0);

  // Lampu Merah state
  const [lmIdx, setLmIdx] = useState(0);
  const [lmGreen, setLmGreen] = useState(false);
  const [lmFeedback, setLmFeedback] = useState('');

  // Pokok Kebaikan state
  const [applesPicked, setApplesPicked] = useState<string[]>([]);
  const [activeAppleId, setActiveAppleId] = useState<string | null>(null);

  // Stesen 3 & Uji Minda state
  const [s3Step, setS3Step] = useState<1 | 2 | 3 | 4>(1);
  const [dishesCleaned, setDishesCleaned] = useState<number[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [quizSolved, setQuizSolved] = useState(false);

  // Auto-narrate station opening
  useEffect(() => {
    if (stationId === 'stesen1') {
      onAvatarAction('wash');
      soundEngine.speak('Stesen satu, adab sebelum makan! Mula-mula, mari basuh tangan sampai bersih dengan sabun.');
    } else if (stationId === 'stesen2') {
      onAvatarAction('sit');
      soundEngine.speak('Stesen dua, adab semasa makan! Tangan manakah yang patut kita gunakan?');
    } else if (stationId === 'lampu_merah') {
      onAvatarAction('idle');
      soundEngine.speak(LAMPU_MERAH_CHALLENGES[0].audioText);
    } else if (stationId === 'pokok') {
      onAvatarAction('idle');
      soundEngine.speak('Selamat datang ke Pokok Kebaikan! Klik ketiga-tiga epal merah untuk mendengar hikmah ikut Sunnah.');
    } else if (stationId === 'stesen3') {
      onAvatarAction('doa');
      soundEngine.speak('Stesen tiga, adab selepas makan! Mari ucap Alhamdulillah dan baca doa selepas makan.');
    }
    return () => {
      onAvatarAction('idle');
      soundEngine.stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId]);

  const finishMission = (badgeId: string) => {
    onAvatarAction('celebrate');
    soundEngine.playMissionComplete();
    onComplete(stationId, badgeId, alreadyCompleted ? 0 : 3);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/55 p-3 sm:p-5">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-amber-400 bg-white p-5 sm:p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            soundEngine.stopSpeech();
            onClose();
          }}
          className="btn-toy absolute right-4 top-4 rounded-xl border-2 border-slate-200 bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ==================== STESEN 1: SEBELUM MAKAN ==================== */}
        {stationId === 'stesen1' && (
          <div>
            <div className="flex items-center gap-2 text-sky-700">
              <Droplets className="h-6 w-6" />
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Stesen 1: Adab Sebelum Makan
              </h2>
            </div>

            {/* Step Indicator */}
            <div className="mt-3 flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2.5 flex-1 rounded-full ${
                    s1Step >= step ? 'bg-sky-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {s1Step === 1 && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-sm font-extrabold text-sky-800">
                  Langkah 1/3: Basuh tangan sampai bersih!
                </div>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  Ketuk semua 6 buih sabun di bawah untuk mencuci tangan!
                </p>

                <div className="mt-4 relative mx-auto flex h-52 max-w-md flex-wrap items-center justify-center gap-4 rounded-3xl border-2 border-sky-200 bg-sky-50 p-4">
                  {[0, 1, 2, 3, 4, 5].map((id) => {
                    const popped = bubblesPopped.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={popped}
                        onClick={() => {
                          soundEngine.playBubblePop();
                          const next = [...bubblesPopped, id];
                          setBubblesPopped(next);
                          if (next.length === 6) {
                            soundEngine.playWaterSplash();
                            soundEngine.speak('Wah, tangan sudah bersih dan wangi! Sekarang mari duduk dengan tertib.');
                            setTimeout(() => {
                              setS1Step(2);
                              onAvatarAction('sit');
                            }, 750);
                          }
                        }}
                        className={`btn-toy flex h-16 w-16 items-center justify-center rounded-full border-2 font-display text-lg font-bold transition-all ${
                          popped
                            ? 'scale-75 border-emerald-300 bg-emerald-100 text-emerald-600 opacity-60'
                            : 'border-sky-400 bg-white text-sky-600 shadow-md hover:scale-105 hover:bg-sky-100'
                        }`}
                      >
                        {popped ? <CheckCircle2 className="h-7 w-7" /> : 'Buih'}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm font-extrabold text-sky-700 tabular-nums">
                  Kebersihan Tangan: {bubblesPopped.length}/6
                </p>
              </div>
            )}

            {s1Step === 2 && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-sm font-extrabold text-sky-800">
                  Langkah 2/3: Duduk Dengan Tertib (Jangan Berdiri)
                </div>
                <p className="mt-2 text-base font-bold text-slate-700">
                  Bagaimanakah cara kita bersedia untuk makan?
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playWrong();
                      const msg = 'Op! Jangan makan sambil berdiri atau berjalan. Mari duduk dengan tertib!';
                      setS1Feedback(msg);
                      soundEngine.speak(msg);
                    }}
                    className="btn-toy flex flex-col items-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 hover:border-rose-400"
                  >
                    <svg viewBox="0 0 80 80" className="h-16 w-16">
                      <circle cx="40" cy="18" r="10" fill="#fb7185" />
                      <rect x="31" y="30" width="18" height="24" rx="4" fill="#f43f5e" />
                      <line x1="35" y1="54" x2="27" y2="72" stroke="#881337" strokeWidth="5" strokeLinecap="round" />
                      <line x1="45" y1="54" x2="55" y2="72" stroke="#881337" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                    <span className="font-display text-base font-bold text-rose-900">
                      Makan Sambil Berdiri
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playCorrect();
                      onAvatarAction('sit');
                      setS1Feedback('Bagus! Duduk bersimpuh atau bersila dengan tertib adalah adab yang mulia.');
                      soundEngine.speak(DOA_SEBELUM_MAKAN.audioText);
                      setTimeout(() => {
                        setS1Feedback('');
                        setS1Step(3);
                        onAvatarAction('doa');
                      }, 800);
                    }}
                    className="btn-toy flex flex-col items-center gap-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 hover:border-emerald-500"
                  >
                    <svg viewBox="0 0 80 80" className="h-16 w-16">
                      <rect x="14" y="58" width="52" height="10" rx="4" fill="#fca5a5" />
                      <circle cx="40" cy="22" r="10" fill="#34d399" />
                      <rect x="30" y="34" width="20" height="20" rx="5" fill="#10b981" />
                      <ellipse cx="40" cy="57" rx="18" ry="6" fill="#047857" />
                    </svg>
                    <span className="font-display text-base font-bold text-emerald-900">
                      Duduk Dengan Tertib
                    </span>
                  </button>
                </div>

                {s1Feedback && (
                  <p className="mt-3 rounded-xl bg-amber-100 p-2.5 text-sm font-bold text-amber-900">
                    {s1Feedback}
                  </p>
                )}
              </div>
            )}

            {s1Step === 3 && (
              <div className="mt-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm font-extrabold text-amber-900">
                    Langkah 3/3: Baca Bismillah &amp; Doa Makan
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
                  <p className="font-arabic text-2xl sm:text-3xl font-bold text-amber-950 leading-loose">
                    {DOA_SEBELUM_MAKAN.arabic}
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-sky-800">{DOA_SEBELUM_MAKAN.rumi}</p>
                  <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-600">{DOA_SEBELUM_MAKAN.meaning}</p>

                  <button
                    type="button"
                    onClick={() => soundEngine.speak(DOA_SEBELUM_MAKAN.audioText)}
                    className="btn-toy mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-sky-400 bg-white px-4 py-2 text-sm font-bold text-sky-800 shadow-sm hover:bg-sky-50"
                  >
                    <Volume2 className="h-4 w-4" />
                    Dengar Audio Doa
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => finishMission('tangan_bersih')}
                  className="btn-toy mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 font-display text-lg font-bold text-white shadow-lg hover:bg-emerald-400"
                >
                  <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
                  Amin! Selesai Stesen 1 (+3 Bintang)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== STESEN 2: SEMASA MAKAN ==================== */}
        {stationId === 'stesen2' && (
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="h-6 w-6" />
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Stesen 2: Adab Semasa Makan
              </h2>
            </div>

            <div className="mt-3 flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2.5 flex-1 rounded-full ${
                    s2Step >= step ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {s2Step === 1 && (
              <div className="mt-4 text-center">
                <div className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-extrabold text-emerald-900">
                  Langkah 1/3: Guna Tangan Mana?
                </div>
                <p className="mt-2 text-base font-bold text-slate-700">
                  Pilih tangan yang disunnahkan oleh Rasulullah SAW untuk makan dan minum:
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playWrong();
                      const msg = 'Op! Itu tangan kiri. Nabi pesan makan dengan tangan kanan!';
                      setS2Feedback(msg);
                      soundEngine.speak(msg);
                    }}
                    className="btn-toy rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 hover:border-rose-300"
                  >
                    <div className="font-display text-lg font-bold text-slate-800">Tangan Kiri</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">Kurang tepat</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playCorrect();
                      onAvatarAction('eat');
                      const msg = 'Syabas! Sentiasa makan dengan tangan kanan. Sekarang ambil lauk yang paling dekat!';
                      setS2Feedback('');
                      soundEngine.speak(msg);
                      setS2Step(2);
                    }}
                    className="btn-toy rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 hover:bg-emerald-100"
                  >
                    <div className="font-display text-lg font-bold text-emerald-900">Tangan Kanan</div>
                    <div className="mt-1 text-xs font-bold text-emerald-700">Cara Sunnah Nabi!</div>
                  </button>
                </div>
                {s2Feedback && (
                  <p className="mt-3 rounded-xl bg-amber-100 p-2.5 text-sm font-bold text-amber-900">{s2Feedback}</p>
                )}
              </div>
            )}

            {s2Step === 2 && (
              <div className="mt-4 text-center">
                <div className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-extrabold text-emerald-900">
                  Langkah 2/3: Ambil Lauk Yang Paling Dekat
                </div>
                <p className="mt-2 text-base font-bold text-slate-700">
                  Di atas meja ada lauk dekat dan lauk jauh. Mana satu yang patut kamu ambil dahulu?
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playCorrect();
                      setS2Feedback('');
                      soundEngine.speak('Betul! Ambil lauk yang paling dekat dengan kita. Sekarang kunyah perlahan-lahan!');
                      setS2Step(3);
                    }}
                    className="btn-toy rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-center hover:bg-emerald-100"
                  >
                    <div className="font-display text-lg font-bold text-emerald-900">
                      Nasi &amp; Ayam (Paling Dekat)
                    </div>
                    <div className="mt-1 text-xs font-bold text-emerald-700">Hadith: Kul mimma yalik</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playWrong();
                      const msg = 'Jangan jangkau lauk yang jauh di hadapan orang lain. Ambil yang hampir dahulu!';
                      setS2Feedback(msg);
                      soundEngine.speak(msg);
                    }}
                    className="btn-toy rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-center hover:border-rose-400"
                  >
                    <div className="font-display text-lg font-bold text-amber-900">
                      Capai Buah di Hujung Meja
                    </div>
                    <div className="mt-1 text-xs font-semibold text-amber-700">Jauh melintasi pinggan</div>
                  </button>
                </div>
                {s2Feedback && (
                  <p className="mt-3 rounded-xl bg-amber-100 p-2.5 text-sm font-bold text-amber-900">{s2Feedback}</p>
                )}
              </div>
            )}

            {s2Step === 3 && (
              <div className="mt-4 text-center">
                <div className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-sm font-extrabold text-emerald-900">
                  Langkah 3/3: Kunyah Perlahan-lahan, Jangan Gelojoh
                </div>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  Klik butang kunyah perlahan sebanyak 3 kali supaya makanan mudah dihadam!
                </p>

                <div className="mx-auto mt-4 max-w-sm rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
                  <div className="h-4 w-full overflow-hidden rounded-full bg-white border border-emerald-300">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-200"
                      style={{ width: `${(chewCount / 3) * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-emerald-800 tabular-nums">
                    Kunyah Tenang: {chewCount}/3
                  </p>

                  {chewCount < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playChimeSoft();
                        const next = chewCount + 1;
                        setChewCount(next);
                        if (next === 3) {
                          soundEngine.speak('Tahniah! Mengunyah perlahan membuat perut sihat dan tidak gelojoh.');
                        }
                      }}
                      className="btn-toy mt-3 w-full rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3 font-display text-base font-bold text-white hover:bg-emerald-400"
                    >
                      Kunyah Perlahan ({chewCount + 1}/3)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => finishMission('tangan_kanan')}
                      className="btn-toy mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-b-4 border-amber-600 bg-amber-400 py-3 font-display text-base font-bold text-amber-950 hover:bg-amber-300"
                    >
                      <Star className="h-5 w-5 fill-amber-700" />
                      Selesai Stesen 2 (+3 Bintang)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== LAMPU MERAH SUNNAH ==================== */}
        {stationId === 'lampu_merah' && (
          <div>
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Awas! Lampu Merah Sunnah ({lmIdx + 1}/{LAMPU_MERAH_CHALLENGES.length})
              </h2>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
              {/* Interactive Traffic Light Graphic */}
              <div className="flex sm:flex-col items-center gap-2 rounded-2xl bg-slate-800 p-3 shadow-inner">
                <div
                  className={`h-8 w-8 rounded-full border-2 border-slate-900 ${
                    !lmGreen ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-red-950'
                  }`}
                />
                <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-amber-950" />
                <div
                  className={`h-8 w-8 rounded-full border-2 border-slate-900 ${
                    lmGreen ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-emerald-950'
                  }`}
                />
              </div>

              <div className="flex-1 text-left">
                <p className="text-sm font-extrabold uppercase tracking-wide text-rose-600">
                  Situasi Adab
                </p>
                <p className="mt-1 text-base font-bold text-slate-800">
                  {LAMPU_MERAH_CHALLENGES[lmIdx].situation}
                </p>
                <p className="mt-1 text-sm font-extrabold text-slate-600">
                  {LAMPU_MERAH_CHALLENGES[lmIdx].question}
                </p>
                <button
                  type="button"
                  onClick={() => soundEngine.speak(LAMPU_MERAH_CHALLENGES[lmIdx].audioText)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-sky-700 border border-sky-200"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Dengar Situasi
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {LAMPU_MERAH_CHALLENGES[lmIdx].options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={lmGreen}
                  onClick={() => {
                    if (opt.isCorrect) {
                      soundEngine.playGateOpen();
                      setLmGreen(true);
                      setLmFeedback(opt.feedback);
                      soundEngine.speak(opt.feedback);
                    } else {
                      soundEngine.playWrong();
                      setLmFeedback(opt.feedback);
                      soundEngine.speak(opt.feedback);
                    }
                  }}
                  className="btn-toy rounded-2xl border-2 border-slate-200 bg-white p-3.5 text-left font-bold text-slate-800 hover:border-sky-400 hover:bg-sky-50 disabled:opacity-60"
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {lmFeedback && (
              <div
                className={`mt-3 rounded-xl p-3 text-sm font-bold ${
                  lmGreen ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}
              >
                {lmFeedback}
              </div>
            )}

            {lmGreen && (
              <button
                type="button"
                onClick={() => {
                  if (lmIdx + 1 < LAMPU_MERAH_CHALLENGES.length) {
                    const nextIdx = lmIdx + 1;
                    setLmIdx(nextIdx);
                    setLmGreen(false);
                    setLmFeedback('');
                    soundEngine.speak(LAMPU_MERAH_CHALLENGES[nextIdx].audioText);
                  } else {
                    finishMission('penjaga_lampu');
                  }
                }}
                className="btn-toy mt-4 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3 font-display text-lg font-bold text-white hover:bg-emerald-400"
              >
                {lmIdx + 1 < LAMPU_MERAH_CHALLENGES.length
                  ? 'Soalan Lampu Merah Seterusnya →'
                  : 'Buka Pagar & Tuntut Lencana (+3 Bintang)'}
              </button>
            )}
          </div>
        )}

        {/* ==================== POKOK KEBAIKAN ==================== */}
        {stationId === 'pokok' && (
          <div>
            <div className="flex items-center gap-2 text-amber-700">
              <Sparkles className="h-6 w-6" />
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Pokok Kebaikan: Kenapa Kita Ikut Sunnah?
              </h2>
            </div>
            <p className="mt-1 text-sm font-bold text-slate-600">
              Ketuk ketiga-tiga buah epal kebaikan di bawah untuk mendengar hikmahnya!
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {POKOK_APPLES.map((ap) => {
                const picked = applesPicked.includes(ap.id);
                const isActive = activeAppleId === ap.id;
                const Icon = ap.emblem === 'heart' ? Heart : ap.emblem === 'shield' ? Shield : Umbrella;
                return (
                  <button
                    key={ap.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playStarCollect();
                      setActiveAppleId(ap.id);
                      soundEngine.speak(ap.audioText);
                      if (!picked) {
                        setApplesPicked((prev) => [...prev, ap.id]);
                      }
                    }}
                    className={`btn-toy flex flex-col items-center gap-2 rounded-2xl border-3 p-4 text-center ${
                      isActive
                        ? 'border-amber-500 bg-amber-50 shadow-md'
                        : picked
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-rose-200 bg-rose-50 hover:border-rose-400'
                    }`}
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow"
                      style={{ backgroundColor: ap.color }}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="font-display text-sm font-bold text-slate-800">{ap.title}</div>
                    {picked && (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Sudah Dengar
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {activeAppleId && (
              <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3.5 text-sm font-bold text-amber-950">
                {POKOK_APPLES.find((a) => a.id === activeAppleId)?.description}
              </div>
            )}

            <button
              type="button"
              disabled={applesPicked.length < 3}
              onClick={() => finishMission('pencinta_hikmah')}
              className="btn-toy mt-4 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 font-display text-lg font-bold text-white disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500"
            >
              {applesPicked.length < 3
                ? `Kutip Semua Epal Dahulu (${applesPicked.length}/3)`
                : 'Syabas! Tuntut Lencana Epal Hikmah (+3 Bintang)'}
            </button>
          </div>
        )}

        {/* ==================== STESEN 3 & UJI MINDA ==================== */}
        {stationId === 'stesen3' && (
          <div>
            <div className="flex items-center gap-2 text-violet-700">
              <Sparkles className="h-6 w-6" />
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                Stesen 3: Selepas Makan &amp; Uji Minda
              </h2>
            </div>

            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2.5 flex-1 rounded-full ${
                    s3Step >= step ? 'bg-violet-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {s3Step === 1 && (
              <div className="mt-4">
                <div className="text-center">
                  <span className="inline-block rounded-full bg-violet-100 px-4 py-1 text-sm font-extrabold text-violet-900">
                    Langkah 1/4: Ucap Alhamdulillah &amp; Baca Doa Selepas Makan
                  </span>
                </div>
                <div className="mt-3 rounded-2xl border-2 border-violet-300 bg-violet-50 p-4 text-center">
                  <p className="font-arabic text-2xl sm:text-3xl font-bold text-violet-950 leading-loose">
                    {DOA_SELEPAS_MAKAN.arabic}
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-violet-800">{DOA_SELEPAS_MAKAN.rumi}</p>
                  <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-600">{DOA_SELEPAS_MAKAN.meaning}</p>
                  <button
                    type="button"
                    onClick={() => soundEngine.speak(DOA_SELEPAS_MAKAN.audioText)}
                    className="btn-toy mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-violet-300 bg-white px-4 py-2 text-sm font-bold text-violet-800"
                  >
                    <Volume2 className="h-4 w-4" /> Dengar Audio Doa
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCorrect();
                    setS3Step(2);
                    soundEngine.speak('Sekarang mari kemas pinggan dan lap tempat makan kita hingga bersih!');
                  }}
                  className="btn-toy mt-4 w-full rounded-2xl border-b-4 border-violet-700 bg-violet-600 py-3 font-display text-lg font-bold text-white"
                >
                  Alhamdulillah! Seterusnya: Kemas Pinggan →
                </button>
              </div>
            )}

            {s3Step === 2 && (
              <div className="mt-4 text-center">
                <span className="inline-block rounded-full bg-violet-100 px-4 py-1 text-sm font-extrabold text-violet-900">
                  Langkah 2/4: Kemas Pinggan &amp; Basuh Tangan Semula
                </span>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  Ketuk kesemua 4 item di bawah untuk mengemas meja dan membasuh tangan selepas makan!
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {['Susun Pinggan', 'Lap Tikar Piknik', 'Buang Sisa Makanan', 'Basuh Tangan Semula'].map(
                    (label, idx) => {
                      const done = dishesCleaned.includes(idx);
                      return (
                        <button
                          key={label}
                          type="button"
                          disabled={done}
                          onClick={() => {
                            soundEngine.playBubblePop();
                            const next = [...dishesCleaned, idx];
                            setDishesCleaned(next);
                            if (next.length === 4) {
                              soundEngine.playCorrect();
                              soundEngine.speak(UJI_MINDA_QUESTIONS[0].audioText);
                              setTimeout(() => setS3Step(3), 750);
                            }
                          }}
                          className={`btn-toy flex items-center justify-center gap-2 rounded-2xl border-2 p-4 font-display text-base font-bold ${
                            done
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : 'border-violet-300 bg-violet-50 text-violet-900 hover:bg-violet-100'
                          }`}
                        >
                          {done && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                          <span>{label}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {s3Step >= 3 && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-extrabold text-amber-900">
                    Jom Uji Minda! Soalan {quizIdx + 1}/{UJI_MINDA_QUESTIONS.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => soundEngine.speak(UJI_MINDA_QUESTIONS[quizIdx].audioText)}
                    className="inline-flex items-center gap-1 rounded-xl border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800"
                  >
                    <Volume2 className="h-4 w-4" /> Dengar Soalan
                  </button>
                </div>

                <p className="mt-3 text-base sm:text-lg font-extrabold text-slate-800">
                  {UJI_MINDA_QUESTIONS[quizIdx].question}
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {UJI_MINDA_QUESTIONS[quizIdx].options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={quizSolved}
                      onClick={() => {
                        if (opt.isCorrect) {
                          soundEngine.playCorrect();
                          setQuizSolved(true);
                          setQuizFeedback(opt.feedback);
                          soundEngine.speak(opt.feedback);
                        } else {
                          soundEngine.playWrong();
                          setQuizFeedback(opt.feedback);
                          soundEngine.speak(opt.feedback);
                        }
                      }}
                      className="btn-toy flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-center hover:border-sky-400 hover:bg-sky-50"
                    >
                      <span className="font-display text-base font-bold text-slate-900">{opt.label}</span>
                      <span className="text-xs font-bold text-slate-500">{opt.sublabel}</span>
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div
                    className={`mt-3 rounded-xl p-3 text-sm font-bold ${
                      quizSolved ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {quizFeedback}
                  </div>
                )}

                {quizSolved && (
                  <button
                    type="button"
                    onClick={() => {
                      if (quizIdx + 1 < UJI_MINDA_QUESTIONS.length) {
                        const nextQ = quizIdx + 1;
                        setQuizIdx(nextQ);
                        setQuizSolved(false);
                        setQuizFeedback('');
                        soundEngine.speak(UJI_MINDA_QUESTIONS[nextQ].audioText);
                      } else {
                        finishMission('juara_syukur');
                      }
                    }}
                    className="btn-toy mt-4 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 font-display text-lg font-bold text-white"
                  >
                    {quizIdx + 1 < UJI_MINDA_QUESTIONS.length
                      ? 'Soalan Uji Minda Seterusnya →'
                      : 'Tamat Semua Misi & Tuntut Sijil! (+3 Bintang)'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
