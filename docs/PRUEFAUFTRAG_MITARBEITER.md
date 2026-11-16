# Prüfauftrag: A2 eMeldewesen-Prototyp (Stand 2026-06-05)

**Zielgruppe:** Zwei Mitarbeiter zur fachlichen Prüfung, Abstimmung und Abgleich mit besprochenen Anpassungen.  
**Repository:** https://github.com/lukasbrueck/meldewesen-a2.git  
**Relevanter Stand:** Commit `fcdea48` auf `main`

---

## Aufgabenstellung (Text an die Mitarbeiter)

**Betreff:** Prüfauftrag – A2 eMeldewesen-Prototyp (Version vom 05.06.2026)

Liebe Kolleginnen, liebe Kollegen,

ich bitte euch, die **zur Verfügung gestellte Version** des A2 eMeldewesen-Prototyps **gemeinsam fachlich zu prüfen**, euch **untereinander abzustimmen** und das Ergebnis mit den **in unseren Besprechungen vereinbarten Anpassungen** abzugleichen.

### Ziel der Prüfung

- Verifizieren, ob die umgesetzten Funktionen **fachlich stimmig** sind und den besprochenen Soll-Prozessen entsprechen.
- Prüfen, ob die **Rollen-Logik** (AVD, Stationsleitung, VAL, Anstaltsleitung) an den richtigen Stellen greift — insbesondere: Wer darf was sehen, wer bekommt welche Aufgabe, wohin führt die Navigation nach Abschluss?
- Festhalten von **Abweichungen**, **offenen Punkten** und **Verbesserungsvorschlägen** — mit klarer Zuordnung: „entspricht Besprechung“ / „weicht ab“ / „noch offen“.

### Technischer Zugang

| Punkt | Details |
|-------|---------|
| Repository | https://github.com/lukasbrueck/meldewesen-a2.git |
| Relevanter Stand | Commit `fcdea48` (plus `992adc9` nur Protokoll) auf `main` |
| Start | `docker compose up`, Frontend `:5173`, Backend `:3001` |
| Rollenwechsel | Gelbes **Prototyp-Banner** oben (kein Login) |
| Demo-Nutzer | z. B. Jana Fischer (AVD-07), Sabine Werner (VAL-01) — siehe [README.md](../README.md) |

### Vorgehen (bitte aufteilen, dann zusammenführen)

**Schritt 1 – Einzelprüfung (je 1–2 h)**

Jeder prüft **mindestens zwei Rollenperspektiven** (empfohlen: einer AVD/SL, einer VAL/AL) anhand der Szenarien unten. Dokumentiert Screenshots oder kurze Notizen zu jedem Szenario.

**Schritt 2 – Abstimmung (gemeinsam, ca. 1 h)**

- Ergebnisse gegenüberstellen: Wo seht ihr dasselbe Verhalten? Wo unterschiedlich?
- Abgleich mit Besprechungsnotizen / Workshop-Checkliste (siehe Referenzdokumente).
- Gemeinsame **Findings-Liste** erstellen (Priorität: Hoch / Mittel / Niedrig).

**Schritt 3 – Rückmeldung**

Bitte liefert **bis [Datum eintragen]**:

1. Kurzfassung (max. 1 Seite): Gesamturteil „abnahmefähig / mit Einschränkungen / nicht abnahmefähig“
2. Tabelle: Szenario × Ist-Verhalten × Soll (Besprechung) × Bewertung
3. Liste offener Punkte / Abweichungen mit Vorschlag „anpassen / dokumentieren / zurückstellen“
4. Optional: konkrete Test-Meldungen (z. B. MEL-115) mit verwendeten Demo-Nutzern

### Referenzdokumente im Repo (Abgleich-Basis)

| Dokument | Zweck |
|----------|-------|
| [PROTOKOLL_AENDERUNGEN.md](PROTOKOLL_AENDERUNGEN.md) | Chronik aller Änderungen |
| [UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md](UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md) | Beweismittel-Rückgabe & Nachreichung |
| [UMSETZUNG_ARBEITSKORB_NAVIGATION.md](UMSETZUNG_ARBEITSKORB_NAVIGATION.md) | Navigation & Rollen-Konsistenz |
| [UMSETZUNG_BENACHRICHTIGUNGEN.md](UMSETZUNG_BENACHRICHTIGUNGEN.md) | Benachrichtigungs-Glocke |
| [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) | Klickpfad Strafanzeige (HP-20a–26e) |
| [LASTENHEFT/02_QUERSCHNITT_ROLLEN_STATUS.md](LASTENHEFT/02_QUERSCHNITT_ROLLEN_STATUS.md) | Rollenmatrix, Statusübergänge |

---

## Übersicht: Umgesetzte Anpassungen (für den Abgleich)

### A. Arbeitskorb & Aufgaben

| Nr | Anpassung | Rollen |
|----|-----------|--------|
| A1 | **Arbeitskorb** mit Aufgabentypen: Zeugenaussage, Zeugenaussage Inhaftierter, Beweismittel nachreichen, Fachliche Prüfung | AVD/SL + VAL/AL |
| A2 | **5-Tier-Prioritätsmodell** mit Sortierung und Tier-Badges auf Karten | alle |
| A3 | **Gruppenaufgaben übernehmen** (PATCH übernehmen + Tab-Wechsel) | AVD/SL |
| A4 | **Zweispaltiges Layout** in Aufgabenansicht (Formular links, DetailSeitenleiste rechts) | alle |
| A5 | **Navigation nach Abschluss:** Zeugen/Beweismittel → zurück zum Arbeitskorb mit Erfolgs-Banner; Fachliche Prüfung (VAL) → Meldungsdetail | rollenabhängig |
| A6 | **Automatische Weiterleitung** nach Aufgaben-Abschluss (kein manuelles Zurücknavigieren) | alle |

### B. Beweismittel-Nachreichung (Rückgabe-Weg, A2-F-QS-004)

| Nr | Anpassung | Rollen |
|----|-----------|--------|
| B1 | VAL/AL kann Meldung **zur Ergänzungserfassung zurückgeben** (auch aus `SUBMITTED`/`FORWARDED`, nicht nur `IN_PROGRESS`) | VAL/AL |
| B2 | Neuer Arbeitskorb-Task **`beweismittel_nachreichen`** bei Rückgabe wegen Beweismittel | AVD/SL |
| B3 | **Inline-UI im Arbeitskorb:** Ja/Nein-Feldset direkt in linker Spalte (nicht nur Link „Meldung bearbeiten“) | AVD/SL |
| B4 | Gemeinsame Komponente **`BeweismittelErfassung`** (Standard-Erfassung + Nachreichung) | AVD/SL |
| B5 | **„Nein“ mit Pflicht-Begründung** weiterhin möglich; automatische **AVD-Notiz** bei Einreichung | AVD/SL |
| B6 | Nachreichung auch wenn Ersterfassung bereits „Keine Beweismittel“ — VAL kann erneut nachfordern | VAL → AVD |
| B7 | **Empfänger = ursprünglich einreichender AVD** (persönliche Aufgabe, nicht nur Gruppenpostfach) | System |
| B8 | **Frist-Eskalation:** bei Fristablauf → Gruppenpostfach + Benachrichtigung an VAL/SL | System |
| B9 | Hervorgehobene Aufgaben-Karte mit **rotem VAL-Hinweis** links (nicht mehr in Dokumente-Sidebar) | AVD/SL |
| B10 | Upload von Anhängen **nur im Status Entwurf** (`DRAFT`) | AVD/SL |

### C. Zeugenaussagen

| Nr | Anpassung | Rollen |
|----|-----------|--------|
| C1 | Zeugenaussage als **Arbeitskorb-Task** (persönlich + Inhaftierter) | AVD/SL |
| C2 | Nach Abschluss Zeugenaussage: **Rückkehr zum Arbeitskorb** — nicht fälschlich „Fachliche Prüfung“ (Fix MEL-115 / Jana Fischer) | AVD/SL |
| C3 | Zeugen-Folgeaktionen im Meldungsdetail nach Einreichung (Mock, Frist 5 Tage) | AVD |

### D. Rollen-Logik & Navigation (Kernpunkt der Prüfung)

| Nr | Regel | Wer | Technische Absicherung |
|----|-------|-----|------------------------|
| D1 | **Fachliche Prüfung aufnehmen** (`IN_PROGRESS`) | nur **VAL/AL** | Frontend-Button + Backend 403 |
| D2 | AVD bei `SUBMITTED`: **kein** Prüf-Button, stattdessen Hinweis „obliegt der VAL“ | AVD/SL | MeldungAktionen |
| D3 | **Prüf-Hinweis-Modal** (Dashboard/Liste) | nur **VAL/AL** | useMeldungPruefPopup |
| D4 | Dashboard-KPI AVD: **„Eingereichte Meldungen“** (nicht „zur Prüfung“) | AVD | JVPDashboard |
| D5 | Hub-Beschreibung Arbeitskorb **rollenabhängig** | alle | EMeldewesenHub |
| D6 | **Zur Ergänzung zurückgeben** | nur **VAL/AL** | MeldungAktionen + API |
| D7 | **beBPo / eGPA / Archivieren** | nur **VAL/AL** (ERV) | bestehend |
| D8 | **Weiterleiten** (`FORWARDED`) | AVD, SL, VAL, AL, Kammer, Zahlstelle, Arbeitskoordination | mockAuth |
| D9 | **Einreichen** (`SUBMITTED`) | alle mit Erstell-/Bearbeitungsrecht | bestehend |
| D10 | Nach Einreichen: AVD/SL → **Dashboard** (nicht Meldungsdetail) | AVD/SL | Navigation |

### E. Zuweisung & Team-Übersicht (VAL/AL)

| Nr | Anpassung | Rollen |
|----|-----------|--------|
| E1 | **4. Hub-Kategorie „Team-Übersicht“** im eMeldewesen-Hub (nur VAL/AL) | VAL/AL |
| E2 | KPI **„Beweismittel offen“**, Stationstasks, Ergänzungs-Meldungen | VAL/AL |
| E3 | **Zuweisen / Ummelden / Zurück an Gruppe** (Zwei-Dropdown: Station + Person) | VAL/AL |
| E4 | Button **„Verantwortlichkeit zuweisen“** in Team-Übersicht | VAL/AL |
| E5 | Zuweisungsdialog: VAL sieht **eigene Abteilung** als Standard | VAL |

### F. Benachrichtigungen (Prototyp)

| Nr | Anpassung | Rollen |
|----|-----------|--------|
| F1 | **Glocke im Header** mit Polling (30 s) | alle |
| F2 | Ereignisse: Aufgabe zugewiesen, zurückgezogen, neu, eskaliert | betroffene Nutzer |
| F3 | Deep-Link aus Benachrichtigung → Meldung oder Arbeitskorb-Aufgabe | alle |
| F4 | Parallel: Arbeitskorb-Badge „X neu“ (localStorage) bleibt bestehen | alle |

### G. Meldungsdetail & ERV

| Nr | Anpassung | Rollen |
|----|-----------|--------|
| G1 | **ERV-Prozesshinweise** über Aktionsblock (beBPo → eGPA → Vier-Augen-Abschluss) | VAL/AL |
| G2 | **DetailSeitenleiste** konsolidiert: Notizen, Dokumente, Verlauf | alle |
| G3 | **PDF-Export** für Meldungen | alle mit Sicht |
| G4 | **Dashboard:** erweiterter Erfolgs-Banner + neue KPI-Kacheln | alle |

### H. Bewusst nicht / noch offen (nicht als Bug werten)

- Keine echte E-Mail / LC-Plattform (nur In-App-Glocke)
- Vier-Augen ERV-Abschluss: Regel dokumentiert, **nicht** technisch erzwungen
- Zweiterfassung / QS (ARIS-Soll): **nicht** im Prototyp
- Kammer bei Beweismitteln: offene Rückfrage
- Proaktiver Hinweis bei Einreichung ohne Anhänge trotz „Beweismittel: Nein“: **offen**

---

## Pflicht-Prüfszenarien (Abnahme-Checkliste)

| # | Szenario | Rolle | Erwartetes Ergebnis |
|---|----------|-------|---------------------|
| 1 | Zeugenaussage abschließen (z. B. MEL-115, Jana Fischer) | AVD | Weiterleitung `/arbeitskorb`, grüner Banner, kein „Fachliche Prüfung“ |
| 2 | Beweismittel nachreichen inline (Ja + Anhänge) | AVD | Formular links, Abschluss → `SUBMITTED`, Rückkehr Arbeitskorb |
| 3 | Beweismittel nachreichen (Nein + Begründung) | AVD | Notiz automatisch, VAL kann Prüfung fortsetzen |
| 4 | VAL fordert Beweismittel nach (auch wenn Ersterfassung „Nein“) | VAL → AVD | Task `beweismittel_nachreichen` beim einreichenden AVD |
| 5 | Fachliche Prüfung aufnehmen | VAL | Status `IN_PROGRESS`, Button sichtbar |
| 6 | Fachliche Prüfung versuchen | AVD | Kein Button; API → 403 |
| 7 | Prüf-Popup auf Dashboard | VAL vs. AVD | Nur VAL/AL sehen Modal |
| 8 | Team-Übersicht: Beweismittel zuweisen | VAL | Glocke beim Ziel-AVD, Task in „Meine Aufgaben“ |
| 9 | Frist Beweismittel abgelaufen | System | Eskalation Gruppenpostfach + Benachrichtigung |
| 10 | ERV-Meldung nach beBPo | VAL | Blauer Hinweis „Nächster Schritt: eGPA“ |

### Vorlage: Ergebnis-Tabelle (für Rückmeldung)

| # | Szenario | Ist-Verhalten | Soll (Besprechung) | Bewertung |
|---|----------|---------------|-------------------|-----------|
| 1 | | | | entspricht / weicht ab / offen |
| 2 | | | | |
| … | | | | |

---

## Rollen-Matrix (Kurzreferenz für den Abgleich)

| Aktion | AVD/SL | VAL/AL | Sonstige |
|--------|--------|--------|----------|
| Meldung erstellen / bearbeiten (Entwurf) | ja | ja | ja* |
| Einreichen | ja | ja | ja* |
| Zeugen-/Beweismittel-Aufgaben (Arbeitskorb) | ja | nein** | nein |
| Fachliche Prüfung aufnehmen | **nein** | **ja** | nein |
| Zur Ergänzung zurückgeben | nein | ja | nein |
| Beweismittel dispositionieren (Team-Übersicht) | nein | ja | nein |
| Weiterleiten | ja | ja | Kammer/Zahlstelle/AK ja |
| beBPo / eGPA / Archivieren | nein | ja | nein |

\*je nach `mockAuth`-Berechtigung  
\*\*außer wenn selbst als Zeuge beteiligt

---

## E-Mail-Kurzfassung (copy-paste)

```
Betreff: Prüfauftrag – A2 eMeldewesen-Prototyp (Version vom 05.06.2026)

Liebe Kolleginnen, liebe Kollegen,

bitte prüft gemeinsam die aktuelle Version des A2 eMeldewesen-Prototyps und gleicht
das Ergebnis mit unseren besprochenen Anpassungen ab.

Repo: https://github.com/lukasbrueck/meldewesen-a2.git (main, Commit fcdea48)
Start: docker compose up → http://localhost:5173

Vollständiger Prüfauftrag mit Szenarien, Anpassungsliste und Rollen-Matrix:
docs/PRUEFAUFTRAG_MITARBEITER.md im Repository

Vorgehen:
1. Einzelprüfung (je 1–2 h, mindestens zwei Rollenperspektiven)
2. Gemeinsame Abstimmung (ca. 1 h)
3. Rückmeldung bis [Datum eintragen]: Kurzfassung + Ergebnis-Tabelle + offene Punkte

Referenz: docs/UMSETZUNG_*.md, docs/HAPPY_PATH_STRAFANZEIGE.md

Vielen Dank!
```
