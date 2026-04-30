export const ITEM_BUNDLES = [
  {
    id: "pkg-fb-area",
    name: "[PKG] F&B Area Standard",
    description: "Standard setup for F&B area including tent, tables, chairs, and power.",
    items: [
      { item_code: "VS-TS-001", quantity: 1, duration: 3, dur_unit: "day", note: "Tent 12x24 for F&B" },
      { item_code: "VS-CM-003", quantity: 24, duration: 3, dur_unit: "day", note: "IBM Tables with cover" },
      { item_code: "VS-CM-004", quantity: 48, duration: 3, dur_unit: "day", note: "Futura Chairs with cover" },
      { item_code: "PR-EQ-012", quantity: 1, duration: 3, dur_unit: "day", note: "80KVA Power" },
      { item_code: "PR-EQ-011", quantity: 4, duration: 3, dur_unit: "day", note: "Misty Fan cooling" }
    ]
  },
  {
    id: "pkg-reg-area",
    name: "[PKG] Registration / Redemption Area",
    description: "Setup for participant registration or voucher redemption.",
    items: [
      { item_code: "PR-BO-005", quantity: 2, duration: 3, dur_unit: "day", note: "R8 Ticket Booth" },
      { item_code: "VS-CM-001", quantity: 10, duration: 3, dur_unit: "day", note: "Queue lines" },
      { item_code: "VS-SR-003", quantity: 2, duration: 3, dur_unit: "day", note: "AC Portable" },
      { item_code: "SP-SG-005", quantity: 4, duration: 3, dur_unit: "day", note: "Standing Signage A3" },
      { item_code: "SU-TC-001", quantity: 1, duration: 1, dur_unit: "event", note: "Dedicated Internet" }
    ]
  },
  {
    id: "pkg-vip-lounge",
    name: "[PKG] VIP Lounge Hospitality",
    description: "Premium setup for VIP guests holding room.",
    items: [
      { item_code: "VS-VH-002", quantity: 4, duration: 3, dur_unit: "day", note: "VIP Sofa" },
      { item_code: "VS-VH-003", quantity: 2, duration: 3, dur_unit: "day", note: "Coffee Table" },
      { item_code: "VS-SR-003", quantity: 2, duration: 3, dur_unit: "day", note: "AC Portable" },
      { item_code: "VS-VH-004", quantity: 2, duration: 3, dur_unit: "day", note: "Flowers / Centerpiece" },
      { item_code: "VS-VH-008", quantity: 1, duration: 3, dur_unit: "day", note: "Amenities & Refreshments" }
    ]
  },
  {
    id: "pkg-medical-vvip",
    name: "[PKG] Medical VVIP Team",
    description: "Full ICU Standard medical team for high priority events.",
    items: [
      { item_code: "PR-ME-001", name: "Ambulance ICU", quantity: 1, duration: 1, dur_unit: "day", note: "VVIP Mini ICU Unit" },
      { item_code: "PR-ME-002", name: "Specialist Doctor", quantity: 1, duration: 1, dur_unit: "day", note: "Emergency Specialist" },
      { item_code: "PR-ME-002", name: "ICU Nurse", quantity: 2, duration: 1, dur_unit: "day", note: "Certified RN" },
      { item_code: "VS-SR-001", quantity: 1, duration: 1, dur_unit: "day", note: "Full Medic Tools Set" }
    ]
  },
  {
    id: "pkg-main-led-system",
    name: "[PKG] Main LED System P2.9",
    description: "Complete LED P2.9 System including Main, Inner, Curve, Wing panels, Video Switcher, Media Server, and Logistics.",
    items: [
      { item_code: "LED-P29-MAIN", quantity: 48, duration: 2, dur_unit: "day", note: "Main LED 12x4m" },
      { item_code: "LED-P29-INNER", quantity: 20, duration: 2, dur_unit: "day", note: "Flat Inner LED 5x4m" },
      { item_code: "LED-P29-CURVE", quantity: 12, duration: 2, dur_unit: "day", note: "Curve LED 3x4m 9deg" },
      { item_code: "LED-P29-WING", quantity: 16, duration: 2, dur_unit: "day", note: "Flat Wing LED 4x4m" },
      { item_code: "LED-ACC-CABLE", quantity: 4, duration: 2, dur_unit: "day", note: "Cabling and Fiber Optic" },
      { item_code: "LED-PRO-SWITCH", quantity: 1, duration: 2, dur_unit: "day", note: "Video Switcher V16 Magnimage (FOH)" },
      { item_code: "MAN-OP-LED", quantity: 1, duration: 2, dur_unit: "day", note: "LED Operator" },
      { item_code: "LED-ACC-SLIDER", quantity: 1, duration: 2, dur_unit: "day", note: "Slider LED 18mx1,8m" },
      { item_code: "LED-PRO-SERVER", quantity: 8, duration: 2, dur_unit: "day", note: "Hirlander/Resolume Media Server" },
      { item_code: "LOG-TR-TRUCK", quantity: 4, duration: 2, dur_unit: "trip", note: "Transport Truck" },
      { item_code: "LOG-TR-ELF", quantity: 1, duration: 5, dur_unit: "day", note: "Main Power Transport (Elf)" },
      { item_code: "LOG-AC-ROOM", quantity: 8, duration: 5, dur_unit: "night", note: "Team Accomodation" },
      { item_code: "LOG-CS-MEALS", quantity: 16, duration: 5, dur_unit: "day", note: "Team Meals" }
    ]
  },
  {
    id: "pkg-program-wing-led",
    name: "[PKG] Program Wing LED P2.9",
    description: "Additional LED P2.9 for Program Wing (6x4m).",
    items: [
      { item_code: "LED-P29-WING-PRG", quantity: 24, duration: 2, dur_unit: "day", note: "LED P2.9 6x4m" }
    ]
  },
  {
    id: "pkg-floor-led",
    name: "[PKG] Floor LED P3.9",
    description: "LED P3.9 Floor system (5x5m).",
    items: [
      { item_code: "LED-P39-FLOOR", quantity: 25, duration: 2, dur_unit: "day", note: "LED P3.9 5x5m" }
    ]
  },
  {
    id: "pkg-basic-stage-sound",
    name: "[PKG] Basic Stage & Sound 5000W",
    description: "Ideal for small seminars or press conferences. Includes 6x4m stage and professional audio setup.",
    items: [
      { item_code: "STG-6X4", quantity: 1, duration: 1, dur_unit: "day", note: "Stage 6x4m height 40cm" },
      { item_code: "AUD-SS-5000", quantity: 1, duration: 1, dur_unit: "day", note: "Sound System 5000W Package" },
      { item_code: "AUD-MIC-WRLS", quantity: 4, duration: 1, dur_unit: "day", note: "Wireless Microphone" },
      { item_code: "MAN-OP-AUD", quantity: 1, duration: 1, dur_unit: "day", note: "Sound Engineer" }
    ]
  },
  {
    id: "pkg-lighting-standard",
    name: "[PKG] Standard Lighting System",
    description: "Atmospheric lighting for evening events or indoor ambiance.",
    items: [
      { item_code: "LIT-PAR-LED", quantity: 8, duration: 1, dur_unit: "day", note: "Par LED 54x3W" },
      { item_code: "LIT-MOV-HEAD", quantity: 4, duration: 1, dur_unit: "day", note: "Moving Head Beam 230W" },
      { item_code: "LIT-CON-TITAN", quantity: 1, duration: 1, dur_unit: "day", note: "Lighting Console" },
      { item_code: "MAN-OP-LIT", quantity: 1, duration: 1, dur_unit: "day", note: "Lighting Operator" }
    ]
  },
  {
    id: "pkg-manpower-ushers",
    name: "[PKG] Professional Manpower - Ushers",
    description: "Dedicated team for guest registration and hospitality.",
    items: [
      { item_code: "MP-USR-PRO", quantity: 4, duration: 1, dur_unit: "day", note: "Professional Usher (Female/Male)" },
      { item_code: "MP-USR-SPV", quantity: 1, duration: 1, dur_unit: "day", note: "Usher Supervisor" },
      { item_code: "LOG-CS-MEALS", quantity: 5, duration: 1, dur_unit: "day", note: "Team Meals" }
    ]
  },
  {
    id: "pkg-branding-basic",
    name: "[PKG] Event Branding & Collaterals",
    description: "Basic items for participant identification and event identity.",
    items: [
      { item_code: "BR-ID-CARD", quantity: 100, duration: 1, dur_unit: "event", note: "PVC ID Card" },
      { item_code: "BR-LANYARD", quantity: 100, duration: 1, dur_unit: "event", note: "Nylon Lanyard with Logo" },
      { item_code: "BR-REG-BOOK", quantity: 5, duration: 1, dur_unit: "event", note: "Guest Signature Book" },
      { item_code: "BR-ST-BAN", quantity: 4, duration: 1, dur_unit: "event", note: "X-Banner / Roll-up Banner" }
    ]
  },
  {
    id: "pkg-broadcast-streaming",
    name: "[PKG] Live Streaming & Broadcast Pro",
    description: "Complete setup for hybrid events or live streaming to YouTube/Zoom.",
    items: [
      { item_code: "BC-CAM-SONY", quantity: 3, duration: 1, dur_unit: "day", note: "Sony A7SIII / PXW Camera" },
      { item_code: "BC-SW-ATEM", quantity: 1, duration: 1, dur_unit: "day", note: "Blackmagic ATEM Switcher" },
      { item_code: "BC-PC-STREAM", quantity: 1, duration: 1, dur_unit: "day", note: "High-spec Streaming PC" },
      { item_code: "SU-TC-001", quantity: 1, duration: 1, dur_unit: "event", note: "Dedicated Internet for Stream" }
    ]
  },
  {
    id: "pkg-after-movie-afm",
    name: "[PKG] After Movie (AFM) Pro",
    description: "High-quality event documentation and cinematic after movie production.",
    items: [
      { item_code: "DOC-VID-PRO", quantity: 2, duration: 1, dur_unit: "day", note: "Senior Videographer" },
      { item_code: "DOC-CAM-SET", quantity: 2, duration: 1, dur_unit: "day", note: "Professional 4K Camera & Lens Set" },
      { item_code: "DOC-GIMBAL", quantity: 2, duration: 1, dur_unit: "day", note: "3-Axis Stabilizer (Ronin/Crane)" },
      { item_code: "DOC-DRONE-4K", quantity: 1, duration: 1, dur_unit: "day", note: "Drone Aerial 4K & Pilot" },
      { item_code: "DOC-EDT-AFM", quantity: 1, duration: 1, dur_unit: "event", note: "Cinematic After Movie Edit (3-5 Mins)" },
      { item_code: "DOC-EDT-SOC", quantity: 1, duration: 1, dur_unit: "event", note: "Social Media Reel/TikTok Edit (1 Min)" }
    ]
  },
  {
    id: "pkg-audience-flow",
    name: "[PKG] Audience Flow Management",
    description: "Complete solution for guest flow, queueing, and directional guidance.",
    items: [
      { item_code: "VS-CM-001", quantity: 20, duration: 1, dur_unit: "day", note: "Queue Line / Barrier Rope" },
      { item_code: "SP-SG-005", quantity: 10, duration: 1, dur_unit: "day", note: "Standing Directional Signage A3" },
      { item_code: "SP-SG-008", quantity: 2, duration: 1, dur_unit: "day", note: "Large Map/Venue Signage (Backdrop)" },
      { item_code: "MP-SCR-CROWD", quantity: 6, duration: 1, dur_unit: "day", note: "Crowd Control / Security" },
      { item_code: "MP-USR-PRO", quantity: 2, duration: 1, dur_unit: "day", note: "Directional Usher" },
      { item_code: "PR-EQ-HT", quantity: 8, duration: 1, dur_unit: "day", note: "Handy Talky for Coordination" }
    ]
  },
  {
    id: "pkg-booth-games",
    name: "[PKG] Interactive Booth Games",
    description: "Engagement booth featuring gaming consoles, large screens, and branding.",
    items: [
      { item_code: "BT-R8-3X3", quantity: 1, duration: 3, dur_unit: "day", note: "R8 Booth System 3x3m" },
      { item_code: "BT-BR-VINYL", quantity: 1, duration: 3, dur_unit: "day", note: "Full Vinyl Sticker Branding" },
      { item_code: "BT-EQ-PS5", quantity: 1, duration: 3, dur_unit: "day", note: "Playstation 5 / Gaming Console" },
      { item_code: "LED-TV-55", quantity: 1, duration: 3, dur_unit: "day", note: "55-inch LED TV & Standing" },
      { item_code: "VS-VH-002", quantity: 2, duration: 3, dur_unit: "day", note: "Gaming / VIP Sofa" },
      { item_code: "MP-USR-SPG", quantity: 1, duration: 3, dur_unit: "day", note: "Booth Crew / SPG" }
    ]
  }
];
