# HEUREKA 2.0 – A2 eMeldewesen (Prototyp)

Prototyp zur Anforderungserhebung für das **digitale Meldewesen** in Hamburger Justizvollzugsanstalten (JVAs). Ziel ist die Validierung mit Bediensteten und die Ableitung eines Lastenhefts für eine spätere LC-Plattform (z. B. Appian oder ServiceNow).

Dieses Repository ist **kein** produktives System: Mock-Authentifizierung, Mock-Anbindungen (eGPA, beBPo/xJustiz, BASIS-Web).

Maßgeblich für Architektur-Konventionen im Repo: [`.cursorrules`](.cursorrules).

**Übergabe an Entwicklung** (Dateiübersicht, Klickpfad, Backlog, Konventionen):

- [docs/UEBERGABE_PROTOTYP_ENTWICKLUNG.md](docs/UEBERGABE_PROTOTYP_ENTWICKLUNG.md)

**Vorlagen für Lastenheft und Workshops** (Inhalt nach Word/PDF übernehmen):

- [docs/LASTENHEFT/](docs/LASTENHEFT/) – **ausgearbeitetes Lastenheft** (Kapitel, Anforderungen, Anhänge)  
- [docs/LASTENHEFT_GLIEDERUNG.md](docs/LASTENHEFT_GLIEDERUNG.md) – Gliederung Lastenheft  
- [docs/WORKSHOP_AGENDA.md](docs/WORKSHOP_AGENDA.md) – Agenda 90 / 120 / 180 Minuten  
- [docs/RUECKFRAGEN_UND_OFFENE_PUNKTE.md](docs/RUECKFRAGEN_UND_OFFENE_PUNKTE.md) – alle Rückfragen, Antworten, offene Punkte (**laufend pflegen**, siehe Arbeitsregel im Dokument)  

---

## Tech-Stack

| Bereich   | Technologie                          |
|----------|---------------------------------------|
| Frontend | React 18, Vite, Tailwind, React Router v6 |
| Backend  | Node.js 20, Express 4, Prisma ORM     |
| Datenbank| PostgreSQL 15                         |
| Container| Docker Compose                        |

---

## Repository-Struktur

```
a2/
├── docs/              # Vorlagen Lastenheft & Workshop
├── frontend/          # React-App (Vite)
├── backend/           # Express-API, Prisma, seed.js, data/ (BASIS-Web-Dummy-Gefangene)
├── docker-compose.yml # PostgreSQL + Backend + Frontend (Dev)
├── .env.example       # Vorlage für lokale Umgebungsvariablen
└── .cursorrules       # Projektregeln (Rollen, Routen, Design-Tokens)
```

---

## Schnellstart mit Docker

Voraussetzungen: **Docker** und **Docker Compose** (Plugin `docker compose`).

1. Im Projektroot `.env` anlegen (falls noch nicht geschehen):

   ```powershell
   copy .env.example .env
   ```

2. Stack starten:

   ```powershell
   docker compose up -d
   ```

3. Im Browser öffnen:

   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend Health: [http://localhost:3001/health](http://localhost:3001/health)

Beim Start des Backends werden **Prisma `db push`** (Schema auf die leere DB anwenden) und **`seed.js`** ausgeführt, anschließend läuft der Dev-Server mit Hot Reload. Der Seed legt u. a. **30 Demo-Gefangene** (Mock-Stammdaten statt BASIS-Web, `backend/data/basisWebDummyGefangene.js`) an.

**Stack stoppen**

```powershell
docker compose down
```

**Datenbank inkl. Volumes zurücksetzen**

```powershell
docker compose down -v
```

---

## Lokale Entwicklung ohne Docker

Voraussetzung: laufende **PostgreSQL 15** (Port 5432), Datenbank und Nutzer wie in `.env.example` oder eigene `DATABASE_URL`.

1. `.env` aus `.env.example` kopieren und Werte anpassen.

2. Abhängigkeiten installieren:

   ```powershell
   cd frontend
   npm install
   cd ..\backend
   npm install
   ```

3. Prisma Client erzeugen, Schema anwenden, Seed:

   `DATABASE_URL` wird aus **Repo-Root** `.env` und optional `backend/.env` geladen (siehe `backend/src/env.js`).

   ```powershell
   cd backend
   npm run db:generate
   npm run db:push
   npm run seed
   ```

4. Zwei Terminals:

   ```powershell
   # Terminal 1 – Backend (Port 3001)
   cd backend
   npm run dev
   ```

   ```powershell
   # Terminal 2 – Frontend (Port 5173)
   cd frontend
   npm run dev
   ```

---

## Umgebungsvariablen

Siehe [`.env.example`](.env.example). Wichtig:

| Variable        | Bedeutung |
|----------------|-----------|
| `DATABASE_URL` | PostgreSQL-Verbindungszeichenkette |
| `PORT`         | Backend-Port (Standard 3001) |
| `FRONTEND_URL` | CORS-Ursprung für das React-Frontend |
| `VITE_*`       | Build-Zeit-Variablen für das Frontend (API-URL, Verlinkungen) |

`.env` nicht ins Versionsverwaltungssystem einchecken.

---

## Mock-Authentifizierung

Es gibt **keine** echte Anmeldung. Das Backend liest HTTP-Header und setzt `req.mockNutzer`:

| Header              | Bedeutung | Beispiel |
|---------------------|-----------|----------|
| `x-mock-rolle`      | Rollencode (kleinschreibung) | `val`, `avd`, `anstaltsleitung` |
| `x-mock-nutzer-id`| Demo-Bediensteten-ID | `BD-VAL-1` |
| `x-mock-jva`      | JVA-Name | `JVA Billwerder` |
| `x-mock-abteilung`| Abteilung | `Abteilung 1` |
| `x-mock-station`  | Station | optional |

Standard ohne Header: Rolle `avd`, Nutzer `BD-AVD-1`.

Gültige Rollen und Berechtigungen sind in [backend/src/middleware/mockAuth.js](backend/src/middleware/mockAuth.js) und im Frontend in [frontend/src/context/RollenContext.jsx](frontend/src/context/RollenContext.jsx) definiert. Das **Rollenwechsel-Banner** im UI setzt die Mock-Header für API-Aufrufe.

---

## API-Überblick (Auszug)

Basis-URL: `http://localhost:3001` (unter Docker dieselbe URL vom Host aus).

| Methode | Pfad | Kurzbeschreibung |
|---------|------|------------------|
| GET | `/health` | Healthcheck |
| GET | `/api/rollen` | Aktuelle Rolle und Berechtigungen |
| GET | `/api/gefangene?search=…` oder `?list=1` | Stammdaten aus PostgreSQL (Autocomplete, JVA-Filter) |
| GET | `/api/gefangene/:id` | Einzelner Gefangene/r aus der Datenbank |
| GET | `/api/meldungstypen` | Typen inkl. ERV-Flag |
| GET | `/api/meldungen` | Liste (rollen-/JVA-gefiltert) |
| GET | `/api/meldungen/:id` | Detail inkl. Statusverlauf, Veraktung, xJustiz |
| POST | `/api/meldungen` | Meldung anlegen |
| PATCH | `/api/meldungen/:id/status` | Status ändern |
| POST | `/api/meldungen/:id/verakten` | eGPA (Mock, nur berechtigte Rollen) |
| POST | `/api/meldungen/:id/xjustiz-versand` | beBPo/xJustiz (Mock, nur VAL/AL, nur ERV-relevant) |
| GET | `/api/meldungen/:id/xjustiz-versand` | Versandverlauf |

Vollständige Konventionen: [`.cursorrules`](.cursorrules) Abschnitt Backend.

---

## Datenmodell (Kurz)

Kerntabellen in [backend/prisma/schema.prisma](backend/prisma/schema.prisma): `Meldung`, `StatusVerlauf`, `Gefangene`, `Bedienstete`, `Veraktung`, `XJustizVersand`, optional `Anhang`.

Typ-spezifische Zusatzdaten können in `Meldung.metadaten` (JSON) abgelegt werden.

Im Repo liegen **keine** Prisma-Migrate-Ordner; für Entwicklung und Docker wird **`prisma db push`** genutzt.

---

## Meldungstypen (Stand API)

Definiert in [backend/src/routes/index.js](backend/src/routes/index.js) (`GET /api/meldungstypen`):

| Code | Bezeichnung | Aktiv in API | ERV-relevant |
|------|-------------|--------------|--------------|
| `STRAFANZEIGE` | Strafanzeige | ja | ja |
| `VORFALL_INTERN` | Interner Vorfall | ja | nein |
| `MELDUNG_GERICHT` | Meldung an Gericht | ja | ja |
| `VORFALL_EXTERN` | Externe Behördenmeldung | nein | ja |
| `STATISTIK_MELDUNG` | Statistikmeldung | nein | nein |
| `SONSTIGE` | Sonstige Meldung | nein | nein |

---

## Frontend-Routen

| Pfad | Komponente | Beschreibung |
|------|-----------|--------------|
| `/` | – | Weiterleitung → `/dashboard` |
| `/dashboard` | `JVPDashboard` | Hub: KPI-Karten, Fachverfahren-Kacheln, Postfach & Hinweise |
| `/emeldewesen` | `MeldungenListe` | Meldungsübersicht (Tab „Offen" default) |
| `/meldungen` | `MeldungenListe` | wie `/emeldewesen` |
| `/meldungen/neu` | `MeldungDetail` | Neue Meldung erfassen |
| `/meldungen/:id` | `MeldungDetail` | Detailansicht (Zweispalten-Layout) |
| `/meldungen/:id/bearbeiten` | `MeldungDetail` | Entwurf bearbeiten |
| `/arbeitskorb` | `Arbeitskorb` | Persönliche Aufgaben und Gruppenaufgaben |
| `/arbeitskorb/aufgabe/:id` | `ArbeitskorbAufgabe` | Aufgaben-Detailansicht |

---

## Demo-Nutzer

Alle 20 Demo-Nutzer sind in `frontend/src/context/RollenContext.jsx` definiert. Rollenwechsel über das Banner oben rechts im UI.

### Leitungsebene

| ID | Name | Rolle | Abteilung | Station |
|----|------|-------|-----------|---------|
| AL-01 | Dr. Christine Möller | Anstaltsleitung | Leitung | – |
| AL-02 | Thomas Brandt | Anstaltsleitung (Stv.) | Leitung | – |
| VAL-01 | Sabine Werner | Vollzugsabteilungsleitung | Abteilung 1 | – |
| VAL-02 | Ralf Hoffmann | Vollzugsabteilungsleitung | Abteilung 2 | – |
| VAL-03 | Maria Kovacs | Vollzugsabteilungsleitung | Abteilung 3 | – |

### Vollzugsdienst

| ID | Name | Rolle | Abteilung | Station |
|----|------|-------|-----------|---------|
| SL-01 | Pedro Guerrero | Stationsleitung | Abteilung 1 | A1 |
| SL-02 | Katrin Hofer | Stationsleitung | Abteilung 1 | A2 |
| SL-03 | Frank Bauer | Stationsleitung | Abteilung 2 | B1 |
| AVD-01 | Yasmin Özdemir | AVD | Abteilung 1 | A1 |
| AVD-02 | Tobias Klein | AVD | Abteilung 1 | A1 |
| AVD-03 | Sandra Meier | AVD | Abteilung 1 | A2 |
| AVD-04 | Kevin Schulz | AVD | Abteilung 2 | B1 |
| AVD-05 | Nina Bergmann | AVD | Abteilung 2 | B2 |
| AVD-06 | Marcus Petric | AVD | Aufnahme | Aufnahme |
| AVD-07 | Jana Fischer | AVD | Abteilung 3 | C1 |

### Sonderdienst

| ID | Name | Rolle | Abteilung | Station |
|----|------|-------|-----------|---------|
| SD-01 | Dr. Lena Richter | Sonderdienst | Psychologischer Dienst | – |
| SD-02 | Klaus Weber | Sonderdienst | Sozialdienst | – |
| SD-03 | Dr. Ahmad Karimi | Sonderdienst | Medizinischer Dienst | – |
| SD-04 | Pfarrerin E. Krause | Sonderdienst | Seelsorge | – |
| SD-05 | Gunnar Svensson | Sonderdienst | Werkdienst | – |

---

## Architektur: Drei-Körper-Navigation

Der Prototyp folgt einer strikten Drei-Ebenen-Trennung:

```
Hub (/dashboard)
  → keine Meldungsinhalte, nur KPI-Karten und aggregierte Systemhinweise
  → Einstieg in Fachverfahren über Kacheln

Übersicht (/meldungen)
  → Zuständigkeits-Banner (Rolle, Abteilung, Station, JVA)
  → Status-Tabs: Offen | Erledigt
  → Aufgaben-Filter: Alle | Meine Aufgaben | Gruppenaufgaben
  → Kartenansicht mit "Öffnen" und "Übernehmen" (nur Gruppenaufgaben)

Detail (/meldungen/:id)
  → Zweispalten-Layout (lg:grid-cols-3)
  → Links (col-span-2): Stammdaten, Sachverhalt, Zeugen, Aktionsblock
  → Rechts (col-span-1): Anhänge, ERV-Status, Statusverlauf
  → Alle Aktionen (Prüfen, beBPo, eGPA, Abschließen) nur hier
```

### Rollenkonzept

| Code | Bezeichnung | Erfassen | Prüfen | beBPo | eGPA | Abschließen |
|------|-------------|----------|--------|-------|------|-------------|
| `avd` | Allgemeiner Vollzugsdienst | ✅ | – | – | – | – |
| `stationsleitung` | Stationsleitung | ✅ | – | – | – | – |
| `val` | Vollzugsabteilungsleitung | ✅ | ✅ | ✅ | ✅ | ✅ |
| `anstaltsleitung` | Anstaltsleitung | ✅ | ✅ | ✅ | ✅ | ✅ |
| `sonderdienst` | Sonderdienst | ✅ | – | – | – | – |

### ERV-Prozess (für ERV-relevante Meldungstypen)

```
1. Einreichung (SUBMITTED)
2. Fachliche Prüfung – VAL übernimmt (IN_PROGRESS)
3. beBPo-Versand – xJustiz-Mock (PATCH /xjustiz-versand)
4. eGPA-Veraktung – nur nach beBPo möglich (POST /verakten)
5. Abschluss/Archivierung – nur nach beBPo + eGPA möglich (ARCHIVED)
```

---

## Offene Punkte

Alle offenen fachlichen Fragen und Rückfragen sind gesammelt in:

- [`docs/RUECKFRAGEN_UND_OFFENE_PUNKTE.md`](docs/RUECKFRAGEN_UND_OFFENE_PUNKTE.md)

**Hinweis zu SLA-Werten:** Alle im Prototyp verwendeten Fristen (z. B. 24 h Prüfungsfrist, 3 Werktage beBPo-Versand) sind **Arbeitswerte**. Sie müssen im Workshop mit JVA-Bediensteten verifiziert und ggf. angepasst werden. Die Werte dienen ausschließlich zur Demonstration der SLA-Logik.

---

## Cursor Prompts

Korrekturprompts und Weiterentwicklungs-Prompts für die Arbeit mit diesem Repo liegen unter:

- [`docs/UEBERGABE_PROTOTYP_ENTWICKLUNG.md`](docs/UEBERGABE_PROTOTYP_ENTWICKLUNG.md) – Übergabedokumentation für Entwicklung
- [`.cursorrules`](.cursorrules) – Projektregeln, Konventionen, Rollenlogik (für den AI-Kontext)

---

## Design und Barrierefreiheit

- Farben: nur `jhh-*`-Tokens aus `tailwind.config.js` (keine freien Hex-Werte).
- Logo: `frontend/public/assets/Justizvollzug-Hamburg-logo.png` (nicht umbenennen, keine CSS-Filter).
- UI-Sprache: Deutsch, formelles „Sie“.

Details: [`.cursorrules`](.cursorrules) Abschnitte Frontend und WCAG.

---

## Was dieser Prototyp bewusst nicht leistet

Keine echte AD-Authentifizierung, keine echte eGPA/VIS- oder beBPo/xJustiz-Anbindung, kein Gefangenenportal (A1), kein E-Mail-Versand, keine produktiven Sicherheitsmechanismen (CSRF, Rate Limiting). Siehe [`.cursorrules`](.cursorrules) Abschnitt „Nicht in diesem Prototyp“.

---

## Lizenz / Vertraulichkeit

Inhalt und Nutzung richten sich nach den Vorgaben Ihrer Behörde bzw. des Projektleiters. Dieses README beschreibt nur den technischen Prototyp.

---

## Kontext HEUREKA 2.0

**A2 eMeldewesen** ergänzt das Konzept **A1 eGefangenenanträge**: Meldungen werden von **Bediensteten** initiiert; Außenwirkung kann ERV und xJustiz/beBPo umfassen. Kurzüberblick: [`.cursorrules`](.cursorrules) Abschnitt „Unterschied A2 zu A1“.
