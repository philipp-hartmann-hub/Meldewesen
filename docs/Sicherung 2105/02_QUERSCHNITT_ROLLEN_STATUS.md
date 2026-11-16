# Kapitel 6.3–6.4 – Querschnitt Rollen, Rechte, Status

**Version:** 0.3 | **Status:** Phase 2 ausformuliert (Entwurf 0.x)

## 6.4 Rollen (kanonisch, lowercase)

| Rollencode | UI-Label | Sichtbereich |
|------------|----------|--------------|
| `anstaltsleitung` | Anstaltsleitung (AL) | gesamte Anstalt (eigene JVA) |
| `val` | Vollzugsabteilungsleitung (VAL) | eigene Vollzugsabteilung |
| `stationsleitung` | Stationsleitung / Wohngruppenleitung | eigene Station |
| `avd` | Allgemeiner Vollzugsdienst (aVD) | eigene Station |
| `kammer` | Kammer | eigene JVA |
| `zahlstelle` | Zahlstelle | eigene JVA |
| `arbeitskoordination` | Arbeitskoordination | eigene JVA |

---

## Soll-Matrix: Rolle × Aktion (aktive Meldungstypen)

| Rolle | Erstellen | Bearbeiten | Weiterleiten | Verakten eGPA | xJustiz/beBPo | Abschließen |
|-------|-----------|------------|--------------|---------------|---------------|-------------|
| `avd` | ja | ja | ja | nein | nein | nein |
| `stationsleitung` | ja | ja | ja | nein | nein | nein |
| `val` | ja | ja | ja | ja | ja | ja |
| `anstaltsleitung` | ja | ja | ja | ja | ja | ja |
| `kammer` | ja | ja | ja | nein | nein | nein |
| `zahlstelle` | ja | ja | ja | nein | nein | nein |
| `arbeitskoordination` | ja | ja | ja | nein | nein | nein |

### ERV-relevante Meldungen (zusätzlich)

- Reihenfolge: **zuerst xJustiz/beBPo, dann eGPA-Veraktung**, danach Abschluss.
- **Vier-Augen (Beschluss):** Bei ERV-relevantem `ARCHIVED` muss die **zweite Freigabe** durch die **jeweils andere Leitungsrolle** erfolgen (`val` ↔ `anstaltsleitung`). Wer den beBPo-Versand ausgelöst hat, soll nicht allein abschließen (Ausnahmen: Anhang A / Vertretung).

### A2-F-ROL-005 – Vier-Augen ERV-Abschluss

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Soll) / Zielsystem (Muss) |
| HEUREKA-Referenz | HEUREKA-2.0-A2-ROL-005 |
| Beschreibung | Archivieren einer ERV-relevanten Meldung erfordert zwei unterschiedliche Leitungsrollen (VAL und AL). |
| Akzeptanzkriterium | System verweigert ARCHIVED, wenn nur ein und dieselbe Leitungsrolle beteiligt war (Prototyp: Prüfung im Backend oder manueller Workshop-Check bis Umsetzung). |
| Prototyp | **nicht umgesetzt** (Regel dokumentiert) |

---

## Anforderungen Rollen (Auszug)

### A2-F-ROL-001 – Weiterleiten Sonderdienste (Soll im Prototyp)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | Die Rollen `kammer`, `zahlstelle` und `arbeitskoordination` können Meldungen **intern weiterleiten**, ohne ERV- oder Abschlussrechte. |
| Akzeptanzkriterium | Nach Anpassung von `mockAuth` und `RollenContext`: `PATCH …/status` mit `FORWARDED` für diese Rollen liefert 200, nicht 403. |
| Prototyp | `mockAuth.js`, `RollenContext.jsx` – **umgesetzt** |

### A2-F-ROL-002 – Abschluss nur VAL/AL

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | Nur `val` und `anstaltsleitung` dürfen den Status **Archiviert** setzen. |
| Akzeptanzkriterium | Andere Rollen erhalten HTTP 403 mit verständlicher Meldung. |
| Prototyp | `PATCH /api/meldungen/:id/status` – **umgesetzt** |

### A2-F-ROL-003 – xJustiz und Verakten nur VAL/AL

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | Nur `val` und `anstaltsleitung` lösen Mock-Veraktung und Mock-beBPo-Versand aus. |
| Akzeptanzkriterium | POST `…/verakten` und `…/xjustiz-versand` für aVD → 403. |
| Prototyp | **umgesetzt** |

### A2-F-ROL-004 – Sichtbereich JVA-Filter

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | `GET /api/meldungen` filtert nach JVA des Mock-Nutzers, sofern nicht `siehtAlleJVAs`. |
| Akzeptanzkriterium | aVD sieht nur Meldungen der eigenen JVA/Station gemäß Seed. |
| Prototyp | **umgesetzt** |

---

## 6.3 Statusmodell

| Code | UI (DE) |
|------|---------|
| `DRAFT` | Entwurf |
| `SUBMITTED` | Eingereicht |
| `IN_PROGRESS` | In Bearbeitung |
| `FORWARDED` | Weitergeleitet |
| `ARCHIVED` | Archiviert |

**Fachlich:** `FORWARDED` = **interne** Weitergabe. Externer Versand = beBPo/ERV, eigener Nachweis (`XJustizVersand`), nicht durch `FORWARDED` ersetzt.

### Tabelle: Erlaubte Statusübergänge × Rolle

Legende: ● = erlaubt, ○ = nicht erlaubt, ●* = nur VAL/AL

| Von \ Nach | SUBMITTED | IN_PROGRESS | FORWARDED | ARCHIVED |
|------------|-----------|-------------|-----------|----------|
| **DRAFT** → | alle mit Bearbeiten | – | – | – |
| **SUBMITTED** → | – | alle mit Bearbeiten | Weiterleiten-Rollen | ○ |
| **IN_PROGRESS** → | – | alle mit Bearbeiten | Weiterleiten-Rollen | ○ |
| **FORWARDED** → | – | alle mit Bearbeiten | Weiterleiten-Rollen | ○ |
| **beliebig** → ARCHIVED | | | | ●* |

*Weiterleiten-Rollen (Soll):* `avd`, `stationsleitung`, `val`, `anstaltsleitung`, `kammer`, `zahlstelle`, `arbeitskoordination`.

### A2-F-STA-001 – Statusverlauf protokollieren

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | Jeder Statuswechsel erzeugt einen Eintrag in `StatusVerlauf` mit optionalem Kommentar und Bedienstetenbezug. |
| Akzeptanzkriterium | `GET /api/meldungen/:id` enthält chronologischen `statusVerlauf`. |
| Prototyp | **umgesetzt** |

### A2-F-STA-002 – Einreichung Entwurf → Eingereicht

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Soll) |
| Beschreibung | Bedienstete können eine Meldung von Entwurf auf Eingereicht setzen; Übergabe zwischen Personen ist organisatorisch möglich. |
| Akzeptanzkriterium | UI-Button oder API-PATCH mit `SUBMITTED`; Verlaufseintrag sichtbar. |
| Prototyp | **umgesetzt** (Button „Einreichen“ Detail + Formular; API `PATCH …/status`) |

---

## Pflichtangaben bei Meldungserstellung (Querschnitt)

Die meldende Person muss bei **Einreichung** u. a. **Tatzeit**, **Tatort**, **Sachverhalt** und **beteiligte Person(en)** (Hauptgefangene/r) angeben; **Beweismittel** (Ja/Nein, bei Ja Kurztext) und **Zeugen** (falls vorhanden) sind fachlich abzudecken. Vollständige Definition und HEUREKA-IDs **A2-F-ERF-001**, **A2-F-ERF-002:** [ANHANG_B_FELDER.md](ANHANG_B_FELDER.md) Abschnitt „Querschnitt“.
