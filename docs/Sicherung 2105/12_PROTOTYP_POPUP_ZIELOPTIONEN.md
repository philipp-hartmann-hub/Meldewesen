# Pop-up: Optionen des Zielprozesses (noch nicht im Prototyp)

**Version:** 0.1 | **Status:** Planung + Prototyp-Mock (Workshop)  
**Bezug:** [08_GESAMTPROZESS_ARIS.md](08_GESAMTPROZESS_ARIS.md), [11_PROTOTYP_KLICKPFAD_ERFASSUNG.md](11_PROTOTYP_KLICKPFAD_ERFASSUNG.md) Kap. 8, [09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md](09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md)

---

## 1 Zweck

Im **HEUREKA-A2-Prototyp** sind nur ein **Teil** der fachlichen und technischen Aktionen klickbar. Für **Workshops** und **Lastenheft-Abstimmung** soll ein **Pop-up** alle **im Zielprozess (ARIS / Lastenheft) vorgesehenen, im Prototyp aber noch nicht umsetzbaren Optionen** sichtbar machen – **ohne** sie als funktionierende Buttons auszugeben.

| Ziel | Nicht-Ziel |
|------|------------|
| Transparenz: „So soll es später sein“ | Vollständige LC-Plattform-Umsetzung |
| Diskussionsgrundlage mit JVA-Bediensteten | Echte Workflows, E-Mail, Aufgaben |
| Abgrenzung zu **bereits umgesetzten** Aktionen in `MeldungAktionen` | Verwechslung mit klickbaren Mock-Aktionen |

**Abgrenzung zum Pop-up „Meldungen zur fachlichen Prüfung“ (A2-F-SLA-004):** Dort geht es um **eine konkrete Benachrichtigung** bei eingereichten Meldungen. Hier geht es um die **Gesamtliste fehlender Zieloptionen**.

---

## 2 Einbindung in der UI (Prototyp)

| Element | Vorgabe |
|---------|---------|
| **Ort** | Meldungs-**Detailansicht** (`MeldungDetail`), Bereich **Aktionen** – sekundärer Button unter den klickbaren Aktionen |
| **Label Button** | „Zielprozess: weitere Optionen (nicht im Prototyp)“ |
| **Modal** | `role="dialog"`, Titel z. B. „Optionen im fertigen Prozess (noch nicht im Prototyp)“ |
| **Inhalt** | Gruppierte Liste (Accordions oder Überschriften), je Eintrag: **Kurztitel**, **1 Satz Beschreibung**, optional **typische Rolle**, **ARIS-/Lastenheft-Bezug** |
| **Fußzeile** | Hinweis: Prototyp = Validierung Kernpfad; Zielsystem = LC-Plattform + Anhang A |
| **Barrierefreiheit** | Fokus beim Öffnen, Escape schließt, `aria-labelledby` / `aria-describedby` |
| **Optional Phase 2** | Gleicher Button auf **MeldungenListe** (Toolbar) – nur wenn Workshop-Feedback es verlangt |

**Datenquelle im Code:** `frontend/src/constants/zielprozessNichtUmgesetzt.js` (eine Pflege-Stelle, synchron mit dieser Tabelle).

---

## 3 Bereits im Prototyp umgesetzt (nicht im Pop-up listen)

Diese Aktionen sind **klickbar** (Mock oder Status) und erscheinen **nicht** in der „nicht umgesetzt“-Liste:

| Aktion | Komponente / API |
|--------|------------------|
| Entwurf speichern / bearbeiten | `MeldungForm`, nur `DRAFT` |
| Einreichen | `SUBMITTED` |
| In Bearbeitung nehmen | `IN_PROGRESS` |
| Intern weiterleiten | `FORWARDED` |
| Per beBPo versenden (Mock) | `POST …/xjustiz-versand` |
| In eGPA verakten (Mock) | `POST …/verakten` |
| Abschließen (Archivieren) | `ARCHIVED` |
| Kommentar im Statusverlauf | `PATCH …/status` |
| Optionale Anhänge (Entwurf) | `POST …/anhaenge` |
| Zeugen-Folgeaktionen (Mock) | `zeugenFolgeaktionen` bei Einreichung Strafanzeige |
| SLA-Hinweise in Liste/Detail | `getSlaHinweise` |
| Pop-up Prüfpflicht bei Eingereicht | A2-F-SLA-004 |

---

## 4 Vollständige Liste: noch nicht im Prototyp (Inhalt des Pop-ups)

### 4.1 Rückgabe, Korrektur, Erfassung

| ID | Option (UI-Kurztitel) | Beschreibung (Zielprozess) | Typische Rolle | Referenz |
|----|------------------------|----------------------------|----------------|----------|
| Z-01 | An Erfassende zurücksenden | Meldung zur **Bearbeitung/Ergänzung** an die erfassende Person; Status z. B. Entwurf oder „Zurück zur Erfassung“ | QS / SL / VAL | ARIS 3.4; Q-16 |
| Z-02 | Inhalt nach Einreichung bearbeiten | **Sachverhalt/Metadaten** ändern ohne vollständige Rückgabe („große Korrektur“) | VAL / AL | Cluster C; P3 |
| Z-03 | Zweiterfassung | **Zweite unabhängige** inhaltliche Erfassung (parallel, wiederholbar) | Zweiterfassende | ARIS 3.3; Q-41 |
| Z-04 | Weitere Beteiligte einbinden | Zusätzliche Gefangene/Beteiligte nach Ersterfassung | Erfassende / Bearbeitende | ARIS 3.2 |
| Z-05 | Geschäftsvorgangsnummer (4W) | Führende **4W-Nummer** / Verknüpfung verbundener Sachverhalte | System | ARIS Anmerkung; Kap. 8 |

### 4.2 Qualitätssicherung

| ID | Option | Beschreibung | Typische Rolle | Referenz |
|----|--------|--------------|----------------|----------|
| Z-10 | QS Erstinstanz | **1. QS-Instanz** vor Freigabe; Rückfragen an Ersterfassung | QS / SL | ARIS 3.4; Q-40 |
| Z-11 | QS Zweitinstanz | **2. QS-Instanz** nach Zweiterfassung | QS / VAL | ARIS 3.4; Q-42 |
| Z-12 | QS abschließen / stoppen | QS **abgeschlossen** oder **gestoppt** (laufende Anpassungen) | QS | ARIS 3.4 |
| Z-13 | Meldepflicht prüfen | Dokumentiert: **meldepflichtig** / nicht | VAL / AL | ARIS 3.5; Q-20 |

### 4.3 Bearbeitung, Zuweisung, Organisation

| ID | Option | Beschreibung | Typische Rolle | Referenz |
|----|--------|--------------|----------------|----------|
| Z-20 | Bearbeiter/in zuweisen | **Zuständigkeit** festlegen, Warteschlange | SL / VAL | P4; Q-04 |
| Z-21 | Als versandfähig markieren | Explizites **„versandfähig“** vor beBPo (Start 3-Werktage-SLA) | VAL / AL | P1; Q-50 |
| Z-22 | Anhörungen dokumentieren | **Anhörung** durchgeführt, Ergebnis abgelegt | Bearbeitende | ARIS; Q-32 |
| Z-23 | Beweismittel (fachlich) | Sicherung/Digitalisierung **über Formular hinaus** | aVD / Station | Q-33 |
| Z-24 | Kammer informieren (Beweismittel) | **Kammer** bei gesicherten Beweismitteln | Kammer / VAL | Rückfragen Cluster C |

### 4.4 Fristen, Eilmeldung, Eskalation

| ID | Option | Beschreibung | Typische Rolle | Referenz |
|----|--------|--------------|----------------|----------|
| Z-30 | Eilmeldung (< 48 h) | **Dringliche Vorabinformation** vor vollständiger Meldung | VAL / AL | ARIS 3.7; Q-22–23 |
| Z-31 | Automatische SLA-Eskalation | **E-Mail/Aufgabe** bei 24-h / 3-Tage-Verstoß | System → SL/VAL/AL | A2-F-SLA-003 |
| Z-32 | Werktags-/Feiertagslogik | Frist **pausiert** oder verschoben (je JVA) | System | Anhang A; Q-02 |

### 4.5 Expertise, Gutachten, externe Pfade

| ID | Option | Beschreibung | Typische Rolle | Referenz |
|----|--------|--------------|----------------|----------|
| Z-40 | Gutachten anfordern | Experte / Revision / Revier | VAL / AL | ARIS 3.8; Q-34–35 |
| Z-41 | Gutachten erfassen & Stellungnahme | Rückmeldung verarbeiten | Bearbeitende | ARIS 3.8 |
| Z-42 | Beweismittelbegutachtung | Fachliche **Begutachtung** Beweismittel | Begutachtung | ARIS 3.8 |
| Z-43 | Direktes Hochladen (ohne beBPo) | **Ausnahme** statt ERV-Versand | VAL / AL | Q-55 |
| Z-44 | Vier-Augen erzwingen | System **verweigert** Archiv ohne zweite Leitungsrolle | System | A2-F-ROL-005; P7 |
| Z-45 | beBPo vor eGPA erzwingen | Reihenfolge **technisch** abgesichert | System | A2-F-SLA-001 |

### 4.6 Benachrichtigungen & Zielsystem

| ID | Option | Beschreibung | Typische Rolle | Referenz |
|----|--------|--------------|----------------|----------|
| Z-50 | Aufgabe/E-Mail (LC-Plattform) | Echte **Benachrichtigung** prüf-/bearbeitungsberechtigter Personen | System | A2-F-SLA-003/004 |
| Z-51 | Zeugen: echte Kanäle | E-Mail/Aufgabe statt Mock-Portal | System | Cluster 12 |
| Z-52 | BASIS-Web Live-Anbindung | **Stammdaten** Gefangene/Bedienstete live | System | Nicht-Ziele Prototyp |

### 4.7 Meldungstypen & UI-Lücken

| ID | Option | Beschreibung | Referenz |
|----|--------|--------------|----------|
| Z-60 | Externe Behördenmeldung | Typ `VORFALL_EXTERN` aktiv + Prozess | Inaktiver Typ |
| Z-61 | Statistik / Sonstige | Typen aktiv + Felder | Inaktiver Typ |
| Z-62 | ERV-Badge in Liste | Durchgängige **ERV-Kennzeichnung** Liste | A2-F-UI-003 |
| Z-63 | Mehrere Hauptbeteiligte | UI für **mehrere** Gefangene als Hauptperson | A2-F-STR-002 |

---

## 5 Anforderung (Lastenheft)

### A2-F-UI-007 – Pop-up Zieloptionen (nicht im Prototyp)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Soll, Workshop) |
| HEUREKA-Referenz | HEUREKA-2.0-A2-UI-007 |
| Beschreibung | Auf der Meldungs-Detailseite öffnet ein Button ein **Modal** mit **gruppierter Liste** aller im Zielprozess vorgesehenen Aktionen, die im Prototyp **noch nicht** klickbar sind (Abschnitt 4 dieses Dokuments). |
| Akzeptanzkriterium | Mindestens 20 Einträge in ≥ 5 Gruppen; deutscher Text; klarer Prototyp-Hinweis; keine irreführenden aktiven Buttons; Liste pflegbar in einer Konstantendatei. |
| Prototyp | **umgesetzt** – `MeldungZieloptionenModal`, `zielprozessNichtUmgesetzt.js`, Button in `MeldungAktionen` |
| Zielsystem | Entfällt als Pop-up – Optionen werden **echte** Workflow-Schritte |

---

## 6 Umsetzungsphasen (Backlog)

| Phase | Inhalt | Aufwand (grob) |
|-------|--------|----------------|
| **0 (jetzt)** | Konstante + Modal + Button Detail; dieses Dokument | S |
| **1** | Filter: nur Optionen anzeigen, die zur **aktuellen Meldung** passen (ERV ja/nein, Typ) | S |
| **2** | Einzelne Backlog-Punkte (P1–P7 aus Kap. 11) **aus Liste entfernen** und als echte Buttons nachziehen | je M |
| **3** | Workshop: Liste mit JVA **kürzen/ergänzen** → Anhang A / Word-Lastenheft | organisatorisch |

---

## 7 Test / Demo

| Schritt | Erwartung |
|---------|-----------|
| Meldung **eingereicht** öffnen | Button sichtbar |
| Button klicken | Modal mit Gruppen, alle Einträge **disabled**-Optik (nur Info) |
| Escape / Verstanden | Modal zu |
| Rolle wechseln (Banner) | Liste unverändert (gesamtprozessbezogen) |

---

## 8 Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2026-05-19 | 0.1 | Planung Pop-up Zieloptionen; Liste aus ARIS, Workshop-Checkliste, Backlog Kap. 11 |
