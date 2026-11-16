/**
 * Kurzfassungen aller Projektdokumente für das Word-Übergabedokument.
 * Pfadangaben relativ zum Repository-Root a2/.
 */
export const DOC_SUMMARY_GROUPS = [
  {
    title: '9.1 Steuerung, Übergabe und Projektregeln',
    docs: [
      {
        name: '.cursorrules',
        path: '.cursorrules',
        purpose:
          'Verbindliche Projektregeln für Prototyp A2 — bei Widerspruch zu älteren Team-Dokumenten maßgeblich.',
        bullets: [
          'Rollencodes lowercase; Berechtigungsmatrix; vier Dateien für neue Rollen.',
          'Stack: React 18, Node/Express/Prisma, Docker; Design-Tokens jhh-*.',
          'Explizite Nicht-Ziele: kein echtes SSO, beBPo, eGPA, CSRF.',
          'API-Routen, PageLayout-Pflicht, ERV-Kennzeichnung.',
        ],
      },
      {
        name: 'README.md',
        path: 'README.md',
        purpose: 'Schnellstart, Tech-Stack und Repository-Übersicht im Projektroot.',
        bullets: [
          'docker compose up → Frontend :5173, Backend :3001/health.',
          'Verweist auf Übergabe-Docs, Lastenheft, Workshop-Agenda.',
          'Prisma db push + seed beim Backend-Start.',
        ],
      },
      {
        name: 'UEBERGABE_GESAMT.md',
        path: 'docs/meldewesen-a2-main/docs/UEBERGABE_GESAMT.md',
        purpose: 'Markdown-Gesamtübergabe: Prozess, Prototyp, Schemata, Roadmap §13.',
        bullets: [
          'Zentraler Einstieg für Fachliche, Workshop-Leitung, Entwicklung.',
          'Enthält Begriffe §1.4, Demo-Klickpfade, OP-Kurzindex, Chronik.',
          'Word-Export: A2_eMeldewesen_UEBERGABE.docx (dieses Dokument).',
        ],
      },
      {
        name: 'UEBERGABE_PROTOTYP_ENTWICKLUNG.md',
        path: 'docs/UEBERGABE_PROTOTYP_ENTWICKLUNG.md',
        purpose: 'Entwickler-Einstieg: Repo-Struktur, Kernfunktionen, Doku-Reihenfolge.',
        bullets: [
          '15-Min-Einstieg: .cursorrules → Docker → Banner → Klickpfad.',
          'Kernfunktionen: drei Meldungstypen, Mock ERV/eGPA, Arbeitskorb, SLA.',
          'Umgesetzt: Beweismittel-Nachreichung, Arbeitskorb-Navigation, Benachrichtigungen.',
          'Lesereihenfolge: Lastenheft 11 → 02 → ANHANG_B → 04 → RUECKFRAGEN.',
        ],
      },
      {
        name: 'UEBERGABE_KAPITEL_OFFENE_PUNKTE_VORSCHLAG.md',
        path: 'docs/meldewesen-a2-main/docs/UEBERGABE_KAPITEL_OFFENE_PUNKTE_VORSCHLAG.md',
        purpose: 'Archivierter Kapitelvorschlag — Inhalt in UEBERGABE_GESAMT.md §13 übernommen.',
        bullets: [
          'Status: archiviert seit 2026-06-17.',
          'Nicht mehr aktiv pflegen; maßgeblich ist UEBERGABE_GESAMT §13.',
        ],
      },
      {
        name: 'GIT_UND_GITHUB.md',
        path: 'docs/meldewesen-a2-main/docs/GIT_UND_GITHUB.md',
        purpose: 'Git-Tagesablauf und GitHub-Repo-Einrichtung für A2.',
        bullets: [
          'Täglich: status/add/commit/push; .env nicht versionieren.',
          'Repo-Anlage via scripts/github-setup.sh oder manuell.',
          'A2 ist separates Repository vom JVP-Starter A1.',
        ],
      },
    ],
  },
  {
    title: '9.2 Fachprozess, Validierung und Workshop',
    docs: [
      {
        name: 'GESAMTPROZESS.md',
        path: 'docs/meldewesen-a2-main/docs/GESAMTPROZESS.md',
        purpose: 'Fachliche End-to-End-Soll-Referenz nach Praxisfeedback Blocks A–P (v2.0).',
        bullets: [
          'Sechs Phasen: Ereignis → aVD-Ersterfassung → Bündelung → DGL → SL → AL/VAL → ERV/eGPA.',
          'Kern: ein Vorfall, mehrere Ich-Meldungen, ein gebündelter Fall.',
          'Phase ③ Bündelung = Annahme (OP-FB-01); 24 h Ersterfassung ab Ereignisende.',
          'Abgrenzung: kein Gefangenenportal, keine Basisbeobachtungen (JVP-Thema).',
        ],
      },
      {
        name: 'VALIDIERUNG_PROZESS.md',
        path: 'docs/meldewesen-a2-main/docs/VALIDIERUNG_PROZESS.md',
        purpose: 'Validierungs-Matrix: sicher / Vorentwurf / zu validieren / Annahme je Prozessschritt.',
        bullets: [
          'Phase ②: Hafthaus-Filter, keine Zeugen sicher; W-Fragen offen.',
          'Phase ③ gesamt: Annahme OP-FB-01; ein Typ pro Fall sicher.',
          'Phase ⑤: meldepflichtig=ERV sicher; Entscheider AL/VAL offen.',
          'Phase ⑥: ERV-Kette/eGPA-Übergang/Vier-Augen zu validieren.',
        ],
      },
      {
        name: 'PROZESS_SOLL_UND_STAND.md',
        path: 'docs/meldewesen-a2-main/docs/PROZESS_SOLL_UND_STAND.md',
        purpose: 'Abgleich feedbacketer Soll-Prozess vs. Prototyp-Umsetzung und Backlog.',
        bullets: [
          'Fall-Status: SAMMELN, ZUR_DGL, ZUR_SL, ZUR_AL, ERV_WEG, EGPA_INTERN.',
          'Umgesetzt: DGL/AK-Rollen, Fall-ERV-Kette, Seed FALL-001/002.',
          'Offen: DGL-Rückgabe an aVD (OP-DGL-03), VAL-Befragung-Workflow.',
        ],
      },
      {
        name: 'Praxisfeedback.md',
        path: 'docs/meldewesen-a2-main/docs/Praxisfeedback.md',
        purpose: 'Roh-Feedback Praxisexpert:innen in Blocks A–P und UI-Abschnitten 1–9.',
        bullets: [
          'Blocks A–P: Rollen, Ersterfassung, Bündelung, AL-Entscheid, Fristen, ERV, JVP-Abgrenzung.',
          'Beschlüsse: keine Zeugen, Sicherstellung statt Erhebung, Hafthaus-Filter, Dringend entfällt.',
          'Ist-Kern: aVD → Zentrale bündelt → DGL → AL; Prototyp bildet Fall-Pfad ab.',
          'Enthält BZ-JV-Grundsätze §15 und Sitzungsprotokolle.',
        ],
      },
      {
        name: 'ZU_KLAERENDE_BEGRIFFLICHKEITEN.md',
        path: 'docs/meldewesen-a2-main/docs/ZU_KLAERENDE_BEGRIFFLICHKEITEN.md',
        purpose: 'Glossar und Klärungskatalog für widersprüchliche Begriffe (WABE, Lastenheft, Prototyp).',
        bullets: [
          'Kanonisch: Ereignis, Einzelmeldung, Fall, Meldepflicht, ERV-Kette.',
          '§13 Fristen (OP-F-*); §14 Rolle Zentrale (OP-R-*).',
          'Fall-Bündelung §3.1 als nicht validierte Annahme dokumentiert.',
          'Hierarchie: GESAMTPROZESS v2.0 > älteres Lastenheft/ARIS > Prototyp-IST.',
        ],
      },
      {
        name: 'RUECKFRAGEN_UND_OFFENE_PUNKTE.md',
        path: 'docs/RUECKFRAGEN_UND_OFFENE_PUNKTE.md',
        purpose: 'Zentrales Register: Rückfragen, Beschlüsse, OP-*-Backlog, Chronik (laufend pflegen!).',
        bullets: [
          'Cluster A–C (Rollen, Steuerung, Prozess) + Cluster 7–12 (Lastenheft-Phasen).',
          'OP-FB-01, OP-ORG-01, OP-DGL-01, OP-M-01, OP-Z-01, OP-F-*, OP-EGPA-01.',
          'Nach jedem Workshop: Chronik oben eintragen; Status in VALIDIERUNG_PROZESS anpassen.',
        ],
      },
      {
        name: 'WORKSHOP_AGENDA.md',
        path: 'docs/WORKSHOP_AGENDA.md',
        purpose: 'Moderations-Agenda für JVA-Workshops in drei Zeitvarianten (90/120/180 Min.).',
        bullets: [
          '90 Min: Kontext A2 vs. A1, Demo, Pain-Points, JVA-Abweichungen.',
          '120 Min: + Strafanzeige, ERV-Reihenfolge, Vier-Augen.',
          '180 Min: alle Typen, JVA-Matrix, Abnahme-Szenarien.',
          'Ergebnis: Protokoll, Checkliste 09, Anhang A, Prioritätenliste.',
        ],
      },
      {
        name: 'HAPPY_PATH_STRAFANZEIGE.md',
        path: 'docs/HAPPY_PATH_STRAFANZEIGE.md',
        purpose: 'Klick-für-Klick-Demo Strafanzeige (Legacy-Pfad Einzelmeldung, teils abweichend vom Fall-Pfad).',
        bullets: [
          'aVD DRAFT → SUBMITTED → VAL IN_PROGRESS → beBPo → eGPA → ARCHIVED.',
          'Formular F1–F11; 24-h-SLA = Bearbeitung aufnehmen.',
          'Nach Fall-Pfad-Abgleich ggf. als Legacy kennzeichnen (OP-T-07).',
        ],
      },
    ],
  },
  {
    title: '9.3 Lastenheft und Anforderungen',
    docs: [
      {
        name: 'LASTENHEFT_GLIEDERUNG.md',
        path: 'docs/LASTENHEFT_GLIEDERUNG.md',
        purpose: 'Word/PDF-Gliederungsvorlage für das formale Lastenheft.',
        bullets: [
          'Kap. 1–4: Management Summary, Ist/Soll, Begriffe, Rahmen.',
          'Kap. 5.1: SLA-Tabelle, intern vs. extern (beBPo/ERV).',
          'Kap. 6–9: Funktionale Anforderungen, NFR, Testfälle, Risiken.',
          'Anhänge A (JVA-Matrix) und B (Felder).',
        ],
      },
      {
        name: 'LASTENHEFT/README.md',
        path: 'docs/LASTENHEFT/README.md',
        purpose: 'Index aller Lastenheft-Kapitel mit Plan-Phasen und Verknüpfungen.',
        bullets: [
          'Markdown-Quellen für Word-Lastenheft-Zusammenstellung.',
          'Verweist auf GESAMTPROZESS, PROZESS_SOLL_UND_STAND, RUECKFRAGEN.',
          'Status: Phasen 0–5 ausformuliert; workshop-ready Entwurf 0.x.',
        ],
      },
    ],
  },
  {
    title: '9.4 Lastenheft-Kapitel (docs/LASTENHEFT/)',
    isLastenheftTable: true,
    rows: [
      ['00_PHASE0_ARBEITSHILFE.md', 'ID-Schema, Anforderungsvorlage, Word↔Repo-Abgleich wöchentlich'],
      ['01_KAPITEL_RAHMEN.md', 'Kap. 1–4: Management Summary, Zielbild, Abgrenzung A1, Meilensteine'],
      ['02_QUERSCHNITT_ROLLEN_STATUS.md', 'Rollenmatrix, Rechte, Statusübergänge (Kap. 6.3–6.4)'],
      ['03_QUERSCHNITT_SLA_UI.md', 'SLA, ERV-Reihenfolge, Eskalation, UI-Pop-ups'],
      ['04_MELDUNGSTYP_STRAFANZEIGE.md', 'STRAFANZEIGE: Tatvorwurf, Zeugen, ERV-Pflicht'],
      ['05_MELDUNGSTYP_INTERN_GERICHT.md', 'VORFALL_INTERN und MELDUNG_GERICHT'],
      ['06_MELDUNGSTYP_INAKTIV.md', 'Inaktive Typen: sichtbar, disabled, „in Planung“'],
      ['07_ABNAHME_UND_ANHANG.md', 'Abnahmekriterien, Testfälle A2-F-TST-*, Risiken'],
      ['08_GESAMTPROZESS_ARIS.md', 'ARIS-Gesamtprozess — teilweise veraltet, mit GESAMTPROZESS abgleichen'],
      ['09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md', 'Workshop-Checkliste Prüfinhalt nach Einreichung'],
      ['10_PROZESSDIAGRAMM.md', 'Mermaid-Diagramme: Soll, Prototyp, Typen, SLA'],
      ['11_PROTOTYP_KLICKPFAD_ERFASSUNG.md', 'Technische Referenz: Routen, API, Rollen, Backlog P1–P7'],
      ['12_PROTOTYP_POPUP_ZIELOPTIONEN.md', 'Pop-up „Zieloptionen nicht im Prototyp“ für Workshops'],
      ['ANHANG_A_JVA_MATRIX.md', 'Leervorlage JVA-Abweichungen — nach Workshop befüllen (OP-JVA-01)'],
      ['ANHANG_B_FELDER.md', 'Typ-spezifische metadaten-Felder und Pflichten bei Einreichung'],
    ],
  },
  {
    title: '9.5 Umsetzung, Prüfung und Protokoll',
    docs: [
      {
        name: 'UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md',
        path: 'docs/meldewesen-a2-main/docs/UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md',
        purpose: 'Rückgabe-Weg Beweismittel-Nachreichung (A2-F-QS-004) — technisch-fachlich.',
        bullets: [
          'VAL/AL → DRAFT; Arbeitskorb-Task beweismittel_nachreichen beim AVD.',
          'AVD: Ja (Anhänge) oder Nein mit Begründung; Team-Übersicht mit KPI.',
        ],
      },
      {
        name: 'UMSETZUNG_ARBEITSKORB_NAVIGATION.md',
        path: 'docs/meldewesen-a2-main/docs/UMSETZUNG_ARBEITSKORB_NAVIGATION.md',
        purpose: 'Navigation nach Arbeitskorb-Abschluss und rollenkonsistente Primäraktionen.',
        bullets: [
          'Nach Zeugen/Beweismittel: Rückkehr /arbeitskorb; nach fachlicher Prüfung: /meldungen/:id.',
          '„Fachliche Prüfung aufnehmen“ nur VAL/AL; Backend blockiert andere Rollen (403).',
        ],
      },
      {
        name: 'UMSETZUNG_BENACHRICHTIGUNGEN.md',
        path: 'docs/meldewesen-a2-main/docs/UMSETZUNG_BENACHRICHTIGUNGEN.md',
        purpose: 'In-App-Benachrichtigungs-Glocke als Ersatz für E-Mail im Prototyp.',
        bullets: [
          'Ereignisse: Zuweisung, Rückzug, Nachreichung, Eskalation.',
          'API /api/benachrichtigungen; Polling 30 s; Deep-Links zu Meldung/Arbeitskorb.',
        ],
      },
      {
        name: 'PROTOKOLL_AENDERUNGEN.md',
        path: 'docs/meldewesen-a2-main/docs/PROTOKOLL_AENDERUNGEN.md',
        purpose: 'Chronologisches Änderungsprotokoll aller Prototyp-Anpassungen mit Commits.',
        bullets: [
          'Pflicht nach jeder Anpassung; neueste Einträge oben.',
          'Jeder Eintrag: Umfang, Code-Dateien, aktualisierte Docs, Commit-Hash.',
        ],
      },
      {
        name: 'PRUEFAUFTRAG_MITARBEITER.md',
        path: 'docs/meldewesen-a2-main/docs/PRUEFAUFTRAG_MITARBEITER.md',
        purpose: 'Prüfauftrag für fachliche Abnahme des Prototyps (10 Szenarien, Anpassungsliste A–H).',
        bullets: [
          'Einzelprüfung 1–2 h/Rolle → Abstimmung → Findings-Liste.',
          'Demo-Nutzer z. B. AVD-07, VAL-01; Basis: PROTOKOLL, UMSETZUNG_*, HAPPY_PATH.',
        ],
      },
    ],
  },
  {
    title: '9.6 Quellen und externe Dateien',
    docs: [
      {
        name: 'quellen/README.md',
        path: 'docs/meldewesen-a2-main/docs/quellen/README.md',
        purpose: 'Index externer Quelldokumente, deren Inhalte in Markdown übernommen wurden.',
        bullets: [
          'Hauptquelle: 20260610_HEUREA_WABE.docx (WABE/ANNA/elBe-Schulung BZ JV).',
          'Inhalte: GZ-A1–B5, 7 W-Fragen → GESAMTPROZESS §7, ZU_KLAERENDE §2.',
          'Spiegelkopie: docs/20260610_HEUREA_WABE.docx.',
        ],
      },
      {
        name: '20260610_HEUREA_WABE.docx',
        path: 'docs/20260610_HEUREA_WABE.docx',
        purpose: 'Original-WABE-Schulungsfolien (überwiegend Bilder, nicht durchsuchbar).',
        bullets: [
          'Grundsätze Abfassung und Abgabe von Meldungen im Justizvollzug.',
          'Essenz in Word-Anhang 11 und GESAMTPROZESS §7 extrahiert.',
        ],
      },
      {
        name: 'Praxisfeedback_Schaubild.html',
        path: 'docs/meldewesen-a2-main/docs/Praxisfeedback_Schaubild.html',
        purpose: 'Interaktives HTML-Schaubild des feedbacketen Prozesses.',
        bullets: ['Workshop-Visualisierung; bei Abgleich GESAMTPROZESS v2.0 bevorzugen.'],
      },
      {
        name: 'eMeldewesen_Prozess_ARIS.txt',
        path: 'docs/meldewesen-a2-main/docs/eMeldewesen_Prozess_ARIS.txt',
        purpose: 'Älterer ARIS-Export — historische Referenz, nicht maßgeblich.',
        bullets: ['Ersetzt durch GESAMTPROZESS.md v2.0 nach Gesamtprozess-Abgleich (Roadmap Schritt 3).'],
      },
    ],
  },
];
