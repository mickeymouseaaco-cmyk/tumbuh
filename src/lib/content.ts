/**
 * All of Tumbuh's words, in Bahasa Melayu (everyday words) and English.
 * General information only; not a substitute for a doctor or dentist.
 */

export type Lang = 'bm' | 'en';
export type Jaw = 'U' | 'L';
export type Kind = 'c' | 'l' | 'k' | 'm1' | 'm2';
export type Side = 'R' | 'L';

export const strings = {
  bm: {
    welcomeTitle: 'Teman tumbuh gigi si kecil',
    welcomeSub:
      'Pantau gigi anak sulung anda, belajar cara jaga gigi dan mulut, dan kenal masalah biasa — dalam bahasa yang senang faham.',
    chooseLang: 'Pilih bahasa · Choose language',
    start: 'Jom mula',
    disclaimer: 'Maklumat am sahaja — bukan pengganti nasihat doktor atau doktor gigi.',
    hello: 'Hai, Ibu & Ayah',
    helloSub: 'Ini perkembangan gigi si kecil hari ini.',
    ageLabel: 'Umur anak',
    months: 'bulan',
    unit: 'bln',
    ageDown: 'Kurangkan umur',
    ageUp: 'Tambah umur',
    teethIn: 'Gigi sudah tumbuh',
    nowTitle: 'Mungkin sedang tumbuh',
    noDue: 'Tiada gigi yang biasanya tumbuh pada umur ini. Itu normal — setiap bayi ikut masa sendiri.',
    nextTitle: 'Seterusnya',
    allDone: 'Semua 20 gigi susu sepatutnya sudah ada. Teruskan jaga!',
    openChart: 'Buka carta gigi',
    todayTitle: 'Rutin hari ini',
    tipTitle: 'Tip untuk umur ini',
    visitTitle: 'Lawatan pertama ke doktor gigi',
    visitBody:
      'Bawa anak jumpa doktor gigi bila gigi pertama keluar, atau sebelum hari jadi pertama. Lepas itu setiap 6 bulan.',
    teethTitle: 'Carta gigi susu',
    teethSub: 'Tekan gigi untuk tanda.',
    upper: 'Atas',
    lower: 'Bawah',
    legIn: 'Sudah tumbuh',
    legDue: 'Mungkin sekarang',
    legNot: 'Belum',
    usually: 'Biasanya tumbuh:',
    markIn: 'Tandakan sudah tumbuh',
    markOut: 'Tandakan belum tumbuh',
    orderTitle: 'Bila gigi tumbuh?',
    chartNote: 'Awal atau lambat beberapa bulan itu normal.',
    factsTitle: 'Perlu tahu',
    learnTitle: 'Belajar',
    learnSub: 'Lihat, faham, buat.',
    probTitle: 'Masalah biasa',
    probSub: 'Tekan untuk tahu rupanya & apa nak buat.',
    urgentTitle: 'Pergi klinik segera jika:',
    looks: 'Rupanya',
    todo: 'Apa nak buat',
    fAll: 'Semua',
    fOk: 'Biasanya OK',
    fCheck: 'Perlu periksa',
    fUrgent: 'Segera',
    tabHome: 'Utama',
    tabTeeth: 'Gigi',
    tabLearn: 'Belajar',
    tabProblems: 'Masalah',
    next: 'Seterusnya',
    back: 'Kembali',
    skip: 'Langkau',
    nameQ: 'Siapa nama si kecil?',
    nameHint: 'Kami guna nama ini untuk sapa anda setiap hari. Boleh tukar nanti.',
    namePlaceholder: 'Nama panggilan',
    ageQ: 'Berapa umur {name}?',
    ageHint: 'Kami akan tunjuk gigi yang biasanya tumbuh pada umur ini.',
    littleOne: 'si kecil',
    morning: 'Selamat pagi', noon: 'Selamat tengah hari', evening: 'Selamat petang', night: 'Selamat malam',
    teethOf: 'Gigi {name}',
    ofTwenty: 'daripada 20 gigi',
    allDoneToday: 'Hebat! Rutin hari ini lengkap.',
    doneCount: '{n}/3 siap',
    youAreHere: 'Umur {name} sekarang',
    tapTooth: 'Tekan mana-mana gigi',
    didYouKnow: 'Tahukah anda?',
    topics: 'Topik',
    stepsCount: '{n} perkara',
    mouthTitle: 'Dalam mulut {name}',
    tapHead: 'Tekan kepala {name} untuk intai ke dalam mulut',
    close: 'Tutup',
    callTitle: 'Ragu-ragu?',
    callBody: 'Klinik pergigian kerajaan dan swasta boleh periksa anak anda. Lebih awal, lebih baik.',
    jaw: { U: 'atas', L: 'bawah' },
    side: { R: 'kanan', L: 'kiri' },
  },
  en: {
    welcomeTitle: "Your baby's teething companion",
    welcomeSub:
      "Track your firstborn's teeth, learn simple ways to care for their mouth, and spot common problems — in plain words.",
    chooseLang: 'Pilih bahasa · Choose language',
    start: 'Get started',
    disclaimer: 'General information only — not a substitute for advice from your doctor or dentist.',
    hello: 'Hi, Mum & Dad',
    helloSub: "Here's how your little one's teeth are doing.",
    ageLabel: "Baby's age",
    months: 'months',
    unit: 'mo',
    ageDown: 'Decrease age',
    ageUp: 'Increase age',
    teethIn: 'Teeth in',
    nowTitle: 'Might be coming in now',
    noDue: "No teeth usually arrive at this age. That's normal — every baby has their own timing.",
    nextTitle: 'Coming next',
    allDone: 'All 20 baby teeth should be in by now. Keep up the brushing!',
    openChart: 'Open teeth chart',
    todayTitle: "Today's routine",
    tipTitle: 'Tip for this age',
    visitTitle: 'First dental visit',
    visitBody:
      'Book a check-up when the first tooth appears, or by the first birthday. After that, every 6 months.',
    teethTitle: 'Baby teeth chart',
    teethSub: 'Tap a tooth to mark it.',
    upper: 'Upper',
    lower: 'Lower',
    legIn: 'In',
    legDue: 'Due now',
    legNot: 'Not yet',
    usually: 'Usually appears:',
    markIn: 'Mark as in',
    markOut: 'Mark as not in yet',
    orderTitle: 'When do teeth come in?',
    chartNote: 'A few months early or late is normal.',
    factsTitle: 'Good to know',
    learnTitle: 'Learn',
    learnSub: 'Look, get it, do it.',
    probTitle: 'Common problems',
    probSub: 'Tap to see what it looks like and what to do.',
    urgentTitle: 'Get help quickly if:',
    looks: 'What it looks like',
    todo: 'What to do',
    fAll: 'All',
    fOk: 'Usually fine',
    fCheck: 'Get checked',
    fUrgent: 'Urgent',
    tabHome: 'Home',
    tabTeeth: 'Teeth',
    tabLearn: 'Learn',
    tabProblems: 'Problems',
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    nameQ: "What's your little one's name?",
    nameHint: "We'll use it to greet you each day. You can change it later.",
    namePlaceholder: 'Nickname',
    ageQ: 'How old is {name}?',
    ageHint: "We'll show which teeth usually come in around this age.",
    littleOne: 'your little one',
    morning: 'Good morning', noon: 'Good afternoon', evening: 'Good evening', night: 'Good night',
    teethOf: "{name}'s teeth",
    ofTwenty: 'of 20 teeth',
    allDoneToday: "Lovely! Today's routine is done.",
    doneCount: '{n}/3 done',
    youAreHere: "{name}'s age now",
    tapTooth: 'Tap any tooth',
    didYouKnow: 'Did you know?',
    topics: 'Topics',
    stepsCount: '{n} things',
    mouthTitle: "Inside {name}'s mouth",
    tapHead: "Tap {name}'s head to peek inside the mouth",
    close: 'Close',
    callTitle: 'Not sure?',
    callBody: 'Any government or private dental clinic can check your child. Earlier is better.',
    jaw: { U: 'Upper', L: 'Lower' },
    side: { R: 'right', L: 'left' },
  },
};

export type Strings = (typeof strings)['bm'];

/** Usual age range (months) each baby tooth comes in. */
export const toothAges: Record<Jaw, Record<Kind, [number, number]>> = {
  U: { c: [8, 12], l: [9, 13], k: [16, 22], m1: [13, 19], m2: [25, 33] },
  L: { c: [6, 10], l: [10, 16], k: [17, 23], m1: [14, 18], m2: [23, 31] },
};

const kindNames: Record<Lang, Record<Kind, string>> = {
  bm: { c: 'Gigi kacip tengah', l: 'Gigi kacip tepi', k: 'Gigi taring', m1: 'Geraham pertama', m2: 'Geraham kedua' },
  en: { c: 'central incisor', l: 'lateral incisor', k: 'canine', m1: 'first molar', m2: 'second molar' },
};

export function toothName(jaw: Jaw, kind: Kind, lang: Lang) {
  if (lang === 'bm') return `${kindNames.bm[kind]} ${strings.bm.jaw[jaw]}`;
  return `${strings.en.jaw[jaw]} ${kindNames.en[kind]}`;
}

export const toothId = (jaw: Jaw, kind: Kind, side: Side) => `${jaw}-${kind}-${side}`;

export const tips: Record<Lang, [string, string, string, string]> = {
  bm: [
    'Lap gusi dengan kain lembap selepas menyusu, pagi dan malam. Ini biasakan anak dengan mulut bersih.',
    'Gigi pertama biasanya keluar sekarang. Berus 2 kali sehari dengan ubat gigi berfluorida sebesar sebutir beras.',
    'Masa untuk lawatan pertama ke doktor gigi, jika belum. Mula tukar botol kepada cawan.',
    'Hampir semua gigi susu sudah ada. Teruskan berus untuk anak — guna ubat gigi sebesar kacang pea dari umur 3 tahun.',
  ],
  en: [
    'Wipe the gums with a damp cloth after feeds, morning and night. It builds a clean-mouth habit.',
    'First teeth usually arrive around now. Brush twice a day with a rice-grain smear of fluoride toothpaste.',
    "Time for the first dental visit, if you haven't been. Start switching from bottle to cup.",
    'Most baby teeth are in. Keep brushing for your child — move to a pea-sized amount of toothpaste from age 3.',
  ],
};

export function tipFor(age: number, lang: Lang) {
  const i = age < 6 ? 0 : age < 12 ? 1 : age < 24 ? 2 : 3;
  return tips[lang][i];
}

export function checklist(lang: Lang, hasTeeth: boolean): { key: string; label: string }[] {
  if (lang === 'bm') {
    return hasTeeth
      ? [
          { key: 'a', label: 'Berus gigi waktu pagi' },
          { key: 'b', label: 'Berus gigi sebelum tidur' },
          { key: 'c', label: 'Tidur tanpa botol susu' },
        ]
      : [
          { key: 'a', label: 'Lap gusi waktu pagi' },
          { key: 'b', label: 'Lap gusi sebelum tidur' },
          { key: 'c', label: 'Tidur tanpa botol susu' },
        ];
  }
  return hasTeeth
    ? [
        { key: 'a', label: 'Brush in the morning' },
        { key: 'b', label: 'Brush before bed' },
        { key: 'c', label: 'Sleep without a bottle' },
      ]
    : [
        { key: 'a', label: 'Wipe gums in the morning' },
        { key: 'b', label: 'Wipe gums before bed' },
        { key: 'c', label: 'Sleep without a bottle' },
      ];
}

export const facts: Record<Lang, string[]> = {
  bm: [
    'Setiap bayi lain-lain. Cepat atau lambat beberapa bulan itu biasa.',
    'Semua 20 gigi susu biasanya lengkap sekitar umur 2½–3 tahun.',
    'Gigi susu mula tanggal sekitar umur 6 tahun — tapi ia tetap penting untuk makan, bercakap dan simpan ruang untuk gigi kekal.',
    'Tiada gigi langsung pada umur 18 bulan? Jumpa doktor gigi.',
  ],
  en: [
    'Every baby is different. A few months early or late is normal.',
    'All 20 baby teeth are usually in by about 2½–3 years.',
    'Baby teeth start falling out around age 6 — but they matter for eating, talking and saving space for adult teeth.',
    'No teeth at all by 18 months? See a dentist.',
  ],
};

export type LearnSection = { title: string; items: { title: string; points: string[] }[] };

/** Learn topics, same order as `learn[lang]`. Icon names map to lucide icons in the Learn screen. */
export const topicMeta = [
  { id: 'clean', icon: 'clean', tint: 'sky', blurb: { bm: 'Lap gusi, berus gigi, cara mudah', en: 'Wiping gums, brushing, easy tricks' } },
  { id: 'fluoride', icon: 'fluoride', tint: 'mint', blurb: { bm: 'Berapa banyak & kenapa penting', en: 'How much, and why it matters' } },
  { id: 'food', icon: 'food', tint: 'peach', blurb: { bm: 'Botol, gula & kuman', en: 'Bottles, sugar and germs' } },
  { id: 'teething', icon: 'teething', tint: 'lilac', blurb: { bm: 'Tanda, cara legakan, elakkan', en: 'Signs, soothing, what to avoid' } },
  { id: 'dentist', icon: 'dentist', tint: 'butter', blurb: { bm: 'Bila pergi & apa berlaku', en: 'When to go and what happens' } },
] as const;

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

export const learn: Record<Lang, LearnSection[]> = {
  bm: [
    {
      title: 'Cuci gigi harian',
      items: [
        { title: 'Sebelum gigi keluar (0–6 bulan)', points: ['Lap gusi dengan kain bersih atau kain kasa yang dibasahkan air masak, 2 kali sehari.', 'Buat selepas menyusu, terutama sebelum tidur malam.', 'Ini biasakan anak dengan rutin mulut bersih dari awal.'] },
        { title: 'Bila gigi pertama keluar', points: ['Guna berus gigi bayi yang lembut dan berkepala kecil.', 'Berus 2 kali sehari — pagi dan sebelum tidur. Berus malam paling penting.', 'Berus semua permukaan gigi, termasuk tepi gusi.'] },
        { title: 'Cara berus yang senang', points: ['Baringkan anak di riba, kepala menghadap anda — lebih senang nampak gigi.', 'Selak bibir atas sekali-sekala untuk periksa gigi depan.', 'Ibu bapa yang berus sampai anak umur 7–8 tahun. Tangan kecil belum cukup cekap.', 'Tukar berus setiap 3 bulan atau bila bulu dah kembang.'] },
      ],
    },
    {
      title: 'Ubat gigi & fluorida',
      items: [
        { title: 'Berapa banyak ubat gigi?', points: ['Bawah 3 tahun: sapuan nipis, sebesar sebutir beras.', '3 hingga 6 tahun: sebesar sebiji kacang pea.', 'Guna ubat gigi berfluorida (1000 ppm atau lebih) — fluorida bantu kuatkan gigi.'] },
        { title: 'Ludah, jangan bilas', points: ['Lap buih yang berlebihan. Tak perlu kumur dengan banyak air — biar fluorida tinggal di gigi.', 'Simpan ubat gigi jauh dari capaian anak.'] },
        { title: 'Sapuan fluorida di klinik', points: ['Doktor gigi boleh sapu varnis fluorida untuk kuatkan gigi dan cegah gigi berlubang.', 'Cepat, tak sakit, dan selamat untuk bayi.'] },
      ],
    },
    {
      title: 'Makanan & minuman',
      items: [
        { title: 'Botol susu', points: ['Jangan biar anak tidur sambil hisap botol susu atau air manis — ini punca utama gigi reput.', 'Ajar minum guna cawan dari umur 6 bulan.', 'Cuba berhenti guna botol sekitar 12–18 bulan.'] },
        { title: 'Gula', points: ['Elak jus, air manis, air kotak, teh atau kopi bergula. Air kosong dan susu paling baik.', 'Makanan manis — bagi masa makan sahaja, bukan sikit-sikit sepanjang hari.', 'Jangan celup puting (pacifier) dalam madu atau gula. Madu tidak selamat untuk bayi bawah 1 tahun.'] },
        { title: 'Menyusu badan waktu malam', points: ['Susu ibu sangat baik untuk bayi.', 'Bila gigi dah keluar, lap atau berus gigi selepas susu malam bila boleh.'] },
        { title: 'Kuman boleh berjangkit', points: ['Kuman gigi berlubang boleh pindah dari mulut orang dewasa ke anak.', 'Elak kongsi sudu, rasa makanan guna sudu anak, atau "cuci" puting dengan mulut.', 'Jaga gigi ibu bapa sendiri juga — ia bantu lindungi gigi anak.'] },
      ],
    },
    {
      title: 'Tumbuh gigi',
      items: [
        { title: 'Tanda biasa', points: ['Air liur banyak, suka gigit barang, gusi bengkak atau merah, meragam, tidur terganggu.', 'Suhu mungkin naik sedikit. Tetapi demam tinggi (38°C ke atas), cirit-birit atau ruam teruk BUKAN sebab tumbuh gigi — jumpa doktor.'] },
        { title: 'Cara legakan', points: ['Urut gusi perlahan dengan jari yang bersih.', 'Bagi gelang gigit (teether) yang disejukkan dalam peti sejuk — bukan peti beku.', 'Lap air liur selalu untuk elak ruam di dagu.', 'Ubat tahan sakit seperti paracetamol hanya ikut nasihat doktor atau ahli farmasi.'] },
        { title: 'Elakkan', points: ['Gel gusi yang mengandungi benzocaine atau lidocaine.', 'Rantai ambar atau manik — bahaya tercekik dan terjerut.', 'Biskut tumbuh gigi yang manis.'] },
      ],
    },
    {
      title: 'Jumpa doktor gigi',
      items: [
        { title: 'Bila perlu pergi?', points: ['Lawatan pertama: bila gigi pertama tumbuh, atau sebelum umur 1 tahun.', 'Lepas itu setiap 6 bulan, atau ikut nasihat doktor gigi.'] },
        { title: 'Apa yang berlaku?', points: ['Pemeriksaan ringkas di riba ibu atau ayah — cepat dan tak sakit.', 'Doktor gigi akan semak gigi, gusi, tabiat makan dan beri tip penjagaan.'] },
        { title: 'Buat anak selesa', points: ['Guna perkataan positif. Elak ayat seperti "nanti kena cucuk".', 'Pilih waktu anak segar, bukan waktu tidur.'] },
      ],
    },
  ],
  en: [
    {
      title: 'Daily cleaning',
      items: [
        { title: 'Before teeth (0–6 months)', points: ['Wipe the gums with a clean, damp cloth or gauze twice a day.', 'Do it after feeds, especially before bedtime.', 'This gets your baby used to a clean-mouth routine early.'] },
        { title: 'When the first tooth appears', points: ['Use a soft, small-headed baby toothbrush.', 'Brush twice a day — morning and before bed. Night-time matters most.', 'Brush every surface, including along the gumline.'] },
        { title: 'An easy way to brush', points: ['Lay your child on your lap with their head towards you — it is easier to see.', 'Lift the top lip now and then to check the front teeth.', 'Parents should do the brushing until about age 7–8. Little hands are not skilled enough yet.', 'Replace the brush every 3 months, or when the bristles splay.'] },
      ],
    },
    {
      title: 'Toothpaste & fluoride',
      items: [
        { title: 'How much toothpaste?', points: ['Under 3: a thin smear, the size of a grain of rice.', '3 to 6 years: a pea-sized amount.', 'Use fluoride toothpaste (1000 ppm or more) — fluoride helps make teeth stronger.'] },
        { title: "Spit, don't rinse", points: ['Wipe away extra foam. No need to rinse with lots of water — let the fluoride stay on the teeth.', 'Keep toothpaste out of reach.'] },
        { title: 'Fluoride varnish at the clinic', points: ['Dentists can paint fluoride varnish on teeth to strengthen them and prevent decay.', 'Quick, painless and safe for babies.'] },
      ],
    },
    {
      title: 'Food & drink',
      items: [
        { title: 'Bottles', points: ['Never put your child to sleep with a bottle of milk or sweet drink — it is a top cause of decay.', 'Start drinking from a cup at around 6 months.', 'Aim to stop the bottle around 12–18 months.'] },
        { title: 'Sugar', points: ['Avoid juice, sweet drinks, boxed drinks and sweetened tea or coffee. Plain water and milk are best.', 'Keep sweet foods to mealtimes, not little bits all day.', "Never dip a pacifier in honey or sugar. Honey isn't safe for babies under 1."] },
        { title: 'Night breastfeeding', points: ['Breast milk is great for your baby.', 'Once teeth are in, wipe or brush after night feeds when you can.'] },
        { title: 'Germs can spread', points: ['Decay-causing germs can pass from adult mouths to your child.', 'Avoid sharing spoons, tasting from their spoon, or "cleaning" a pacifier with your mouth.', 'Look after your own teeth too — it helps protect theirs.'] },
      ],
    },
    {
      title: 'Teething',
      items: [
        { title: 'Common signs', points: ['Drooling, chewing on things, swollen or red gums, fussiness, poor sleep.', 'Temperature may rise a little. But a high fever (38°C or more), diarrhoea or a bad rash is NOT from teething — see a doctor.'] },
        { title: 'How to soothe', points: ['Gently rub the gums with a clean finger.', 'Offer a teething ring chilled in the fridge — not the freezer.', 'Wipe drool often to prevent a chin rash.', 'Pain relief such as paracetamol only as advised by a doctor or pharmacist.'] },
        { title: 'Avoid', points: ['Teething gels containing benzocaine or lidocaine.', 'Amber or bead necklaces — a choking and strangling risk.', 'Sugary teething biscuits.'] },
      ],
    },
    {
      title: 'Dentist visits',
      items: [
        { title: 'When to go', points: ['First visit: when the first tooth appears, or by age 1.', 'Then every 6 months, or as your dentist advises.'] },
        { title: 'What happens', points: ['A quick check on your lap — fast and painless.', 'The dentist looks at teeth, gums and feeding habits, and gives care tips.'] },
        { title: 'Make it easy', points: ['Use positive words. Avoid phrases like "they will give you a shot".', 'Pick a time when your child is rested, not nap time.'] },
      ],
    },
  ],
};

export type Tag = 'ok' | 'check' | 'urgent';
type Bi = Record<Lang, string>;
export type Problem = { id: string; tag: Tag; term: string; title: Bi; looks: Bi; todo: Bi };

export const urgentList: Record<Lang, string[]> = {
  bm: [
    'Muka, pipi atau gusi bengkak',
    'Demam tinggi bersama sakit mulut',
    'Gigi tercabut, patah atau tertolak masuk selepas jatuh',
    'Sakit gigi sampai anak tak boleh makan atau tidur',
  ],
  en: [
    'Swelling of the face, cheek or gum',
    'High fever together with mouth pain',
    'A tooth knocked out, broken or pushed in after a fall',
    'Toothache stopping your child eating or sleeping',
  ],
};

export const problems: Problem[] = [
  {
    id: 'ecc', tag: 'check', term: 'Early childhood caries',
    title: { bm: 'Gigi reput / berlubang awal', en: 'Early tooth decay' },
    looks: { bm: 'Mula dengan tompok putih macam kapur di tepi gusi gigi depan atas. Lama-kelamaan jadi perang atau hitam, dan berlubang.', en: 'Starts as chalky white spots along the gumline of the upper front teeth. Over time they turn brown or black and form holes.' },
    todo: { bm: 'Jumpa doktor gigi awal — tompok putih masih boleh dipulihkan dengan fluorida. Berus 2 kali sehari dengan ubat gigi berfluorida, kurangkan gula, dan jangan tidur dengan botol.', en: 'See a dentist early — white spots can still be reversed with fluoride. Brush twice a day with fluoride toothpaste, cut down sugar, and no bottle at bedtime.' },
  },
  {
    id: 'thrush', tag: 'check', term: 'Oral thrush',
    title: { bm: 'Kulat mulut', en: 'Thrush (mouth fungus)' },
    looks: { bm: 'Tompok putih macam susu di lidah, pipi atau gusi yang TIDAK hilang bila dilap. Bayi mungkin meragam semasa menyusu.', en: "White, milk-like patches on the tongue, cheeks or gums that DON'T wipe off. Baby may be fussy while feeding." },
    todo: { bm: 'Jumpa doktor untuk ubat. Basuh dan sterilkan puting, botol dan alat pam susu. Sisa susu biasa boleh dilap — kulat tidak.', en: 'See a doctor for treatment. Wash and sterilise teats, bottles and breast pump parts. Milk residue wipes off — thrush does not.' },
  },
  {
    id: 'injury', tag: 'urgent', term: 'Dental trauma',
    title: { bm: 'Jatuh & gigi cedera', en: 'Falls & tooth injuries' },
    looks: { bm: 'Gigi goyang, patah, tertolak masuk ke gusi, tercabut, atau gusi dan bibir berdarah selepas jatuh.', en: 'A tooth that is loose, chipped, pushed up into the gum or knocked out, or a bleeding gum or lip after a fall.' },
    todo: { bm: 'Bertenang. Tekan dengan kain bersih untuk hentikan darah. Jumpa doktor gigi pada hari yang sama. JANGAN pasang semula gigi susu yang tercabut. Pergi ke unit kecemasan jika ada cedera kepala, muntah atau anak lesu.', en: "Stay calm. Press with a clean cloth to stop bleeding. See a dentist the same day. DON'T put a knocked-out baby tooth back in. Go to emergency if there is a head injury, vomiting or drowsiness." },
  },
  {
    id: 'colour', tag: 'check', term: 'Tooth discolouration',
    title: { bm: 'Gigi bertukar warna', en: 'Tooth changing colour' },
    looks: { bm: 'Satu gigi jadi kelabu, perang atau gelap — selalunya selepas terhantuk. Kesan perang di permukaan boleh juga datang dari ubat zat besi.', en: 'One tooth turns grey, brown or dark — often after a knock. Brown surface stains can also come from iron drops.' },
    todo: { bm: 'Jumpa doktor gigi untuk semak saraf gigi. Kesan kotoran di permukaan biasanya boleh dibersihkan di klinik.', en: "See a dentist to check the tooth's nerve. Surface stains can usually be cleaned off at the clinic." },
  },
  {
    id: 'natal', tag: 'check', term: 'Natal / neonatal teeth',
    title: { bm: 'Gigi semasa lahir', en: 'Teeth at birth' },
    looks: { bm: 'Gigi yang sudah ada semasa bayi lahir, atau tumbuh dalam bulan pertama.', en: 'A tooth already there at birth, or one that comes in during the first month.' },
    todo: { bm: 'Jumpa doktor gigi. Gigi ini kadang-kadang goyang (risiko tertelan) atau melukakan lidah bayi dan puting ibu.', en: "See a dentist. These teeth can be loose (a swallowing risk) or hurt baby's tongue and mum's nipple." },
  },
  {
    id: 'tie', tag: 'check', term: 'Tongue-tie (ankyloglossia)',
    title: { bm: 'Lidah terikat', en: 'Tongue-tie' },
    looks: { bm: 'Lidah susah dijelir atau nampak berbentuk hati di hujung. Bayi susah menyusu dan puting ibu terasa sakit.', en: "The tongue can't stick out far or looks heart-shaped at the tip. Baby struggles to latch and feeding hurts." },
    todo: { bm: 'Jumpa doktor atau perunding laktasi untuk pemeriksaan. Tidak semua perlu dirawat.', en: 'Ask a doctor or lactation consultant to check. Not every case needs treatment.' },
  },
  {
    id: 'late', tag: 'ok', term: 'Delayed eruption',
    title: { bm: 'Gigi lambat tumbuh', en: 'Late teeth' },
    looks: { bm: 'Belum ada gigi walaupun umur sudah lebih 12 bulan.', en: 'No teeth yet even after 12 months.' },
    todo: { bm: 'Selalunya normal dan ikut keturunan. Jumpa doktor gigi jika tiada gigi langsung pada umur 18 bulan.', en: 'Usually normal and often runs in families. See a dentist if there are no teeth at all by 18 months.' },
  },
  {
    id: 'cyst', tag: 'ok', term: 'Eruption cyst',
    title: { bm: 'Bonjol biru di gusi', en: 'Blue bump on the gum' },
    looks: { bm: 'Bonjol kecil kebiruan atau ungu di gusi, tepat di tempat gigi nak keluar.', en: 'A small bluish or purple bump on the gum right where a tooth is coming.' },
    todo: { bm: 'Biasanya hilang sendiri bila gigi keluar. Jumpa doktor gigi jika ia besar, sakit, atau nampak bernanah.', en: 'Usually goes away once the tooth comes through. See a dentist if it is large, painful or looks infected.' },
  },
  {
    id: 'pearls', tag: 'ok', term: "Epstein pearls / Bohn's nodules",
    title: { bm: 'Bintil putih bayi baru lahir', en: 'White bumps in newborns' },
    looks: { bm: 'Bintil putih kecil macam mutiara di lelangit atau gusi bayi baru lahir.', en: "Tiny pearl-like white bumps on a newborn's palate or gums." },
    todo: { bm: 'Tidak berbahaya dan hilang sendiri dalam beberapa minggu. Jangan picit.', en: "Harmless and fade on their own within weeks. Don't squeeze them." },
  },
  {
    id: 'suck', tag: 'ok', term: 'Thumb / pacifier sucking',
    title: { bm: 'Hisap jari atau puting', en: 'Thumb or dummy sucking' },
    looks: { bm: 'Tabiat biasa untuk tenangkan diri.', en: 'A normal way for babies to soothe themselves.' },
    todo: { bm: 'Biasanya tidak apa sebelum umur 3–4 tahun. Galakkan berhenti perlahan-lahan dengan pujian, bukan marah.', en: 'Usually fine before age 3–4. Help them stop gently with praise, not scolding.' },
  },
  {
    id: 'grind', tag: 'ok', term: 'Bruxism',
    title: { bm: 'Kisar gigi', en: 'Teeth grinding' },
    looks: { bm: 'Bunyi gigi berkeriut, selalunya waktu tidur.', en: 'A grinding or squeaking sound, often during sleep.' },
    todo: { bm: 'Biasa berlaku dan selalunya hilang sendiri. Beritahu doktor gigi jika gigi nampak haus atau anak sakit.', en: 'Common and usually outgrown. Tell your dentist if teeth look worn or your child is in pain.' },
  },
  {
    id: 'gaps', tag: 'ok', term: 'Spacing',
    title: { bm: 'Celah antara gigi', en: 'Gaps between teeth' },
    looks: { bm: 'Ada ruang antara gigi susu.', en: 'Spaces between the baby teeth.' },
    todo: { bm: 'Normal dan sebenarnya bagus — ia beri ruang untuk gigi kekal yang lebih besar nanti.', en: 'Normal and actually good — it leaves room for the bigger adult teeth later.' },
  },
];

/* ---------- Learn as picture cards: one visual + a few words each ---------- */

export type CardTag = 'do' | 'dont' | 'warn';
export type LearnCard = { v: string; tag?: CardTag; bm: string; en: string };

export const learnCards: Record<string, LearnCard[]> = {
  clean: [
    { v: 'wipe', tag: 'do', bm: '0–6 bln: lap gusi', en: '0–6 mo: wipe gums' },
    { v: 'brush', tag: 'do', bm: 'Gigi keluar? Berus', en: 'First tooth? Brush' },
    { v: 'daynight', tag: 'do', bm: 'Pagi & sebelum tidur', en: 'Morning & bedtime' },
    { v: 'lap', bm: 'Baring di riba', en: 'Lay on your lap' },
    { v: 'newbrush', bm: 'Berus baru tiap 3 bln', en: 'New brush every 3 mo' },
    { v: 'parent', bm: 'Ibu bapa berus hingga 7–8 thn', en: 'You brush until 7–8' },
  ],
  fluoride: [
    { v: 'paste', tag: 'do', bm: 'Saiz ubat gigi', en: 'How much paste' },
    { v: 'ppm', tag: 'do', bm: 'Pilih berfluorida', en: 'Choose fluoride' },
    { v: 'spit', tag: 'dont', bm: 'Ludah, jangan bilas', en: "Spit, don't rinse" },
    { v: 'varnish', tag: 'do', bm: 'Sapuan fluorida di klinik', en: 'Fluoride varnish at clinic' },
    { v: 'reach', bm: 'Simpan jauh dari anak', en: 'Keep out of reach' },
  ],
  food: [
    { v: 'bedbottle', tag: 'dont', bm: 'Jangan tidur dengan botol', en: 'No bottle in bed' },
    { v: 'cup', tag: 'do', bm: 'Cawan dari 6 bulan', en: 'Cup from 6 months' },
    { v: 'sweet', tag: 'dont', bm: 'Elak air manis', en: 'Skip sweet drinks' },
    { v: 'water', tag: 'do', bm: 'Air kosong & susu', en: 'Water & milk' },
    { v: 'honey', tag: 'dont', bm: 'Tiada madu bawah 1 thn', en: 'No honey under 1' },
    { v: 'spoon', tag: 'dont', bm: 'Jangan kongsi sudu', en: "Don't share spoons" },
  ],
  teething: [
    { v: 'signs', bm: 'Air liur, gigit, meragam', en: 'Drool, chewing, fussy' },
    { v: 'fever', tag: 'warn', bm: 'Demam 38°C? Jumpa doktor', en: '38°C fever? See a doctor' },
    { v: 'finger', tag: 'do', bm: 'Urut gusi dengan jari', en: 'Rub gums with a finger' },
    { v: 'teether', tag: 'do', bm: 'Gelang gigit sejuk', en: 'Chilled teether' },
    { v: 'gel', tag: 'dont', bm: 'Elak gel bius', en: 'No numbing gels' },
    { v: 'amber', tag: 'dont', bm: 'Tiada rantai ambar', en: 'No amber necklaces' },
  ],
  dentist: [
    { v: 'firstvisit', tag: 'do', bm: 'Gigi pertama atau umur 1', en: 'First tooth or age 1' },
    { v: 'sixmonths', tag: 'do', bm: 'Setiap 6 bulan', en: 'Every 6 months' },
    { v: 'quick', bm: 'Cepat & tak sakit', en: 'Quick & painless' },
    { v: 'kind', tag: 'do', bm: 'Guna kata positif', en: 'Use kind words' },
  ],
};
