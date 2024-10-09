import { Background, Button } from './types';

export const backgrounds: Record<string, Background> = {
  normal: {
    video: '/europa.mp4',
    icon: '/euheart.svg',
    logo: '/normal-logo.png',
  },
  herbst: {
    video: '/herbst.mp4',
    icon: '/pumpkin.svg',
    logo: '/logo_herbst.png',
  },
  winter: {
    video: '/snow.mp4',
    icon: '/snowman.svg',
    logo: '/logo_winter.png',
  },
};

export const buttons: Button[] = [
  { name: 'Raumplan', icon: 'LayoutDashboard' },
  { name: 'Info', icon: 'Info', url: 'https://www.bs-elmshorn.de/' },
  { name: 'Kontakt', icon: 'Mail' },
];

export const CORRECT_PIN = '1254';