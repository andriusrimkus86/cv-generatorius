import { Document, Image, Page, Path, StyleSheet, Svg, Text, View } from '@react-pdf/renderer';
import { formatPeriod } from '../../model/dates';
import type { TimelineItem } from '../../model/types';
import { contactItems, cvFileName, visible } from '../common';
import { CONTACT_ICON_PATHS } from '../pdfFonts';
import { pdfBullets, PdfSections, type PdfSectionStyles } from '../shared/PdfSections';
import type { TemplateProps, Theme } from '../types';
import { MODERN_ASIDE_WIDTH, modernTint } from './ModernTemplate';

/* „Modernus“ PDF versija. Matmenys sutampa su modern.css. */

const PAD_Y = '9mm';

const makeStyles = (t: Theme) => {
  const base = StyleSheet.create({
    page: { paddingTop: PAD_Y, paddingBottom: PAD_Y, fontFamily: 'Lato', fontSize: 9, lineHeight: 1.45, color: t.text },
    asideBg: { position: 'absolute', top: 0, right: 0, bottom: 0, width: MODERN_ASIDE_WIDTH, backgroundColor: modernTint(t) },
    band: {
      marginTop: `-${PAD_Y}`,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: '10mm',
      paddingHorizontal: '12mm',
      backgroundColor: t.sidebarBg,
      color: t.sidebarText,
    },
    photoRing: { width: '30mm', height: '30mm', borderRadius: '15mm', padding: '0.9mm', marginRight: '7mm', backgroundColor: t.accent },
    photo: { width: '28.2mm', height: '28.2mm', borderRadius: '14.1mm', objectFit: 'cover' },
    name: { fontFamily: 'Bebas', fontSize: 32, lineHeight: 1, letterSpacing: 1.2, textTransform: 'uppercase', color: t.sidebarStrong },
    contacts: { flexDirection: 'row', flexWrap: 'wrap', marginTop: '3.4mm', rowGap: '1.4mm', columnGap: '6mm' },
    contact: { flexDirection: 'row' },
    contactIcon: { marginRight: '1.8mm', paddingTop: '0.5mm' },
    contactText: { fontSize: 8.5, lineHeight: 1.3 },
    body: { flexDirection: 'row', paddingTop: '9mm' },
    main: { flexGrow: 1, flexBasis: 0, paddingLeft: '12mm', paddingRight: '8mm' },
    aside: { width: MODERN_ASIDE_WIDTH, paddingLeft: '8mm', paddingRight: '10mm' },

    tlItem: { flexDirection: 'row', paddingLeft: '5mm', paddingBottom: '5.5mm', borderLeftWidth: '0.35mm', borderLeftColor: t.line, position: 'relative' },
    tlDot: { position: 'absolute', left: '-1.3mm', top: '0.9mm', width: '2.3mm', height: '2.3mm', borderRadius: '1.15mm', backgroundColor: t.accent },
    tlBody: { flexGrow: 1, flexBasis: 0 },
    tlHead: { flexDirection: 'row' },
    tlTitle: { flexGrow: 1, flexBasis: 0, fontWeight: 700, fontSize: 9.2, lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: 0.14 },
    tlDate: { marginLeft: '4mm', fontSize: 8.3, lineHeight: 1.5, color: t.muted },
    tlOrg: { marginTop: '0.4mm', fontWeight: 700, fontSize: 8.6, color: t.accent },
    tlBullets: { marginTop: '2mm' },
  });

  const section = (side: boolean): PdfSectionStyles =>
    StyleSheet.create({
      section: {},
      sectionNext: { marginTop: '8mm' },
      heading: { fontFamily: 'Bebas', fontSize: 14, lineHeight: 1.1, letterSpacing: 0.4, textTransform: 'uppercase', color: t.text },
      headingBar: { width: '9mm', height: '0.8mm', marginTop: '1.3mm', marginBottom: '4mm', backgroundColor: t.accent },
      text: { color: t.muted },
      tags: { flexDirection: 'row', flexWrap: 'wrap', gap: '1.6mm' },
      tag: {
        paddingVertical: '0.9mm',
        paddingHorizontal: '2.4mm',
        borderWidth: '0.3mm',
        borderColor: side ? t.line : modernTint(t),
        borderRadius: '1mm',
        backgroundColor: side ? '#FFFFFF' : modernTint(t),
        fontSize: 8.3,
        lineHeight: 1.3,
      },
      kv: { gap: '2.2mm' },
      kvLabel: { fontWeight: 700 },
      kvValue: { color: t.muted },
      bullets: { gap: '1.6mm' },
      bullet: { flexDirection: 'row' },
      bulletDot: { width: '1.1mm', height: '1.1mm', borderRadius: '0.55mm', marginTop: '1.55mm', marginLeft: '0.2mm', marginRight: '2mm', backgroundColor: t.accent },
      bulletText: { flexGrow: 1, flexBasis: 0, fontSize: 8.5, lineHeight: 1.4, color: t.muted },
    }) as PdfSectionStyles;

  return { base, main: section(false), side: section(true) };
};

export function ModernPdf({ data, theme }: TemplateProps) {
  const { base: s, main, side } = makeStyles(theme);
  const { personal } = data;
  const contacts = contactItems(data);

  const mainTimeline = (it: TimelineItem, i: number, n: number) => {
    const period = formatPeriod(it);
    return (
      <View key={it.id} style={[s.tlItem, i === n - 1 ? { paddingBottom: 0 } : {}]} wrap={false}>
        <View style={s.tlDot} />
        <View style={s.tlBody}>
          <View style={s.tlHead}>
            <Text style={s.tlTitle}>{it.title}</Text>
            {period ? <Text style={s.tlDate}>{period}</Text> : null}
          </View>
          {it.org ? <Text style={s.tlOrg}>{it.org}</Text> : null}
          {pdfBullets(visible(it.bullets), main, s.tlBullets)}
        </View>
      </View>
    );
  };

  const sideTimeline = (it: TimelineItem) => (
    <View key={it.id} style={{ marginBottom: '3mm' }} wrap={false}>
      <Text style={{ fontWeight: 700 }}>{it.title}</Text>
      {it.org ? <Text style={{ color: theme.accent, fontWeight: 700, fontSize: 8.6 }}>{it.org}</Text> : null}
      <Text style={{ color: theme.muted, fontSize: 8.3 }}>{formatPeriod(it)}</Text>
      {pdfBullets(visible(it.bullets), side)}
    </View>
  );

  return (
    <Document title={cvFileName(data).replace(/_/g, ' ')} author={`${personal.firstName} ${personal.lastName}`.trim()} language="lt">
      <Page size="A4" style={s.page}>
        <View fixed style={s.asideBg} />
        <View style={s.band} wrap={false}>
          {personal.photo && (
            <View style={s.photoRing}>
              <Image src={personal.photo} style={s.photo} />
            </View>
          )}
          <View style={{ flexGrow: 1, flexBasis: 0 }}>
            <Text style={s.name}>
              {personal.firstName} {personal.lastName}
            </Text>
            {contacts.length > 0 && (
              <View style={s.contacts}>
                {contacts.map((c) => (
                  <View key={c.kind} style={s.contact}>
                    <View style={s.contactIcon}>
                      <Svg viewBox="0 0 24 24" width={8.5} height={8.5}>
                        <Path d={CONTACT_ICON_PATHS[c.kind]} fill={theme.accent} />
                      </Svg>
                    </View>
                    <Text style={s.contactText}>{c.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={s.body}>
          <View style={s.main}>
            <PdfSections data={data} placement="main" styles={main} timeline={mainTimeline} />
          </View>
          <View style={s.aside}>
            <PdfSections data={data} placement="sidebar" styles={side} timeline={sideTimeline} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
