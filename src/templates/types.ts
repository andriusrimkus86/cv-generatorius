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

export interface PdfTemplateProps extends TemplateProps {
  /** PDF puslapio dydis taškais [plotis, aukštis]. Numatytasis A4. */
  size?: [number, number];
}

export interface TemplateDef {
  id: string;
  name: string;
  component: ComponentType<TemplateProps>;
  /**
   * Puslapio fonas spausdinant (kad šoninė juosta tęstųsi kiekviename puslapyje).
   * `scale` < 1 naudojamas režimui „Sutalpinti į vieną A4“: turinys sumažintas ir prigludęs kairėje,
   * o fonas dešinėje už turinio užpildomas `rightEdge` spalva.
   */
  pageBackground: (theme: Theme, scale?: number) => string;
  /** Spalva, kuria užpildoma juosta dešinėje, kai sumažintas turinys neužpildo viso A4 pločio. */
  rightEdge: (theme: Theme) => string;
  /** PDF versijos komponentas (react-pdf). Įkeliamas tik prireikus, nes biblioteka didelė. */
  loadPdf: () => Promise<ComponentType<PdfTemplateProps>>;
}
