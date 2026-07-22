// =============================================================================
// AETHERFALL: Sang Penjelajah Dunia — Story Graph
// -----------------------------------------------------------------------------
// Seluruh naskah cerita disimpan sebagai data (node graph) supaya engine game
// (lihat gameEngine.ts) dapat murni fungsional / deterministik: cocok untuk
// dijalankan di render loop ringan tanpa alokasi berat di setiap frame.
// =============================================================================

export type EndingKey = "true" | "good" | "normal" | "bad" | "secret";

export type SceneKey =
  | "eldrath_battle"
  | "portal_rift"
  | "neo_veyron_city"
  | "council_hall"
  | "rebel_hideout"
  | "council_lab"
  | "spy_data"
  | "ancient_temple"
  | "rift_core"
  | "ending_true"
  | "ending_good"
  | "ending_normal"
  | "ending_bad"
  | "ending_secret";

export type ParticleEffect =
  | "none"
  | "portal"
  | "magic_sparks"
  | "sword_slash"
  | "ember_drift"
  | "void_wisps"
  | "holy_light"
  | "corruption";

export interface StatEffects {
  hp?: number;
  mp?: number;
  karma?: number;
  fragments?: number;
}

export type FlagKey =
  | "alliedRebels"
  | "trainedDarkPower"
  | "corrupted"
  | "doubleAgent";

export type EndingResolver =
  | "give_up"
  | "control_rift"
  | "sacrifice"
  | "seize_power"
  | "fight";

export interface StoryChoice {
  id: string;
  text: string;
  effects?: StatEffects;
  setFlags?: FlagKey[];
  next?: string; // node id (omit when resolver is used)
  resolver?: EndingResolver; // only used on the climax node
  /** Choice is only shown when this predicate passes. */
  condition?: {
    minKarma?: number;
    maxKarma?: number;
    minFragments?: number;
    minMp?: number;
    minHp?: number;
    flag?: FlagKey;
  };
}

export interface StoryNode {
  id: string;
  speaker: string;
  text: string;
  scene: SceneKey;
  effect?: ParticleEffect;
  choices: StoryChoice[];
}

export const STORY: Record<string, StoryNode> = {
  start: {
    id: "start",
    speaker: "Narator",
    scene: "eldrath_battle",
    effect: "sword_slash",
    text:
      "Petir menyambar di atas reruntuhan Benteng Draven. Kau, Ser Kaelen — pengembara pedang legendaris dari dunia Eldrath — berdiri sendirian menghadapi Naga Bayangan terakhir, sisa kutukan Perang Seribu Tahun. Pedangmu bergetar, darah menetes dari lukamu, namun matamu tak pernah goyah.",
    choices: [
      {
        id: "attack",
        text: "Terjang maju, habisi naga itu dengan tebasan terakhir!",
        effects: { hp: -15, karma: 5 },
        next: "portal",
      },
      {
        id: "retreat",
        text: "Mundur, cari celah untuk menyerang balik",
        effects: { hp: -5, mp: 10 },
        next: "portal",
      },
    ],
  },

  portal: {
    id: "portal",
    speaker: "Narator",
    scene: "portal_rift",
    effect: "portal",
    text:
      "Tepat saat pedangmu berkilat, langit terbelah. Sebuah retakan ungu menyala membentuk pusaran raksasa, menyedot segalanya di sekitarnya — termasuk dirimu. Ini bukan sihir Eldrath yang kau kenal. Ini adalah Anomali Dimensi.",
    choices: [
      {
        id: "surrender",
        text: "Pasrah dan biarkan pusaran menelanmu",
        effects: { mp: 5 },
        next: "arrival",
      },
      {
        id: "resist",
        text: "Melawan tarikan, berpegang pada reruntuhan batu",
        effects: { hp: -10 },
        next: "arrival",
      },
    ],
  },

  arrival: {
    id: "arrival",
    speaker: "Narator",
    scene: "neo_veyron_city",
    effect: "magic_sparks",
    text:
      "Kau terbangun di atas aspal dingin yang memancarkan cahaya neon dari bawah. Menara logam raksasa menjulang berdampingan dengan reruntuhan kuil bersinar. Papan hologram berkedip: 'Selamat Datang di Neo-Veyron, Distrik 7.' Seorang gadis berjubah dengan mata bercahaya digital, Nova, mendekat. 'Manusia asing... kau jatuh dari Retakan Langit? Aether di tubuhmu sangat kuat. Aku Nova — pemandu, atau buronan, tergantung siapa yang bertanya.'",
    choices: [
      {
        id: "trust_nova",
        text: "Percaya Nova, minta bantuannya",
        effects: { karma: 10 },
        setFlags: ["alliedRebels"],
        next: "meet_council",
      },
      {
        id: "wary_nova",
        text: "Waspada, jaga jarak dan diam saja",
        effects: { karma: -5 },
        next: "meet_council",
      },
      {
        id: "attack_nova",
        text: "Serang duluan, jangan ambil risiko",
        effects: { karma: -15, hp: -5, mp: 5 },
        next: "meet_council",
      },
    ],
  },

  meet_council: {
    id: "meet_council",
    speaker: "Arkon Vey",
    scene: "council_hall",
    effect: "magic_sparks",
    text:
      "Sebelum kalian sempat bicara lebih jauh, drone berlambang mata emas mengepung dari udara. Seorang pria berjubah sirkuit turun dari kapal terbang — Arkon Vey, Penjaga Ascendant Council. Ia tersenyum tipis. 'Pendatang dari Retakan... kekuatan Aether-mu bisa jadi kunci untuk menstabilkan Rift kami. Bergabunglah, dan kau akan menjadi dewa di dunia ini.'",
    choices: [
      {
        id: "refuse_council",
        text: "Tolak tegas — aku berdiri bersama rakyat",
        effects: { karma: 15 },
        setFlags: ["alliedRebels"],
        next: "rebel_1",
      },
      {
        id: "accept_council",
        text: "Terima tawaran itu — kekuatan adalah segalanya",
        effects: { mp: 20, karma: -20 },
        setFlags: ["trainedDarkPower"],
        next: "council_1",
      },
      {
        id: "pretend_agree",
        text: "Berpura-pura setuju, cari informasi dari dalam",
        setFlags: ["doubleAgent"],
        next: "agent_1",
      },
    ],
  },

  // --- Jalur Pemberontak (Fraksi Fajar) -------------------------------------
  rebel_1: {
    id: "rebel_1",
    speaker: "Kapten Rhea",
    scene: "rebel_hideout",
    effect: "ember_drift",
    text:
      "Fraksi Fajar bersembunyi di terowongan pipa Aether tua di bawah kota. Pemimpin mereka, Kapten Rhea, memintamu membantu evakuasi warga sipil dari serangan drone Council malam ini.",
    choices: [
      {
        id: "protect_directly",
        text: "Bertarung langsung melindungi warga",
        effects: { hp: -20, karma: 10, fragments: 1 },
        next: "rebel_2",
      },
      {
        id: "protect_stealth",
        text: "Menyelinap dan alihkan perhatian drone",
        effects: { mp: -15, karma: 5, fragments: 1 },
        next: "rebel_2",
      },
    ],
  },
  rebel_2: {
    id: "rebel_2",
    speaker: "Kapten Rhea",
    scene: "rebel_hideout",
    effect: "holy_light",
    text:
      "Warga selamat berkat tindakanmu. Rhea menyerahkan sebuah kristal berpendar ungu. 'Fragmen Aether pertama. Konon ini bagian dari Rift Core kuno. Jaga baik-baik, Ser Kaelen.'",
    choices: [
      {
        id: "honor_gift",
        text: "Terima dengan hormat, berjanji melindungi Neo-Veyron",
        effects: { karma: 5 },
        next: "fragment_hunt",
      },
      {
        id: "greedy_gift",
        text: "Ambil diam-diam, simpan untuk kepentinganmu sendiri",
        effects: { karma: -10 },
        next: "fragment_hunt",
      },
    ],
  },

  // --- Jalur Ascendant Council -----------------------------------------------
  council_1: {
    id: "council_1",
    speaker: "Arkon Vey",
    scene: "council_lab",
    effect: "corruption",
    text:
      "Arkon membawamu ke Laboratorium Sirkuit, tempat pelatihan Cyber-Mana. Sebagai ujian kesetiaan, ia menyeret seorang tahanan pemberontak ke hadapanmu. 'Bunuh dia untuk membuktikan kesetiaanmu. Sebagai imbalan, kau dapatkan Fragmen Aether kekaisaran.'",
    choices: [
      {
        id: "show_mercy",
        text: "Tunjukkan belas kasih, bebaskan tahanan itu",
        effects: { karma: 15, hp: -10 },
        next: "council_2",
      },
      {
        id: "execute_prisoner",
        text: "Eksekusi tahanan demi kekuatan",
        effects: { karma: -25, mp: 15, fragments: 1 },
        setFlags: ["corrupted"],
        next: "council_2",
      },
    ],
  },
  council_2: {
    id: "council_2",
    speaker: "Arkon Vey",
    scene: "council_lab",
    effect: "corruption",
    text:
      "Arkon menyeringai. 'Kekuatan sejati butuh pengorbanan.' Ia menanamkan inti Cyber-Mana ke dadamu — rasa sakit luar biasa, namun kekuatanmu melonjak drastis.",
    choices: [
      {
        id: "accept_power_full",
        text: "Terima kekuatan itu sepenuhnya",
        effects: { mp: 15, karma: -10 },
        next: "fragment_hunt",
      },
      {
        id: "resist_power",
        text: "Tahan sebagian, jaga kewarasanmu",
        effects: { mp: 5 },
        next: "fragment_hunt",
      },
    ],
  },

  // --- Jalur Mata-mata Ganda ---------------------------------------------------
  agent_1: {
    id: "agent_1",
    speaker: "Nova",
    scene: "spy_data",
    effect: "magic_sparks",
    text:
      "Kau menyusup ke ruang data Council bersama Nova, mencari bukti rencana rahasia mereka terhadap Rift Core.",
    choices: [
      {
        id: "careful_infiltrate",
        text: "Bergerak hati-hati, hindari sensor keamanan",
        effects: { mp: -10, fragments: 1 },
        next: "agent_2",
      },
      {
        id: "reckless_infiltrate",
        text: "Bergerak cepat meski berisiko tertangkap",
        effects: { hp: -15, karma: -5, fragments: 1 },
        next: "agent_2",
      },
    ],
  },
  agent_2: {
    id: "agent_2",
    speaker: "Nova",
    scene: "spy_data",
    effect: "magic_sparks",
    text:
      "Data ditemukan: Council berencana meledakkan Rift Core untuk menyerap seluruh energinya sekaligus — mengorbankan seluruh Neo-Veyron. Nova menggenggam tanganmu. 'Kita harus hentikan mereka, dengan cara apa pun.'",
    choices: [
      {
        id: "vow_to_stop",
        text: "Bersumpah menghentikan rencana itu demi semua orang",
        effects: { karma: 10 },
        next: "fragment_hunt",
      },
      {
        id: "exploit_info",
        text: "Pikirkan cara memanfaatkan situasi ini untukmu sendiri",
        effects: { karma: -10 },
        next: "fragment_hunt",
      },
    ],
  },

  // --- Titik konvergensi: perburuan fragmen terakhir --------------------------
  fragment_hunt: {
    id: "fragment_hunt",
    speaker: "Narator",
    scene: "ancient_temple",
    effect: "void_wisps",
    text:
      "Petunjuk membawa kalian ke Kuil Aether yang runtuh, dijaga oleh Void Wraith — makhluk bayangan pelahap mana. Untuk merebut fragmen terakhir, kau harus melewatinya terlebih dahulu.",
    choices: [
      {
        id: "wraith_magic",
        text: "Serang habis-habisan dengan sihir penuh",
        effects: { mp: -30, hp: -15, fragments: 1 },
        next: "rift_core",
      },
      {
        id: "wraith_sword",
        text: "Andalkan pedang dan taktik bertarung jarak dekat",
        effects: { hp: -30, fragments: 1 },
        next: "rift_core",
      },
      {
        id: "wraith_avoid",
        text: "Hindari pertarungan, cari jalan memutar",
        effects: { mp: -10, karma: 5 },
        next: "rift_core",
      },
    ],
  },

  // --- Klimaks: Rift Core ------------------------------------------------------
  rift_core: {
    id: "rift_core",
    speaker: "Narator",
    scene: "rift_core",
    effect: "portal",
    text:
      "Kalian tiba di jantung Neo-Veyron: Rift Core, pilar cahaya raksasa penghubung segala dimensi — kini retak dan tak stabil. Arkon Vey berdiri di hadapannya, bersiap memicu ledakan penyerapan total. Inilah momen penentu takdirmu, Ser Kaelen.",
    choices: [
      {
        id: "control_rift",
        text: "Gunakan ketiga Fragmen Aether untuk mengendalikan Rift sepenuhnya",
        resolver: "control_rift",
        condition: { minFragments: 3 },
      },
      {
        id: "sacrifice",
        text: "Korbankan kekuatanmu untuk menutup Rift dan menyelamatkan Neo-Veyron",
        resolver: "sacrifice",
        condition: { minKarma: 15 },
      },
      {
        id: "seize_power",
        text: "Rebut kendali Rift Core, taklukkan dunia ini sebagai penguasa baru",
        resolver: "seize_power",
        condition: { maxKarma: -20 },
      },
      {
        id: "fight",
        text: "Lawan Arkon Vey secara langsung, apa pun risikonya",
        effects: { hp: -40 },
        resolver: "fight",
      },
      {
        id: "give_up",
        text: "\"Aku sudah cukup. Aku hanya ingin hidup tenang di dunia ini.\"",
        resolver: "give_up",
      },
    ],
  },
};

export const START_NODE_ID = "start";

export const ENDING_META: Record<
  EndingKey,
  { title: string; subtitle: string; scene: SceneKey; effect: ParticleEffect; text: string; color: string }
> = {
  true: {
    title: "THE WORLD WALKER",
    subtitle: "True Ending",
    scene: "ending_true",
    effect: "portal",
    color: "#7dd3fc",
    text:
      "Ketiga Fragmen Aether bersatu di tanganmu, beresonansi dengan detak jantung Rift Core. Kau tidak lagi sekadar pengembara yang tersesat — kau adalah kunci di antara dunia. Retakan dimensi kini tunduk pada kehendakmu. Eldrath dan Neo-Veyron, dua dunia yang dulu terpisah, kini bisa kau susuri kapan pun kau mau. Legenda menyebutmu 'Sang Penjelajah Dunia', sosok yang melampaui batas takdir maupun ruang-waktu.",
  },
  good: {
    title: "THE NEW HERO",
    subtitle: "Good Ending",
    scene: "ending_good",
    effect: "holy_light",
    color: "#facc15",
    text:
      "Dengan mengorbankan sebagian besar kekuatanmu, kau berhasil menutup keretakan Rift Core sebelum meledak. Neo-Veyron selamat. Warga bersorak menyebut namamu di setiap sudut kota — Ser Kaelen, Sang Pahlawan Baru. Kau memang tak lagi bisa pulang ke Eldrath, tapi di sinilah kau menemukan rumah dan legenda barumu.",
  },
  normal: {
    title: "PEACEFUL LIFE",
    subtitle: "Normal Ending",
    scene: "ending_normal",
    effect: "ember_drift",
    color: "#a7f3d0",
    text:
      "Kau menurunkan pedangmu. Cukup sudah pertarungan, cukup sudah taruhan nyawa. Kau berjalan menjauh dari Rift Core, meninggalkan takdir besar itu kepada yang lain. Kini kau membuka sebuah kedai kecil di pinggiran Distrik 7, menjalani hari-hari sederhana sebagai warga biasa Neo-Veyron — tenang, damai, dan akhirnya bebas dari beban seorang 'pahlawan'.",
  },
  bad: {
    title: "LOST IN THE VOID",
    subtitle: "Bad Ending",
    scene: "ending_bad",
    effect: "void_wisps",
    color: "#64748b",
    text:
      "Tubuhmu tak lagi mampu menahan beban pertarungan maupun tekanan Rift yang runtuh. Cahaya di sekitarmu memudar, digantikan kehampaan tanpa warna maupun suara. Kau melayang, sadar namun tanpa raga, terjebak selamanya di celah antar dimensi — bukan di Eldrath, bukan pula di Neo-Veyron. Hanya kehampaan yang mengingat namamu.",
  },
  secret: {
    title: "THE OVERLORD",
    subtitle: "Secret Ending",
    scene: "ending_secret",
    effect: "corruption",
    color: "#ef4444",
    text:
      "Kekuatan gelap yang kau tempa perlahan menelan nuranimu. Kau merebut Rift Core sepenuhnya, menundukkan Arkon Vey dan seluruh Ascendant Council di bawah kakimu. Neo-Veyron yang dulu ingin kau selamatkan kini bertekuk lutut di hadapan singgasana barumu. Kau bukan lagi pengembara dari Eldrath — kau adalah Raja Iblis baru dunia ini.",
  },
};
