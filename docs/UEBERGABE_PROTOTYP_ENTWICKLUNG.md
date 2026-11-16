# Übergabe: A2 eMeldewesen – Prototyp für Entwicklung

**Zielgruppe:** Entwickler:in, die den ersten Prototypen auf Basis dieses Repositories weiterprogrammiert.  
**Stand:** Mai 2026 (aus Projektarbeit inkl. Chat-Session dokumentiert)  
**Projekt:** HEUREKA 2.0 · Prototyp A2 · Digitales Meldewesen (JVAs Hamburg)

---

## 1 Einstieg in 15 Minuten

| Schritt | Aktion |
|--------|--------|
| 1 | Repository klonen / Ordner `a2` öffnen |
| 2 | **Maßgeblich:** [`.cursorrules`](../.cursorrules) lesen (Rollen, Routen, Design, API, was nicht verändert werden darf) |
| 3 | [README.md](../README.md) – `docker compose up`, URLs Frontend `5173`, Backend `3001` |
| 4 | Im Browser: gelbes **Prototyp-Banner** → Rolle wechseln (aVD, SL, VAL, AL, …) |
| 5 | Klickpfad: Dashboard → Meldungen → Neu / Detail → Demo Strafanzeige |
| 6 | Fachlich: [docs/LASTENHEFT/11_PROTOTYP_KLICKPFAD_ERFASSUNG.md](LASTENHEFT/11_PROTOTYP_KLICKPFAD_ERFASSUNG.md) |
| 7 | Offene Punkte: [docs/RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md) |

**Wichtig:** Kein echtes SSO, kein echtes ERV/eGPA/BASIS – nur Mock-Header und Seed-Daten.

---

## 2 Was dieser Prototyp kann (Kernfunktionen)

| Bereich | Umsetzung |
|---------|-----------|
| Meldungstypen | `STRAFANZEIGE`, `VORFALL_INTERN`, `MELDUNG_GERICHT` aktiv; weitere Typen sichtbar, **disabled** („in Planung“) |
| Erfassung | Formular mit Pflichtfeldern bei **Einreichung**: Tatzeit, Tatort, Sachverhalt, Gefangene/r, Beweismittel (Ja/Nein + Text bei Ja); Strafanzeige: Tatvorwurf, Zeugen |
| Status | `DRAFT` → `SUBMITTED` → `IN_PROGRESS` / `FORWARDED` → `ARCHIVED` |
| Rollen | Mock via `X-Mock-*`-Header; Matrix in Lastenheft Kap. 6.3 |
| ERV | Mock beBPo + eGPA (nur VAL/AL); ERV-Badge |
| Zeugen (Strafanzeige) | `metadaten.zeugen[]`; Folgeaktionen Mock bei Einreichung |
| Anhänge | Upload nur im **Entwurf** (`POST …/anhaenge`, multer) |
| SLA-Hinweise | Überfällig / 24-h in Liste und Detail |
| Workshop-UI | Pop-up **Prüfpflicht** bei eingereichten Meldungen; Pop-up **Zieloptionen nicht im Prototyp** |

---

## 3 Ergebnisse aus der fachlichen Diskussion (Kurz)

Diese Punkte wurden im Projektchat / Lastenheft festgehalten – für Implementierung und Workshops relevant:

| Thema | Stand |
|-------|--------|
| **Pflichtangaben Einreichung** | Tatzeit, Tatort, Sachverhalt, Hauptgefangene/r, Beweismittel; Zeugen bedingt – A2-F-ERF-001/002 |
| **Optionale Anhänge** | Fotos/Liste Beweismittel, nur Entwurf – A2-F-ERF-003 |
| **Zeugen-Benachrichtigung** | Bediensteter → Mitteilung im System; inhaftiert/ohne Meldewesen → aVD/SL Station/Hafthaus – A2-F-STR-008 |
| **Nach Einreichung** | 24-h-SLA Bearbeitung aufnehmen; keine automatische E-Mail im Prototyp |
| **Fachliche Prüfung** | Keine feste Einzelrolle; SL/aVD Übernahme, VAL/AL für ERV/Abschluss |
| **Rückgabe Ergänzungserfassung (Beweismittel/Zeugen)** | **Umgesetzt** (A2-F-QS-004): VAL/AL → Entwurf, Arbeitskorb-Task, Team-Übersicht; AVD kann bei Nachreichung **Ja** (Anhänge) oder **Nein** mit Begründung wählen → [UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md](UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md) |
| **Arbeitskorb-Navigation & Rollen** | **Umgesetzt:** Zeugen/Beweismittel-Abschluss → Arbeitskorb; fachliche Prüfung nur VAL/AL → [UMSETZUNG_ARBEITSKORB_NAVIGATION.md](UMSETZUNG_ARBEITSKORB_NAVIGATION.md) |
| **Zweiterfassung / QS** | ARIS-Soll, **nicht** im Prototyp |
| **Kammer bei Beweismitteln** | Offene Rückfrage (Cluster C) |
| **Pop-ups** | (1) Hinweis Prüfpflicht, (2) Liste aller noch fehlenden Zieloptionen |

Details und Chronik: [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md).

---

## 4 Repository-Übersicht (Top-Level)

| Pfad | Zweck |
|------|--------|
| [`.cursorrules`](../.cursorrules) | **Verbindliche** Projektregeln (Priorität vor älteren Docs) |
| [`README.md`](../README.md) | Schnellstart Docker, lokale Dev, API-Übersicht |
| [`.env.example`](../.env.example) | Umgebungsvariablen-Vorlage |
| [`.gitignore`](../.gitignore) | u. a. `node_modules/`, `backend/uploads/`, `.env` |
| [`docker-compose.yml`](../docker-compose.yml) | PostgreSQL + Backend + Frontend (Dev) |
| **`docs/`** | Lastenheft, Workshop, Rückfragen, **diese Übergabe** |
| **`frontend/`** | React 18 + Vite + Tailwind |
| **`backend/`** | Express + Prisma + PostgreSQL |

**Nicht versionieren / ignorieren:** `node_modules/`, `frontend/dist/` (Build), `backend/uploads/` (hochgeladene Dateien).

---

## 5 Dokumentation (`docs/`)

### 5.1 Steuerung und Übergabe

| Datei | Inhalt |
|-------|--------|
| **`UEBERGABE_PROTOTYP_ENTWICKLUNG.md`** | **Diese Datei** – Einstieg für Entwicklung |
| [PROTOKOLL_AENDERUNGEN.md](PROTOKOLL_AENDERUNGEN.md) | **Chronik** aller Prototyp-Änderungen inkl. Commit-Referenz (**nach jeder Anpassung**) |
| `UMSETZUNG_*.md` | Tiefe Umsetzungsdokumentation je Fachthema (z. B. Beweismittel-Nachreichung) |
| [PRUEFAUFTRAG_MITARBEITER.md](PRUEFAUFTRAG_MITARBEITER.md) | Prüfauftrag für fachliche Abnahme (Stand 2026-06-05) |
| [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md) | Alle Rückfragen, Beschlüsse, offene Punkte (**laufend pflegen**) |
| [LASTENHEFT_GLIEDERUNG.md](LASTENHEFT_GLIEDERUNG.md) | Gliederung Word/PDF-Lastenheft |
| [WORKSHOP_AGENDA.md](WORKSHOP_AGENDA.md) | Workshop 90 / 120 / 180 Min. |
| [eMeldewesen_Prozess_ARIS.txt](eMeldewesen_Prozess_ARIS.txt) | Rohtext aus ARIS-BPMN (Referenz) |

### 5.2 Lastenheft-Arbeitsdokumente (`docs/LASTENHEFT/`)

Index: [LASTENHEFT/README.md](LASTENHEFT/README.md)

| Datei | Inhalt | Für Entwicklung besonders |
|-------|--------|---------------------------|
| [00_PHASE0_ARBEITSHILFE.md](LASTENHEFT/00_PHASE0_ARBEITSHILFE.md) | ID-Schema `A2-F-…`, HEUREKA-Referenz | Anforderungs-IDs |
| [01_KAPITEL_RAHMEN.md](LASTENHEFT/01_KAPITEL_RAHMEN.md) | Zielbild, Nicht-Ziele Prototyp | Scope |
| [02_QUERSCHNITT_ROLLEN_STATUS.md](LASTENHEFT/02_QUERSCHNITT_ROLLEN_STATUS.md) | Rollenmatrix, Statusübergänge | **Pflicht** |
| [03_QUERSCHNITT_SLA_UI.md](LASTENHEFT/03_QUERSCHNITT_SLA_UI.md) | SLA, nach Einreichung, UI-Anforderungen | SLA, Pop-ups |
| [04_MELDUNGSTYP_STRAFANZEIGE.md](LASTENHEFT/04_MELDUNGSTYP_STRAFANZEIGE.md) | Strafanzeige, Zeugen, beBPo | Typ STRAFANZEIGE |
| [05_MELDUNGSTYP_INTERN_GERICHT.md](LASTENHEFT/05_MELDUNGSTYP_INTERN_GERICHT.md) | Intern, Gericht | Typen INTERN/GERICHT |
| [06_MELDUNGSTYP_INAKTIV.md](LASTENHEFT/06_MELDUNGSTYP_INAKTIV.md) | Inaktive Typen | UI disabled |
| [07_ABNAHME_UND_ANHANG.md](LASTENHEFT/07_ABNAHME_UND_ANHANG.md) | Testfälle `A2-F-TST-…` | Abnahme |
| [08_GESAMTPROZESS_ARIS.md](LASTENHEFT/08_GESAMTPROZESS_ARIS.md) | ARIS-Soll vs. Prototyp-Lücken | Zielprozess |
| [09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md](LASTENHEFT/09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md) | Prüfpunkte nach Einreichung | Fachliche Prüfung |
| [10_PROZESSDIAGRAMM.md](LASTENHEFT/10_PROZESSDIAGRAMM.md) | Mermaid-Diagramme | Visualisierung |
| [11_PROTOTYP_KLICKPFAD_ERFASSUNG.md](LASTENHEFT/11_PROTOTYP_KLICKPFAD_ERFASSUNG.md) | Routen, API, Rollen, **Backlog P1–P7** | **Implementierung** |
| [12_PROTOTYP_POPUP_ZIELOPTIONEN.md](LASTENHEFT/12_PROTOTYP_POPUP_ZIELOPTIONEN.md) | Pop-up „nicht im Prototyp“ | Workshop-UI |
| [ANHANG_A_JVA_MATRIX.md](LASTENHEFT/ANHANG_A_JVA_MATRIX.md) | JVA-Abweichungen (Vorlage) | später |
| [ANHANG_B_FELDER.md](LASTENHEFT/ANHANG_B_FELDER.md) | `metadaten`-Felder, Pflichten | **Datenmodell UI** |

**Empfohlene Lesereihenfolge:** `.cursorrules` → 11 → 02 → ANHANG_B → 04 → RUECKFRAGEN.

---

## 6 Backend (`backend/`)

### 6.1 Wichtige Dateien

| Datei | Zweck |
|-------|--------|
| [`package.json`](../backend/package.json) | Dependencies: express, prisma, multer, pdfkit, … |
| [`seed.js`](../backend/seed.js) | Demo-Daten (Bedienstete, Meldungen); Gefangene: 30 BASIS-Web-Mock-Stammdaten in [`data/basisWebDummyGefangene.js`](../backend/data/basisWebDummyGefangene.js) |
| [`prisma/schema.prisma`](../backend/prisma/schema.prisma) | DB-Schema: Meldung, Anhang, StatusVerlauf, Veraktung, XJustizVersand, … |
| [`src/server.js`](../backend/src/server.js) | Express-Start, CORS, Routen-Mount |
| [`src/middleware/mockAuth.js`](../backend/src/middleware/mockAuth.js) | **NICHT ohne Abstimmung ändern** – Rollen + Berechtigungen |
| [`src/utils/rollen.js`](../backend/src/utils/rollen.js) | **NICHT ändern** – Rollennormalisierung |
| [`src/utils/meldungPflichtfelder.js`](../backend/src/utils/meldungPflichtfelder.js) | Validierung Einreichung (Backend) |
| [`src/routes/index.js`](../backend/src/routes/index.js) | Haupt-API: Meldungen, Status, beBPo, eGPA, … |
| [`src/routes/meldungAnhaenge.js`](../backend/src/routes/meldungAnhaenge.js) | Upload/Download Anhänge (multer) |
| [`src/services/zeugenFolgeaktionenService.js`](../backend/src/services/zeugenFolgeaktionenService.js) | Mock Zeugen-Benachrichtigungen bei Einreichung |
| [`uploads/meldungen/`](../backend/uploads/) | Laufzeit-Uploads (gitignored) |

### 6.2 API-Endpunkte (Kurz)

Vollständig in `.cursorrules` Abschnitt 5.2.

```
GET    /health
GET    /api/rollen
GET    /api/gefangene?search=
GET    /api/meldungstypen
GET    /api/meldungen
GET    /api/meldungen/:id          (+ anhaenge, statusVerlauf, …)
POST   /api/meldungen
PATCH  /api/meldungen/:id          (nur DRAFT)
PATCH  /api/meldungen/:id/status
POST   /api/meldungen/:id/anhaenge
GET    /api/meldungen/:meldungId/anhaenge/:anhangId/file
POST   /api/meldungen/:id/verakten
POST   /api/meldungen/:id/xjustiz-versand
GET    /api/meldungen/:id/xjustiz-versand
```

**Mock-Header (Pflicht für API-Calls):** `X-Mock-Rolle`, `X-Mock-Nutzer-ID`, `X-Mock-JVA`, `X-Mock-Haus`, `X-Mock-Station`.

---

## 7 Frontend (`frontend/src/`)

### 7.1 Einstieg und Shell

| Datei | Zweck |
|-------|--------|
| [`main.jsx`](../frontend/src/main.jsx) | React-Root |
| [`App.jsx`](../frontend/src/App.jsx) | Routen |
| [`styles/index.css`](../frontend/src/styles/index.css) | Open Sans, Design-Tokens |
| [`tailwind.config.js`](../frontend/tailwind.config.js) | `jhh-*`-Farben |
| [`vite.config.js`](../frontend/vite.config.js) | Dev-Server, Proxy optional |

**Layout (laut `.cursorrules` möglichst nicht ändern):**

| Datei | Zweck |
|-------|--------|
| [`components/layout/Header.jsx`](../frontend/src/components/layout/Header.jsx) | Logo (weißer Kasten, kein Filter) |
| [`components/layout/PageLayout.jsx`](../frontend/src/components/layout/PageLayout.jsx) | Pflicht-Layout aller Seiten |
| [`components/layout/Breadcrumb.jsx`](../frontend/src/components/layout/Breadcrumb.jsx) | Brotkrumen |
| [`components/layout/PrototypBanner.jsx`](../frontend/src/components/layout/PrototypBanner.jsx) | Gelbes Banner, Rollenwechsel |

### 7.2 Kontext und API

| Datei | Zweck |
|-------|--------|
| [`context/RollenContext.jsx`](../frontend/src/context/RollenContext.jsx) | **NICHT ohne Abstimmung ändern** – `ROLLEN_CONFIG`, `BERECHTIGUNGEN`, `DEMO_NUTZER` |
| [`api/client.js`](../frontend/src/api/client.js) | **NICHT ändern** – `useApiClient()`, JSON + Mock-Header |
| [`api/meldungAnhaengeApi.js`](../frontend/src/api/meldungAnhaengeApi.js) | FormData-Upload (getrennt wegen .cursorrules) |

### 7.3 Seiten (`pages/`)

| Datei | Route | Zweck |
|-------|-------|--------|
| [`JVPDashboard.jsx`](../frontend/src/pages/JVPDashboard.jsx) | `/dashboard` | JVP-Einstieg, Kennzahlen, Pop-up Prüfpflicht |
| [`MeldungenListe.jsx`](../frontend/src/pages/MeldungenListe.jsx) | `/meldungen` | Tabelle, Filter, Pop-up Prüfpflicht |
| [`MeldungNeu.jsx`](../frontend/src/pages/MeldungNeu.jsx) | `/meldungen/neu` | Neue Meldung |
| [`MeldungDetail.jsx`](../frontend/src/pages/MeldungDetail.jsx) | `/meldungen/:id`, `…/bearbeiten` | Detail, Aktionen, Anhänge |
| [`StrafanzeigeDemo.jsx`](../frontend/src/pages/StrafanzeigeDemo.jsx) | `/meldungen/demo/strafanzeige` | Geführter Demo-Durchlauf |

### 7.4 Meldungs-Komponenten (`components/meldung/`)

| Datei | Zweck |
|-------|--------|
| [`MeldungForm.jsx`](../frontend/src/components/meldung/MeldungForm.jsx) | Hauptformular (Typ, Pflichtfelder, Zeugen, Anhänge) |
| [`MeldungAktionen.jsx`](../frontend/src/components/meldung/MeldungAktionen.jsx) | Status, beBPo, eGPA, Abschluss, Button Zieloptionen |
| [`GefangeneAutocomplete.jsx`](../frontend/src/components/meldung/GefangeneAutocomplete.jsx) | Gefangene/r suchen |
| [`ZeugenEditor.jsx`](../frontend/src/components/meldung/ZeugenEditor.jsx) | Zeugen erfassen |
| [`ZeugenAnzeige.jsx`](../frontend/src/components/meldung/ZeugenAnzeige.jsx) | Zeugen in Detail |
| [`ZeugenFolgeaktionenAnzeige.jsx`](../frontend/src/components/meldung/ZeugenFolgeaktionenAnzeige.jsx) | Mock-Folgeaktionen |
| [`ProzessSchritte.jsx`](../frontend/src/components/meldung/ProzessSchritte.jsx) | Prozesslandkarte |
| [`StatusVerlaufListe.jsx`](../frontend/src/components/meldung/StatusVerlaufListe.jsx) | Statusverlauf |
| [`DemoLeitfaden.jsx`](../frontend/src/components/meldung/DemoLeitfaden.jsx) | Demo-Banner Strafanzeige |
| [`DemoAktionHighlight.jsx`](../frontend/src/components/meldung/DemoAktionHighlight.jsx) | Demo-Hervorhebung |
| [`MeldungPruefHinweisModal.jsx`](../frontend/src/components/meldung/MeldungPruefHinweisModal.jsx) | Pop-up Prüfpflicht (A2-F-SLA-004) |
| [`MeldungZieloptionenModal.jsx`](../frontend/src/components/meldung/MeldungZieloptionenModal.jsx) | Pop-up Zieloptionen (A2-F-UI-007) |

### 7.5 Shared, Utils, Constants, Hooks

| Datei | Zweck |
|-------|--------|
| [`components/shared/StatusBadge.jsx`](../frontend/src/components/shared/StatusBadge.jsx) | Status + `ERVBadge` |
| [`utils/meldungen.js`](../frontend/src/utils/meldungen.js) | Formatierung, SLA, Labels |
| [`constants/zeugen.js`](../frontend/src/constants/zeugen.js) | Zeugen-Typen, Validierung |
| [`constants/strafanzeigeUntertypen.js`](../frontend/src/constants/strafanzeigeUntertypen.js) | Tatvorwurf BTM/aoV/Diebstahl |
| [`constants/zielprozessNichtUmgesetzt.js`](../frontend/src/constants/zielprozessNichtUmgesetzt.js) | Liste fürs Zieloptionen-Pop-up (sync mit Kap. 12) |
| [`hooks/useMeldungPruefPopup.js`](../frontend/src/hooks/useMeldungPruefPopup.js) | Logik Prüfpflicht-Pop-up |
| [`demo/strafanzeigeSchritte.js`](../frontend/src/demo/strafanzeigeSchritte.js) | Demo-Schritte 1–9 |

### 7.6 Statische Assets

Logo laut `.cursorrules`: `frontend/public/assets/Justizvollzug-Hamburg-logo.png` (Dateiname **nicht** umbenennen). Falls fehlend: aus Starter-Repo / Team bereitstellen.

---

## 8 Dateien, die Sie nicht ändern sollten (ohne Abstimmung)

| Bereich | Dateien |
|---------|---------|
| Rollen / Demo-Nutzer | `RollenContext.jsx`, `mockAuth.js`, `PrototypBanner.jsx` (Reihenfolge Rollen) |
| API-Client | `frontend/src/api/client.js` |
| Rollen-Utils | `backend/src/utils/rollen.js` |
| Layout-Shell | `frontend/src/components/layout/*` (Header, PageLayout, …) |
| Prisma-Enum Rollen | `schema.prisma` `RolleTyp` – nur mit vier Dateien-Sync laut `.cursorrules` |

**Neue Rolle:** Nur über die vier in `.cursorrules` Abschnitt 2.2 genannten Stellen + `PrototypBanner`.

---

## 9 Priorisiertes Backlog (aus Lastenheft Kap. 11)

| Prio | Thema | Anknüpfung |
|------|--------|------------|
| P1 | „Versandfähig“ markieren | `metadaten` oder Status vor beBPo |
| P2 | Anlagen (bereits teilweise: Upload Entwurf) | `Anhang`, ggf. nach Einreichung lesbar |
| P3 | Inhalt nach Einreichung bearbeiten / Zurück an Erfassende | Policy + API + UI |
| P4 | Bearbeiter-Zuweisung | `metadaten.zugewiesenAn` |
| P5 | QS simulieren (Workshop) | Audit-Eintrag |
| P6 | Eilmeldung | Flag + UI |
| P7 | Vier-Augen + beBPo-vor-eGPA **erzwingen** | Backend-Validierung |

Weitere Lücken: [12_PROTOTYP_POPUP_ZIELOPTIONEN.md](LASTENHEFT/12_PROTOTYP_POPUP_ZIELOPTIONEN.md) (29 Einträge Z-01 … Z-63).

---

## 10 Konventionen (Kurz)

| Thema | Regel |
|-------|--------|
| Sprache UI | Deutsch, **Sie** |
| Code / API | Englisch (`meldungsTyp`, Routen, Variablen) |
| Rollencodes | **lowercase** (`stationsleitung`, `val`, …) |
| Farben | Nur `jhh-*` aus `tailwind.config.js` |
| Status UI | Entwurf · Eingereicht · In Bearbeitung · Weitergeleitet · Archiviert |
| Commits | Nur auf Anfrage; keine Secrets in Git |

---

## 11 Docker und lokale Entwicklung

```powershell
copy .env.example .env
docker compose up -d
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001/health
```

Ohne Docker: siehe [README.md](../README.md) – PostgreSQL, `npm install` in `backend/` und `frontend/`, `npm run db:push` (lädt `.env` aus Projektroot und optional `backend/.env`, siehe `backend/src/env.js`), `npm run seed`, `npm run dev`.

---

## 12 Kontakt / Pflege

- **Fachliche offene Punkte:** immer in [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md) eintragen (Chronik oben).
- **Zieloptionen-Pop-up:** Liste in `zielprozessNichtUmgesetzt.js` mit [12_PROTOTYP_POPUP_ZIELOPTIONEN.md](LASTENHEFT/12_PROTOTYP_POPUP_ZIELOPTIONEN.md) synchron halten.
- **Widersprüche:** `.cursorrules` > Lastenheft-Entwurf > Chat.

---

## 13 Änderungshistorie

| Datum | Änderung |
|-------|----------|
| 2026-05-19 | Erstversion Übergabedokument für Entwicklung |
