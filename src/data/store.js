export const INITIAL_OILS = [
  { id: 1, sin: 'SIN-4412', name: '5W-30 Full Synthetic', type: 'synthetic', brand: 'Castrol Edge', price: 3450, stock: 240 },
  { id: 2, sin: 'SIN-3301', name: '10W-40 Semi-Synthetic', type: 'semi', brand: 'Mobil Super', price: 2890, stock: 180 },
  { id: 3, sin: 'SIN-7780', name: '0W-20 OEM Grade', type: 'synthetic', brand: 'Toyota GF-6A', price: 4120, stock: 90 },
  { id: 4, sin: 'SIN-1150', name: '15W-40 Mineral', type: 'mineral', brand: 'Shell Rimula', price: 1980, stock: 320 },
  { id: 5, sin: 'SIN-9920', name: '5W-40 Sport', type: 'synthetic', brand: 'Motul 8100', price: 4680, stock: 60 },
  { id: 6, sin: 'SIN-2270', name: '20W-50 Classic', type: 'mineral', brand: 'Havoline', price: 1650, stock: 150 },
];

export const INITIAL_TAGS = [
  { id: 1, name: '5W-30', icon: 'droplet', color: 'amber' },
  { id: 2, name: '10W-40', icon: 'droplet', color: 'amber' },
  { id: 3, name: 'Akció', icon: 'star', color: 'green' },
  { id: 4, name: 'Figyelem', icon: 'alert-circle', color: 'red' },
  { id: 5, name: 'EU Szabály', icon: 'file-text', color: 'blue' },
  { id: 6, name: 'Szállítás', icon: 'truck', color: 'blue' },
  { id: 7, name: 'OEM', icon: 'award', color: 'purple' },
  { id: 8, name: 'Sport', icon: 'flame', color: 'red' },
];

export const INITIAL_CARDS = [
  { id: 1, last4: '4821', bank: 'OTP Bank', holder: 'Kovács Tibor', expires: '08/26', status: 'active' },
  { id: 2, last4: '0034', bank: 'Raiffeisen', holder: 'Kovács Tibor', expires: '12/25', status: 'active' },
  { id: 3, last4: '7192', bank: 'K&H Bank', holder: 'Kovács Tibor', expires: '03/24', status: 'expired' },
  { id: 4, last4: '3345', bank: 'MBH Bank', holder: 'Kovács Tibor', expires: '11/27', status: 'active' },
];

export const INITIAL_POSTS = [
  {
    id: 1, author: 'Nagy Péter', initials: 'NP', avatarColor: '#e05050',
    time: '2 órája', location: 'Debrecen', badge: 'deal',
    oils: ['SIN-4412', 'SIN-3301'],
    content: 'Friss készlet érkezett! 5W-30 Full Szinti most 15% kedvezménnyel — hétvégéig érvényes. 20L feletti rendelésnél ingyenes kiszállítás az egész régióban.',
    prices: [{ label: '5W-30 / liter', val: 3450, change: -15 }, { label: '10W-40 / liter', val: 2890, change: 3 }],
    likes: 24, comments: 8, liked: false,
  },
  {
    id: 2, author: 'Szabó Zsolt', initials: 'SZ', avatarColor: '#3db87a',
    time: '5 órája', location: null, badge: 'news',
    oils: [],
    content: 'Új EU szabályozás 2025-től: a hajtóanyag-adalékok kötelező jelölése megváltozik. Az eddigi SAE osztályozás mellett egy új ökológiai pontszám is meg fog jelenni a csomagoláson.',
    prices: [],
    likes: 11, comments: 3, liked: false,
  },
  {
    id: 3, author: 'Molnár Ádám', initials: 'MÁ', avatarColor: '#4a90e2',
    time: '1 napja', location: null, badge: 'warn',
    oils: ['SIN-7780'],
    content: 'Vigyázat: a Castrol Edge 0W-20 szériából hamis termékek kerültek forgalomba. Ellenőrizzétek a SIN kódot vásárlás előtt! Ha SIN-7780-at kaptok de a visszaigazolóban más szám van, jelezzétek adminnak.',
    prices: [],
    likes: 47, comments: 19, liked: true,
  },
  {
    id: 4, author: 'Horváth Bence', initials: 'HB', avatarColor: '#9b59b6',
    time: '2 napja', location: 'Budapest', badge: 'deal',
    oils: ['SIN-9920'],
    content: 'Motul 8100 5W-40 Sport készlet — limitált mennyiség. Versenypályás tesztek alapján kiváló hőstabilitás. Ára most különösen kedvező mert éves záró akció van.',
    prices: [{ label: '5W-40 Sport / liter', val: 4680, change: -8 }],
    likes: 33, comments: 12, liked: false,
  },
];

export const EDITOR_BLOCKS = [
  { id: 'hero', label: 'Hero szekció', icon: 'rectangle' },
  { id: 'prices', label: 'Ár lista', icon: 'chart-bar' },
  { id: 'promo', label: 'Akció banner', icon: 'star' },
  { id: 'feed', label: 'Feed widget', icon: 'timeline' },
  { id: 'text', label: 'Szöveg blokk', icon: 'align-left' },
  { id: 'image', label: 'Kép', icon: 'photo' },
];
