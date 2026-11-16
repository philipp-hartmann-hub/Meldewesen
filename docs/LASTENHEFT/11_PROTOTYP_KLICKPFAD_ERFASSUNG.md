# Prototyp: Klickpfad Erfassung und Folgeprozess (Umsetzungsreferenz)

**Version:** 0.1 | **Stand:** 2026-05-19  
**Ziel:** Tabellarische Referenz für einen **durchgängig klickbaren** HEUREKA-A2-Prototyp – Schwerpunkt **Meldung aufnehmen** (Erfassung), Erweiterung bis **Archiviert**.  
**Quellen:** `frontend/src/App.jsx`, `MeldungForm.jsx`, `MeldungDetail.jsx`, `MeldungAktionen.jsx`, `RollenContext.jsx` (Berechtigungen), [10_PROZESSDIAGRAMM.md](10_PROZESSDIAGRAMM.md), [08_GESAMTPROZESS_ARIS.md](08_GESAMTPROZESS_ARIS.md)

**Happy Path (nur Strafanzeige, Workshop):** [HAPPY_PATH_STRAFANZEIGE.md](../HAPPY_PATH_STRAFANZEIGE.md) – Soll-Pfad klick für klick inkl. IST-Abgleich und Hackathon-To-dos.

---

## 1 Geltungsbereich

| Bereich | Im Prototyp klickbar? |
|---------|------------------------|
| Einstieg JVP → eMeldewesen | ja |
| Neue Meldung anlegen (Entwurf / Einreichen) | ja |
| Entwurf bearbeiten | ja (nur `DRAFT`) |
| Nach Einreichung: In Bearbeitung, Weiterleiten | ja (rollenabhängig) |
| ERV: beBPo, eGPA, Abschließen | ja (nur VAL/AL) |
| Strafanzeige: Zeugen + Folgeaktionen (Mock) | ja (Folgeaktionen bei `SUBMITTED`) |
| Anlagen-Upload | nein (nur Hinweisliste) |
| QS, Zweiterfassung, Meldepflicht, Eilmeldung, Gutachten (ARIS) | nein |

**Rollenwechsel im Prototyp:** gelbes **Prototyp-Banner** – gleicher Nutzer, andere Mock-Rolle (Header `X-Mock-Rolle`).

---

## 2 Routen (React Router)

| Route | Komponente | Zweck |
|-------|------------|--------|
| `/` | Redirect | → `/dashboard` |
| `/dashboard` | `JVPDashboard` | Einstieg, Kachel eMeldewesen |
| `/meldungen` | `MeldungenListe` | Liste, Filter, „+ Neue Meldung“ |
| `/meldungen/neu` | `MeldungNeu` | Formular neue Meldung |
| `/meldungen/neu?demo=strafanzeige` | `MeldungNeu` | Demo: vorausgewählt Strafanzeige |
| `/meldungen/demo/strafanzeige` | `StrafanzeigeDemo` | Geführte Demo-Startseite |
| `/meldungen/:id` | `MeldungDetail` | Detail, Aktionen, Verlauf |
| `/meldungen/:id/bearbeiten` | `MeldungDetail` (`editMode`) | Nur bei `DRAFT`: Formular |

---

## 3 Klickpfad A – Nur Erfassung (aVD / Stationsleitung)

Annahme: Rolle mit `kannMeldungErstellen` und `kannMeldungBearbeiten` (alle sieben Meldewesen-Rollen außer Admin).

| Schritt | Seite / Route | Klick oder Eingabe | Ergebnis (Status / Daten) | Hinweis |
|--------|---------------|-------------------|---------------------------|---------|
| A1 | `/dashboard` | Kachel **eMeldewesen** | Navigation `/meldungen` | |
| A2 | `/meldungen` | **+ Neue Meldung** | `/meldungen/neu` | |
| A3 | `/meldungen/neu` | Meldungstyp wählen (Radio) | Typ gesetzt | Inaktive Typen disabled |
| A3a | Formular (STRAFANZEIGE) | **Tatvorwurf** (Dropdown) direkt nach Typwahl | `metadaten.tatvorwurf` | Pflicht bei Einreichung; vor Gefangene/r |
| A4 | Formular | **Gefangene/r** (Autocomplete, Stammdaten/Dummy-DB) | `gefangeneId` | Pflicht; `GET /api/gefangene` |
| A4b | Formular (aktive Typen) | **Tatzeit**, **Tatort** direkt nach Gefangene/r | `metadaten.tatzeit`, `tatort` | Pflicht bei Einreichung |
| A5 | Formular | **Sachverhalt** | Text | Pflicht |
| A5a | aktive Typen | **Beweismittel** Ja/Nein (+ Kurztext bei Ja) | `beweismittelGesichert`, `beweismittelAngaben` | Pflicht bei Einreichung |
| A5b | aktive Typen | optional **Dateien** + **Kurzbeschreibung** je Datei | `POST …/anhaenge`, `Anhang.beschreibung` | Formate + Anlagetypen im UI |
| A5c | STRAFANZEIGE | **Zeugen** (`ZeugenEditor`) | `metadaten.zeugen[]` | nach A5b; optional |
| A6 | Formular | optional **Als dringend markieren** | `prioritaet` 0/1 | nach Zeugen (Strafanzeige: kein Empfänger-Feld) |
| A7a | STRAFANZEIGE | *(kein Formularfeld Empfänger)* | bei Einreichung: `empfaenger`/`empfaengerTyp` automatisch → fachliche Prüfung (VAL) | Tatvorwurf siehe A3a; Staatsanwaltschaft erst nach Prüfung/beBPo |
| A7b | STRAFANZEIGE | optional **Zeugen** (`ZeugenEditor`) | `metadaten.zeugen[]` | bei Einreichung: Validierung wenn Zeile begonnen |
| A7c | alle aktiven Typen | **Beweismittel** (Radio/Kurztext) | siehe A5a | Datei-Upload siehe A5b |
| A7e | VORFALL_INTERN | Interner Empfänger (Select), optional Zusatz-Fundort | `empfaengerTyp`, `empfaenger`, `fundort` | |
| A7f | MELDUNG_GERICHT | Aktenzeichen, Empfänger Gericht | `metadaten.aktenzeichen`, `empfaenger` | Empfänger bei Einreichung |
| A8a | Formular | **Als Entwurf speichern** (Submit) | `POST /api/meldungen` mit `alsEntwurf: true` → `DRAFT` | Validierung leichter (Entwurf) |
| A8b | Formular | **Einreichen** (Button) | Bestätigungsdialog → `SUBMITTED` | Volle Validierung; Strafanzeige: Backend ergänzt `zeugenFolgeaktionen` |
| A9 | `/meldungen/:id` | Lesen: Stammdaten, Zeugen, **Folgeaktionen** (wenn STRAFANZEIGE + nicht DRAFT) | Anzeige | Nach Einreichung kein Formular-Edit mehr |
| A10 | `/meldungen/:id` (nur `DRAFT`) | **Bearbeiten** (Link im Header) | `/meldungen/:id/bearbeiten` | |
| A11 | `/meldungen/:id/bearbeiten` | **Entwurf speichern** oder **Einreichen** | `PATCH /api/meldungen/:id` (+ bei Einreichen `PATCH …/status` `SUBMITTED`) | |

**API (Kurz):**

- Neu: `POST /api/meldungen` (Body siehe `MeldungForm` → `handleSubmit`)
- Entwurf aktualisieren + optional einreichen: `MeldungDetail.handleUpdate` → `PATCH /api/meldungen/:id`, bei `alsEntwurf === false` zusätzlich `PATCH …/status` mit `SUBMITTED`

---

## 4 Klickpfad B – Nach Einreichung (alle mit Bearbeiten / Weiterleiten)

| Schritt | Seite | Voraussetzung | Klick | API / Status |
|--------|-------|---------------|-------|--------------|
| B1 | `/meldungen/:id` | `SUBMITTED` oder `FORWARDED` | **In Bearbeitung nehmen** | `PATCH …/status` → `IN_PROGRESS` |
| B2 | `/meldungen/:id` | nicht `DRAFT`, nicht `ARCHIVED` | **Intern weiterleiten** | `PATCH …/status` → `FORWARDED` (`darfWeiterleiten`) |
| B3 | optional | – | Kommentar zu Aktion | `kommentar` im Body `PATCH …/status` |

---

## 5 Klickpfad C – ERV-Abschluss (nur VAL / Anstaltsleitung)

| Schritt | Seite | Voraussetzung | Klick | API / Status |
|--------|-------|---------------|-------|--------------|
| C1 | `/meldungen/:id` | `ervRelevant`, nicht `DRAFT`, noch kein beBPo | **Per beBPo versenden** | `POST /api/meldungen/:id/xjustiz-versand` |
| C2 | `/meldungen/:id` | beBPo erfolgt, noch keine eGPA | **In eGPA verakten (Mock)** | `POST /api/meldungen/:id/verakten` |
| C3 | `/meldungen/:id` | beBPo + eGPA erledigt | **Abschließen** | `PATCH …/status` → `ARCHIVED` |
| C4 | `/meldungen/:id` | `VORFALL_INTERN` (kein ERV) | **Abschließen** (ohne beBPo/eGPA) | direkt `ARCHIVED` |

Button **Abschließen** bei ERV ist deaktiviert, solange beBPo oder eGPA fehlt (UI-Logik in `MeldungAktionen`).

---

## 6 Geführte Demo Strafanzeige

| Einstieg | Beschreibung |
|----------|--------------|
| `/meldungen/demo/strafanzeige` | Schritt-für-Schritt mit `DemoLeitfaden` / SessionStorage |
| Nach Speichern | Navigation zu Detail mit `?demo=strafanzeige&schritt=…` (siehe `strafanzeigeSchritte.js`) |

Nutzen: Workshop ohne Orientierungsverlust; gleiche Aktionen wie in Pfad A/B/C.

---

## 7 Rollenmatrix: sichtbare Aktionen (Prototyp)

Abgeleitet aus `BERECHTIGUNGEN` in `RollenContext.jsx` und `MeldungAktionen.jsx`.

| Rolle | Neue Meldung | Entwurf bearbeiten | Einreichen | In Bearbeitung | Weiterleiten | beBPo | eGPA | Abschließen |
|-------|--------------|-------------------|------------|-----------------|--------------|-------|------|-------------|
| `avd` | ● | ● | ● | ● | ● | ○ | ○ | ○ |
| `stationsleitung` | ● | ● | ● | ● | ● | ○ | ○ | ○ |
| `val` | ● | ● | ● | ● | ● | ● | ● | ● |
| `anstaltsleitung` | ● | ● | ● | ● | ● | ● | ● | ● |
| `kammer` | ● | ● | ● | ● | ● | ○ | ○ | ○ |
| `zahlstelle` | ● | ● | ● | ● | ● | ○ | ○ | ○ |
| `arbeitskoordination` | ● | ● | ● | ● | ● | ○ | ○ | ○ |

● = Button wird angezeigt (sofern Status passt). ○ = nicht angeboten.

---

## 8 Backlog: nächste Schritte für „tatsächlich klickbarer“ Gesamtprototyp

Priorisierung für Umsetzung (Cursor / Sprint); Bezug [09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md](09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md).

| Prio | Thema | User Story (Kurz) | Technische Andockstelle |
|------|--------|-------------------|-------------------------|
| P1 | **Versandfähig** | „Als versandfähig markieren“ vor beBPo (nur VAL/AL) | neues Flag in `metadaten` oder Status `READY_TO_SEND` (Schema + API + UI) |
| P2 | **Anlagen Mock** | Datei auswählen, Name/Typ speichern, in Detail anzeigen | `Anhang`-Modell existiert; Upload-Route + Formular |
| P3 | **Bearbeitung nach Einreichung** | Sachverhalt korrigieren ohne zurück auf Entwurf | Policy: wer darf `PATCH` Inhalt bei `SUBMITTED`? + UI |
| P4 | **Zuweisung** | „Bearbeiter/in: …“ / Warteschlange sichtbar | `metadaten.zugewiesenAn` + Filter Liste |
| P5 | **QS simulieren** | Ein Klick „QS abgeschlossen“ (Workshop-Demo) | optionaler Status oder Audit-Eintrag |
| P6 | **Eilmeldung** | Separater Schritt bei Frist &lt; 48 h | UI + Flag, kein echtes ERV |
| P7 | **Vier-Augen erzwingen** | Backend verweigert `ARCHIVED` ohne zweite Rolle | `mockAuth` + `PATCH` status |

---

## 9 Abgleich ARIS „Ersterfassung“ ↔ dieser Klickpfad

| ARIS (Kurz) | Prototyp-Schritt |
|-------------|------------------|
| Eckdaten, Aussage, Anlagen | A4–A7, Hinweis Anlagen |
| Geschäftsvorgangsnummer 4W | implizit `meldungsNr` |
| Weitere Beteiligte / QS | nicht in Pfade A–C |
| Rückgabe Ergänzungserfassung (VAL/AL → Entwurf) | nicht im Prototyp | A2-F-QS-004, Happy Path HP-26b–f |
| Einreichung = offizieller Eingang | A8b / A11 Einreichen |

---

## 10 Verwandte Dokumente

| Datei | Inhalt |
|-------|--------|
| [10_PROZESSDIAGRAMM.md](10_PROZESSDIAGRAMM.md) | Mermaid-Gesamtübersicht |
| [08_GESAMTPROZESS_ARIS.md](08_GESAMTPROZESS_ARIS.md) | ARIS-Soll vs. Prototyp |
| [09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md](09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md) | Fachliche Prüfpunkte Bearbeitung |
| [02_QUERSCHNITT_ROLLEN_STATUS.md](02_QUERSCHNITT_ROLLEN_STATUS.md) | Status und Matrix |
| [03_QUERSCHNITT_SLA_UI.md](03_QUERSCHNITT_SLA_UI.md) | SLA nach Einreichung |

---

## 11 Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2026-05-19 | 0.1 | Erstfassung Klickpfad Erfassung + ERV + Backlog |
