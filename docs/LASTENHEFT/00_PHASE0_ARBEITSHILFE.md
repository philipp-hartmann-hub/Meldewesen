# Phase 0 – Arbeitssetup Lastenheft (ausformuliert)

**Version:** 0.4 | **Status:** Phase 0 abgeschlossen (Entwurf 0.x)  
**Geltung:** HEUREKA 2.0 | A2 eMeldewesen  
**Vertraulichkeit:** Intern (nur Projekt, JVA, beteiligte IT)  
**Verantwortung Abgleich Word ↔ Repo:** Fachauftrag  
**Autor/in (Deckblatt):** PD

---

## 1 Zweck von Phase 0

Phase 0 legt fest, **wie** das Lastenheft geschrieben, nummeriert, versioniert und mit dem Prototyp verknüpft wird – noch **ohne** fachliche Inhalte zu einzelnen Meldungstypen (ab Phase 1).

---

## 2 Führende Quellen und Abgleich

| Quelle | Rolle |
|--------|--------|
| **Word/PDF** | Veröffentlichbare Fassung für Stakeholder und Workshop |
| **`docs/LASTENHEFT/`** (Markdown) | Arbeits- und Versionsstand im Repository |

**Abgleich:** Word und Repo werden **parallel** geführt und **wöchentlich** abgeglichen (Inhalt, Versionsnummer, neue Anforderungs-IDs).

**Vorgehen beim wöchentlichen Abgleich:**

1. Neue/geänderte Anforderungen in Markdown zuerst pflegen.
2. In Word übernehmen (Kapitel + Anforderungstabellen).
3. Versionsfeld in Word und in `LASTENHEFT/README.md` angleichen.
4. Offene Punkte nur in [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](../RUECKFRAGEN_UND_OFFENE_PUNKTE.md) – im Lastenheft Verweis „Kap. 10“.

**Verantwortlich:** **Fachauftrag** (wöchentlicher Abgleich, inhaltliche Freigabe der Word-Fassung vor Workshop).

---

## 3 Versionierung und Freigabe

- **Schema:** `0.x` = Entwurf während Prototyp und Workshops.
- **Keine** formale Behörden-Freigabe in Phase 0; Freigabe 1.0 optional nach Workshop-Reihe.
- **Pflichtfelder** auf dem Word-Deckblatt: Version, Datum, **Autor/in: PD**, Status („Entwurf“), **Vertraulichkeit: Intern**.

---

## 4 Kennzeichnung Priorität

| Kennzeichnung | Bedeutung |
|---------------|-----------|
| **Prototyp (Muss)** | Für Demo/Workshop zwingend; im Repo umsetzbar oder per Mock simulierbar |
| **Prototyp (Soll)** | Wünschenswert für Workshop; Mock ausreichend |
| **Prototyp (Kann)** | Optional im Prototyp; keine Workshop-Blockade bei Ausfall |
| **Zielsystem** | LC-Plattform später; im Lastenheft dokumentieren, nicht im Prototyp versprechen |

**Schnitt:** mittlere Granularität – etwa eine ID pro erkennbarem Feature oder Regel (Button, Statusübergang, Validierung), nicht jede Fehlermeldung einzeln.

---

## 5 Anforderungs-ID-Schema

Format: `A2-{Typ}-{Bereich}-{NNN}`

| Segment | Werte | Beispiel |
|---------|--------|----------|
| Präfix | `A2` | Projekt A2 eMeldewesen |
| Typ | `F` = funktional, `NF` = nicht-funktional | `A2-F-STR-001`, `A2-NF-UI-001` |
| Bereich | siehe Tabelle unten | |
| NNN | dreistellig, fortlaufend **pro Bereich** | `001`, `002`, … |

### Bereichscodes (funktional)

| Code | Bereich |
|------|---------|
| `QS` | Querschnitt allgemein (inkl. Auswertung/Statistik, z. B. A2-F-QS-002) |
| `ROL` | Rollen und Rechte |
| `STA` | Statusmodell |
| `SLA` | Fristen, Eskalation |
| `UI` | Oberfläche, Barrierefreiheit |
| `STR` | Meldungstyp Strafanzeige |
| `INT` | Meldungstyp Interner Vorfall |
| `GER` | Meldungstyp Gericht |
| `TST` | Test / Abnahme (funktionale Tests, gekoppelt an F-IDs) |

### HEUREKA-Referenz (verbindliches Muster)

Parallel zur A2-ID, **gleicher Bereich und laufende Nummer**:

`HEUREKA-2.0-A2-{Bereich}-{NNN}`

Beispiele:

- Anforderung `A2-F-STR-001` → `HEUREKA-2.0-A2-STR-001`
- Test `A2-F-TST-003` → `HEUREKA-2.0-A2-TST-003`

Die HEUREKA-Referenz wird **1:1** zur A2-ID geführt (kein separates Nummernkreis).

### Bereichscodes (nicht-funktional, NF)

| Code | Bereich |
|------|---------|
| `PERF` | Performance / Antwortzeiten |
| `SEC` | Sicherheit (Zielsystem; Prototyp eingeschränkt) |
| `A11Y` | Barrierefreiheit (WCAG 2.1 AA) |
| `AUD` | Audit, Protokollierung, Nachvollziehbarkeit |

### NF im Prototyp vs. Zielsystem

| NF-Bereich | Prototyp | Zielsystem |
|------------|----------|------------|
| `A11Y` | **Ja** – WCAG 2.1 AA orientierend prüfbar | Vollständige Zertifizierung |
| `AUD` | **Teilweise** – Statusverlauf, Mock-Versand protokolliert | Vollständiges Audit-Log, revisionssicher |
| `PERF` | Nein (nur Zielsystem) | Ja |
| `SEC` | Nein (Mock-Auth ausreichend für Demo) | Ja (SSO, CSRF, …) |

---

## 6 Vorlage pro Anforderung

### Darstellung in Word

**Je Anforderungs-ID genau eine Word-Tabelle** (einzeilig oder mehrzeilig mit Feldname | Inhalt). Keine zusammengefassten Sammeltabellen für mehrere IDs.

**Sprache:** Deutsch, **Sie-Form**; Fach und IT **gleichberechtigt** (Beschreibung fachlich, Spalte „Prototyp“ technisch).

```
ID:                 A2-F-___-___
HEUREKA-Referenz:   HEUREKA-2.0-A2-___-___  (1:1 zur ID)
Titel:
Priorität:          Prototyp (Muss) | Prototyp (Soll) | Prototyp (Kann) | Zielsystem
Beschreibung:       (Sie-Form, 2–4 Sätze, Fach + ggf. IT-Bezug)
Vorbedingung:
Auslöser:
Ergebnis:
Akzeptanzkriterium:
  - …
  - …
Rolle(n):
Meldungstyp:        (oder „alle aktiven Typen“ / „Querschnitt“)
Statusbezug:        (optional)
Quelle:             Workshop | Beschluss | Rückfragen-Doc
Prototyp:           API-Route / Seite / nicht umgesetzt
```

**NF-Anforderungen** nutzen dieselbe Vorlage mit `A2-NF-…` und Fokus auf messbare Kriterien (z. B. WCAG, Log-Einträge).

### Vorlage Abnahmetest (gekoppelt an Anforderung)

Format Test-ID: `A2-F-TST-{NNN}` mit `HEUREKA-2.0-A2-TST-{NNN}`.

Zusätzliches Pflichtfeld in der Test-Tabelle:

- **Verifiziert Anforderung:** `A2-F-…-…` (exakt eine oder mehrere F-IDs)

Workshop-Kurz-IDs (z. B. `TST-STR-01`) sind **Alias** in der Spalte „Titel“ oder „Kommentar“, führend bleibt `A2-F-TST-…`.

---

## 7 Word-Übernahme (Checkliste)

1. [LASTENHEFT_GLIEDERUNG.md](../LASTENHEFT_GLIEDERUNG.md) → Kapitelstruktur in Word (Überschrift 1–3, Inhaltsverzeichnis).
2. Inhalt aus `01_` … `07_` und Anhänge A/B einfügen.
3. **Pro Anforderung eine eigene Tabelle** nach Vorlage (Abschn. 6).
4. Deckblatt: Version 0.x, Datum, Autor **PD**, Status „Entwurf“, **Intern**.
5. Wöchentlicher Abgleich durch **Fachauftrag** (Abschn. 2).

---

## 8 Pflege offener Punkte

Neue Rückfragen und offene Punkte **nur** in [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](../RUECKFRAGEN_UND_OFFENE_PUNKTE.md) (Cluster oder Chronik). Im Lastenheft: Verweis, keine doppelte Pflege.

---

## 9 Beschlüsse Phase 0 (vollständig)

| Thema | Beschluss |
|-------|-----------|
| Führende Quelle | Word + Repo parallel, wöchentlicher Abgleich |
| Abgleich-Verantwortung | **Fachauftrag** |
| Freigabe | Entwurf 0.x, keine formale Freigabe im Prototyp |
| Vertraulichkeit | **Intern** |
| Autor/in Deckblatt | **PD** |
| HEUREKA-Referenz | **Festes Muster** `HEUREKA-2.0-A2-{Bereich}-{NNN}`, 1:1 zur A2-ID |
| NF-Anforderungen | F und NF; im Prototyp prüfbar: **A11Y**, teilweise **AUD** |
| Prioritäten | Muss, Soll, **Kann**, Zielsystem |
| Granularität | Mittel (Feature/Regel-Ebene) |
| Sprache | Deutsch, Sie, Fach + IT gemischt |
| Word-Layout | **Eine Tabelle je Anforderungs-ID** |
| Tests | **Gekoppelt** an F-IDs über `A2-F-TST-…` |

---

## 10 Nächster Schritt nach Phase 0

**Phase 1 starten:** [01_KAPITEL_RAHMEN.md](01_KAPITEL_RAHMEN.md) in Word übernehmen und Ist-Zustand mit JVA-Ansprechpartnern ergänzen.
