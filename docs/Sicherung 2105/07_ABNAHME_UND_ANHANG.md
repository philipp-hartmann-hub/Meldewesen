# Kapitel 9–10 – Abnahme, Risiken, Prototyp-Abgleich

**Version:** 0.4 | **Status:** Phase 5–6 ausformuliert (Entwurf 0.x)

---

## 9 Abnahmekriterien

### 9.1 Zwei Abnahme-Ebenen (Beschluss Phase 5)

| Ebene | Wann | Kriterium | Verantwortlich |
|-------|------|-----------|----------------|
| **Workshop / Prototyp** | Erster JVA-Workshop | **Fachliche Plausibilität** – geführte Demo, Rückmeldungen dokumentiert; **keine** vollständige technische Testmatrix muss grün sein | Fachauftrag + JVA |
| **Regression / Zielsystem** | Vor Pilot / LC-Übergabe | Alle Tests `A2-F-TST-…` mit gekoppelter F-ID durchführbar und protokolliert | PD + IT |

Workshop-Kurz-IDs (`TST-STR-01` usw.) sind **Alias**; führend bleibt `A2-F-TST-{NNN}` mit Feld **Verifiziert Anforderung** (siehe [00_PHASE0_ARBEITSHILFE.md](00_PHASE0_ARBEITSHILFE.md)).

### 9.2 Testkatalog (vollständig gekoppelt)

| A2-F-TST-ID | HEUREKA-Ref | Alias | Verifiziert Anforderung | Rolle | Szenario | Erwartung | Workshop |
|-------------|-------------|-------|-------------------------|-------|----------|-----------|----------|
| A2-F-TST-001 | HEUREKA-2.0-A2-TST-001 | TST-QS-01 | – (Betrieb) | – | GET `/health` | 200 | optional |
| A2-F-TST-002 | HEUREKA-2.0-A2-TST-002 | TST-QS-02 | A2-F-ROL-003 | val | GET `/api/rollen` | `darfXJustizSenden: true` | Demo |
| A2-F-TST-003 | HEUREKA-2.0-A2-TST-003 | TST-QS-03 | A2-F-ROL-002 | aVD | PATCH → ARCHIVED | 403 | Negativ-Demo |
| A2-F-TST-004 | HEUREKA-2.0-A2-TST-004 | TST-QS-04 | – (Mock-Auth) | – | `x-mock-rolle: foo` | 400 | – |
| A2-F-TST-005 | HEUREKA-2.0-A2-TST-005 | TST-STR-01 | A2-F-STR-001, A2-F-STR-002, A2-F-STA-002 | aVD | Strafanzeige anlegen, einreichen | SUBMITTED, ERV | Demo |
| A2-F-TST-006 | HEUREKA-2.0-A2-TST-006 | TST-STR-02 | A2-F-STR-004, A2-F-SLA-001 | val | MEL-018, beBPo | Versand protokolliert | Demo |
| A2-F-TST-007 | HEUREKA-2.0-A2-TST-007 | TST-STR-03 | A2-F-STR-004 | aVD | beBPo senden | 403 | Negativ-Demo |
| A2-F-TST-008 | HEUREKA-2.0-A2-TST-008 | TST-STR-04 | A2-F-ROL-005, A2-F-SLA-001 | val | beBPo + eGPA, abschließen | ARCHIVED; Vier-Augen VAL↔AL manuell | fachlich |
| A2-F-TST-009 | HEUREKA-2.0-A2-TST-009 | TST-STR-05 | A2-F-STR-002 | – | Seed MEL-015 | Referenz ARCHIVED | optional |
| A2-F-TST-010 | HEUREKA-2.0-A2-TST-010 | TST-INT-01 | A2-F-INT-001, A2-F-INT-002 | aVD | MEL-014 DRAFT | kein ERV-Badge | Demo |
| A2-F-TST-011 | HEUREKA-2.0-A2-TST-011 | TST-INT-02 | A2-F-INT-003, A2-F-STA-001 | val | MEL-017 IN_PROGRESS | 200 | Demo |
| A2-F-TST-012 | HEUREKA-2.0-A2-TST-012 | TST-INT-03 | A2-F-INT-002 | aVD | xjustiz auf Intern | 400 nicht ERV-relevant | API |
| A2-F-TST-013 | HEUREKA-2.0-A2-TST-013 | TST-GER-01 | A2-F-GER-001, A2-F-GER-002 | – | MEL-016 | Gericht, FORWARDED | Demo |
| A2-F-TST-014 | HEUREKA-2.0-A2-TST-014 | TST-GER-02 | A2-F-GER-003 | val | beBPo Gerichtsmeldung | Mock OK | Demo |
| A2-F-TST-015 | HEUREKA-2.0-A2-TST-015 | TST-INA-01 | A2-F-QS-001, A2-F-UI-005 | – | Meldungstypen-Liste | inaktive disabled | UI offen |

*Typ-Details:* [04_MELDUNGSTYP_STRAFANZEIGE.md](04_MELDUNGSTYP_STRAFANZEIGE.md), [05_MELDUNGSTYP_INTERN_GERICHT.md](05_MELDUNGSTYP_INTERN_GERICHT.md), [06_MELDUNGSTYP_INAKTIV.md](06_MELDUNGSTYP_INAKTIV.md).

### 9.3 Seed-Referenz (Demo-Daten)

| meldungsNr | Typ | Status | Nutzung |
|------------|-----|--------|---------|
| MEL-018 | STRAFANZEIGE | SUBMITTED | ERV, VAL zuständig |
| MEL-015 | STRAFANZEIGE | ARCHIVED | Abgeschlossen |
| MEL-017 | VORFALL_INTERN | IN_PROGRESS | Intern |
| MEL-016 | MELDUNG_GERICHT | FORWARDED | Gericht |
| MEL-014 | VORFALL_INTERN | DRAFT | Entwurf |

Quelle: [backend/seed.js](../../backend/seed.js).

---

## 10 Offene Punkte und Risiken

**Pflege:** **PD / Fachauftrag** (laufende Risikotabelle; IT bei technischen Abhängigkeiten einbinden).

Aus [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](../RUECKFRAGEN_UND_OFFENE_PUNKTE.md):

| Risiko / Offen | Auswirkung | Maßnahme | Stand |
|----------------|------------|----------|-------|
| „Versandfähig“ Definition | SLA 3 WT messbar | Workshop + Anhang A | offen |
| Werktagslogik SLA | Fristen je JVA | [ANHANG_A_JVA_MATRIX.md](ANHANG_A_JVA_MATRIX.md) | Vorlage |
| Vier-Augen technisch | Nur manuell im Prototyp | A2-F-ROL-005 Zielsystem | VAL↔AL fachlich ja |
| UI Meldungen fehlt | Workshop nur Dashboard | Backlog A2-F-UI-004 | offen |
| Auth offen | Pilot ohne SSO | Entscheidung nach Pilot | offen |
| Pflichtfelder Strafanzeige | Lastenheft unvollständig | Workshop-Checkliste | offen |
| Intern Gefangenenbezug | Regel unklar | Workshop | offen |

~~Code vs. Soll Weiterleiten Sonderdienste~~ → **behoben** (A2-F-ROL-001).

---

## Phase 6 – Prototyp-Abgleich

| Anforderungsbereich | API | UI | Anmerkung |
|---------------------|-----|-----|-----------|
| Meldungstypen | umgesetzt | teilweise | |
| CRUD Meldungen | umgesetzt | nicht | Routen auskommentiert |
| Status + Verlauf | umgesetzt | nicht | |
| Verakten / xJustiz | umgesetzt | nicht | |
| Rollen Mock | umgesetzt | Banner ja | A2-F-ROL-001 umgesetzt |
| SLA Überfällig | – | nicht | A2-F-SLA-002 |
| Inaktive Typen UI | – | nicht | A2-F-UI-005 |
| Anhänge | Schema | nicht | |

### Empfohlene Umsetzungsreihenfolge (Backlog)

1. A2-F-UI-004 (Routen + Liste/Detail/Neu)  
2. A2-F-STR-005 / STR-003 (Formular Strafanzeige)  
3. A2-F-UI-005 (inaktive Typen disabled)  
4. A2-F-SLA-002 (Überfällig in Liste)  
5. A2-F-ROL-005 (Vier-Augen technisch, Zielsystem)

---

## Freigabe-Checkliste Lastenheft

### „Workshop-ready“ (Entwurf 0.x)

Gilt, wenn **Phase 3** inhaltlich vorliegt **und** offene Punkte in [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](../RUECKFRAGEN_UND_OFFENE_PUNKTE.md) dokumentiert sind – **ohne** Voraussetzung fertiger UI oder befüllter JVA-Matrix.

- [x] Kap. 1–4 und Querschnitt (Phasen 1–2) ausformuliert  
- [x] Aktive Meldungstypen (Phase 3) ausformuliert  
- [x] Inaktive Typen Kurzprofil (Phase 4)  
- [x] Testkatalog `A2-F-TST-001` … `015` gekoppelt (Phase 5)  
- [ ] [WORKSHOP_AGENDA.md](../WORKSHOP_AGENDA.md) durchgeführt  
- [ ] Anhang A: vorerst **Leervorlage + Beispielzeile** ([ANHANG_A_JVA_MATRIX.md](ANHANG_A_JVA_MATRIX.md)); Befüllung **nach** Workshop  
- [ ] Export Word/PDF Version 0.y nach Workshop-Feedback  

### Formale Version 1.0 (später)

- [ ] Anhang A mit teilnehmenden JVAs befüllt (nach gemeinsamem Workshop)  
- [ ] Vier-Augen und „versandfähig“ fachlich geschlossen  
- [ ] Meilenstein-Daten Kap. 1 ergänzt  
