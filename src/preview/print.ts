import type { CvDocument } from '../model/types';

/**
 * Atidaro naršyklės spausdinimo langą („Išsaugoti kaip PDF").
 * Dokumento pavadinimas tampa siūlomu PDF failo vardu.
 */
export async function printCv(doc: CvDocument) {
  const { firstName, lastName } = doc.data.personal;
  const name = [firstName, lastName, 'CV'].filter(Boolean).join('_').replace(/\s+/g, '_');
  const prevTitle = document.title;
  document.title = name;
  const restore = () => {
    document.title = prevTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  // Šriftai ir nuotrauka turi būti įkelti, kitaip PDF gali gautis su atsarginiu šriftu.
  await document.fonts.ready;
  window.print();
}
