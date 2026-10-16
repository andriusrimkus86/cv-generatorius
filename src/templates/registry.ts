import { ClassicTemplate, CLASSIC_SIDEBAR_WIDTH } from './classic/ClassicTemplate';
import type { TemplateDef } from './types';

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'classic',
    name: 'Klasikinis su šonine juosta',
    component: ClassicTemplate,
    pageBackground: (t) =>
      `linear-gradient(to right, ${t.sidebarBg} ${CLASSIC_SIDEBAR_WIDTH}, #fff ${CLASSIC_SIDEBAR_WIDTH})`,
  },
];

export const DEFAULT_TEMPLATE_ID = TEMPLATES[0].id;

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
