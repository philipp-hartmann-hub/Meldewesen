# Protokoll fachlicher und technischer Änderungen (A2 eMeldewesen)

Chronologisches Änderungsprotokoll zum Prototyp. Ergänzt Umsetzungsdokumente (`UMSETZUNG_*.md`) und Lastenheft.

**Pflege:** Bei jeder relevanten Anpassung Eintrag anlegen; nach Commit den Hash eintragen.  
**Regel für Cursor:** `.cursor/rules/dokumentation-nach-aenderungen.mdc`

---

## Einträge (neueste zuerst)

### 2026-11-19 – Fall-Ansichten laden nicht mehr in einer Schleife

- **Umfang:** Fall-Bündelung und Fall-Detail halten den API-Client in einem Ref. Der Lade-Effekt hängt nicht mehr vom Client-Objekt ab, das bei jedem Render neu entsteht. Sonstige Effekte im Frontend hatten `api` nicht in der Abhängigkeitsliste.
- **Code:** `FallBuendelungPanel.jsx`, `FallDetail.jsx`
- **Dokumentation:** dieser Eintrag
- **Commit:** ausstehend

### 2026-11-19 – Anzeige folgt dem Fall-Pfad

- **Umfang:** Schrittleiste, Banner und Einreichungsdialog nennen dieselbe Folge: Entwurf → Eingereicht → Zentrale bündelt → DGL prüft → SL → AL/VAL entscheidet → eGPA/ERV → Abschluss. Der aktive Schritt kommt aus Meldungs- und Fallstatus. Eine DGL-Rückgabe markiert „DGL prüft“. Zeugenbefragung steht nicht mehr in der Leiste. An einer Meldung ohne Fall gibt es keine Aktionen für fachliche Prüfung, beBPo, eGPA oder Abschluss, sondern den Hinweis „Wartet auf Bündelung durch die Zentrale“.
- **Code:** `meldungen.js`, `faelle.js`, `ProzessSchritte.jsx`, `MeldungAktionen.jsx`, `MeldungFallBanner.jsx`, `EinreichungFolgeaktionenDialog.jsx`
- **Dokumentation:** dieser Eintrag; Backend-Sperre im Eintrag darunter
- **Commit:** `e2dd73f`

### 2026-11-19 – Kein Einzelpfad ohne Fall

- **Umfang:** Jede eingereichte Meldung ohne Fall geht an die Arbeitskoordination zur Zuordnung („MEL-xxx einem Fall zuordnen“). Fachliche Prüfung, beBPo, eGPA und Abschluss gibt es an der Einzelmeldung nicht mehr. `IN_PROGRESS` und `ARCHIVED` setzt nur der Fall. Versand und Veraktung ohne Fall antworten mit 409. MEL-015 und MEL-017 stehen im Seed auf „Eingereicht“.
- **Code:** `arbeitskorbService.js`, `meldungStatusUebergaenge.js`, `routes/index.js`, `seed.js`
- **Dokumentation:** dieser Eintrag
- **Commit:** `e2dd73f`

### 2026-11-19 – Schrittleiste steuert die Arbeitskörbe

- **Umfang:** Nach dem Absenden arbeitet die Meldung die angezeigten Schritte der Reihe nach ab. Der jeweils offene Schritt liegt als Aufgabe im Arbeitskorb der zuständigen Rolle: Zeugenbefragung bei den Zeugen, danach fachliche Prüfung, beBPo, eGPA und Abschluss bei VAL und Anstaltsleitung. Die Schrittleiste markiert denselben offenen Schritt. Die Zentrale bündelt weiter nur Fälle, nicht den nächsten Einzelschritt.
- **Code:** `arbeitskorbService.js`, `routes/index.js`, `meldungen.js`, `MeldungAktionen.jsx`, `ArbeitskorbPanel.jsx`, `arbeitskorb.js`, `BenachrichtigungenGlocke.jsx`
- **Dokumentation:** dieser Eintrag
- **Commit:** `a8b3569`

### 2026-11-19 – Nutzerwechsel führt auf das Dashboard

- **Umfang:** Wechsel des Testnutzers im Prototyp-Banner setzt die Ansicht auf `/dashboard` zurück.
- **Code:** `PrototypBanner.jsx`
- **Dokumentation:** dieser Eintrag
- **Commit:** `a8b3569`

### 2026-11-17 – Vier-Augen am Fallabschluss

- **Umfang:** `MeldungsFall` erhält `entscheidVonId` und `egpaVeraktetVonId` (Relation zu `Bedienstete`). Die Meldepflicht-Entscheidung und die eGPA-Veraktung speichern die ausführende Person. Der Abschluss ist nur durch eine andere Person zulässig (409). Der Button erscheint für dieselbe Person nicht; stattdessen der Hinweis, dass AL oder VAL als zweite Person abschließen muss. Die Demo-Fälle FALL-001 und FALL-002 setzen die Felder beim Seed auf leer.
- **Code:** `schema.prisma`, `fallService.js`, `FallErvPanel.jsx`, `seed.js`
- **Dokumentation:** dieser Eintrag
- **Commit:** `a8b3569`

### 2026-06-05 – Prüfauftrag für Mitarbeiter-Abnahme

- **Umfang:** Dokument `PRUEFAUFTRAG_MITARBEITER.md` mit Aufgabenstellung, Anpassungsliste (A–H), 10 Prüfszenarien, Rollen-Matrix und E-Mail-Kurzfassung für fachliche Abnahme durch zwei Mitarbeiter.
- **Code:** —
- **Dokumentation:** `PRUEFAUFTRAG_MITARBEITER.md`, `UEBERGABE_PROTOTYP_ENTWICKLUNG.md`
- **Commit:** `08a9489`

### 2026-06-05 – Arbeitskorb: Navigation & Rollen-Konsistenz (AVD vs. VAL)

- **Umfang:** Nach Abschluss von Zeugen- und Beweismittel-Aufgaben Rückkehr zum **Arbeitskorb** (nicht Meldungsdetail). „Fachliche Prüfung aufnehmen“ nur **VAL/AL** (Frontend + Backend `IN_PROGRESS`). Prüf-Popup nur für VAL/AL. AVD-Hinweise auf Dashboard/Hub/MeldungAktionen angepasst.
- **Code:** `arbeitskorb.js` (`getNavigationNachAufgabenAbschluss`), `ArbeitskorbAufgabe.jsx`, `Arbeitskorb.jsx`, `MeldungAktionen.jsx`, `MeldungDetail.jsx`, `useMeldungPruefPopup.js`, `JVPDashboard.jsx`, `EMeldewesenHub.jsx`, `index.js` (Status-Guard)
- **Dokumentation:** `UMSETZUNG_ARBEITSKORB_NAVIGATION.md`, `HAPPY_PATH_STRAFANZEIGE.md` (HP-20a/b, HP-24, HP-26e), `LASTENHEFT/02_QUERSCHNITT_ROLLEN_STATUS.md` (A2-F-ROL-006), `LASTENHEFT/03_QUERSCHNITT_SLA_UI.md`, `UEBERGABE_PROTOTYP_ENTWICKLUNG.md`
- **Commit:** `fcdea48`

### 2026-06-05 – Beweismittel-Nachreichung: Inline-UI im Arbeitskorb

- **Umfang:** Task „Beweismittel nachreichen“ mit Ja/Nein-Feldset direkt in linker Spalte (wie Standard-Meldeprozess); gemeinsame Komponente `BeweismittelErfassung`; Abschluss via `PATCH /arbeitskorb/:id/abschliessen` + `beweismittelNachreichungService`; hervorgehobene Aufgaben-Karte mit rotem VAL-Hinweis (nicht mehr in Dokumente-Sidebar).
- **Code:** `BeweismittelErfassung.jsx`, `MeldungForm.jsx`, `ArbeitskorbAufgabe.jsx`, `DetailSeitenleiste.jsx`, `beweismittelNachreichungService.js`, `arbeitskorbService.js`
- **Dokumentation:** `UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md` (Abschn. 5, 7)
- **Commit:** `fcdea48`

### 2026-06-05 – Stabilität: Prisma-Client + Zuweisung ohne Abbruch

- **Umfang:** Gemeinsamer Prisma-Client (`prisma.js`); Benachrichtigungen blockieren Zuweisung nicht mehr, wenn Model temporär fehlt; Zuweisungsdialog: VAL nur eigene Abteilung als Standard.
- **Code:** `prisma.js`, `benachrichtigungService.js`, `server.js`, `ZuweisungSection.jsx`
- **Commit:** `fcdea48`

### 2026-06-05 – Zuweisung, Benachrichtigungs-Glocke, Frist-Eskalation

- **Umfang:** VAL/AL: Zuweisen/Ummelden/Zurück an Gruppe (MeldungDetail + Team-Übersicht); Zwei-Dropdown-Dialog (Station + Person); In-App-Glocke mit Polling; Beweismittel-Frist → Gruppenpostfach + Hierarchie-Benachrichtigung.
- **Code:** `benachrichtigungService.js`, `zuweisungMetaService.js`, `beweismittelEskalationService.js`, `arbeitskorbService.js`, `index.js`, `bediensteteService.js`, `BenachrichtigungenGlocke.jsx`, `ZuweisungSection.jsx`, `ZuweisenDialog.jsx`, `schema.prisma`
- **Dokumentation:** `UMSETZUNG_BENACHRICHTIGUNGEN.md`, `UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md`, `zielprozessNichtUmgesetzt.js`
- **Commit:** `fcdea48`

### 2026-06-05 – Beweismittel-Task: Empfänger = erfassender AVD

- **Umfang:** Nach VAL-Nachforderung erscheint die Beweismittel-Aufgabe beim **ursprünglich einreichenden AVD** (persönlich), nicht nur als Gruppenaufgabe der Gefangenen-Abteilung. Team-Übersicht zeigt den zugewiesenen Empfänger.
- **Code:** `arbeitskorbService.js` (`resolveBeweismittelEmpfaenger`, `sammleAufgabenFuerMeldung`), `dispositionService.js`, `index.js` (Rückgabe)
- **Dokumentation:** `UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md` (Zuweisungslogik)
- **Commit:** `fcdea48`

### 2026-06-05 – Beweismittel-Nachreichung: Nein mit Begründung

- **Umfang:** AVD kann bei VAL-Nachforderung weiterhin „Keine Beweismittel“ wählen; Pflichtfeld `beweismittelKeineBegruendung`; automatische AVD-Notiz bei Einreichung; Nachfordern aus Arbeitskorb „Fachliche Prüfung“ auch wenn Ersterfassung „Nein“.
- **Code:** `MeldungForm.jsx`, `MeldungDetail.jsx`, `MeldungAktionen.jsx`, `ArbeitskorbAufgabe.jsx`, `DetailSeitenleiste.jsx`, `meldungPflichtfelder.js`, `index.js`, `arbeitskorbService.js`, `TeamUebersichtPanel.jsx` (Button „Verantwortlichkeit zuweisen“)
- **Dokumentation:** `UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md`, `HAPPY_PATH_STRAFANZEIGE.md`, `LASTENHEFT/02_QUERSCHNITT_ROLLEN_STATUS.md`, `LASTENHEFT/ANHANG_B_FELDER.md`, `UEBERGABE_PROTOTYP_ENTWICKLUNG.md`
- **Commit:** `fcdea48`

### 2026-06-05 – Beweismittel-Nachreichung (Rückgabe-Weg, Erstumsetzung)

- **Umfang:** Arbeitskorb-Task `beweismittel_nachreichen`, Team-Übersicht KPI, Rückgabe ab SUBMITTED, VAL-Schnellaktion, Upload nur im Entwurf.
- **Code:** `arbeitskorbService.js`, `dispositionService.js`, `index.js`, Frontend Arbeitskorb/Team/MeldungAktionen
- **Dokumentation:** `UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md`, `HACKATHON_A2_AUFNAHME_TODOS.md` (H-P54), `HAPPY_PATH_STRAFANZEIGE.md`, Workshop-Checkliste Q-43
- **Commit:** `fcdea48`

---

## Vorlage für neue Einträge

```markdown
### YYYY-MM-DD – Kurztitel

- **Umfang:** Was sich fachlich/technisch geändert hat (1–3 Sätze)
- **Code:** betroffene Dateien/Module
- **Dokumentation:** aktualisierte oder neue Docs
- **Commit:** `hash` oder ausstehend
```
