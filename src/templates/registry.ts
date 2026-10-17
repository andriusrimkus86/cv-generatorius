import { ClassicTemplate, CLASSIC_SIDEBAR_WIDTH } from './classic/ClassicTemplate';
import { MinimalTemplate } from './minimal/MinimalTemplate';
import { MODERN_ASIDE_WIDTH, ModernTemplate, modernTint } from './modern/ModernTemplate';
import type { TemplateDef } from './types';

const A4_WIDTH_MM = 210;
const mm = (v: string) => parseFloat(v);

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'classic',
    name: 'Klasikinis: tamsi juosta kairėje',
    component: ClassicTemplate,
    pageBackground: (t, s = 1) => {
      const x = `${mm(CLASSIC_SIDEBAR_WIDTH) * s}mm`;
      return `linear-gradient(to right, ${t.sidebarBg} ${x}, #fff ${x})`;
    },
    rightEdge: () => '#ffffff',
    loadPdf: () => import('./classic/ClassicPdf').then((m) => m.ClassicPdf),
  },
  {
    id: 'modern',
    name: 'Modernus: tamsi antraštė, šviesi skiltis dešinėje',
    component: ModernTemplate,
    pageBackground: (t, s = 1) => {
      const x = `${(A4_WIDTH_MM - mm(MODERN_ASIDE_WIDTH)) * s}mm`;
      return `linear-gradient(to right, #fff ${x}, ${modernTint(t)} ${x})`;
    },
    rightEdge: (t) => modernTint(t),
    loadPdf: () => import('./modern/ModernPdf').then((m) => m.ModernPdf),
  },
  {
    id: 'minimal',
    name: 'Minimalus: baltas su plonomis linijomis',
    component: MinimalTemplate,
    pageBackground: () => '#fff',
    rightEdge: () => '#ffffff',
    loadPdf: () => import('./minimal/MinimalPdf').then((m) => m.MinimalPdf),
  },
];

export const DEFAULT_TEMPLATE_ID = TEMPLATES[0].id;

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
