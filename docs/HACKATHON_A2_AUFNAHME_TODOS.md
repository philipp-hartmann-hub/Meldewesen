# Hackathon A2 – Aufnahme: To-do-Liste Änderungsanforderungen

**Version:** 0.2 | **Stand:** 2026-05-20  
**Zweck:** Umsetzbare To-do-Liste aller **Änderungsanforderungen** für Prototyp, Lastenheft und Zielprozess.

---

## Hinweis zur Quelle

| Status | Beschreibung |
|--------|----------------|
| **Protokoll** | Workshop-Aufnahme: `Protokoll Prototyp.txt` (lokal; Auszug in **Abschnitt G**). |
| **Abgeleitet** | Zusätzlich: Klickpfad-Backlog, Zieloptionen-Pop-up, Rückfragen (Abschnitte A–F). |
| **Nachpflege** | Video/Word-Original bei Bedarf nach `docs/` ablegen; Duplikate mit H-A* / H-Z* abstimmen. |

**Quellen (Stand Repo):**

- **`Protokoll Prototyp.txt`** (Workshop-Durchklick, 2026-05-20) → **Abschnitt G**
- [LASTENHEFT/11_PROTOTYP_KLICKPFAD_ERFASSUNG.md](LASTENHEFT/11_PROTOTYP_KLICKPFAD_ERFASSUNG.md) Kap. 8 (P1–P7)
- [LASTENHEFT/12_PROTOTYP_POPUP_ZIELOPTIONEN.md](LASTENHEFT/12_PROTOTYP_POPUP_ZIELOPTIONEN.md) (Z-01 … Z-63)
- [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md) (Cluster A–C, Checkliste Kap. 6)
- [LASTENHEFT/09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md](LASTENHEFT/09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md)

**Legende Priorität:** **P1** = nächster Sprint Prototyp · **P2** = kurzfristig · **P3** = Lastenheft/Workshop · **Z** = Zielprozess (nach Prototyp / LC-Plattform)

**Legende Status:** `[ ]` offen · `[~]` teilweise · `[x]` erledigt

---

## A – Prototyp HEUREKA A2 (Umsetzung)

### A.1 Priorität P1–P7 (Klickpfad-Backlog)

| ID | Prio | Status | Änderungsanforderung | Andockstelle |
|----|------|--------|----------------------|--------------|
| H-A01 | P1 | [ ] | **„Versandfähig“ markieren** vor beBPo (nur VAL/AL); Startpunkt 3-Werktage-SLA dokumentieren | `metadaten` oder Status `READY_TO_SEND`; API + `MeldungAktionen` |
| H-A02 | P2 | [x] | **Anlagen (Mock):** Datei wählen, speichern, in Detail anzeigen (Workshop: Upload + Download getestet) | `Anhang`-Modell, `POST …/anhaenge`, `MeldungForm` |
| H-A03 | P2 | [ ] | **Inhalt nach Einreichung bearbeiten** (Sachverhalt/Metadaten) ohne Rückfall auf Entwurf; nur VAL/AL | `PATCH /api/meldungen/:id`, Policy + UI |
| H-A04 | P2 | [ ] | **Bearbeiter/in zuweisen** und Warteschlange in Liste sichtbar | `metadaten.zugewiesenAn`, Filter `MeldungenListe` |
| H-A05 | P3 | [ ] | **QS simulieren** (Workshop): ein Klick „QS abgeschlossen“ | Status oder `status_verlauf`-Eintrag |
| H-A06 | P3 | [ ] | **Eilmeldung** (< 48 h) als eigener Schritt/Flag (ohne echtes ERV) | UI + `metadaten` |
| H-A07 | P1 | [ ] | **Vier-Augen erzwingen:** `ARCHIVED` nur wenn zweite Leitungsrolle (VAL↔AL) am ERV-Vorgang | `mockAuth` + `PATCH …/status` |

### A.2 Stammdaten & Backend

| ID | Prio | Status | Änderungsanforderung | Andockstelle |
|----|------|--------|----------------------|--------------|
| H-A10 | P1 | [x] | **30 Gefangene** als BASIS-Web-Ersatz in PostgreSQL (`basisWebDummyGefangene.js`, Seed) | `backend/data/`, `seed.js` |
| H-A11 | P1 | [x] | **Autocomplete** lädt Stammdaten aus DB (`GET /api/gefangene`, `list=1`, Validierung `gefangeneId`) | `GefangeneAutocomplete`, `gefangeneService.js` |
| H-A12 | P2 | [ ] | **Docker-Backend:** `multer` im Volume bei `npm ci` / Rebuild absichern (kein Startabbruch) | `docker-compose.yml`, `Dockerfile` |
| H-A13 | P2 | [ ] | **Health/Start-Doku:** einheitlich `/health` vs. `/api/health` in README | `README.md` |

### A.3 UI / UX

| ID | Prio | Status | Änderungsanforderung | Andockstelle |
|----|------|--------|----------------------|--------------|
| H-A20 | P2 | [x] | **ERV-Badge** in Meldungsliste für alle ERV-pflichtigen Typen | `MeldungenListe`, A2-F-UI-003 |
| H-A21 | P2 | [x] | **Pop-up Zieloptionen** (nicht im Prototyp) auf Detailseite | `MeldungZieloptionenModal`, `zielprozessNichtUmgesetzt.js` |
| H-A22 | P3 | [ ] | Pop-up **Phase 1:** nur zur Meldung passende Zieloptionen filtern (ERV, Typ) | `12_PROTOTYP_POPUP` Kap. 6 Phase 1 |
| H-A23 | P2 | [ ] | **Inaktive Meldungstypen:** sichtbar, disabled, Tooltip „in Planung“ | `MeldungForm`, `GET /api/meldungstypen` |
| H-A24 | P2 | [ ] | **SLA-Eskalation** im Prototyp (Verlauf/Mock, keine E-Mail) | `03_QUERSCHNITT_SLA_UI`, A2-F-SLA-003 |
| H-A25 | P2 | [ ] | **Prüfpflicht-Pop-up** bei eingereichten Meldungen konsistent (A2-F-SLA-004) | `useMeldungPruefPopup` |
| H-A26 | P3 | [ ] | **Mehrere Hauptbeteiligte** (Gefangene) in UI | A2-F-STR-002 |

### A.4 Reihenfolge ERV / Abschluss (technisch)

| ID | Prio | Status | Änderungsanforderung | Andockstelle |
|----|------|--------|----------------------|--------------|
| H-A30 | P1 | [ ] | **beBPo vor eGPA** technisch erzwingen (kein Verakten ohne Versand) | `routes/index.js`, `MeldungAktionen` |
| H-A31 | P1 | [ ] | **Kein Archiv** ohne beBPo + eGPA bei ERV-Typen (UI bereits teilweise) | Backend-Validierung bei `ARCHIVED` |

---

## B – Fachliche Klärung (Workshop / Lastenheft)

Aus [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md) Kap. 6 und Cluster C.

| ID | Prio | Status | Änderungsanforderung |
|----|------|--------|----------------------|
| H-B01 | P3 | [ ] | **Vier-Augen** schriftlich finalisieren (Wer gegenzeichnet, Ausnahmen) |
| H-B02 | P3 | [ ] | **Werktags- und Nachtlogik** für SLAs (24 h, 3 Werktage) in Anhang A / Zentralregel |
| H-B03 | P3 | [ ] | Pro **Meldungstyp:** Gefangenenbezug ja/nein + Anhang-Checkliste |
| H-B04 | P3 | [ ] | **JVA-Matrix Anhang A** mit Eskalationsnamen je Standort |
| H-B05 | P3 | [ ] | Definition **„versandfähig“** (Start 3-Werktage-SLA) |
| H-B06 | P3 | [ ] | Definition **„Bearbeitung aufgenommen“** für 24-h-Messung (`IN_PROGRESS` vs. Kommentar) |
| H-B07 | P3 | [ ] | **Kammer** informieren bei gesicherten Beweismitteln (Kanal, Zeitpunkt, Pflicht) |
| H-B08 | P3 | [ ] | **Workshop-Checkliste** Pflichtfelder Strafanzeige / interne Bearbeitung ausfüllen |
| H-B09 | P3 | [ ] | **Große Korrektur** VAL/AL: Versionierung / Audit (Governance) |

---

## C – Zielprozess (noch nicht im Prototyp)

Vollständige IDs aus [12_PROTOTYP_POPUP_ZIELOPTIONEN.md](LASTENHEFT/12_PROTOTYP_POPUP_ZIELOOPTIONEN.md). Jede Zeile = **Änderungsanforderung Zielsystem** (LC-Plattform); im Prototyp nur über Pop-up sichtbar, bis als echte Aktion umgesetzt.

### C.1 Rückgabe, Korrektur, Erfassung

- [ ] **H-Z01** (Z-01) An Erfassende zurücksenden  
- [ ] **H-Z02** (Z-02) Inhalt nach Einreichung bearbeiten (siehe auch H-A03)  
- [ ] **H-Z03** (Z-03) Zweiterfassung  
- [ ] **H-Z04** (Z-04) Weitere Beteiligte einbinden  
- [ ] **H-Z05** (Z-05) Geschäftsvorgangsnummer (4W) führend  

### C.2 Qualitätssicherung

- [ ] **H-Z10** (Z-10) QS Erstinstanz  
- [ ] **H-Z11** (Z-11) QS Zweitinstanz  
- [ ] **H-Z12** (Z-12) QS abschließen / stoppen  
- [ ] **H-Z13** (Z-13) Meldepflicht prüfen  

### C.3 Bearbeitung, Organisation

- [ ] **H-Z20** (Z-20) Bearbeiter/in zuweisen (siehe H-A04)  
- [ ] **H-Z21** (Z-21) Als versandfähig markieren (siehe H-A01)  
- [ ] **H-Z22** (Z-22) Anhörungen dokumentieren  
- [ ] **H-Z23** (Z-23) Beweismittel fachlich (über Formular hinaus)  
- [ ] **H-Z24** (Z-24) Kammer bei Beweismitteln informieren (siehe H-B07)  

### C.4 Fristen, Eilmeldung

- [ ] **H-Z30** (Z-30) Eilmeldung (< 48 h) (siehe H-A06)  
- [ ] **H-Z31** (Z-31) Automatische SLA-Eskalation (E-Mail/Aufgabe)  
- [ ] **H-Z32** (Z-32) Werktags-/Feiertagslogik je JVA  

### C.5 Expertise, Gutachten, extern

- [ ] **H-Z40** (Z-40) Gutachten anfordern  
- [ ] **H-Z41** (Z-41) Gutachten erfassen & Stellungnahme  
- [ ] **H-Z42** (Z-42) Beweismittelbegutachtung  
- [ ] **H-Z43** (Z-43) Direktes Hochladen (Ausnahme ohne beBPo)  
- [ ] **H-Z44** (Z-44) Vier-Augen erzwingen (siehe H-A07)  
- [ ] **H-Z45** (Z-45) beBPo vor eGPA erzwingen (siehe H-A30)  

### C.6 Benachrichtigungen & Systeme

- [ ] **H-Z50** (Z-50) Aufgabe/E-Mail LC-Plattform  
- [ ] **H-Z51** (Z-51) Zeugen: echte Kanäle statt Mock  
- [ ] **H-Z52** (Z-52) BASIS-Web Live-Anbindung  

### C.7 Meldungstypen & UI-Lücken

- [ ] **H-Z60** (Z-60) `VORFALL_EXTERN` aktiv + Prozess  
- [ ] **H-Z61** (Z-61) Statistik / Sonstige Typen aktiv  
- [x] **H-Z62** (Z-62) ERV-Badge Liste (siehe H-A20)  
- [ ] **H-Z63** (Z-63) Mehrere Hauptbeteiligte (siehe H-A26)  

---

## G – Workshop-Protokoll „Protokoll Prototyp.txt“

Aus dem live durchgeklickten Prototyp (Rollenwechsel-Banner, Dashboard, Meldungsliste, Strafanzeige-Erfassung, Einreichung, VAL-Prüfung). IDs **H-P** = Protokoll.

### G.1 Dashboard & Meldungsliste

| ID | Prio | Status | Änderungsanforderung |
|----|------|--------|----------------------|
| H-P01 | P1 | [x] | KPI **„ERV-pflichtig & offen“** klar benennen (nicht nur „ERV-pflichtig“); Zahl muss mit gefilterter Liste **übereinstimmen** (Workshop: Anzeige „2“, Klick öffnet nur **1**) |
| H-P02 | P1 | [x] | Filter **„Überfällig“** nur überfällige Meldungen listen (Workshop: öffnet **alle**) |
| H-P03 | P1 | [x] | Filter **„Meldungen in Bearbeitung“** nur Status `IN_PROGRESS` (Workshop: 5 angezeigt, faktisch nur 1; andere Status Entwurf/Eingereicht/Weitergeleitet/Archiviert) |
| H-P04 | P2 | [x] | Kachel-Zähler und Listenfilter **fachlich abstimmen** (Dummy-Meldungen für Demo bleiben, Logik muss stimmen) |

### G.2 Geführte Demo Strafanzeige

| ID | Prio | Status | Änderungsanforderung |
|----|------|--------|----------------------|
| H-P10 | P2 | [ ] | **Demo-Strafanzeige** (rechts oben / `/meldungen/demo/strafanzeige`): „Weiter“ soll **nächsten Schritt** ausführen, nicht erneut die Schritt-für-Schritt-Einleitung öffnen |
| H-P11 | P2 | [ ] | Demo **ohne Rücksprung** auf dieselbe Eingabemaske pro Schritt – entweder **eigene Seite pro Schritt** oder Demo für Workshop **ausblenden/vereinfachen** |
| H-P12 | P3 | [ ] | Rollen-Hinweis in Demo: **aVD** für Erfassung (Workshop: „Vollzugsdienst“-Wahl scheitert; SL vs. aVD in Anleitung klären) |
| H-P13 | P3 | [ ] | Workshop-Prozess-Durchklick **in zweitem Schritt** separat von Live-Demo (Protokoll-Vorgabe) |

### G.3 Formular „Neue Meldung“ (Strafanzeige)

| ID | Prio | Status | Änderungsanforderung |
|----|------|--------|----------------------|
| H-P20 | P1 | [x] | **Tatzeit-Eingabe** prüfen/reparieren: falsche Anzeige (z. B. 13:54 eingegeben → 11:54 gespeichert); nur Hoch/Runter vs. freie Uhrzeit – [`TatzeitEingabe.jsx`](../frontend/src/components/meldung/TatzeitEingabe.jsx), Wandzeit `YYYY-MM-DDTHH:mm:00` in [`meldungen.js`](../frontend/src/utils/meldungen.js) |
| H-P21 | P2 | [x] | **Tatort:** Vorauswahl (Autocomplete statt Freitext) – [`TatortAutocomplete.jsx`](../frontend/src/components/meldung/TatortAutocomplete.jsx), [`tatorte.js`](../frontend/src/constants/tatorte.js) |
| H-P22 | P2 | [x] | **Reihenfolge Felder:** Typ → Tatvorwurf → Gefangene → Tatzeit/Tatort → Sachverhalt → Beweismittel → Upload → Zeugen → Dringend ([HAPPY_PATH](HAPPY_PATH_STRAFANZEIGE.md) §3; **ohne** Empfänger-Feld) |
| H-P53 | P2 | [x] | **Einreichungs-Dialog:** vor `SUBMITTED` Bestätigung „Was passiert als Nächstes?“ (Prüfung 24 h, ERV, Zeugen-Vorschau) – [`EinreichungFolgeaktionenDialog.jsx`](../frontend/src/components/meldung/EinreichungFolgeaktionenDialog.jsx), [HAPPY_PATH](HAPPY_PATH_STRAFANZEIGE.md) HP-16 |
| H-P23 | P2 | [x] | **Beweismittel-Upload:** Anlagetypen + erlaubte Dateiformate im Upload-Block; Kurzbeschreibung je Datei (`Anhang.beschreibung`) – [`BeweismittelDateiUpload.jsx`](../frontend/src/components/meldung/BeweismittelDateiUpload.jsx) |
| H-P24 | P2 | [ ] | Hinweis **„Dringend“** (gelbes Ausrufezeichen): Funktion in UI/Lastenheft erklären oder entfernen (Workshop: redundant zu 24-h-SLA?) |
| H-P25 | P3 | [ ] | **Gefangenen-Autocomplete:** Verhalten bei Kurzsuchbegriff „B“ dokumentieren (Namens-B vs. JVA Billwerder – Workshop: Filter wirkt, ggf. verfeinern) |
| H-P26 | P2 | [x] | **Pflichtfeld-Validierung** bei Einreichen mit verständlicher Meldung (Workshop: „einige Pflichtfelder noch nicht ausgefüllt“ – OK) |
| H-P27 | P2 | [x] | **Empfänger Strafanzeige:** **kein Formularfeld**; bei Einreichung Zuständigkeit **fachliche Prüfung (VAL)** (`empfaengerTyp: INTERN_LEITUNG`); Staatsanwaltschaft erst nach Prüfung via beBPo – [HAPPY_PATH](HAPPY_PATH_STRAFANZEIGE.md) HP-16 |

### G.4 Status, Prozesslandkarte, Aktionen

| ID | Prio | Status | Änderungsanforderung |
|----|------|--------|----------------------|
| H-P30 | P1 | [ ] | **Statusbezeichnungen** und Prozesslandkarte fachlich klären: **Entwurf** = Erfassung läuft; **Eingereicht** = eingegangen; **In Bearbeitung** = eigentlich **Prüfverfahren** (sachlich/fachlich durch Leitung), nicht Entwurf-Bearbeitung |
| H-P31 | P1 | [x] | Button **„Fachlich prüfen“** statt „In Bearbeitung nehmen“ – [`MeldungAktionen.jsx`](../frontend/src/components/meldung/MeldungAktionen.jsx) (Status weiter `IN_PROGRESS`) |
| H-P32 | P2 | [ ] | Prozesslandkarte: Schritt **„Bearbeitung“** vs. **Prüfung** in Texten und `getProzessSchritte()` angleichen |
| H-P33 | P2 | [ ] | Nach Einreichung: **Zeugen-Folgeaktionen** (Mock) in Präsentation belassen; Text „kein E-Mail-Versand“ beibehalten (Workshop bestätigt) |

### G.5 Fehlende Funktionen (Vergleich Appian QSC)

| ID | Prio | Status | Änderungsanforderung |
|----|------|--------|----------------------|
| H-P40 | P2 | [ ] | **Dynamische PDF-Erstellung** (Mock oder Hinweis im Prototyp) – Workshop: bei Appian QSC vorhanden, hier vermisst |
| H-P41 | P3 | [ ] | Kennzeichnung **„meldepflichtig“** (fachlich, ggf. getrennt von ERV-pflichtig) – Workshop aufnehmen; Abgrenzung zu `ervRelevant` / ARIS Meldepflicht |

### G.6 Offene Fragen aus dem Protokoll (→ Rückfragen)

| ID | Prio | Status | Änderungsanforderung |
|----|------|--------|----------------------|
| H-P50 | P3 | [ ] | Braucht es **„Als dringend markieren“** zusätzlich zur **24-h-SLA** für alle Meldungen? → [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md) |
| H-P51 | P3 | [ ] | Gibt es **Zeugen „ohne Meldewesen-Zugriff“**, die weder Bedienstete noch Inhaftierte sind? (JVA-Alltag) |
| H-P52 | P3 | [ ] | **Zeugen Inhaftierter / ohne Meldewesen:** Benachrichtigung an **Station/Hafthaus** (aVD/SL) – Routing im Mock mit gewähltem Haus abstimmen (Workshop bestätigt Soll) |
| H-P54 | P1 | [x] | **Rückgabe Ergänzungserfassung:** VAL/AL geben Meldung zurück, wenn Zeugen/Beweismittel **nicht in 24 h** vollständig – Nachreichung, Wiedereinreichung → [A2-F-QS-004](LASTENHEFT/02_QUERSCHNITT_ROLLEN_STATUS.md), [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) HP-26b–f, [UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md](UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md) |

### G.7 Bereits positiv bestätigt (kein To-do, Referenz)

- Rollenwechsel-Banner (Leitung / Zul-Dienste / Sonderdienste) ohne erneuten Login  
- Tatvorwurf-Dropdown nur bei **Strafanzeige** (nicht bei Meldung Gericht / intern)  
- Zeugen hinzufügen/entfernen, Typen Bediensteter / Inhaftierter / ohne Meldewesen  
- Datei-Upload im Entwurf (Größenlimit getestet), Download in Detail  
- Prozesslandkarte nach Einreichung (Entwurf → Eingereicht → … → Archiviert)  
- Demo-Hinweis Rolle wechseln zu **VAL** nach Einreichung  

---

## D – Dokumentation & Abnahme

| ID | Prio | Status | Änderungsanforderung |
|----|------|--------|----------------------|
| H-D01 | P3 | [~] | Protokoll `Protokoll Prototyp.txt` in Abschnitt **G** übernommen; optional Kopie nach `docs/` ablegen |
| H-D02 | P3 | [ ] | Word-Lastenheft aus Repo-Kapiteln synchronisieren (wöchentlicher Abgleich PD) |
| H-D03 | P3 | [ ] | Anhang A JVA-Matrix nach Workshop befüllen |
| H-D04 | P3 | [ ] | Testfälle `A2-F-TST-…` an neue Prototyp-Funktionen koppeln |

---

## E – Kurzüberblick nach Priorität (Sprint-Empfehlung)

**Sprint 1 (Prototyp):** H-P01–H-P03, H-P30, H-A01, H-A07, H-A30, H-A31 *(H-P20, H-P31 erledigt)*  
**Sprint 2:** H-P10, H-P11, H-P21–H-P24, H-P40, H-A03, H-A04, H-A24, H-A12  
**Parallel Workshop:** H-P50–H-P52, H-B01, H-B02, H-B05, H-B08  

---

## F – Verwandte Dokumente

| Dokument | Inhalt |
|----------|--------|
| [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) | **Leitfaden** klick für klick Strafanzeige (Soll + IST, HP-01–30, **Abschnitt 7** = vollständiger Hackathon-Abgleich H-P/H-A/H-B/H-Z) |
| [README.md](../README.md) | Start Backend/Frontend/Docker |
| [UEBERGABE_PROTOTYP_ENTWICKLUNG.md](UEBERGABE_PROTOTYP_ENTWICKLUNG.md) | Übergabe Entwicklung |
| [LASTENHEFT/README.md](LASTENHEFT/README.md) | Lastenheft-Kapitel |

---

## Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2026-05-20 | 0.7 | **H-P27** `[x]`: Strafanzeige ohne Empfänger-Feld; Einreichung → fachliche Prüfung (VAL); [HAPPY_PATH](HAPPY_PATH_STRAFANZEIGE.md) v0.3 |
| 2026-05-20 | 0.6 | **H-P53** Einreichungs-Dialog; [HAPPY_PATH](HAPPY_PATH_STRAFANZEIGE.md) v0.2 Abschnitt 7 Hackathon-Vollabgleich |
| 2026-05-20 | 0.5 | **H-P23:** Beweismittel-Upload mit Beschreibung pro Datei; Reihenfolge Sachverhalt → Beweismittel → Dateien |
| 2026-05-20 | 0.4 | **H-P22:** Gefangene → Tatzeit/Tatort direkt danach (`MeldungForm.jsx`) |
| 2026-05-20 | 0.3 | **H-P22** umgesetzt: Tatvorwurf direkt nach Meldungstyp in `MeldungForm.jsx` |
| 2026-05-20 | 0.2 | Abschnitt **G** aus `Protokoll Prototyp.txt` (Dashboard-Filter, Demo-Flow, Tatzeit, Status/Prüfung, PDF/Meldepflicht) |
| 2026-05-20 | 0.1 | Erstfassung To-do aus Klickpfad-Backlog, Zieloptionen-Pop-up, Rückfragen |
