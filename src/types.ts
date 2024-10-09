export interface Background {
  video: string;
  icon: string;
  logo: string;
}

export type BackgroundType = 'normal' | 'herbst' | 'winter';

export interface Button {
  name: string;
  icon: string;
  url?: string;
}