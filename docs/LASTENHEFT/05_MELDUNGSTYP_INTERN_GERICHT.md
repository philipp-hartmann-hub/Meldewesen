# Meldungstypen VORFALL_INTERN und MELDUNG_GERICHT

**Version:** 0.4 | **Phase-3-Beschlüsse** eingearbeitet; Querschnitt Pflichtangaben A2-F-ERF-001/002

## Querschnitt Phase 3 (alle Typen)

| Thema | Beschluss |
|-------|-----------|
| Entwurf bearbeiten | **Alle** mit `kannMeldungBearbeiten` im Sichtbereich (nicht nur Ersteller/in) |

---

## VORFALL_INTERN (Interner Vorfall)

**Code:** `VORFALL_INTERN` | **Aktiv:** ja | **ERV-relevant:** nein

### Zweck

Interne Vorfälle (z. B. Disziplinarverstoß, Auseinandersetzung) ohne Pflicht zum externen ERV-Versand. Abschluss durch VAL/AL; kein beBPo/eGPA im Regelfall.

### Gefangenenbezug

**Im Workshop klären** (Pflicht vs. optional bei allgemeinen Vorfällen). Bis dahin: **Pflicht** im Prototyp-Formular (wie Seed).

### Felder (Anhang B)

Querschnitt **Tatzeit, Tatort, Sachverhalt, Beweismittel:** [ANHANG_B_FELDER.md](ANHANG_B_FELDER.md) (A2-F-ERF-001, A2-F-ERF-002).

- `sachverhalt` (Pflicht bei Einreichung)
- `metadaten.tatzeit`, `metadaten.tatort` (Pflicht bei Einreichung)
- `metadaten.beweismittelGesichert` / ggf. `beweismittelAngaben`
- `metadaten.fundort` (optional, Ergänzung zu Tatort)
- `empfaengerTyp`: bei Erstellung **wählen** – `INTERN_ABTEILUNG` oder `INTERN_LEITUNG`

### Anforderungen

| ID | Titel | Priorität | Prototyp |
|----|-------|-----------|----------|
| A2-F-INT-001 | Typ aktiv, nicht ERV | Muss | umgesetzt (API) |
| A2-F-INT-002 | Kein xJustiz-Button | Muss | UI offen |
| A2-F-INT-003 | VAL darf abschließen | Muss | umgesetzt |
| A2-F-INT-004 | Interne Weiterleitung | Muss | API umgesetzt |

### Abnahme

| ID | Szenario | Erwartung |
|----|----------|-----------|
| TST-INT-01 | aVD legt Vorfall an (MEL-014 DRAFT) | kein ERV-Badge |
| TST-INT-02 | VAL setzt IN_PROGRESS auf MEL-017 | 200 |
| TST-INT-03 | aVD ruft xjustiz-versand auf | 400 „nicht ERV-relevant“ |

---

## MELDUNG_GERICHT (Meldung an Gericht)

**Code:** `MELDUNG_GERICHT` | **Aktiv:** ja | **ERV-relevant:** ja

### Zweck

Meldungen an Gerichte (z. B. Vollstreckungsplan, Fristen). Externer Versand über beBPo/ERV; Empfänger `empfaengerTyp: GERICHT`.

### Gefangenenbezug

**Pflicht**.

### Felder (Anhang B)

Querschnitt **Tatzeit, Tatort, Sachverhalt, Beweismittel:** [ANHANG_B_FELDER.md](ANHANG_B_FELDER.md).

- `sachverhalt`, `metadaten.tatzeit`, `metadaten.tatort`, Beweismittel-Felder wie in Anhang B
- `metadaten.aktenzeichen` (Soll)
- `empfaenger`, `empfaengerTyp: GERICHT`

### Prozess

**Gleiche ERV-Kette** wie Strafanzeige: beBPo → eGPA → Archiv mit Vier-Augen (VAL ↔ AL).

### Empfänger

- **Zielsystem:** Aktenzeichen leitet zuständiges **Gericht** ab.
- **Prototyp:** Freitext `empfaenger` + `empfaengerTyp: GERICHT` + `metadaten.aktenzeichen` (Mock, keine echte Aktenzeichen-Logik).

### Anforderungen

| ID | Titel | Priorität | Prototyp |
|----|-------|-----------|----------|
| A2-F-GER-001 | Typ aktiv, ERV | Muss | umgesetzt |
| A2-F-GER-002 | Empfänger Gericht | Soll | Seed MEL-016 |
| A2-F-GER-003 | ERV-Ablauf wie STRAFANZEIGE | Muss | Mock gleich |
| A2-F-GER-004 | Aktenzeichen im Formular | Soll | nicht umgesetzt |
| A2-F-GER-005 | Anhörung beschuldigte Hauptbeteiligte vor ERV | Muss (Zielsystem) | wie A2-F-QS-003, nicht umgesetzt |

### Abnahme

| ID | Szenario | Erwartung |
|----|----------|-----------|
| TST-GER-01 | MEL-016 Detail | Gericht als Empfänger, FORWARDED |
| TST-GER-02 | VAL beBPo bei Gerichtsmeldung | Versand Mock OK |
