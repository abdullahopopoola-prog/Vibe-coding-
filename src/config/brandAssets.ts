export type BrandAssetKey =
  | 'background'
  | 'pattern'
  | 'alMusaahamahHeader'
  | 'amettsaAnd50Logo'
  | 'amettsa50Mark'
  | 'amettsaSocials'
  | 'amettsaFooter'
  | 'alMusaahamahFooter';

export interface BrandAssetSlot {
  key: BrandAssetKey;
  filename: string;
  src: string;
  description: string;
}

export type BrandAssetImages = Partial<Record<BrandAssetKey, HTMLImageElement>>;

/**
 * Official AMETTSA 5.0 brand color system (aligned with "Colour Pallete Ametssa Con.png").
 */
export const AMETTSA_PALETTE = {
  deepForest: '#002a16',
  emeraldDark: '#013214',
  emeraldMid: '#003a12',
  emeraldBrand: '#105b3c',
  white: '#ffffff',
  goldPrimary: '#fdc80f',
  goldLight: '#ffe47a',
  goldDeep: '#d6a002',
  surfaceLight: '#f3f7f4',
  borderLight: '#cde0d4',
  borderDark: '#164d33',
  inkLight: '#002a16',
  inkMutedLight: '#426150',
  inkDark: '#ffffff',
  inkMutedDark: '#b8d4c4',
} as const;

export const DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1BF0O-E1aBj3jBkFYqrNulBn74sO6PzCi?usp=sharing';

/**
 * Wired to the official client PNG assets uploaded to /public/assets/aistudio/,
 * with clean drop-in slots in /public/assets/brand/ for additional overrides.
 */
export const BRAND_ASSET_SLOTS: ReadonlyArray<BrandAssetSlot> = [
  {
    key: 'background',
    filename: 'Flyer_body_2df0a131.png',
    src: '/assets/aistudio/Flyer_body_2df0a131.png',
    description: 'Official emerald compass-patterned flyer background (Ametssa Bg.png)',
  },
  {
    key: 'alMusaahamahHeader',
    filename: 'Header_db0b6560.png',
    src: '/assets/aistudio/Header_db0b6560.png',
    description: 'Official top organization & convention header bar (Al-Musaahamah header.png)',
  },
  {
    key: 'amettsa50Mark',
    filename: 'Convention_Logo_800ad48e.png',
    src: '/assets/aistudio/Convention_Logo_800ad48e.png',
    description: 'Official AMETTSA 5.0 Convention & 5th Anniversary lockup (Amettsa 5_0.png)',
  },
  {
    key: 'amettsaFooter',
    filename: 'Footer_d3a61521.png',
    src: '/assets/aistudio/Footer_d3a61521.png',
    description: 'Official website & socials footer bar (Amettsa Footer.png)',
  },
  {
    key: 'pattern',
    filename: 'Ametssa Pattern.png',
    src: encodeURI('/assets/brand/Ametssa Pattern.png'),
    description: 'Optional extra pattern overlay',
  },
  {
    key: 'amettsaAnd50Logo',
    filename: 'Ametssa and 5_0 Logo.png',
    src: encodeURI('/assets/brand/Ametssa and 5_0 Logo.png'),
    description: 'Optional secondary logo badge',
  },
  {
    key: 'amettsaSocials',
    filename: 'Amettsa Socials.png',
    src: encodeURI('/assets/brand/Amettsa Socials.png'),
    description: 'Optional standalone socials strip',
  },
  {
    key: 'alMusaahamahFooter',
    filename: 'Almusaahamah footer.png',
    src: encodeURI('/assets/brand/Almusaahamah footer.png'),
    description: 'Optional partner footer bar',
  },
];
