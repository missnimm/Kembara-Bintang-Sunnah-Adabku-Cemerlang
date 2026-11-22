export type AvatarId = 'amir' | 'aisyah';

export type StationId = 'stesen1' | 'stesen2' | 'lampu_merah' | 'pokok' | 'stesen3';

export interface AdabStep {
  id: string;
  title: string;
  subtitle: string;
  audioText: string;
  arabic?: string;
  rumi?: string;
  meaning?: string;
}

export interface BadgeDef {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  icon: 'soap' | 'hand' | 'traffic' | 'apple' | 'sparkle' | 'crown';
  requirement: string;
}

export interface AppleWisdom {
  id: string;
  title: string;
  description: string;
  audioText: string;
  emblem: 'heart' | 'shield' | 'umbrella';
  color: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  audioText: string;
  options: {
    id: string;
    label: string;
    sublabel: string;
    isCorrect: boolean;
    feedback: string;
    visualType: 'walk_drink' | 'sit_drink' | 'blow_food' | 'wait_cool' | 'right_hand' | 'left_hand';
  }[];
}

export const HADITH_DATA = {
  title: 'Kata-kata Emas Nabi Muhammad SAW',
  arabic: 'يَا غُلَامُ، سَمِّ اللَّهَ، وَكُلْ بِيَمِينِكَ، وَكُلْ مِمَّا يَلِيكَ',
  translation:
    'Wahai budak, sebutlah nama Allah (Bismillah), makanlah dengan tangan kananmu, dan makanlah makanan yang hampir denganmu.',
  source: 'Riwayat al-Bukhari & Muslim',
  audioText:
    'Sabda Nabi Muhammad Sallallahu Alaihi Wasallam: Wahai budak, sebutlah nama Allah iaitu Bismillah, makanlah dengan tangan kananmu, dan makanlah makanan yang hampir denganmu.',
};

export const DOA_SEBELUM_MAKAN = {
  title: 'Bismillah & Doa Sebelum Makan',
  arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ۞ اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
  rumi: 'Bismillahirrahmanirrahim. Allahumma barik lana fima razaqtana waqina azabannar.',
  meaning: 'Dengan nama Allah Yang Maha Pemurah lagi Maha Penyayang. Ya Allah, berkatilah rezeki yang Engkau kurniakan kepada kami dan peliharalah kami daripada azab neraka.',
  audioText:
    'Mari baca doa sebelum makan bersama-sama! Bismillahirrahmanirrahim. Allahumma barik lana fima razaqtana waqina azabannar. Ya Allah, berkatilah rezeki kami dan peliharalah kami daripada azab neraka.',
};

export const DOA_SELEPAS_MAKAN = {
  title: 'Alhamdulillah & Doa Selepas Makan',
  arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ',
  rumi: 'Alhamdulillahillazi at-amana wasaqana waja-alana minal muslimin.',
  meaning: 'Segala puji bagi Allah yang telah memberi kami makan dan minum, serta menjadikan kami daripada kalangan orang Islam.',
  audioText:
    'Alhamdulillah! Mari baca doa selepas makan: Alhamdulillahillazi at-amana wasaqana waja-alana minal muslimin. Segala puji bagi Allah yang telah memberi kami makan dan minum.',
};

export const PANTUN_SUNNAH = [
  'Bismillah dibaca sebelum makan,',
  'Tangan kanan sentiasa digunakan,',
  'Alhamdulillah syukur diucapkan,',
  'Sunnah Nabi sama-sama kita amalkan!',
];

export const PANTUN_AUDIO_TEXT =
  'Ingat pantun ini selalu! Bismillah dibaca sebelum makan, Tangan kanan sentiasa digunakan, Alhamdulillah syukur diucapkan, Sunnah Nabi sama-sama kita amalkan!';

export const STATION_LIST: {
  id: StationId;
  order: number;
  shortTitle: string;
  fullTitle: string;
  hint: string;
  position: [number, number, number];
  accent: string;
}[] = [
  {
    id: 'stesen1',
    order: 1,
    shortTitle: '1. Sebelum Makan',
    fullTitle: 'Stesen 1: Adab Sebelum Makan',
    hint: 'Basuh tangan, duduk tertib & baca doa makan',
    position: [-9, 0, 5],
    accent: '#0284c7',
  },
  {
    id: 'stesen2',
    order: 2,
    shortTitle: '2. Semasa Makan',
    fullTitle: 'Stesen 2: Adab Semasa Makan',
    hint: 'Guna tangan kanan, ambil lauk dekat & kunyah perlahan',
    position: [0, 0, -2],
    accent: '#059669',
  },
  {
    id: 'lampu_merah',
    order: 3,
    shortTitle: '3. Lampu Merah',
    fullTitle: 'Cabaran Lampu Merah Sunnah!',
    hint: 'Elakkan 3 larangan adab makan untuk buka pagar',
    position: [9.5, 0, 4],
    accent: '#dc2626',
  },
  {
    id: 'pokok',
    order: 4,
    shortTitle: '4. Pokok Kebaikan',
    fullTitle: 'Pokok Kebaikan: Hikmah Ikut Sunnah',
    hint: 'Kutip 3 buah epal kebaikan di bawah pokok rendang',
    position: [8, 0, -9],
    accent: '#d97706',
  },
  {
    id: 'stesen3',
    order: 5,
    shortTitle: '5. Selepas Makan',
    fullTitle: 'Stesen 3: Selepas Makan & Uji Minda',
    hint: 'Alhamdulillah, kemas pinggan, basuh tangan & kuiz',
    position: [-8.5, 0, -9],
    accent: '#7c3aed',
  },
];

export const BADGES: BadgeDef[] = [
  {
    id: 'tangan_bersih',
    title: 'Wira Tangan Bersih',
    subtitle: 'Selesai Stesen 1: Basuh tangan, duduk tertib & baca doa makan.',
    color: '#0369a1',
    bgColor: '#e0f2fe',
    icon: 'soap',
    requirement: 'Selesaikan Stesen 1',
  },
  {
    id: 'tangan_kanan',
    title: 'Sahabat Tangan Kanan',
    subtitle: 'Selesai Stesen 2: Makan dengan tangan kanan, ambil lauk dekat & kunyah perlahan.',
    color: '#047857',
    bgColor: '#d1fae5',
    icon: 'hand',
    requirement: 'Selesaikan Stesen 2',
  },
  {
    id: 'penjaga_lampu',
    title: 'Penjaga Lampu Merah',
    subtitle: 'Berjaya elak tiup makanan panas, bercakap mulut penuh & hina rezeki.',
    color: '#b91c1c',
    bgColor: '#fee2e2',
    icon: 'traffic',
    requirement: 'Lepasi Cabaran Lampu Merah',
  },
  {
    id: 'pencinta_hikmah',
    title: 'Pengutip Epal Hikmah',
    subtitle: 'Memahami 3 kebaikan mengikut sunnah di Pokok Kebaikan.',
    color: '#b45309',
    bgColor: '#fef3c7',
    icon: 'apple',
    requirement: 'Teroka Pokok Kebaikan',
  },
  {
    id: 'juara_syukur',
    title: 'Juara Kemas & Syukur',
    subtitle: 'Selesai Stesen 3: Ucap Alhamdulillah, kemas pinggan & basuh tangan semula.',
    color: '#6d28d9',
    bgColor: '#ede9fe',
    icon: 'sparkle',
    requirement: 'Selesaikan Stesen 3',
  },
  {
    id: 'bintang_sunnah',
    title: 'Bintang Sunnah Sejati',
    subtitle: 'Menamatkan semua misi & Uji Minda! Layak menerima Sijil Kejayaan.',
    color: '#92400e',
    bgColor: '#fde68a',
    icon: 'crown',
    requirement: 'Lengkapkan Semua 5 Stesen',
  },
];

export const POKOK_APPLES: AppleWisdom[] = [
  {
    id: 'pahala',
    title: 'Dapat Pahala & Allah Sayang Kita!',
    description: 'Mengikut cara Rasulullah SAW menjadikan makan dan minum kita sebagai ibadah yang disukai Allah SWT.',
    audioText: 'Hikmah pertama: Dapat pahala dan Allah sayang kita apabila kita mengikut sunnah Rasulullah.',
    emblem: 'heart',
    color: '#ef4444',
  },
  {
    id: 'sihat',
    title: 'Perut Sihat & Badan Kuat!',
    description: 'Duduk dengan tertib dan mengunyah perlahan membantu penghadaman supaya badan bertenaga.',
    audioText: 'Hikmah kedua: Perut sihat dan badan kuat kerana kita duduk tertib dan mengunyah perlahan-lahan.',
    emblem: 'shield',
    color: '#2563eb',
  },
  {
    id: 'kuman',
    title: 'Terhindar Dari Kuman & Penyakit!',
    description: 'Membasuh tangan sebelum dan selepas makan serta menjaga kebersihan mengelakkan sakit perut.',
    audioText: 'Hikmah ketiga: Terhindar daripada kuman dan penyakit apabila tangan dan tempat makan sentiasa bersih.',
    emblem: 'umbrella',
    color: '#059669',
  },
];

export const LAMPU_MERAH_CHALLENGES = [
  {
    id: 'panas',
    situation: 'Sup ayam di dalam mangkuk masih sangat panas dan berasap!',
    question: 'Apakah tindakan yang betul mengikut Sunnah?',
    audioText: 'Awas Lampu Merah! Sup ayam masih panas dan berasap. Apakah tindakan yang betul?',
    options: [
      {
        id: 'tiup',
        text: 'Tiup kuat-kuat supaya cepat sejuk',
        isCorrect: false,
        feedback: 'Op! Jangan tiup makanan yang panas. Rasulullah SAW melarang meniup makanan.',
      },
      {
        id: 'tunggu',
        text: 'Tunggu sebentar atau kipas perlahan hingga suam',
        isCorrect: true,
        feedback: 'Betul! Kita tunggu sebentar sehingga suam sebelum makan. Lampu bertukar Hijau!',
      },
    ],
  },
  {
    id: 'mulut_penuh',
    situation: 'Mulut kamu sedang penuh dengan nasi, tiba-tiba kawan ajak berbual!',
    question: 'Apa yang patut kamu lakukan?',
    audioText: 'Awas Lampu Merah! Mulut penuh makanan tetapi kawan ajak berbual. Apa yang patut kamu lakukan?',
    options: [
      {
        id: 'telan',
        text: 'Kunyah dan telan dahulu, baru jawab dengan sopan',
        isCorrect: true,
        feedback: 'Bagus! Jangan bercakap semasa mulut penuh supaya tidak tercekik dan kekal sopan.',
      },
      {
        id: 'cakap',
        text: 'Terus bercakap sambil mengunyah makanan',
        isCorrect: false,
        feedback: 'Op! Jangan bercakap masa mulut penuh, nanti tersembur atau tersedak.',
      },
    ],
  },
  {
    id: 'rezeki',
    situation: 'Hari ini lauk di atas meja ringkas sahaja dan bukan makanan kegemaranmu.',
    question: 'Bagaimana sikap murid Bintang Sunnah?',
    audioText: 'Awas Lampu Merah! Lauk hari ini ringkas sahaja. Bagaimana sikap kita terhadap rezeki Allah?',
    options: [
      {
        id: 'kutuk',
        text: 'Mengeluh dan mengutuk makanan itu tidak sedap',
        isCorrect: false,
        feedback: 'Op! Jangan sekali-kali kutuk atau hina rezeki Allah SWT.',
      },
      {
        id: 'syukur',
        text: 'Bersyukur dan makan dengan gembira tanpa mencela',
        isCorrect: true,
        feedback: 'Syabas! Rasulullah SAW tidak pernah mencela makanan. Kita mesti bersyukur atas rezeki Allah.',
      },
    ],
  },
];

export const UJI_MINDA_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Pilih cara minum air yang mengikut Sunnah Nabi Muhammad SAW!',
    audioText: 'Jom Uji Minda! Pilih cara minum air yang mengikut Sunnah Nabi Muhammad Sallallahu Alaihi Wasallam!',
    options: [
      {
        id: 'walk',
        label: 'A. Minum sambil berjalan laju',
        sublabel: 'Berdiri / berlari',
        isCorrect: false,
        feedback: 'Kurang tepat! Minum sambil berjalan bukan cara Sunnah dan mudah tersedak.',
        visualType: 'walk_drink',
      },
      {
        id: 'sit',
        label: 'B. Duduk dengan tertib & guna tangan kanan',
        sublabel: 'Tenang & bersopan',
        isCorrect: true,
        feedback: 'Tepat sekali! Duduk dengan tenang dan minum menggunakan tangan kanan ialah Sunnah Nabi!',
        visualType: 'sit_drink',
      },
    ],
  },
  {
    id: 'q2',
    question: 'Jika ada ayam goreng jauh di hujung meja dan ikan dekat dengan kita, mana satu patut diambil?',
    audioText: 'Soalan kedua! Jika ada lauk yang jauh dan lauk yang dekat, mana satu yang patut diambil dahulu?',
    options: [
      {
        id: 'near',
        label: 'A. Ambil lauk yang paling dekat dengan kita',
        sublabel: 'Ikut Hadith: Kul mimma yalik',
        isCorrect: true,
        feedback: 'Betul! Nabi berpesan supaya makan makanan yang paling hampir dengan kita.',
        visualType: 'right_hand',
      },
      {
        id: 'far',
        label: 'B. Capai melintasi pinggan orang lain',
        sublabel: 'Tidak sopan',
        isCorrect: false,
        feedback: 'Op! Menggapai lauk yang jauh di hadapan orang lain adalah kurang sopan.',
        visualType: 'left_hand',
      },
    ],
  },
];
