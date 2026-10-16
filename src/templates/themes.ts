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
  {
    id: 'forest',
    name: 'Miško žalia ir vario',
    sidebarBg: '#253D35',
    sidebarText: '#CBD8D2',
    sidebarStrong: '#EEF4F1',
    sidebarLine: 'rgba(255, 255, 255, 0.3)',
    accent: '#B5794A',
    text: '#24352F',
    muted: '#76817C',
    line: '#C8D0CC',
  },
  {
    id: 'ocean',
    name: 'Jūros mėlyna',
    sidebarBg: '#1F3B5A',
    sidebarText: '#C7D5E4',
    sidebarStrong: '#EEF3F9',
    sidebarLine: 'rgba(255, 255, 255, 0.3)',
    accent: '#3B82C4',
    text: '#1E3047',
    muted: '#73808E',
    line: '#C7D0DA',
  },
  {
    id: 'mono',
    name: 'Juoda ir balta',
    sidebarBg: '#222222',
    sidebarText: '#CFCFCF',
    sidebarStrong: '#F5F5F5',
    sidebarLine: 'rgba(255, 255, 255, 0.3)',
    accent: '#555555',
    text: '#1F1F1F',
    muted: '#767676',
    line: '#CDCDCD',
  },
];

export const DEFAULT_THEME_ID = THEMES[0].id;

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
