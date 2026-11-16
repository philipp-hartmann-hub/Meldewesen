# Kapitel 1–4 – Rahmen (Lastenheft A2 eMeldewesen)

**Version:** 0.3 | **Status:** Phase 1 ausformuliert (Entwurf 0.x)  
**Autor/in:** PD | **Vertraulichkeit:** Intern

---

## 1 Management Summary

Das Vorhaben **HEUREKA 2.0 – A2 eMeldewesen** liefert einen **Prototyp** zur Anforderungserhebung für das digitale Meldewesen in **mehreren Hamburger JVAs**. Bedienstete erfassen, bearbeiten und leiten Meldungen rollen- und statusbezogen; bei ERV-relevanten Vorgängen sind Veraktung (eGPA) und externer Versand (beBPo/xJustiz) im Soll-Prozess vorgesehen – im Prototyp als **Mock**.

**Nutzen für Bedienstete:** eine Oberfläche für Meldungen, nachvollziehbarer Status, klare Zuständigkeiten, Vorbereitung verbindlicher Regeln für die spätere **LC-Plattform** (Produkt offen).

**Einordnung im JVP:** A2 ist über das **gemeinsame JVP-Dashboard** mit **A1 (eGefangenenanträge)** verlinkt; fachlich getrennte Prozesse, ein Einstieg für Bedienstete.

### Abgrenzung zu A1 (eGefangenenanträge)

| Aspekt | A1 | A2 |
|--------|----|----|
| Initiiert von | Bedienstete (für Gefangene) | Bedienstete |
| Gefangenenportal | Ja | Nein |
| Außenwirkung | Intern + eGPA | Intern + eGPA + xJustiz/beBPo |
| ERV-Pflicht | Nein | Ja (z. B. Strafanzeige, Gerichtsmeldung) |
| Einstieg UI | JVP-Dashboard | JVP-Dashboard (Kachel eMeldewesen) |

### Meilensteine (Termine vom Fachauftrag einzutragen)

| Phase | Inhalt | Termin (Soll) |
|-------|--------|----------------|
| M1 | Prototyp lauffähig, Demo intern | *[PD: Datum eintragen]* |
| M2 | Workshop(s) mit JVAs | *[PD: Datum eintragen]* |
| M3 | Lastenheft Entwurf 0.x | *[PD: Datum eintragen]* |
| M4 | Entscheidung / Vorbereitung LC-Plattform | *[PD: Datum eintragen]* |

> **Hinweis:** Konkrete **Pilot-JVA-Liste** wird nach dem Workshop in Anhang A ergänzt; im Rahmenkapitel gilt „mehrere JVAs“.

### Zielplattform

Es wird **keine** LC-Produktentscheidung im Prototyp getroffen. Das Lastenheft beschreibt Anforderungen gegen eine künftige **LC-Plattform** (Low-Code, z. B. Appian oder ServiceNow – **ohne Festlegung**).

---

## 2 Ausgangslage und Zielbild

### 2.1 Ist-Zustand (Arbeitsstand – vor Workshop verfeinern)

- Meldungen und Vorfälle werden **nicht in einem einheitlichen Meldesystem** für alle JVAs geführt; Nutzung unterschiedlicher Wege (papiernah, Fachverfahren, Abstimmung per E-Mail/Telefon).
- **Medienbrüche** zwischen Station, Abteilungsleitung (VAL) und externen Stellen (Staatsanwaltschaft, Gerichte); Nachweis „wann versendet“ oft manuell.
- **ERV-Pflichten** und Fristen sind schwer messbar; Eskalationen (z. B. 24 h / 3 Tage) sind organisatorisch bekannt, aber **nicht systemisch überwacht**.
- **Rollen und Zuständigkeiten** sind JVA-üblich klar, aber in IT-Systemen nicht durchgängig als durchsetzbare Berechtigungen abgebildet.
- **Gefangenenstammdaten** kommen aus BASIS-Web (Ziel); im Prototyp nur **Mock-Daten**.
- Hoher Bedarf an **Workshop-Validierung** mit Bediensteten mehrerer JVAs, da Bezeichnungen (Station vs. Wohngruppe) und Eskalationswege abweichen können.

*Nach Workshop: Ist-Zustand je JVA in Anhang A ergänzen oder bestätigen.*

### 2.2 Soll-Zustand

- Ein **Meldewesen** mit **gemeinsamem Kern** für alle teilnehmenden JVAs; Abweichungen in **Anhang A**.
- Jede Meldung: Typ, Status, Sachverhalt, typ-spezifische Metadaten (`metadaten`), lückenloser **Statusverlauf**.
- **Intern:** Weiterleitung (`FORWARDED`) zwischen Rollen; **extern:** ausschließlich **beBPo/ERV** – nicht mit internem Weiterleiten verwechseln.
- **`val`** und **`anstaltsleitung`:** ERV-Schritte (beBPo vor eGPA), Abschluss, Vier-Augen bei ERV-relevanten Archivierungen.
- **JVP-Dashboard** als Shell: Wechsel zwischen A1 und A2 ohne separates Login im Prototyp (Mock-Rolle).

### 2.3 Zielgruppen

| Gruppe | Nutzen |
|--------|--------|
| aVD, Stationsleitung | Erfassen, Einreichen, interne Bearbeitung |
| VAL, Anstaltsleitung | Steuerung, ERV, Abschluss |
| Kammer, Zahlstelle, Arbeitskoordination | Mitwirkung, interne Weiterleitung (Soll) |
| IT / Architektur | Prototyp, Schnittstellen-Soll |
| Datenschutz / Rechtsreferat | Stellungnahme zu ERV und Personenbezug |

---

## 3 Begriffe und Abkürzungen

| Begriff | Erklärung |
|---------|-----------|
| ERV | Elektronischer Rechtsverkehr; Meldungstyp kann ERV-relevant sein |
| eGPA | Elektronische Gesamtstrafenakte; Veraktung (Prototyp: Mock) |
| beBPo / xJustiz | Externer Versand an Staatsanwaltschaft/Gericht (Prototyp: Mock) |
| Meldungstyp | z. B. `STRAFANZEIGE`, `VORFALL_INTERN` |
| Status | Entwurf · Eingereicht · In Bearbeitung · Weitergeleitet · Archiviert |
| JVA | Justizvollzugsanstalt |
| JVP-Dashboard | Gemeinsamer Einstieg HEUREKA 2.0 (A1 + A2) |
| LC-Plattform | Künftige Low-Code-Plattform (Produkt nicht festgelegt) |
| HEUREKA-Referenz | `HEUREKA-2.0-A2-{Bereich}-{NNN}`, siehe Phase 0 |

---

## 4 Rahmenbedingungen

### 4.1 Rechtliches und Datenschutz

- Verarbeitung **personenbezogener Daten** (Gefangene, Bedienstete); Zugriff nur nach **Rolle und Sichtbereich**.
- Dieses Lastenheft ist **keine Rechtsberatung**; verbindliche ERV- und Datenschutz-Festlegungen erfolgen mit **Rechtsreferat** und **Datenschutz** der Behörde.
- Im Prototyp: keine produktive Speicherung echter Fälle ohne Freigabe; Demo-Daten aus Seed.

### 4.2 Organisation Mehr-JVA

- **Kernregeln** gelten für alle teilnehmenden JVAs.
- **Pilot-JVA-Liste** und Abweichungen (Bezeichnungen, Fristen, Eskalation) → **Anhang A** (nach Workshop).
- Workshop-Scope: **mehrere JVAs**, gemeinsamer Kern + dokumentierte Sonderregeln.

### 4.3 Nicht-Ziele des Prototyps

- Keine echte AD-/SSO-Authentifizierung (Mock-Header).
- Keine echte eGPA-, VIS-, beBPo- oder BASIS-Web-Anbindung.
- Kein Gefangenenportal (gehört zu A1).
- Kein E-Mail-Versand; keine produktiven Sicherheitsmechanismen (CSRF, Rate Limiting).
- Datenbank: `prisma db push` statt Migrationspipeline im Prototyp.
- Keine verbindliche LC-Produktwahl.

### 4.4 JVP-Dashboard (Verzahnung A1 / A2)

- Bedienstete erreichen **eMeldewesen (A2)** über das **JVP-Dashboard** (Kachel/Link).
- Umgebungsvariablen `VITE_JVP_URL`, `VITE_A1_URL`, `VITE_A2_URL` verlinken Prototyp-Instanzen (lokal/Docker).
- Fachliche Prozesse A1 und A2 bleiben **getrennt**; gemeinsam ist nur der **Einstieg** und die Rolle (Mock).

---

## 5 Stakeholder (Projekt)

| Rolle | Aufgabe |
|-------|---------|
| **PD** (Fachauftrag) | Inhalt, wöchentlicher Word/Repo-Abgleich, Workshop |
| JVA-Ansprechpartner | Ist/Soll, Anhang A (nach Nennung im Workshop) |
| IT-Entwicklung Prototyp | Umsetzung, Mock-Schnittstellen |
| Workshop-Teilnehmer | Validierung mit Bediensteten |

*Prozessregeln:* [LASTENHEFT_GLIEDERUNG.md](../LASTENHEFT_GLIEDERUNG.md) Kap. 5.1, [02_QUERSCHNITT_ROLLEN_STATUS.md](02_QUERSCHNITT_ROLLEN_STATUS.md).

---

## Beschlüsse Phase 1

| Thema | Beschluss |
|-------|-----------|
| Pilot-JVAs | Liste **nach Workshop**; Text: „mehrere JVAs“ |
| Ist-Zustand | **Stichpunkte jetzt**, Workshop verfeinert |
| LC-Plattform | Nur **generisch** „LC-Plattform“, keine Produktfestlegung |
| Meilensteine | **Konkrete Termine** – vom Fachauftrag (PD) nachzureichen |
| A1 / A2 | **Gemeinsames JVP-Dashboard**, fachlich getrennt |
| Datenschutz | **Kurz** + Verweis Fachstellen |
