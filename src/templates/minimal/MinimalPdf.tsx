import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { formatPeriod } from '../../model/dates';
import type { TimelineItem } from '../../model/types';
import { contactItems, cvFileName, visible } from '../common';
import '../pdfFonts';
import { pdfBullets, PdfSections, type PdfSectionStyles } from '../shared/PdfSections';
import type { TemplateProps, Theme } from '../types';
import { MINIMAL_ASIDE_WIDTH } from './MinimalTemplate';

/* „Minimalus“ PDF versija. Matmenys sutampa su minimal.css. */

const makeStyles = (t: Theme) => {
  const base = StyleSheet.create({
    page: {
      paddingTop: '14mm',
      paddingBottom: '14mm',
      paddingHorizontal: '14mm',
      fontFamily: 'Lato',
      fontSize: 9,
      lineHeight: 1.45,
      color: t.text,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: '5mm',
      borderBottomWidth: '0.6mm',
      borderBottomColor: t.accent,
    },
    name: { fontFamily: 'Bebas', fontSize: 36, lineHeight: 1, letterSpacing: 1.8, textTransform: 'uppercase' },
    contacts: { flexDirection: 'row', flexWrap: 'wrap', marginTop: '2.6mm' },
    contact: { fontSize: 8.5, lineHeight: 1.3, color: t.muted },
    sep: { fontSize: 8.5, lineHeight: 1.3, marginHorizontal: '2.4mm', color: t.accent, fontWeight: 700 },
    photo: { width: '24mm', height: '24mm', borderRadius: '12mm', marginLeft: '8mm', objectFit: 'cover' },
    body: { flexDirection: 'row' },
    aside: { width: `${parseFloat(MINIMAL_ASIDE_WIDTH) - 14}mm`, paddingTop: '7mm', paddingRight: '6mm' },
    main: {
      flexGrow: 1,
      flexBasis: 0,
      paddingTop: '7mm',
      paddingLeft: '6mm',
      borderLeftWidth: '0.25mm',
      borderLeftColor: t.line,
    },
    tlItem: { flexDirection: 'row', paddingBottom: '5mm' },
    tlDate: { width: '27mm', marginRight: '4mm', fontSize: 8.2, lineHeight: 1.55, color: t.muted },
    tlBody: { flexGrow: 1, flexBasis: 0 },
    tlTitle: { fontWeight: 700, fontSize: 9.4, lineHeight: 1.35 },
    tlOrg: { fontSize: 8.6, color: t.muted },
    tlBullets: { marginTop: '1.8mm' },
  });

  const section = (side: boolean): PdfSectionStyles =>
    StyleSheet.create({
      section: {},
      sectionNext: { marginTop: '7mm' },
      heading: {
        marginBottom: '3mm',
        fontWeight: 700,
        fontSize: 8.6,
        lineHeight: 1.2,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        color: t.accent,
      },
      text: { color: t.muted },
      tags: side ? { gap: '1.2mm' } : { flexDirection: 'row', flexWrap: 'wrap', rowGap: '1.2mm', columnGap: '4mm' },
      tag: { flexShrink: 1, fontSize: 9, lineHeight: 1.35 },
      tagMarker: { width: '1.2mm', height: '1.2mm', marginTop: '1.25mm', marginRight: '1.8mm', backgroundColor: t.accent },
      kv: { gap: '2mm' },
      kvLabel: { fontWeight: 700 },
      kvValue: { color: t.muted },
      bullets: { gap: '1.4mm' },
      bullet: { flexDirection: 'row' },
      bulletDot: { width: '2mm', height: '0.3mm', marginTop: '2.05mm', marginRight: '1.6mm', backgroundColor: t.accent },
      bulletText: { flexGrow: 1, flexBasis: 0, fontSize: 8.5, lineHeight: 1.4, color: t.muted },
    }) as PdfSectionStyles;

  return { base, main: section(false), side: section(true) };
};

export function MinimalPdf({ data, theme }: TemplateProps) {
  const { base: s, main, side } = makeStyles(theme);
  const { personal } = data;
  const contacts = contactItems(data);

  const mainTimeline = (it: TimelineItem, i: number, n: number) => (
    <View key={it.id} style={[s.tlItem, i === n - 1 ? { paddingBottom: 0 } : {}]} wrap={false}>
      <Text style={s.tlDate}>{formatPeriod(it)}</Text>
      <View style={s.tlBody}>
        <Text style={s.tlTitle}>{it.title}</Text>
        {it.org ? <Text style={s.tlOrg}>{it.org}</Text> : null}
        {pdfBullets(visible(it.bullets), main, s.tlBullets)}
      </View>
    </View>
  );

  const sideTimeline = (it: TimelineItem) => (
    <View key={it.id} style={{ marginBottom: '3mm' }} wrap={false}>
      <Text style={s.tlTitle}>{it.title}</Text>
      {it.org ? <Text style={s.tlOrg}>{it.org}</Text> : null}
      <Text style={{ fontSize: 8.2, color: theme.muted }}>{formatPeriod(it)}</Text>
      {pdfBullets(visible(it.bullets), side)}
    </View>
  );

  return (
    <Document title={cvFileName(data).replace(/_/g, ' ')} author={`${personal.firstName} ${personal.lastName}`.trim()} language="lt">
      <Page size="A4" style={s.page}>
        <View style={s.header} wrap={false}>
          <View style={{ flexGrow: 1, flexBasis: 0 }}>
            <Text style={s.name}>
              {personal.firstName} {personal.lastName}
            </Text>
            {contacts.length > 0 && (
              <View style={s.contacts}>
                {contacts.map((c, i) => (
                  <View key={c.kind} style={{ flexDirection: 'row' }}>
                    {i > 0 && <Text style={s.sep}>·</Text>}
                    <Text style={s.contact}>{c.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          {personal.photo && <Image src={personal.photo} style={s.photo} />}
        </View>
        <View style={s.body}>
          <View style={s.aside}>
            <PdfSections data={data} placement="sidebar" styles={side} timeline={sideTimeline} />
          </View>
          <View style={s.main}>
            <PdfSections data={data} placement="main" styles={main} timeline={mainTimeline} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
