import type { ComponentType } from 'react';
import type { CvData } from '../model/types';

export interface Theme {
  id: string;
  name: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarStrong: string;
  sidebarLine: string;
  accent: string;
  text: string;
  muted: string;
  line: string;
}

export interface TemplateProps {
  data: CvData;
  theme: Theme;
}

export interface TemplateDef {
  id: string;
  name: string;
  component: ComponentType<TemplateProps>;
  /** Fono spalva, kuria spausdinant užpildomi visi puslapiai (kad šoninė juosta tęstųsi). */
  pageBackground: (theme: Theme) => string;
  /** PDF versijos komponentas (react-pdf). Įkeliamas tik prireikus, nes biblioteka didelė. */
  loadPdf: () => Promise<ComponentType<TemplateProps>>;
}
