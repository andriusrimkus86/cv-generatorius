import { Document, Image, Page, Path, StyleSheet, Svg, Text, View, type Styles as PdfStyles } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { formatPeriod } from '../../model/dates';
import type { Bullet, CvData, KeyValue, Placement, Section, TimelineItem } from '../../model/types';
import { contactItems, cvFileName, licenceFields, nonEmpty, personalFields, visible } from '../common';
import { CONTACT_ICON_PATHS } from '../pdfFonts';
import type { PdfTemplateProps, Theme } from '../types';
import { CLASSIC_SIDEBAR_WIDTH } from './ClassicTemplate';

/*
 * Klasikinio šablono PDF versija (react-pdf). Matmenys sutampa su classic.css,
 * kad atsisiųstas PDF atrodytų taip pat kaip peržiūra ir spausdinta versija.
 */

const PAD_Y = '9mm';

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    page: {
      paddingTop: PAD_Y,
      paddingBottom: PAD_Y,
      fontFamily: 'Lato',
      fontSize: 9,
      lineHeight: 1.41,
      color: t.text,
      backgroundColor: '#FFFFFF',
    },
    sidebarBg: { position: 'absolute', top: 0, left: 0, bottom: 0, width: CLASSIC_SIDEBAR_WIDTH, backgroundColor: t.sidebarBg },
    columns: { flexDirection: 'row' },
    sidebar: {
      width: CLASSIC_SIDEBAR_WIDTH,
      marginTop: '-1mm',
      paddingLeft: '9.4mm',
      paddingRight: '9.4mm',
      color: t.sidebarText,
    },
    main: { flexGrow: 1, flexBasis: 0, paddingLeft: '6.3mm', paddingRight: '7.1mm' },

    photo: { width: '37.5mm', height: '37.5mm', borderRadius: '18.75mm', marginBottom: '7.2mm', alignSelf: 'center', objectFit: 'cover' },

    heading: { fontFamily: 'Bebas', fontSize: 12.5, lineHeight: 1.1, letterSpacing: 0.12, textTransform: 'uppercase' },
    sidebarHeading: { color: t.accent, marginBottom: '4.6mm' },
    mainHeading: {
      color: t.text,
      paddingBottom: '2.2mm',
      borderBottomWidth: '0.25mm',
      borderBottomColor: t.line,
      marginBottom: '3.6mm',
    },

    sidebarSection: { paddingBottom: '6.6mm' },
    sidebarSectionNext: { borderTopWidth: '0.3mm', borderTopColor: t.sidebarLine, paddingTop: '7.3mm' },
    mainSectionNext: { marginTop: '15mm' },

    tags: { flexDirection: 'column', alignItems: 'flex-start', gap: '1.9mm' },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: '1.9mm' },
    tag: {
      maxWidth: '47mm',
      paddingTop: '1.6mm',
      paddingBottom: '1.3mm',
      paddingHorizontal: '3.3mm',
      borderWidth: '0.35mm',
      borderColor: t.accent,
      borderRadius: '0.8mm',
      fontSize: 8.7,
      lineHeight: 1.35,
      letterSpacing: 0.17,
      textTransform: 'uppercase',
    },

    kv: { gap: '2.4mm' },
    kvLabel: { fontWeight: 700 },

    header: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: '7.3mm', marginBottom: '12.8mm' },
    name: {
      paddingTop: '0mm',
      fontFamily: 'Bebas',
      fontSize: 28,
      lineHeight: 0.92,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: t.text,
    },
    contacts: { width: '52mm', paddingTop: '0.6mm', color: t.muted },
    contact: { flexDirection: 'row', paddingTop: '1.1mm', paddingBottom: '1.3mm' },
    contactText: { flexGrow: 1, flexBasis: 0, fontSize: 9, lineHeight: 1.35 },
    contactNext: { borderTopWidth: '0.25mm', borderTopColor: t.line },
    contactIcon: { width: '3.2mm', marginRight: '2.8mm', paddingTop: '0.6mm', alignItems: 'center' },

    bullets: { gap: '2mm' },
    bullet: { flexDirection: 'row' },
    bulletDot: { width: '1.1mm', height: '1.1mm', borderRadius: '0.55mm', marginTop: '1.6mm', marginLeft: '0.2mm', marginRight: '2mm', opacity: 0.8 },
    bulletText: { flexGrow: 1, flexBasis: 0, fontSize: 8.5, lineHeight: 1.38 },

    tlItem: { flexDirection: 'row' },
    tlLeft: { width: '31.5mm', paddingRight: '2mm', paddingBottom: '5.8mm' },
    tlOrg: { fontWeight: 700, fontSize: 7.9, lineHeight: 1.45, textTransform: 'uppercase', letterSpacing: 0.08, color: t.text },
    tlDate: { color: t.muted, marginTop: '0.1mm' },
    tlRail: { width: '7.7mm', position: 'relative' },
    tlLine: { position: 'absolute', top: 0, bottom: 0, left: '3.675mm', width: '0.35mm', backgroundColor: t.accent },
    tlDot: { position: 'absolute', top: '0.55mm', left: '2.7mm', width: '2.3mm', height: '2.3mm', borderRadius: '1.15mm', backgroundColor: t.accent },
    tlRight: { flexGrow: 1, flexBasis: 0, paddingLeft: '0.6mm', paddingBottom: '5.8mm' },
    tlTitle: { fontWeight: 700, fontSize: 8.9, lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: 0.13, color: t.text },
    tlBullets: { marginTop: '2.6mm' },
  });

type Styles = ReturnType<typeof makeStyles>;

const ICONS = CONTACT_ICON_PATHS;

export function ClassicPdf({ data, theme, size }: PdfTemplateProps) {
  const s = makeStyles(theme);
  const sections = visible(data.sections);
  const { personal } = data;

  const render = (placement: Placement) => {
    let shown = 0;
    return sections
      .filter((sec) => sec.placement === placement)
      .map((sec) => {
        const body = renderBody(sec, data, placement, s, theme);
        if (!body) return null;
        const first = shown++ === 0;
        const style =
          placement === 'sidebar'
            ? [s.sidebarSection, first ? {} : s.sidebarSectionNext]
            : [first ? {} : s.mainSectionNext];
        return (
          <View key={sec.id} style={style}>
            {/* Antraštė nepaliekama viena puslapio apačioje */}
            <Text minPresenceAhead={40} style={[s.heading, placement === 'sidebar' ? s.sidebarHeading : s.mainHeading]}>
              {sec.title}
            </Text>
            {body}
          </View>
        );
      });
  };

  const contacts = contactItems(data);

  return (
    <Document title={cvFileName(data).replace(/_/g, ' ')} author={`${personal.firstName} ${personal.lastName}`.trim()} language="lt">
      <Page size={size ?? 'A4'} style={s.page}>
        <View fixed style={s.sidebarBg} />
        <View style={s.columns}>
          <View style={s.sidebar}>
            {personal.photo && <Image src={personal.photo} style={s.photo} />}
            {render('sidebar')}
          </View>
          <View style={s.main}>
            <View style={s.header} wrap={false}>
              <View style={s.name}>
                <Text>{personal.firstName}</Text>
                <Text>{personal.lastName}</Text>
              </View>
              {contacts.length > 0 && (
                <View style={s.contacts}>
                  {contacts.map((c, i) => (
                    <View key={c.kind} style={[s.contact, i > 0 ? s.contactNext : {}]}>
                      <View style={s.contactIcon}>
                        <Svg viewBox="0 0 24 24" width={9} height={9}>
                          <Path d={ICONS[c.kind]} fill={theme.accent} />
                        </Svg>
                      </View>
                      <Text style={s.contactText}>{c.value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {render('main')}
          </View>
        </View>
      </Page>
    </Document>
  );
}

function renderBody(sec: Section, data: CvData, placement: Placement, s: Styles, t: Theme): ReactNode {
  const muted = placement === 'main' ? t.muted : t.sidebarText;
  switch (sec.kind) {
    case 'text':
      return sec.text.trim() ? <Text style={placement === 'main' ? { color: t.muted } : {}}>{sec.text}</Text> : null;

    case 'tags': {
      const tags = visible(sec.items);
      if (!tags.length) return null;
      return (
        <View style={placement === 'main' ? s.tagsRow : s.tags}>
          {tags.map((tag) => (
            <Text key={tag.id} style={s.tag} wrap={false}>
              {tag.text}
            </Text>
          ))}
        </View>
      );
    }

    case 'list':
      return renderBullets(visible(sec.items), s, muted);

    case 'keyValue':
      return renderKeyValues(visible(sec.items), s, placement, t);
    case 'personal':
      return renderKeyValues(personalFields(data), s, placement, t);
    case 'licence':
      return renderKeyValues(licenceFields(data), s, placement, t);

    case 'timeline': {
      const items = visible(sec.items);
      if (!items.length) return null;
      if (placement === 'sidebar') {
        return (
          <View style={{ gap: '3mm' }}>
            {items.map((it) => (
              <View key={it.id} wrap={false}>
                <Text style={[s.kvLabel, { color: t.sidebarStrong }]}>{it.title}</Text>
                <Text>{[it.org, formatPeriod(it)].filter(Boolean).join(', ')}</Text>
                {renderBullets(visible(it.bullets), s, muted)}
              </View>
            ))}
          </View>
        );
      }
      return (
        <View>
          {items.map((it, i) => (
            <TimelineRow key={it.id} item={it} first={i === 0} last={i === items.length - 1} s={s} t={t} />
          ))}
        </View>
      );
    }
  }
}

function renderKeyValues(items: KeyValue[], s: Styles, placement: Placement, t: Theme) {
  const shown = nonEmpty(items);
  if (!shown.length) return null;
  if (placement === 'main') {
    return (
      <View style={{ gap: '1.6mm' }}>
        {shown.map((kv) => (
          <View key={kv.id} style={{ flexDirection: 'row' }} wrap={false}>
            <Text style={[s.kvLabel, { marginRight: '5mm' }]}>{kv.label}</Text>
            <Text style={{ flexGrow: 1, flexBasis: 0, color: t.muted }}>{kv.value}</Text>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={s.kv}>
      {shown.map((kv) => (
        <View key={kv.id} wrap={false}>
          <Text style={[s.kvLabel, { color: t.sidebarStrong }]}>{kv.label}</Text>
          <Text>{kv.value}</Text>
        </View>
      ))}
    </View>
  );
}

function renderBullets(items: Bullet[], s: Styles, color: string, extra?: PdfStyles[string]) {
  if (!items.length) return null;
  return (
    <View style={[s.bullets, extra ?? {}]}>
      {items.map((b) => (
        <View key={b.id} style={s.bullet} wrap={false}>
          <View style={[s.bulletDot, { backgroundColor: color }]} />
          <Text style={[s.bulletText, { color }]}>{b.text}</Text>
        </View>
      ))}
    </View>
  );
}

function TimelineRow({ item, first, last, s, t }: { item: TimelineItem; first: boolean; last: boolean; s: Styles; t: Theme }) {
  const period = formatPeriod(item);
  const noPad = last ? { paddingBottom: 0 } : {};
  return (
    <View style={s.tlItem} wrap={false}>
      <View style={[s.tlLeft, noPad]}>
        <Text style={s.tlOrg}>{item.org}</Text>
        {period ? <Text style={s.tlDate}>{period}</Text> : null}
      </View>
      <View style={s.tlRail}>
        <View style={[s.tlLine, first ? { top: '1.6mm' } : {}]} />
        <View style={s.tlDot} />
      </View>
      <View style={[s.tlRight, noPad]}>
        <Text style={s.tlTitle}>{item.title}</Text>
        {renderBullets(visible(item.bullets), s, t.muted, s.tlBullets)}
      </View>
    </View>
  );
}
