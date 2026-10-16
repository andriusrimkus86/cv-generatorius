import { Font } from '@react-pdf/renderer';
import bebasUrl from '../assets/pdf-fonts/BebasNeue-Regular.ttf?url';
import latoBoldUrl from '../assets/pdf-fonts/Lato-Bold.ttf?url';
import latoUrl from '../assets/pdf-fonts/Lato-Regular.ttf?url';

/*
 * PDF šriftai (TTF su lietuviškomis raidėmis). Importuojama iš kiekvieno *Pdf.tsx šablono:
 * registracija įvyksta vieną kartą, kai įkeliamas pirmas PDF šablonas.
 */

Font.register({
  family: 'Lato',
  fonts: [
    { src: latoUrl, fontWeight: 400 },
    { src: latoBoldUrl, fontWeight: 700 },
  ],
});
Font.register({ family: 'Bebas', src: bebasUrl });
// Be skiemenavimo: kitaip lietuviški žodžiai būtų kapojami pagal anglų kalbos taisykles.
Font.registerHyphenationCallback((word) => [word]);

/** Kontaktų ikonų SVG keliai (24×24), bendri HTML ir PDF šablonams. */
export const CONTACT_ICON_PATHS = {
  address:
    'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z',
  phone:
    'M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z',
  email:
    'M3 5h18a1 1 0 0 1 1 1v.4l-10 6.2L2 6.4V6a1 1 0 0 1 1-1Zm-1 3.75 9.47 5.87a1 1 0 0 0 1.06 0L22 8.75V18a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z',
} as const;
