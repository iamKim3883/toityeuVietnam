
export type AspectRatio = '1:1' | '3:4' | '9:16';
export type Quality = 'standard' | 'high' | 'very_high';
export type NumberOfImages = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Concept {
  key: string;
  label: string;
  prompt: string;
  category?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  seed: string;
}