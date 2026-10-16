import type { Theme } from './types';

export const THEMES: Theme[] = [
  {
    id: 'navy-gold',
    name: 'Tamsiai mėlyna ir auksinė',
    sidebarBg: '#2E3A4B',
    sidebarText: '#C9CFD7',
    sidebarStrong: '#EEF1F4',
    sidebarLine: 'rgba(255, 255, 255, 0.32)',
    accent: '#A8894A',
    text: '#2E3A4B',
    muted: '#7D828A',
    line: '#C9CCD1',
  },
  {
    id: 'graphite-teal',
    name: 'Grafitas ir žalsvai mėlyna',
    sidebarBg: '#33373D',
    sidebarText: '#CDD1D6',
    sidebarStrong: '#F1F3F5',
    sidebarLine: 'rgba(255, 255, 255, 0.3)',
    accent: '#3E8E8A',
    text: '#2B2F35',
    muted: '#7A7F86',
    line: '#CBCED3',
  },
  {
    id: 'burgundy',
    name: 'Bordo ir smėlio',
    sidebarBg: '#4A2730',
    sidebarText: '#E2D2D5',
    sidebarStrong: '#F7EEF0',
    sidebarLine: 'rgba(255, 255, 255, 0.3)',
    accent: '#C29B62',
    text: '#3A2329',
    muted: '#82767A',
    line: '#D6CDCF',
  },
];

export const DEFAULT_THEME_ID = THEMES[0].id;

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
