import { nanoid } from 'nanoid';
import seedPhotoUrl from '../assets/placeholder-avatar.svg';
import type { Bullet, CvData, Tag, TimelineItem } from './types';

const bullets = (...texts: string[]): Bullet[] => texts.map((text) => ({ id: nanoid(), text }));
const tags = (...texts: string[]): Tag[] => texts.map((text) => ({ id: nanoid(), text }));
const item = (i: Omit<TimelineItem, 'id'>): TimelineItem => ({ id: nanoid(), ...i });

/**
 * Pavyzdiniai (išgalvoti) pradiniai duomenys. Jų apimtis panaši į tikrą CV,
 * todėl A4 formatu jie užima 2 puslapius ir tinka maketui tikrinti.
 * Savo CV įkelkite per „Importuoti JSON“.
 */
export function createSeedData(): CvData {
  return {
    personal: {
      firstName: 'Vardenis',
      lastName: 'Pavardenis',
      address: 'Pavyzdžio g. 1-2, Vilnius, 01100, Lietuva',
      phone: '+370 600 00000',
      email: 'vardenis.pavardenis@pavyzdys.lt',
      photo: seedPhotoUrl,
      birthDate: '1990-03-15',
      maritalStatus: 'vedęs',
      drivingLicence: 'B',
      customFields: [],
    },
    sections: [
      {
        id: nanoid(),
        kind: 'text',
        title: 'Apie mane',
        placement: 'sidebar',
        text:
          'Inžinierius, turintis daugiau nei dešimties metų patirtį gamyboje ir kokybės užtikrinime. ' +
          'Mėgstu aiškius procesus, matuojamus rezultatus ir komandinį darbą. Nuolat mokausi naujų ' +
          'technologijų ir ieškau būdų, kaip darbą padaryti paprastesnį ir efektyvesnį. Šis tekstas yra ' +
          'pavyzdys: pakeiskite jį savo.',
      },
      {
        id: nanoid(),
        kind: 'tags',
        title: 'Įgūdžiai',
        placement: 'sidebar',
        items: tags(
          'Projektų valdymas ir planavimas',
          'Procesų optimizavimas',
          'Kokybės kontrolė',
          'Lean / 5S',
          'Duomenų analizė',
          'Python',
        ),
      },
      { id: nanoid(), kind: 'personal', title: 'Asmeninė informacija', placement: 'sidebar' },
      { id: nanoid(), kind: 'licence', title: 'Vairuotojo pažymėjimas', placement: 'sidebar' },
      {
        id: nanoid(),
        kind: 'timeline',
        title: 'Darbo patirtis',
        placement: 'main',
        items: [
          item({
            org: 'UAB Pavyzdys',
            title: 'Gamybos skyriaus vadovas',
            start: { year: 2022, month: 3 },
            end: 'present',
            bullets: bullets(
              'Vadovauju 15 žmonių komandai, planuoju išteklius ir atsakau už gamybos rodiklius. ' +
                'Įdiegiau savaitinį KPI peržiūros procesą, kuris sutrumpino užsakymų vykdymo laiką.',
            ),
          }),
          item({
            org: 'UAB Technologijos',
            title: 'Vyr. kokybės inžinierius',
            start: { year: 2018, month: 9 },
            end: { year: 2022, month: 3 },
            bullets: bullets(
              'Matavimo metodikų kūrimas ir tobulinimas, matavimo įrangos kalibravimas, ' +
                'neatitikčių analizė ir korekcinių veiksmų koordinavimas su tiekėjais.',
              'Vidiniai auditai ir darbuotojų mokymai.',
            ),
          }),
          item({
            org: 'UAB Technologijos',
            title: 'Kokybės inžinierius',
            start: { year: 2017, month: 2 },
            end: { year: 2018, month: 9 },
            bullets: bullets('Gaminių patikra, matavimų protokolų rengimas ir klientų pretenzijų nagrinėjimas.'),
          }),
          item({
            org: 'Mokslinių tyrimų institutas',
            title: 'Jaunesnysis mokslo darbuotojas',
            start: { year: 2014, month: 9 },
            end: { year: 2017, month: 2 },
            bullets: bullets(
              'Eksperimentinių stendų projektavimas, spektroskopiniai matavimai ir rezultatų analizė. ' +
                'Mokslinių publikacijų ir konferencijų pranešimų rengimas.',
            ),
          }),
          item({
            org: 'Mokslinių tyrimų institutas',
            title: 'Inžinierius',
            start: { year: 2011, month: 9 },
            end: { year: 2014, month: 9 },
            bullets: bullets(
              'Laboratorinės įrangos priežiūra, matavimų automatizavimas ir duomenų apdorojimo ' +
                'programų kūrimas.',
            ),
          }),
        ],
      },
      {
        id: nanoid(),
        kind: 'timeline',
        title: 'Išsilavinimas',
        placement: 'main',
        items: [
          item({
            org: 'Mokslinių tyrimų institutas',
            title: 'Mokslų daktaro laipsnis',
            end: { year: 2018 },
            bullets: bullets(
              'Baigta fizikos krypties doktorantūra ir apginta disertacija „Pavyzdinės disertacijos pavadinimas“.',
              'Darbo vadovas: dr. Vardas Pavardė.',
            ),
          }),
          item({
            org: 'Pavyzdžio universitetas, Fizikos fakultetas',
            title: 'Magistro laipsnis',
            end: { year: 2013 },
            bullets: bullets('Baigta taikomosios fizikos programa ir apgintas magistro darbas.'),
          }),
          item({
            org: 'Pavyzdžio universitetas, Fizikos fakultetas',
            title: 'Bakalauro laipsnis',
            end: { year: 2011 },
            bullets: bullets('Baigta fizikos programa ir apgintas bakalauro darbas.'),
          }),
          item({
            org: 'Pavyzdžio gimnazija',
            title: 'Vidurinis išsilavinimas',
            end: { year: 2007 },
            bullets: [],
          }),
        ],
      },
    ],
  };
}
