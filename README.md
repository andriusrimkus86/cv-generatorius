# CV generatorius

Asmeninis CV redaktorius, veikiantis naršyklėje ir Android telefone kaip įdiegiama programėlė (PWA).
Duomenys saugomi tik jūsų įrenginyje (IndexedDB). Serverio ir prisijungimų nėra.

## Galimybės

- Keli profiliai: sukurti, pervadinti, dublikuoti, ištrinti. Kiekvienas profilis gali turėti kelias CV versijas.
- Redaktorius kairėje ir gyva A4 peržiūra dešinėje. Telefone yra skirtukai „Redaguoti / Peržiūra“.
- Asmeninė informacija su nuotrauka (apkirpimas į apskritimą) ir laisvais „pavadinimas: reikšmė“ laukais.
- Sekcijos: tekstas, žymos (įgūdžiai), punktų sąrašas, „pavadinimas: reikšmė“, laiko juosta (patirtis, mokslai).
  Galima pridėti savas sekcijas į šoninę juostą arba pagrindinę dalį.
- Kiekvieną įrašą galima slėpti, trinti ir rikiuoti (tempiant už ⋮⋮ arba rodyklėmis).
- Kiekvienas pakeitimas automatiškai išsaugomas.
- PDF eksportas per naršyklės spausdinimą („Išsaugoti kaip PDF“): A4 formatas, tekstą galima pažymėti, šriftai įterpti.
- JSON eksportas ir importas (vieno profilio arba visų profilių).
- Spalvų temos.

## Paleidimas kompiuteryje

Reikia [Node.js](https://nodejs.org) 20 ar naujesnės versijos.

```bash
npm install
```

```bash
npm run dev
```

Atsidarykite http://localhost:5173.

Statinė versija sukuriama į `dist/` aplanką:

```bash
npm run build
```

Jei norite ją peržiūrėti lokaliai (su service worker ir veikimu be interneto):

```bash
npm run preview
```

## PDF išsaugojimas

Paspauskite **PDF** ir pasirinkite režimą. Paskutinis pasirinkimas įsimenamas šiame įrenginyje.

| Režimas | Rezultatas |
| --- | --- |
| **Vienas ištisinis puslapis** (numatytasis) | Visada lygiai 1 puslapis: 210 mm pločio, aukštis lygus turinio aukščiui (ne mažiau nei 297 mm). |
| **A4 puslapiais** | Standartiniai A4 puslapiai. Įrašai neperkerpami per vidurį, šoninė juosta tęsiasi kiekviename puslapyje. |
| **Sutalpinti į vieną A4** | Jei turinys netelpa, jis proporcingai sumažinamas iki vieno A4. Kai mastelis mažesnis nei 80 %, rodomas įspėjimas. |

Visais režimais tekstas lieka tekstas (jį galima pažymėti), šriftai įterpiami, o spalvos ir fonas išlieka.

Lange galima:

- **Atsisiųsti:** failas išsaugomas į „Atsisiuntimai“ (Downloads).
- **Dalintis / išsaugoti…** (telefone): Android dalinimosi langas, pvz. į Google Drive, el. paštą ar Failus.
- **Atidaryti:** peržiūrėti PDF naršyklėje.
- **Spausdinti…** (kompiuteryje): naršyklės spausdinimo langas tuo pačiu režimu. Paskirtis „Išsaugoti kaip PDF“,
  pažymėkite „Fono grafika“. Įdiegtoje Android programėlėje šis mygtukas nerodomas, nes `window.print()` ten neveikia.

### Kaip tai veikia

- **Atsisiunčiamas PDF** generuojamas tiesiogiai naršyklėje (`src/pdf/generatePdf.ts`), todėl veikia ir Android programėlėje,
  ir be interneto. Maketą sukuria `@react-pdf/renderer` pagal `src/templates/*/…Pdf.tsx`, o `pdf-lib` naudojamas
  puslapiams skaičiuoti ir režimui „Sutalpinti“: ištisinis puslapis įdedamas į A4 kaip vektorinis objektas.
  Ištisinio puslapio aukštis pirmiausia išmatuojamas iš ekrano šablono. Jei PDF makete turinys netelpa, aukštis didinamas,
  kol gaunamas lygiai 1 puslapis.
- **Spausdinimas** (`src/preview/print.ts`) prieš `window.print()` įterpia `@page { size: 210mm <aukštis>mm }`.
  Režimui „Sutalpinti“ naudojamas `@page A4` ir CSS `zoom`.
- PDF šablonai (`…Pdf.tsx`) turi atitikti ekrano šablonus (`…Template.tsx` ir CSS), todėl keičiant dizainą reikia keisti abu.

Peržiūroje raudona brūkšninė linija rodo apytikslę A4 puslapio ribą.

## Pirmas paleidimas

Pirmą kartą atidarius programėlę sukuriamas profilis „Pavyzdys“ su išgalvotais duomenimis. Savo CV
įkelkite per **Importuoti JSON**. Kode ir viešoje svetainėje asmeninių duomenų nėra: jie saugomi tik jūsų
įrenginiuose. Pavyzdinį profilį galima ištrinti.

## Duomenų perkėlimas tarp kompiuterio ir telefono

Kiekviename įrenginyje duomenys saugomi atskirai.

1. Profilių sąraše spauskite **Eksportuoti visus** arba profilio eksporto piktogramą. Bus atsiųstas `.json` failas.
2. Perkelkite failą į kitą įrenginį (el. paštu, Google Drive ir pan.).
3. Ten spauskite **Importuoti JSON**. Esami duomenys niekada neperrašomi: jei toks profilis jau yra, sukuriama kopija.

JSON failas taip pat tinka atsarginei kopijai.

## Diegimas internete (reikalingas HTTPS, kad PWA būtų galima įdiegti telefone)

### A variantas: GitHub Pages (rekomenduojama)

1. Sukurkite naują GitHub repozitoriją, pvz. `cv-generatorius`. Ji gali būti ir privati, jei jūsų planas leidžia Pages.
2. Šiame aplanke įkelkite kodą:

   ```bash
   git init
   git add .
   git commit -m "CV generatorius"
   git branch -M main
   git remote add origin https://github.com/<jūsų-vartotojas>/cv-generatorius.git
   git push -u origin main
   ```

3. GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Workflow `.github/workflows/deploy.yml` sukompiliuos ir paskelbs programėlę po kiekvieno `push` į `main`.
   Adresas bus `https://<jūsų-vartotojas>.github.io/cv-generatorius/`.

Programėlė naudoja santykinius kelius (`base: './'`) ir maršrutus su `#`, todėl veikia bet kuriame kataloge
be papildomų nustatymų.

### B variantas: Netlify

- **Paprasčiausiai:** `npm run build`, tada nutempkite `dist` aplanką į https://app.netlify.com/drop.
- **Iš GitHub:** Netlify → Add new site → Import from Git. Nustatymai paimami iš `netlify.toml`
  (komanda `npm run build`, aplankas `dist`).

## Įdiegimas Android telefone

1. Atsidarykite paskelbtą adresą (HTTPS) Chrome naršyklėje.
2. Meniu **⋮ → Įdiegti programą** (arba „Pridėti prie pradžios ekrano“).
3. Programėlė atsidaro kaip atskira programa ir veikia be interneto. Atnaujinimai parsiunčiami automatiškai,
   kai telefonas prisijungia prie interneto.

Svarbu: duomenys priklauso nuo adreso. Jei pakeisite hostingo adresą, perkelkite duomenis per JSON eksportą.

## Projekto struktūra

```
src/
  model/      Duomenų tipai, pradiniai duomenys (seed.ts), datų formatavimas, JSON schema
  db/         IndexedDB (Dexie) ir operacijos su profiliais / versijomis
  store/      Redaktoriaus būsena (Zustand) ir automatinis išsaugojimas
  templates/  CV šablonai (classic/), spalvų temos, šablonų registras
  editor/     Redaktoriaus formos
  profiles/   Profilių sąrašas
  preview/    Peržiūra ir spausdinimas
  io/         JSON eksportas ir importas
  ui/         Bendri komponentai (rikiuojamas sąrašas, ikonos)
reference/    Asmeniniai failai (neįkeliami į git, žr. .gitignore)
```

### Naujas šablonas

Yra trys šablonai: **Klasikinis** (`classic/`), **Modernus** (`modern/`) ir **Minimalus** (`minimal/`).
Kiekvienas turi dvi versijas: ekrano ir spausdinimo (`*Template.tsx` ir CSS) bei atsisiunčiamo PDF (`*Pdf.tsx`).
Šablonai „Modernus“ ir „Minimalus“ naudoja bendrą sekcijų atvaizdavimą:
`shared/HtmlSections.tsx` (klasės `cvx-*`) ir `shared/PdfSections.tsx`.

Naujas šablonas:

1. Sukurkite `src/templates/<pavadinimas>/` su ekrano komponentu (props `{ data, theme }`, šakninė klasė `cv-sheet`)
   ir PDF komponentu (žr. `templates/types.ts`).
2. Užregistruokite jį `src/templates/registry.ts`. `pageBackground` nusako, kuo spausdinant užpildomi visi puslapiai,
   o `loadPdf` įkelia PDF versiją.
3. Pridėkite miniatiūrą `src/editor/DesignPicker.tsx` (`Thumb`).

Spalvų temos pridedamos `src/templates/themes.ts` ir tinka visiems šablonams.

### Šriftai

Bebas Neue (`@fontsource/bebas-neue`) ir Lato 2.0 (`lato-font`) įtraukiami į build'ą, todėl veikia be interneto
ir įterpiami į PDF. Naudojama Lato 2.0, nes Google Fonts Lato versijoje nėra lietuviškų raidžių ė, į, ų, ū, č.

### Maketo patikrinimas (tik kūrimo režime)

`http://localhost:5173/#/dev/print?variant=long` (2 puslapiai) arba `?variant=short` (1 puslapis) parodo šabloną
su pradiniais duomenimis be duomenų bazės. Galima pridėti `&theme=burgundy`.
