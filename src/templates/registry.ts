import { ClassicTemplate, CLASSIC_SIDEBAR_WIDTH } from './classic/ClassicTemplate';
import { MinimalTemplate } from './minimal/MinimalTemplate';
import { MODERN_ASIDE_WIDTH, ModernTemplate, modernTint } from './modern/ModernTemplate';
import type { TemplateDef } from './types';

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'classic',
    name: 'Klasikinis: tamsi juosta kairėje',
    component: ClassicTemplate,
    pageBackground: (t) =>
      `linear-gradient(to right, ${t.sidebarBg} ${CLASSIC_SIDEBAR_WIDTH}, #fff ${CLASSIC_SIDEBAR_WIDTH})`,
    loadPdf: () => import('./classic/ClassicPdf').then((m) => m.ClassicPdf),
  },
  {
    id: 'modern',
    name: 'Modernus: tamsi antraštė, šviesi skiltis dešinėje',
    component: ModernTemplate,
    pageBackground: (t) =>
      `linear-gradient(to right, #fff calc(100% - ${MODERN_ASIDE_WIDTH}), ${modernTint(t)} calc(100% - ${MODERN_ASIDE_WIDTH}))`,
    loadPdf: () => import('./modern/ModernPdf').then((m) => m.ModernPdf),
  },
  {
    id: 'minimal',
    name: 'Minimalus: baltas su plonomis linijomis',
    component: MinimalTemplate,
    pageBackground: () => '#fff',
    loadPdf: () => import('./minimal/MinimalPdf').then((m) => m.MinimalPdf),
  },
];

export const DEFAULT_TEMPLATE_ID = TEMPLATES[0].id;

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
