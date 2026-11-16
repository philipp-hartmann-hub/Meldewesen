/**
 * Erzeugt A2_eMeldewesen_UEBERGABE.docx aus strukturiertem Inhalt.
 * Ausführung: npm install && node generate-uebergabe-docx.mjs
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
} from 'docx';
import { DOC_SUMMARY_GROUPS } from './document-summaries.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'docs', 'A2_eMeldewesen_UEBERGABE.docx');

const NAVY = '003063';
const BLUE = '005CA9';
const LIGHT = 'EEF0F3';

function t(text, opts = {}) {
  return new TextRun({ text, font: 'Open Sans', size: 22, ...opts });
}

function p(children, opts = {}) {
  const runs = typeof children === 'string' ? [t(children)] : children;
  return new Paragraph({ children: runs, spacing: { after: 120 }, ...opts });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, font: 'Open Sans', size: 32, bold: true, color: NAVY })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, font: 'Open Sans', size: 28, bold: true, color: BLUE })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, font: 'Open Sans', size: 24, bold: true, color: NAVY })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 80 },
    children: [t(text)],
  });
}

function checkbox(text) {
  return bullet(`☐ ${text}`);
}

function table(headers, rows, colWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          width: colWidths ? { size: colWidths[headers.indexOf(h)], type: WidthType.PERCENTAGE } : undefined,
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', font: 'Open Sans', size: 20 })],
            }),
          ],
        })
    ),
  });
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph({ children: [t(String(cell), { size: 20 })] })],
            })
        ),
      })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
    rows: [headerRow, ...dataRows],
  });
}

function docSummary(name, filePath, purpose, bullets) {
  return [
    h3(name),
    p([t('Pfad: ', { bold: true }), t(filePath, { italics: true, size: 20 })]),
    p(purpose),
    ...bullets.map((b) => bullet(b)),
    spacer(),
  ];
}

function buildDocumentSummaries() {
  const blocks = [
    h1('9. Kurzfassungen der Projektdokumente'),
    p(
      'Essenz aller relevanten Markdown- und Quelldateien im Repository. Volltext, Tabellen und Diagramme stehen in den verlinkten Dateien — diese Kurzfassungen dienen der Orientierung ohne jedes Dokument sofort öffnen zu müssen.'
    ),
    p([t('Maßgeblichkeit: ', { bold: true }), t('.cursorrules > GESAMTPROZESS v2.0 > UEBERGABE > älteres Lastenheft/ARIS > Prototyp-IST.')]),
    spacer(),
  ];

  for (const group of DOC_SUMMARY_GROUPS) {
    blocks.push(h2(group.title));
    if (group.isLastenheftTable) {
      blocks.push(
        table(
          ['Datei', 'Essenz'],
          group.rows,
          [35, 65]
        ),
        spacer()
      );
      continue;
    }
    for (const doc of group.docs) {
      blocks.push(...docSummary(doc.name, doc.path, doc.purpose, doc.bullets));
    }
  }

  blocks.push(new Paragraph({ children: [new PageBreak()] }));
  return blocks;
}

function spacer() {
  return p('');
}

const children = [
  // Titelseite
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 200 },
    children: [new TextRun({ text: 'HEUREKA 2.0', font: 'Open Sans', size: 28, color: BLUE })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: 'Übergabedokument – A2 eMeldewesen',
        font: 'Open Sans',
        size: 48,
        bold: true,
        color: NAVY,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [t('FHH Hamburg Justiz · Justizvollzug')],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [t('Version 1.1 Word | Stand: 19. Juni 2026')],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [t('Zielgruppe: Projektnachfolge, Workshop-Leitung, Entwicklung, Lastenheft-Autoren')],
  }),
  new Paragraph({
    children: [new PageBreak()],
  }),

  h1('Wie Sie dieses Dokument nutzen'),
  p([
    t('Dieses Word-Dokument ist der '),
    t('Einstiegspunkt', { bold: true }),
    t(' für die Projektnachfolge. Es bündelt Projektkontext, Prototyp-Start, fachlichen Gesamtprozess, Validierungsstand und '),
    t('ausführbare nächste Schritte', { bold: true }),
    t(' (Roadmap mit Checklisten).'),
  ]),
  h2('Empfohlene Einarbeitung (Tag 1)'),
  bullet('Abschnitt 2 lesen: Projekt in 15 Minuten verstehen'),
  bullet('Abschnitt 3: Prototyp starten und Demo-Klickpfad durchspielen'),
  bullet('Abschnitt 4–5: Gesamtprozess und Rollen'),
  bullet('Abschnitt 8: Nächste Schritte — Roadmap Schritte 1–6'),
  h2('Empfohlene Vertiefung (Tag 2–3)'),
  bullet('Abschnitt 9: Kurzfassungen aller Projektdokumente — Orientierung ohne Volltext'),
  bullet('Markdown-Quellen im Repository vertiefen (GESAMTPROZESS, VALIDIERUNG_PROZESS)'),
  bullet('Workshop-Vorbereitung: Abschnitt 8.1 abarbeiten'),
  bullet('Entwicklung: UEBERGABE_PROTOTYP_ENTWICKLUNG.md und .cursorrules'),
  spacer(),

  h1('1. Projekt in 15 Minuten'),
  h2('1.1 Was ist A2 eMeldewesen?'),
  p(
    'Prototyp zur Anforderungserhebung für das digitale Meldewesen in Hamburger JVAs. Bedienstete validieren den dokumentierten Soll-Prozess gegen die Demo-Oberfläche. Ergebnis: Lastenheft für eine spätere LC-Plattform (z. B. Appian oder ServiceNow).'
  ),
  table(
    ['Aspekt', 'A1 eGefangenenanträge', 'A2 eMeldewesen'],
    [
      ['Initiiert von', 'Bedienstete (für Gefangene)', 'Bedienstete'],
      ['Gefangenenportal', 'Ja', 'Nein'],
      ['ERV-Pflicht', 'Nein', 'Ja (Strafanzeigen, Gerichtsmeldungen)'],
    ],
    [25, 35, 40]
  ),
  spacer(),
  h2('1.2 Kernprinzip des Gesamtprozesses'),
  p(
    'Ein Vorfall → mehrere Einzelmeldungen (parallele aVD-Perspektiven) → ein gebündelter Fall → DGL → Stationsleitung → AL/VAL → Entscheid Meldepflicht → eGPA (intern) oder ERV (versandfähig → beBPo → eGPA).'
  ),
  p([t('⚠ Annahme (nicht validiert): ', { bold: true, color: 'E65100' }), t('Fall-Bündelung (Phase ③) — Workshop-Validierung ausstehend (OP-FB-01).')]),
  h2('1.3 Maßgeblichkeit der Dokumente'),
  table(
    ['Priorität', 'Dokument', 'Rolle'],
    [
      ['1', '.cursorrules (Repository-Root)', 'Technische Konventionen Prototyp'],
      ['2', 'docs/.../GESAMTPROZESS.md v2.0', 'Fachliche Soll-Referenz End-to-End'],
      ['3', 'UEBERGABE_GESAMT.md / dieses Word-Dokument', 'Übergabe-Gesamtüberblick'],
      ['4', 'VALIDIERUNG_PROZESS.md', 'Validierungs-Matrix je Schritt'],
      ['5', 'RUECKFRAGEN_UND_OFFENE_PUNKTE.md', 'OP-*-Backlog + Chronik'],
    ],
    [12, 38, 50]
  ),
  spacer(),

  h1('2. Prototyp starten und Demo'),
  h2('2.1 Voraussetzungen'),
  bullet('Docker und Docker Compose'),
  bullet('Repository-Ordner: a2/ (bzw. docs/meldewesen-a2-main/ für den eingebetteten Prototyp)'),
  h2('2.2 Schnellstart (Docker)'),
  p('Im Projektroot (a2/):'),
  bullet('copy .env.example .env'),
  bullet('docker compose up -d'),
  bullet('Frontend: http://localhost:5173'),
  bullet('Backend Health: http://localhost:3001/health'),
  p('Beim Start: Prisma db push + seed.js (Demo-Gefangene, FALL-001/002).'),
  p('Stack stoppen: docker compose down | DB zurücksetzen: docker compose down -v'),
  h2('2.3 Rolle wechseln'),
  p('Gelbes Prototyp-Banner oben → Dropdown „Schnellwechsel“ → Demo-Nutzer wählen.'),
  table(
    ['ID', 'Rolle', 'Name'],
    [
      ['AVD-02, AVD-04', 'aVD', 'Tobias Klein, Kevin Schulz'],
      ['AK-01', 'Zentrale (arbeitskoordination)', 'Stefan Lindemann'],
      ['DGL-01', 'DGL', 'Andrea Schmitz'],
      ['SL-01', 'Stationsleitung', 'Pedro Guerrero'],
      ['AL-01', 'Anstaltsleitung', 'Dr. Christine Möller'],
      ['VAL-01', 'VAL', 'Sabine Werner'],
    ],
    [25, 35, 40]
  ),
  spacer(),
  h2('2.4 Demo-Klickpfad A — Gesamtprozess ab Bündelung'),
  bullet('AVD-02 + AVD-04: je Vorfall intern einreichen (gleicher Tatort/Tatzeit) oder Seed nutzen'),
  bullet('AK-01: Fall-Bündelung → Fall bündeln → an DGL'),
  bullet('DGL-01: Qualität ok → Stationsleitung'),
  bullet('SL-01: Fallmeldung an AL/VAL'),
  bullet('AL-01 oder VAL-01: Meldepflicht → ERV-Panel am Fall-Detail'),
  h2('2.5 Demo-Klickpfad B — Seed-Sprungpunkte'),
  table(
    ['Fall', 'Status', 'Einstieg als'],
    [
      ['FALL-001', 'ZUR_SL', 'SL-01'],
      ['FALL-002', 'ZUR_AL', 'AL-01 / VAL-01'],
      ['MEL-018 (ungebunden)', 'SUBMITTED', 'AK-01 (Bündeln von Null)'],
    ],
    [25, 25, 50]
  ),
  p([t('Bewusst nicht im Prototyp: ', { bold: true }), t('Echte AD-Auth, eGPA, beBPo, BASIS-Web, Gefangenenportal (A1), E-Mail.')]),
  spacer(),

  h1('3. Gesamtprozess (Soll) — Phasenübersicht'),
  p('Prozesskette in Kurzform (Details: GESAMTPROZESS.md):'),
  table(
    ['Phase', 'Wer', 'Was'],
    [
      ['① Ereignis', '—', 'Meldung unmittelbar nach Ereignisende; telefonische Vorabmeldung bei Schwerwiegendem (OP-M-01)'],
      ['② Ersterfassung', 'Alle beteiligten aVD', 'Je Person eine Meldung; Hafthaus-Filter; keine Zeugen, nur Beteiligte'],
      ['③ Bündelung', 'Nur Zentrale', 'Gleicher Vorfall → ein Fall; ein Meldungstyp (L1); ⚠ OP-FB-01'],
      ['④ DGL', 'dienstgruppenleitung', 'Qualität; Rückgabe aVD+Zentrale; → SL → AL'],
      ['⑤ Entscheid', 'AL oder VAL', 'Meldepflichtig ja/nein; meldepflichtig = ERV (G1)'],
      ['⑥ Abschluss', 'AL / ggf. VAL', 'Nein: Veraktung ohne beBPo; Ja: ERV-Kette; Vier-Augen (OP-V-04)'],
    ],
    [12, 22, 66]
  ),
  spacer(),
  h2('3.1 Wichtige Begriffe'),
  table(
    ['Begriff', 'Bedeutung'],
    [
      ['Einzelmeldung (Meldung)', 'Schriftliche Erfassung je beteiligter aVD; Status z. B. SUBMITTED'],
      ['Fall (MeldungsFall)', 'Container für alle Einzelmeldungen zum gleichen Ereignis'],
      ['Zentrale / AK', 'Rollencode arbeitskoordination — einzige Rolle mit Fall-Bündelung'],
      ['ERV', 'Externer Weg: versandfähig → beBPo → eGPA → Vier-Augen'],
      ['Meldepflichtig', 'Entscheid AL/VAL auf Fall-Ebene; ja = ERV-Weg'],
    ],
    [30, 70]
  ),
  spacer(),
  h2('3.2 Fristen (SLA, beschlossen — Details OP-F-*)'),
  table(
    ['Frist', 'Regel'],
    [
      ['Ersterfassung', '24 h ab Ereignisende'],
      ['Externe Meldung (ERV)', '24 h ab Ereignisende, Werktage'],
      ['Wochenende/Feiertage', 'Sammeln bis Montag 08:00'],
      ['Nachreichung (Rückgabe)', '5 Werktage'],
      ['Zeugenaussage', 'Entfällt (kein Zeugenkonzept, OP-Z-01)'],
    ],
    [40, 60]
  ),
  spacer(),

  h1('4. Rollen und Entscheidungen'),
  table(
    ['Code', 'UI-Label', 'Hauptaufgabe'],
    [
      ['avd', 'Allgemeiner Vollzugsdienst', 'Einzelmeldung erfassen/einreichen'],
      ['arbeitskoordination', 'Zentrale / AK', 'Einzige Rolle mit Fall-Bündelung'],
      ['dienstgruppenleitung', 'DGL', 'Qualitätsprüfung gebündelter Fälle'],
      ['stationsleitung', 'SL / Wohngruppenleitung', 'Fallmeldung DGL → AL/VAL'],
      ['anstaltsleitung', 'AL', 'Meldepflicht; ERV; interner Abschluss'],
      ['val', 'VAL', 'Optional Meldepflicht; Befragung Beteiligter nach „Ja“'],
    ],
    [28, 28, 44]
  ),
  spacer(),
  h2('4.1 Entscheidungspunkte'),
  table(
    ['#', 'Entscheidung', 'Entscheider', 'Optionen'],
    [
      ['E1', 'Gleicher Vorfall?', 'Zentrale', 'Bündeln / nicht bündeln'],
      ['E2', 'Fall vollständig?', 'Zentrale / DGL', 'Weiter / fehlende Meldung anfordern'],
      ['E3', 'Qualität ausreichend?', 'DGL', '→ SL / Rückgabe'],
      ['E4', 'Meldepflichtig?', 'AL oder VAL', 'Ja (ERV) / Nein (intern)'],
      ['E5', 'ERV-Kette', 'AL + VAL', 'versandfähig → beBPo → eGPA → Vier-Augen'],
    ],
    [8, 28, 22, 42]
  ),
  spacer(),

  h1('5. Prototyp-Stand (Juni 2026)'),
  h2('5.1 Umgesetzt'),
  bullet('Fall-Modell MeldungsFall mit Status ZUR_SL, EGPA_INTERN, ERV-Felder'),
  bullet('Prozesskette: Zentrale → DGL → SL → AL/VAL → ERV am Fall'),
  bullet('Meldepflicht: AL oder VAL; ERV: versandfähig → beBPo → eGPA → abschließen'),
  bullet('Bündelung mit Vorschlägen Tatzeit/Tatort (⚠ Annahme OP-FB-01)'),
  bullet('Seed-Demo: FALL-001 (ZUR_SL), FALL-002 (ZUR_AL)'),
  h2('5.2 Wichtigste Code-Pfade'),
  table(
    ['Pfad', 'Inhalt'],
    [
      ['backend/src/services/fallService.js', 'Fall-Workflow'],
      ['backend/src/routes/faelle.js', 'Fall-API'],
      ['frontend/src/pages/FallDetail.jsx', 'Fall-UI + ERV-Panel'],
      ['frontend/src/components/emeldewesen/FallBuendelungPanel.jsx', 'Bündelung'],
      ['frontend/src/context/RollenContext.jsx', 'Rollen Frontend'],
      ['backend/src/middleware/mockAuth.js', 'Rollen Backend'],
    ],
    [45, 55]
  ),
  spacer(),

  h1('6. Validierungsstand (Kurzfassung)'),
  p('Vollständige Matrix: VALIDIERUNG_PROZESS.md im Repository.'),
  table(
    ['Kategorie', 'Befund'],
    [
      ['Stabil geklärt', 'Hafthaus-Filter; kein Zeugenkonzept; ein Meldungstyp pro Fall; DGL-Rückgabe aVD+Zentrale; meldepflichtig=ERV; VAL-Befragung nur nach „Ja“'],
      ['Arbeitsannahme', 'Fall-Bündelung (③) und DGL→SL→AL — OP-FB-01'],
      ['Zielsystem fehlt', 'eGPA nicht ausgerollt → Übergangs-Veraktung OP-EGPA-01'],
      ['Rollen offen', 'Meldepflicht-Entscheid, interner Abschluss, ERV-Personal, Vier-Augen'],
    ],
    [25, 75]
  ),
  spacer(),
  h2('6.1 Status je Phase (Auszug)'),
  table(
    ['Phase', 'Zu validieren / offen', 'Bereits sicher (Auszug)'],
    [
      ['① Ereignis', 'Freistellung OP-ORG-01; Fristen OP-F-*; Telefon OP-M-01', 'Telefonat schwerwiegend; unmittelbar melden'],
      ['② Ersterfassung', 'W-Fragen OP-W-01/02', 'Hafthaus-Filter; keine Zeugen'],
      ['③ Bündelung', 'Gesamtphase OP-FB-01', 'L1; kein Hartblock an DGL'],
      ['④ DGL', 'DGL→SL→AL; Checkliste OP-DGL-01', 'Rückgabe aVD+Zentrale; unbegrenzt'],
      ['⑤ Entscheid', 'K2 OP-K-03; Abschluss OP-ABS-01; ERV OP-ERV-03', 'meldepflichtig = ERV'],
      ['⑥ Abschluss', 'eGPA/Übergang OP-EGPA-01; Vier-Augen OP-V-04', 'VAL-Befragung nur nach „Ja“'],
    ],
    [12, 44, 44]
  ),
  spacer(),

  new Paragraph({ children: [new PageBreak()] }),

  h1('7. Offene Punkte — Prioritäten P1–P3'),
  h2('7.1 P1 — Workshop / fachlicher Beschluss (blockiert Lastenheft)'),
  table(
    ['ID', 'Thema', 'Warum P1'],
    [
      ['OP-FB-01', 'Fall-Bündelung + Kette bis AL', 'Größte unvalidierte Annahme'],
      ['OP-JVA-01', 'JVA-Abweichungen Rollenkette', 'Anhang A JVA-Matrix'],
      ['OP-K-03', 'Meldepflicht-Entscheid: AL oder VAL?', 'Phase ⑤'],
      ['OP-ABS-01', 'Interner Abschluss „nein“: AL oder ggf. VAL?', 'Phase ⑤/⑥'],
      ['OP-ERV-03', 'ERV: eine Person ausreichend?', 'Phase ⑤/⑥'],
      ['OP-EGPA-01', 'Übergangs-Veraktung ohne eGPA', 'Ist-Realität JVAs'],
      ['OP-V-04', 'Vier-Augen-Regeln', 'Abschluss ERV/intern'],
      ['OP-DGL-01', 'DGL-Checkliste', 'Phase ④'],
    ],
    [15, 45, 40]
  ),
  spacer(),
  h2('7.2 P2 — Lastenheft, Begriffe, Fristen'),
  bullet('OP-F-01–14: Fristen/SLA (ZU_KLAERENDE_BEGRIFFLICHKEITEN.md §13)'),
  bullet('OP-W-01/02: W-Fragen 5 vs. 7; Textbausteine'),
  bullet('OP-R-01–08: Rolle Zentrale (§14)'),
  bullet('OP-ORG-01: Formale Freistellung aVD'),
  bullet('OP-M-01: Telefonische Vorabmeldung'),
  bullet('OP-H-03, OP-BM-01/02, OP-JVP-01, OP-P-01'),
  h2('7.3 P3 — Prototyp-Backlog (nach P1-Beschlüssen)'),
  bullet('OP-Z-01: ZeugenEditor entfernen'),
  bullet('OP-Z-02: Feld Polizei Ja/Nein'),
  bullet('OP-DGL-03: DGL-Rückgabe erreicht aVD'),
  bullet('OP-V-02: VAL-Befragung Felder/UI am Fall'),
  spacer(),

  h1('8. Nächste Schritte — Roadmap (ausführbar)'),
  p('Diese Checklisten können Sie direkt abarbeiten. Nach jedem Workshop: RUECKFRAGEN_UND_OFFENE_PUNKTE.md Chronik und VALIDIERUNG_PROZESS.md aktualisieren.'),
  spacer(),

  h2('8.1 Schritt 1 — Workshop-Vorbereitung (1–2 Wochen)'),
  checkbox('Teilnehmer festlegen: je JVA aVD, Zentrale, DGL, SL, AL/VAL (mind. eine JVA vollständig)'),
  checkbox('Material drucken/teilen: VALIDIERUNG_PROZESS.md; Demo Pfad A (Abschnitt 2.4)'),
  checkbox('Agenda: OP-FB-01, DGL→SL→AL, OP-EGPA-01, OP-K-03 / OP-ABS-01 / OP-ERV-03'),
  checkbox('WORKSHOP_AGENDA.md wählen (90/120/180 Min.)'),
  checkbox('Anhang A: erste Zeilen JVA-Matrix (ANHANG_A_JVA_MATRIX.md) vorbereiten'),
  spacer(),

  h2('8.2 Schritt 2 — JVA-Workshop(s)'),
  checkbox('Prozessschritte ③–⑥ an VALIDIERUNG_PROZESS abgleichen; Beschlüsse protokollieren'),
  checkbox('DGL-Checkliste (OP-DGL-01): erste Fassung aus Grundsätzen GZ-A1–A5'),
  checkbox('Übergangs-Veraktung dokumentieren (Ist ohne eGPA)'),
  checkbox('Chronik RUECKFRAGEN + VALIDIERUNG_PROZESS aktualisieren'),
  checkbox('Praxisfeedback.md Blocks ergänzen falls neue Erkenntnisse'),
  spacer(),

  h2('8.3 Schritt 3 — Gesamtprozess-Abgleich (nach Workshop, 2–4 Wochen)'),
  p([t('Verbindlicher Abgleich aller Prozessdarstellungen — Voraussetzung für verbindliches Lastenheft.', { italics: true })]),
  checkbox('GESAMTPROZESS.md als führende Soll-Referenz bestätigen oder an Workshop-Beschlüssen anpassen'),
  checkbox('Lastenheft Kap. 3/4 und LASTENHEFT_GLIEDERUNG.md mit GESAMTPROZESS synchronisieren'),
  checkbox('Veraltete Diagramme markieren: LASTENHEFT/08_GESAMTPROZESS_ARIS.md, 10_PROZESSDIAGRAMM.md'),
  checkbox('PROZESS_SOLL_UND_STAND.md und Prototyp gegen beschlossenen Soll prüfen'),
  checkbox('HAPPY_PATH_STRAFANZEIGE.md als Legacy kennzeichnen wo Fall-Pfad abweicht'),
  checkbox('VALIDIERUNG_PROZESS: keine offenen P1-Punkte in Phase ③–⑥ mehr als „zu validieren“'),
  checkbox('Abnahme Abgleich dokumentieren (Datum, Version GESAMTPROZESS, Unterschriften Fachauftrag + Workshop-Leitung)'),
  spacer(),

  h2('8.4 Schritt 4 — Lastenheft & Anforderungen'),
  checkbox('Beschlossene Punkte in Anforderungs-IDs (HEUREKA) überführen'),
  checkbox('Fristen (OP-F-*) in Anhang A / Kap. SLA verbindlich formulieren'),
  checkbox('Rollenmatrix: Zentrale (OP-R-*) in Lastenheft 02 und .cursorrules-Doku'),
  spacer(),

  h2('8.5 Schritt 5 — Prototyp-Iteration (parallel ab Schritt 2)'),
  checkbox('P3-Quick-Wins: OP-Z-01, OP-Z-02, OP-DGL-03'),
  checkbox('Fall-Pfad / ERV-Panel an Workshop-Beschlüsse und Übergangs-Veraktung anpassen'),
  checkbox('Keine dauerhafte P1-Implementierung ohne fachlichen Beschluss'),
  spacer(),

  h2('8.6 Schritt 6 — Übergabe Zielsystem (LC-Plattform)'),
  checkbox('Abnahmekriterien aus Lastenheft + abgeschlossenem Gesamtprozess-Abgleich'),
  checkbox('Mock-Grenzen dokumentieren (kein echtes beBPo/eGPA/AD)'),
  checkbox('Traceability: OP-* → A2-ID → Testfall'),
  p('Laufender Abgleich: Word-Lastenheft ↔ Repository wöchentlich (LASTENHEFT/00_PHASE0_ARBEITSHILFE.md §2).'),
  spacer(),

  h2('8.7 Checkliste Workshop-Leitung'),
  checkbox('Phase ③ als Annahme kommuniziert?'),
  checkbox('DGL → SL → AL in jeder JVA so gelebt?'),
  checkbox('Aktuelle Veraktung ohne eGPA?'),
  checkbox('Wer entscheidet Meldepflicht und schließt ab?'),
  checkbox('Fristen (24 h, Werktage, Montag 08:00) JVAs-weit tragfähig?'),
  spacer(),

  h2('8.8 Risiken bei ausbleibendem P1 / Abgleich'),
  table(
    ['Risiko', 'Folge'],
    [
      ['Fall-Bündelung nicht validiert', 'Zielsystem mit falschem Hauptprozess'],
      ['Kein Gesamtprozess-Abgleich', 'GESAMTPROZESS, Lastenheft, ARIS und Prototyp widersprechen sich'],
      ['eGPA-Übergang unklar', 'Lücke zwischen Mock und JVA-Alltag'],
      ['Rollenentscheid offen', 'Berechtigungsmatrix / UI widersprechen Praxis'],
    ],
    [40, 60]
  ),
  spacer(),

  ...buildDocumentSummaries(),

  h1('10. Repository und Dokumentenindex'),
  h2('10.1 Repository-Struktur (a2/)'),
  table(
    ['Pfad', 'Zweck'],
    [
      ['.cursorrules', 'Verbindliche Projektregeln'],
      ['README.md', 'Schnellstart Docker, API-Übersicht'],
      ['docker-compose.yml', 'PostgreSQL + Backend + Frontend'],
      ['frontend/', 'React 18 + Vite + Tailwind'],
      ['backend/', 'Express + Prisma + PostgreSQL'],
      ['docs/meldewesen-a2-main/docs/', 'Fachliche Hauptdokumentation'],
      ['docs/LASTENHEFT/', 'Lastenheft-Kapitel (Markdown)'],
    ],
    [35, 65]
  ),
  spacer(),
  h2('10.2 Fachliche Hauptdokumente'),
  table(
    ['Datei', 'Zweck'],
    [
      ['UEBERGABE_GESAMT.md', 'Markdown-Quelle dieses Word-Dokuments'],
      ['GESAMTPROZESS.md', 'Soll-Prozess v2.0'],
      ['VALIDIERUNG_PROZESS.md', 'Validierungs-Matrix Phasen ①–⑥'],
      ['RUECKFRAGEN_UND_OFFENE_PUNKTE.md', 'OP-* Backlog + Chronik (laufend pflegen!)'],
      ['UEBERGABE_PROTOTYP_ENTWICKLUNG.md', 'Entwickler-Einstieg'],
      ['Praxisfeedback.md', 'Workshop-Feedback Blocks A–P'],
      ['ZU_KLAERENDE_BEGRIFFLICHKEITEN.md', 'Begriffe, Fristen §13, Zentrale §14'],
      ['WORKSHOP_AGENDA.md', 'Agenda 90/120/180 Min.'],
    ],
    [40, 60]
  ),
  spacer(),
  h2('10.3 Pflege-Regel bei Änderungen'),
  bullet('Workshop-Entscheid → RUECKFRAGEN Chronik (oben eintragen)'),
  bullet('Status → VALIDIERUNG_PROZESS.md anpassen'),
  bullet('Soll-Prozess → GESAMTPROZESS.md (nach Schritt 3 Abgleich)'),
  bullet('Roadmap/Checklisten → UEBERGABE_GESAMT.md §13 und dieses Word-Dokument neu erzeugen'),
  spacer(),

  h1('11. Anhang: Grundsätze BZ JV'),
  p('Quelle: docs/20260610_HEUREA_WABE.docx (Bildungszentrum Justizvollzug Hamburg)'),
  h3('Abfassung (GZ-A1–A5)'),
  table(
    ['Nr', 'Grundsatz'],
    [
      ['GZ-A1', 'Nur überprüfbare, belegbare Tatsachen'],
      ['GZ-A2', 'Frei von Wertung'],
      ['GZ-A3', 'Genau und klar für Nicht-Augenzeugen'],
      ['GZ-A4', 'W-Fragen: Wer · Was · Wann · Wo · Wie · Warum · Wohin'],
      ['GZ-A5', 'Chronologische Reihenfolge'],
    ],
    [12, 88]
  ),
  spacer(),
  h3('Abgabe (GZ-B1–B5)'),
  table(
    ['Nr', 'Grundsatz'],
    [
      ['GZ-B1', 'Schriftlich so schnell wie möglich (→ 24 h SLA)'],
      ['GZ-B2', 'Bei Eilbedürftigkeit mündliche Meldung vor schriftlicher (OP-M-01)'],
      ['GZ-B3', 'Emotionsabstand vor Abgabe'],
      ['GZ-B4', 'Gegenlesen durch Vertrauensperson'],
      ['GZ-B5', 'Im Krisenfall Meldung nachreichen (→ 5 WT)'],
    ],
    [12, 88]
  ),
  spacer(),
  p([
    t('— Ende Übergabedokument · '),
    t('Markdown-Quellen und Prototyp im Repository a2/ · Stand 19.06.2026', { italics: true }),
  ]),
];

const doc = new Document({
  creator: 'HEUREKA 2.0 A2 eMeldewesen',
  title: 'Übergabedokument A2 eMeldewesen',
  description: 'Projekteinarbeitung und nächste Schritte',
  styles: {
    default: {
      document: {
        run: { font: 'Open Sans', size: 22 },
      },
    },
  },
  sections: [
    {
      properties: {},
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync(OUT, buffer);
console.log('Erstellt:', OUT);
