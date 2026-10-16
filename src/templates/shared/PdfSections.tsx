import { Text, View, type Styles } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import type { Bullet, CvData, KeyValue, Placement, Section, TimelineItem } from '../../model/types';
import { licenceFields, nonEmpty, personalFields, visible } from '../common';

/*
 * Bendras sekcijų atvaizdavimas PDF šablonams „Modernus“ ir „Minimalus“ (HtmlSections atitikmuo).
 * Šablonas pateikia stilius ir laiko juostos įrašo komponentą.
 */

type S = Styles[string];

export interface PdfSectionStyles {
  section: S;
  sectionNext: S;
  heading: S;
  /** Neprivalomas trumpas brūkšnys po antrašte. */
  headingBar?: S;
  text: S;
  tags: S;
  tag: S;
  /** Neprivalomas ženkliukas prieš žymą (pvz. kvadratėlis). */
  tagMarker?: S;
  kv: S;
  kvLabel: S;
  kvValue: S;
  bullets: S;
  bullet: S;
  bulletDot: S;
  bulletText: S;
}

export type TimelineRenderer = (item: TimelineItem, index: number, count: number) => ReactNode;

export function PdfSections({
  data,
  placement,
  styles: s,
  timeline,
}: {
  data: CvData;
  placement: Placement;
  styles: PdfSectionStyles;
  timeline: TimelineRenderer;
}) {
  let shown = 0;
  return (
    <>
      {visible(data.sections)
        .filter((sec) => sec.placement === placement)
        .map((sec) => {
          const body = sectionBody(sec, data, s, timeline);
          if (!body) return null;
          const first = shown++ === 0;
          return (
            <View key={sec.id} style={[s.section, first ? {} : s.sectionNext]}>
              {/* Antraštė nepaliekama viena puslapio apačioje */}
              <View minPresenceAhead={40} wrap={false}>
                <Text style={s.heading}>{sec.title}</Text>
                {s.headingBar && <View style={s.headingBar} />}
              </View>
              {body}
            </View>
          );
        })}
    </>
  );
}

function sectionBody(sec: Section, data: CvData, s: PdfSectionStyles, timeline: TimelineRenderer): ReactNode {
  switch (sec.kind) {
    case 'text':
      return sec.text.trim() ? <Text style={s.text}>{sec.text}</Text> : null;
    case 'tags': {
      const tags = visible(sec.items);
      if (!tags.length) return null;
      return (
        <View style={s.tags}>
          {tags.map((t) =>
            s.tagMarker ? (
              <View key={t.id} style={{ flexDirection: 'row' }} wrap={false}>
                <View style={s.tagMarker} />
                <Text style={s.tag}>{t.text}</Text>
              </View>
            ) : (
              <Text key={t.id} style={s.tag} wrap={false}>
                {t.text}
              </Text>
            ),
          )}
        </View>
      );
    }
    case 'list':
      return pdfBullets(visible(sec.items), s);
    case 'keyValue':
      return keyValues(visible(sec.items), s);
    case 'personal':
      return keyValues(personalFields(data), s);
    case 'licence':
      return keyValues(licenceFields(data), s);
    case 'timeline': {
      const items = visible(sec.items);
      if (!items.length) return null;
      return <View>{items.map((it, i) => timeline(it, i, items.length))}</View>;
    }
  }
}

function keyValues(items: KeyValue[], s: PdfSectionStyles) {
  const shown = nonEmpty(items);
  if (!shown.length) return null;
  return (
    <View style={s.kv}>
      {shown.map((kv) => (
        <View key={kv.id} wrap={false}>
          <Text style={s.kvLabel}>{kv.label}</Text>
          <Text style={s.kvValue}>{kv.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function pdfBullets(items: Bullet[], s: PdfSectionStyles, extra?: S) {
  if (!items.length) return null;
  return (
    <View style={[s.bullets, extra ?? {}]}>
      {items.map((b) => (
        <View key={b.id} style={s.bullet} wrap={false}>
          <View style={s.bulletDot} />
          <Text style={s.bulletText}>{b.text}</Text>
        </View>
      ))}
    </View>
  );
}
