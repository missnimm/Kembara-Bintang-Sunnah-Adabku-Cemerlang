import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Crown,
  Download,
  Lock,
  Sparkles,
  Star,
  Volume2,
  X,
  Droplets,
  Hand,
  AlertTriangle,
  Apple,
} from 'lucide-react';
import { BADGES, PANTUN_AUDIO_TEXT, PANTUN_SUNNAH } from '../data/adabContent';
import { soundEngine } from '../audio/soundEngine';

interface BadgesAndCertModalProps {
  stars: number;
  maxStars: number;
  unlockedBadges: string[];
  allMissionsDone: boolean;
  initialTab?: 'badges' | 'cert';
  onClose: () => void;
}

export const BadgesAndCertModal: React.FC<BadgesAndCertModalProps> = ({
  stars,
  maxStars,
  unlockedBadges,
  allMissionsDone,
  initialTab = 'badges',
  onClose,
}) => {
  const [tab, setTab] = useState<'badges' | 'cert'>(initialTab);
  const [studentName, setStudentName] = useState('Adik Bintang Sunnah');
  const [studentClass, setStudentClass] = useState('Tahun 2 Bestari');

  const renderBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'soap':
        return <Droplets className="h-7 w-7" />;
      case 'hand':
        return <Hand className="h-7 w-7" />;
      case 'traffic':
        return <AlertTriangle className="h-7 w-7" />;
      case 'apple':
        return <Apple className="h-7 w-7" />;
      case 'sparkle':
        return <Sparkles className="h-7 w-7" />;
      default:
        return <Crown className="h-7 w-7" />;
    }
  };

  const handleDownloadCertificate = () => {
    soundEngine.playVictoryFanfare();
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d')!;

    // Cream parchment background
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 0, 1200, 850);

    // Outer ornate emerald & gold borders
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 22;
    ctx.strokeRect(24, 24, 1152, 802);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(48, 48, 1104, 754);

    // Header Ribbon
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(220, 84, 760, 76, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Fredoka, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SIJIL KEJAYAAN BINTANG SUNNAH', 600, 134);

    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 26px Nunito, sans-serif';
    ctx.fillText('Pendidikan Islam Tahun 2 • Adab Makan & Minum Cara Rasulullah SAW', 600, 204);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.fillText('Dengan ini diperakui bahawa', 600, 272);

    // Student Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 54px Fredoka, Nunito, sans-serif';
    ctx.fillText(studentName.trim() || 'Adik Bintang Sunnah', 600, 344);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(280, 366);
    ctx.lineTo(920, 366);
    ctx.stroke();

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 28px Nunito, sans-serif';
    ctx.fillText(studentClass.trim() || 'Tahun 2', 600, 412);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 24px Nunito, sans-serif';
    ctx.fillText(
      `Telah berjaya menamatkan Kembara Adab Makan & Minum dengan ${stars}/${maxStars} Bintang Emas`,
      600,
      476
    );
    ctx.fillText(
      `serta memperoleh ${unlockedBadges.length}/6 Lencana Pencapaian Sunnah!`,
      600,
      514
    );

    // Pantun Box
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.roundRect(210, 552, 780, 148, 20);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 22px Nunito, sans-serif';
    PANTUN_SUNNAH.forEach((line, i) => {
      ctx.fillText(line, 600, 592 + i * 30);
    });

    // Footer Date & Gold Seal
    const today = new Date().toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 20px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Tarikh: ${today}`, 110, 760);

    ctx.textAlign = 'right';
    ctx.fillText('Pengiktirafan: Bintang Sunnah Muda', 1090, 760);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sijil_Bintang_Sunnah_${(studentName || 'Murid').replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-3 sm:p-5">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-amber-400 bg-white p-5 sm:p-6 shadow-2xl">
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

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 pr-12">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setTab('badges');
            }}
            className={`btn-toy flex items-center gap-2 rounded-2xl border-2 px-4 py-2 font-display text-base font-bold ${
              tab === 'badges'
                ? 'border-violet-500 bg-violet-600 text-white'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            <Award className="h-5 w-5" />
            Lencana Pencapaian ({unlockedBadges.length}/6)
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setTab('cert');
            }}
            className={`btn-toy flex items-center gap-2 rounded-2xl border-2 px-4 py-2 font-display text-base font-bold ${
              tab === 'cert'
                ? 'border-amber-500 bg-amber-400 text-amber-950'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            <Crown className="h-5 w-5" />
            Sijil Kejayaan
          </button>
        </div>

        {tab === 'badges' && (
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGES.map((badge) => {
                const unlocked = unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 ${
                      unlocked
                        ? 'border-amber-300 bg-amber-50/60 shadow-sm'
                        : 'border-slate-200 bg-slate-50 opacity-75'
                    }`}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                      style={{
                        backgroundColor: unlocked ? badge.bgColor : '#e2e8f0',
                        color: unlocked ? badge.color : '#94a3b8',
                      }}
                    >
                      {unlocked ? renderBadgeIcon(badge.icon) : <Lock className="h-6 w-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display text-base font-bold text-slate-800">
                          {badge.title}
                        </h3>
                        {unlocked && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-slate-600">
                        {unlocked ? badge.subtitle : `Syarat: ${badge.requirement}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pantun Sunnah Card */}
            <div className="mt-4 rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-center">
              <div className="flex items-center justify-center gap-2 font-display text-base font-bold text-sky-900">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Ingat Pantun Ini Selalu!
              </div>
              <div className="mt-2 space-y-0.5 text-sm font-bold text-slate-700">
                {PANTUN_SUNNAH.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <button
                type="button"
                onClick={() => soundEngine.speak(PANTUN_AUDIO_TEXT)}
                className="btn-toy mt-3 inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3.5 py-1.5 text-xs font-bold text-sky-800"
              >
                <Volume2 className="h-4 w-4" /> Dengar Pantun Bintang Sunnah
              </button>
            </div>
          </div>
        )}

        {tab === 'cert' && (
          <div className="mt-4">
            {!allMissionsDone ? (
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
                <Crown className="mx-auto h-12 w-12 text-amber-500" />
                <h3 className="mt-2 font-display text-xl font-bold text-amber-950">
                  Sijil Kejayaan Hampir Terbuka!
                </h3>
                <p className="mt-1 text-sm font-bold text-amber-800">
                  Selesaikan semua 5 stesen misi adab makan &amp; minum untuk membuka Sijil Kejayaan rasmi dan Jubah Bintang Sunnah 3D!
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                      Nama Penuh Murid
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      maxLength={38}
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-bold text-slate-800 focus:border-emerald-500 focus:outline-none"
                      placeholder="Contoh: Muhammad Amir"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1">
                      Kelas
                    </label>
                    <input
                      type="text"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      maxLength={24}
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2 font-bold text-slate-800 focus:border-emerald-500 focus:outline-none"
                      placeholder="Contoh: 2 Bestari"
                    />
                  </div>
                </div>

                {/* Live Certificate Preview */}
                <div className="rounded-2xl border-4 border-emerald-600 bg-amber-50 p-5 text-center shadow-inner">
                  <div className="inline-block rounded-full bg-emerald-600 px-5 py-1 font-display text-sm font-bold text-white">
                    SIJIL KEJAYAAN BINTANG SUNNAH
                  </div>
                  <p className="mt-2 text-xs font-bold text-amber-800">
                    Pendidikan Islam Tahun 2 • Adab Makan &amp; Minum Cara Rasulullah SAW
                  </p>
                  <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-slate-900 underline decoration-amber-400 underline-offset-4">
                    {studentName || 'Adik Bintang Sunnah'}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-sky-700">{studentClass || 'Tahun 2'}</p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-700">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                    <span className="tabular-nums">
                      {stars}/{maxStars} Bintang Emas • {unlockedBadges.length}/6 Lencana Pencapaian
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="btn-toy mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 font-display text-lg font-bold text-white shadow-lg hover:bg-emerald-400"
                >
                  <Download className="h-5 w-5" />
                  Muat Turun Sijil Kejayaan (PNG)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
