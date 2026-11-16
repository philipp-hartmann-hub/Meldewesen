# Lastenheft A2 eMeldewesen – Gliederungsvorlage

Vorlage für ein Word-/PDF-Lastenheft. In Word: Überschriften als „Überschrift 1–3“ formatieren, Inhaltsverzeichnis automatisch erzeugen.

**Version:** 0.2  
**Status:** Entwurf (Inhalt in [LASTENHEFT/](LASTENHEFT/) ausgearbeitet)  
**Geltung:** HEUREKA 2.0 | Prototyp A2 eMeldewesen  

**Ausgearbeitete Kapitel (Markdown → Word):** siehe [LASTENHEFT/README.md](LASTENHEFT/README.md).

---

## 1 Management Summary

- Ziel des Vorhabens (ein Absatz)
- Nutzen für JVA-Bedienstete und Behörde
- Abgrenzung zu A1 eGefangenenanträgen
- Zeitrahmen und Meilensteine (Prototyp vs. LC-Plattform)

---

## 2 Ausgangslage und Zielbild

### 2.1 Ist-Zustand

- Aktuelle Melde- und Dokumentationspraxis (kurz)
- Medienbrüche, Risiken, Doppelungen

### 2.2 Soll-Zustand

- Digitales Meldewesen: zentrale Erfassung, Nachvollziehbarkeit, rollenbasierte Bearbeitung
- Schnittstellen zur späteren Zielplattform (Appian/ServiceNow o. ä.) – nur beschreiben, nicht festlegen

### 2.3 Zielgruppen

- Primär: Bedienstete (aVD, Stationsleitung, VAL, Anstaltsleitung, …)
- Sekundär: IT, Fachverfahren, Datenschutz

---

## 3 Begriffe und Abkürzungen

| Begriff | Erklärung |
|---------|-----------|
| ERV | Elektronische Rechtsverkehr / ERV-Pflicht je Meldungstyp |
| eGPA | Veraktung (Mock im Prototyp) |
| beBPo / xJustiz | Externer Versand (Mock im Prototyp) |
| JVA | Justizvollzugsanstalt |

(Ergänzen nach internem Glossar)

---

## 4 Rahmenbedingungen

### 4.1 Rechtliches und Datenschutz

- Personenbezogene Daten, Aufbewahrung, Zugriff
- ERV-relevante Meldungen: Anforderungen (fachlich, ohne Rechtsberatung im Dokument)

### 4.2 Organisation Mehr-JVA

- Gemeinsamer fachlicher Kern
- JVA-spezifische Abweichungen (Bezeichnungen, Zuständigkeiten) → Anhang A: Matrix „JVA × Abweichung“

### 4.3 Nicht-Ziele des Prototyps

- Keine echte AD-Auth, keine produktiven Schnittstellen (siehe README / .cursorrules)

---

## 5 Stakeholder und Rollen im Projekt

- Auftraggeber / Product Owner
- Fachbereich JVAs (Ansprechpartner je JVA)
- IT / Architektur
- Datenschutz (bei Bedarf)

### 5.1 Beschlossene Prozessregeln (Übernahme ins Lastenheft)

Die folgenden Regeln wurden im Projektgespräch festgehalten und können 1:1 in Kapitel 6 (Funktionale Anforderungen) und in die Testfälle (Kapitel 9) übernommen werden. Abweichungen je JVA in **Anhang A** dokumentieren.

#### Weiterleiten vs. externer Versand

- **Intern „Weiterleiten“** (Status *Weitergeleitet* / `FORWARDED`): fachliche oder organisatorische Weitergabe **innerhalb** des Meldewesens (andere Rolle, andere Abteilung, Warteschlange). **Kein** automatischer Schluss „Behörde hat erhalten“.
- **Externer Versand:** erfolgt **ausschließlich** über **beBPo / ERV** (im Prototyp: Mock xJustiz/beBPo). Der Nachweis „extern übermittelt“ ergibt sich aus dem **Versand-/ERV-Nachweis**, nicht aus dem internen Weiterleiten.

#### Service-Level (SLA) – Soll-Vorgabe (Kern für alle JVAs)

| Meilenstein | Frist | Messpunkt im System / Prozess |
|-------------|-------|----------------------------------|
| Bearbeitung aufnehmen | **24 Stunden** nach Einreichung (`SUBMITTED`), bezogen auf Werktage (Kalenderdefinition: Anhang A oder Zentralregel) | erster Übergang in *In Bearbeitung* (`IN_PROGRESS`) oder gleichwertig dokumentierte Übernahme |
| Externer Versand (beBPo/ERV) | **3 Werktage** nach fachlicher Freigabe bzw. ab dem Zeitpunkt, ab dem die Meldung **versandfähig** ist (Definition im Lastenheft festhalten) | erfolgreicher Versand bzw. protokollierter Versandstatus |
| Eskalation bei Verletzung der 24-h-Frist | Eskalation an **Stationsleitung / zuständige Führung** (genaue Rolle je JVA in Anhang A) | |
| Eskalation bei Verletzung der 3-Tage-Frist | Eskalation an **VAL**, danach **Anstaltsleitung** | |

Abweichende Fristen oder Eskalationsketten je JVA: **Anhang A (JVA-Matrix)**.

#### Anhänge (ERV-relevant und typabhängig)

- Es gilt **keine** globale Mindestanzahl an Dateien.
- **Je Meldungstyp** (und ggf. je Vorfall) ist festzulegen, **welche** Anlagen sinnvoll oder erforderlich sind (Checkliste, nicht „mindestens n Dateien“).
- Bei **ERV-relevanten** Meldungen können Anhänge verpflichtend sein, **ohne** feste Mindestzahl – z. B. wenn der Sachverhalt auf Belege verweist, sind diese beizufügen; typbezogene Pflichtdokumente separat definieren.

---

## 6 Funktionale Anforderungen

### 6.1 Überblick Meldungsarten

- Liste aller Meldungstypen (aktiv/inaktiv, ERV-Flag)
- Sichtbarkeit inaktiver Typen in der UI („in Planung“, deaktiviert)

### 6.2 Meldung erstellen und bearbeiten

- Pflichtfelder allgemein
- Typ-spezifische Pflichtfelder (z. B. Strafanzeige) → Unterkapitel oder Anhang B

### 6.3 Statusmodell

- Status: Entwurf, Eingereicht, In Bearbeitung, Weitergeleitet, Archiviert
- Erlaubte Übergänge je Rolle

### 6.4 Rollen und Berechtigungen

- Kanonische Rollencodes (lowercase)
- Matrix: Rolle × Aktion (Erstellen, Bearbeiten, Weiterleiten, Verakten, beBPo, Abschließen)
- Sichtbereich: Station, Abteilung, Anstalt, JVA

### 6.5 ERV-Prozess

- Reihenfolge fachlicher Schritte (z. B. beBPo vor eGPA – falls so beschlossen)
- Vier-Augen-Prinzip bei ERV-relevantem Abschluss (falls verbindlich)

**Ausgearbeitet (ARIS-Gesamtprozess):** [LASTENHEFT/08_GESAMTPROZESS_ARIS.md](LASTENHEFT/08_GESAMTPROZESS_ARIS.md) – strukturierte Prozessbeschreibung aus BPMN-PDF, Abgleich Prototyp.

### 6.6 Gefangenenbezug

- Auswahl Gefangener (Autocomplete), Filterung nach JVA/Sichtbereich

### 6.7 Anhänge (falls relevant)

- Erlaubte Formate, Größen, Aufbewahrung

### 6.8 Rückgabe Ergänzungserfassung (Zeugen / Beweismittel)

- VAL/AL können Meldung zur **Nachreichung** zurückgeben, wenn Zeugen/Beweismittel nicht in 24 h vollständig (A2-F-QS-004, A2-F-STA-003)
- Happy Path: [HAPPY_PATH_STRAFANZEIGE.md](../HAPPY_PATH_STRAFANZEIGE.md) HP-26b–e

### 6.9 Anhörung der beschuldigten Hauptbeteiligten

- Befragung/Anhörung der als **Hauptbeteiligte/r** erfassten Gefangenen (beschuldigte Person); getrennt von Zeugen
- Ausgearbeitet: **A2-F-QS-003**, Strafanzeige **A2-F-STR-009**, Gericht **A2-F-GER-005**; Felder Anhang B

### 6.10 Quartalsweise Auswertung (Fachaufsicht / DWH)

- Statistische Auswertung **aller Ermittlungsverfahren und Vorfälle** je Kalenderquartal (Zielsystem)
- **Frist:** Bericht spätestens **15 Werktage** nach Quartalsende
- **Pflicht-KPIs:** KP-EV-01–12, KP-VF-01–09, KP-Ü-01–03
- Ausgearbeitet: [LASTENHEFT/08_GESAMTPROZESS_ARIS.md](LASTENHEFT/08_GESAMTPROZESS_ARIS.md) Abschnitt 8, Anforderung **A2-F-QS-002**

---

## 7 Nicht-funktionale Anforderungen

### 7.1 Bedienbarkeit und Barrierefreiheit

- WCAG 2.1 AA als Zielgröße für Zielsystem (Prototyp orientierend)

### 7.2 Performance und Verfügbarkeit

- Erwartete Nutzerzahl (Groborientierung)

### 7.3 Protokollierung und Audit

- Welche Aktionen müssen nachvollziehbar sein (Statuswechsel, Versand, Abschluss)

---

## 8 Schnittstellen und Integration (Soll)

- eGPA / VIS (Zielbild)
- beBPo / xJustiz (Zielbild)
- Identitätsmanagement (Zielbild; Pilot: Mock)

---

## 9 Abnahmekriterien (Testfälle)

- Szenarien je Rolle (mindestens: aVD, VAL, Anstaltsleitung)
- Szenario ERV-Meldung inkl. Abschluss mit Vier-Augen (falls verbindlich)
- Negative Tests (keine Berechtigung → erwartete Fehlermeldung)

---

## 10 Offene Punkten und Risiken

- Tabelle: ID, Beschreibung, Auswirkung, Owner, Zieltermin

---

## Anhang A – JVA-Abweichungsmatrix

| JVA | Thema (z. B. Bezeichnung SL) | Regelung |
|-----|-------------------------------|----------|
| …   | …                             | …        |

---

## Anhang B – Typ-spezifische Datenfelder (Beispiel Strafanzeige)

| Feld | Pflicht | Datentyp | Hinweis |
|------|---------|----------|---------|
| …    | ja/nein | …        | …       |

---

## Anhang C – Glossar / Referenzen

- Verweise auf interne Richtlinien, Gesetze nur mit offizieller Quelle
