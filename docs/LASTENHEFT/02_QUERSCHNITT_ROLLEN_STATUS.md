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

### A2-F-ROL-006 – Fachliche Prüfung nur VAL/AL

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | Übergang **`SUBMITTED`**/**`FORWARDED`** → **`IN_PROGRESS`** (fachliche Prüfung aufnehmen) ist **ausschließlich** `val` und `anstaltsleitung` vorbehalten. AVD/SL bearbeiten Zeugen- und Beweismittel-Aufgaben im **Arbeitskorb**, nicht über „Fachliche Prüfung aufnehmen“. |
| Akzeptanzkriterium | Frontend: Button nur für VAL/AL; Backend: `PATCH …/status` mit `IN_PROGRESS` für andere Rollen → 403. |
| Prototyp | **umgesetzt** – siehe [UMSETZUNG_ARBEITSKORB_NAVIGATION.md](../UMSETZUNG_ARBEITSKORB_NAVIGATION.md) |

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
| **SUBMITTED** → | – | ●* nur `val`/`anstaltsleitung` (fachliche Prüfung) | Weiterleiten-Rollen | ○ |
| **IN_PROGRESS** → | – | ●* nur `val`/`anstaltsleitung` | Weiterleiten-Rollen | ○ |
| **IN_PROGRESS** → **DRAFT** (Rückgabe Ergänzung) | – | – | – | ●* nur `val`/`anstaltsleitung` (A2-F-STA-003) |
| **FORWARDED** → | – | ●* nur `val`/`anstaltsleitung` | Weiterleiten-Rollen | ○ |
| **FORWARDED** → **DRAFT** (Rückgabe Ergänzung) | – | – | – | ●* nur `val`/`anstaltsleitung` (A2-F-STA-003) |
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

---

## Anhörung der beschuldigten Hauptbeteiligten (Querschnitt)

### A2-F-QS-003 – Anhörung / Befragung der beschuldigten Person

| Feld | Inhalt |
|------|--------|
| **ID** | A2-F-QS-003 |
| **HEUREKA-Referenz** | HEUREKA-2.0-A2-QS-003 |
| **Titel** | Anhörung der beschuldigten Hauptbeteiligten |
| **Priorität** | Zielsystem (Muss) für **ERV-relevante** Meldungen mit Gefangenenbezug; Prototyp (Kann) nur als dokumentierter Soll-Pfad |
| **Beschreibung** | Die im Vorgang als **Hauptbeteiligte/r** erfasste **Gefangene/r** gilt im Strafanzeige-/ERV-Kontext als **beschuldigte Person**. Sie ist im Rahmen der **internen Bearbeitung** zu **befragen bzw. anzuhören**, wenn dies zur Aufklärung des Sachverhalts erforderlich ist. Das System protokolliert **Durchführung**, **Datum**, **durchführende Rolle** und **Ergebnis** (Kurztext + optional Anlage). Eine **Zeugenaussage** derselben Person als Eintrag in `metadaten.zeugen[]` ersetzt die **Anhörung als Beschuldigte/r nicht**. |
| **Vorbedingung** | `gefangeneId` gesetzt; Meldung mindestens **Eingereicht** (`SUBMITTED`). |
| **Auslöser** | Bearbeitungsübernahme (`IN_PROGRESS`) oder Aufgabe an Station/VAL. |
| **Ergebnis** | Block `metadaten.anhoerungBeschuldigte` (siehe Anhang B); Verlaufseintrag „Anhörung durchgeführt“ bzw. „Verzicht dokumentiert“. |
| **Akzeptanzkriterium** | Vor **beBPo-Versand** bzw. Markierung **versandfähig** bei ERV-Meldungen: entweder `durchgefuehrt: true` mit Datum, Rolle und `ergebnis`, **oder** `verzicht: true` mit Pflichtfeld `verzichtBegruendung` (z. B. Verweigerung, nicht auffindbar, bereits vernommen – mit Verweis). |
| | System **blockiert** beBPo/versandfähig, solange der Block fehlt oder unvollständig ist (Zielsystem). |
| | **Abgrenzung Zeugen:** `zeugen[]` = Zeugen; `anhoerungBeschuldigte` = Anhörung der **Hauptperson** als Beschuldigte/r. |
| | **Frist (Soll):** Anhörung **innerhalb der 24-h-SLA** nach Einreichung, sofern praktikabel; spätestens vor externem Versand. |
| **Rolle(n)** | Durchführung: `stationsleitung`, `val`, `anstaltsleitung`; Koordination Station der Hauptbeteiligten: `avd`, `stationsleitung` |
| **Meldungstyp** | **Muss:** `STRAFANZEIGE` (Detail: A2-F-STR-009); **Muss:** `MELDUNG_GERICHT` (Detail: A2-F-GER-005); **Kann:** `VORFALL_INTERN` nach JVA-Regel (Anhang A) |
| **Statusbezug** | `SUBMITTED` → `IN_PROGRESS` (vor `versandfähig` / beBPo) |
| **Quelle** | ARIS „Anhörungen durchführen, falls nötig“; Fachauftrag 2026-05-22 |
| **Prototyp** | **nicht umgesetzt** |

**Workshop-Checkliste:** [09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md](09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md) Q-32. **Zieloptionen UI:** [12_PROTOTYP_POPUP_ZIELOPTIONEN.md](12_PROTOTYP_POPUP_ZIELOPTIONEN.md) Z-22, Z-65.

---

## Rückgabe zur Ergänzungserfassung (Zeugen / Beweismittel)

### A2-F-QS-004 – Rückgabe durch VAL/AL zur Nachreichung (offene Anforderung)

| Feld | Inhalt |
|------|--------|
| **ID** | A2-F-QS-004 |
| **HEUREKA-Referenz** | HEUREKA-2.0-A2-QS-004 |
| **Titel** | Rückgabe zur Ergänzungserfassung (Zweiterfassung) bei offenen Zeugen/Beweismitteln |
| **Priorität** | **Offene Anforderung** / Zielsystem (Muss) |
| **Status** | **Umgesetzt** im Prototyp (siehe [UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md](../UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md)) |
| **Beschreibung** | **Zeugenaussagen** und **Beweismittel** (Anlagen, Sicherungsnachweise) können **nicht immer innerhalb von 24 Stunden** vollständig aufgenommen werden. Die **24-h-SLA** bezieht sich auf die **Bearbeitungsübernahme** (`IN_PROGRESS`), nicht auf den Abschluss aller Zeugen- und Beweismittel-Arbeiten. **`val`** und **`anstaltsleitung`** müssen die Meldung deshalb **zur Ergänzungserfassung zurückgeben** können (fachlich: **Zweiterfassung** / Rückgabe an die Erfassung), damit Station/aVD **Beweismittel nachreichen**, **Zeugen ergänzen** oder **Zeugenaussagen** vervollständigen können. Anschließend **erneute Einreichung** zur fachlichen Prüfung. |
| **Abgrenzung ARIS-Zweiterfassung** | ARIS kennt zusätzlich eine **parallele, unabhängige Zweiterfassung** (QS) – hier gemeint ist die **operative Rückgabe** wegen **fehlender/unvollständiger** Zeugen- oder Beweismittel-Daten (Happy Path HP-26b–HP-26e). |
| **Vorbedingung** | Meldung in **In Bearbeitung** (`IN_PROGRESS`) oder **Weitergeleitet** (`FORWARDED`); mindestens ein offener Punkt Zeugen und/oder Beweismittel dokumentiert. |
| **Auslöser** | VAL/AL stellt bei Prüfung fest: Zeugen-/Beweismittel-Aufnahme **nicht fristgerecht** oder **unvollständig**. |
| **Ergebnis** | Status **Entwurf** (`DRAFT`); `metadaten.rueckgabeErgaenzung` mit Grund, Frist und Kommentar; Verlaufseintrag „Zur Ergänzungserfassung zurückgegeben“; **beBPo/versandfähig gesperrt** bis zur erneuten Einreichung. |
| **Akzeptanzkriterium** | Nur **`val`** und **`anstaltsleitung`** können die Rückgabe auslösen (Zielsystem). |
| | Pflicht: **Grund** (`zeugen` \| `beweismittel` \| `beides`) und **Kommentar** an die Erfassung. |
| | Nach Rückgabe: Erfassende können **Anhänge** und **`metadaten.zeugen[]`** bearbeiten; **erneutes Einreichen** setzt Status wieder auf `SUBMITTED` (ggf. neue Zeugen-Folgeaktionen). |
| | Beweismittel-Nachreichung: AVD kann **Ja** (Anhänge/Kurztext) **oder** **Nein** mit Pflicht-Begründung (`beweismittelKeineBegruendung`) wählen, wenn nachweislich keine Beweismittel vorliegen (z. B. nur Zeugenaussagen); System legt **Notiz** an. |
| | VAL kann Beweismittel nachfordern **unabhängig** vom Erstwert `beweismittelGesichert` (auch aus Aufgabe „Fachliche Prüfung“). |
| | **SLA:** 24-h-Messung für die **erste** Übernahme bleibt protokolliert; **Frist für Nachreichung** (Soll: z. B. **5 Werktage**, Workshop) separat anzeigen und überwachen. |
| | **Keine** Rückgabe nach **beBPo-Versand** oder **Archiv** (Ausnahme nur über gesonderten Korrekturprozess – nicht Teil dieser ID). |
| **Rolle(n)** | Auslösen: `val`, `anstaltsleitung`; Bearbeitung nach Rückgabe: `avd`, `stationsleitung` (Erfassung) |
| **Meldungstyp** | Mindestens `STRAFANZEIGE`; analog für andere ERV-Typen und `VORFALL_INTERN` nach Beschluss |
| **Statusbezug** | `IN_PROGRESS` \| `FORWARDED` → `DRAFT` → `SUBMITTED` → `IN_PROGRESS` |
| **Quelle** | Fachauftrag 2026-05-22 |
| **Prototyp** | **umgesetzt** (Rückgabe-Weg inkl. Beweismittel-Arbeitskorb-Task, Team-Übersicht; siehe [UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md](../UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md)) |
| **Verknüpfung** | Status: **A2-F-STA-003**; Happy Path: [HAPPY_PATH_STRAFANZEIGE.md](../HAPPY_PATH_STRAFANZEIGE.md) HP-26b–HP-26e; Z-66 |

### A2-F-STA-003 – Statusübergang Rückgabe Ergänzungserfassung

| Feld | Inhalt |
|------|--------|
| **ID** | A2-F-STA-003 |
| **HEUREKA-Referenz** | HEUREKA-2.0-A2-STA-003 |
| **Priorität** | Zielsystem (Muss) |
| **Beschreibung** | Erlaubter Übergang **`IN_PROGRESS`**, **`FORWARDED`** oder **`SUBMITTED`** → **`DRAFT`** durch `val`/`anstaltsleitung` mit Aktion **„Zur Ergänzungserfassung zurückgeben“** (A2-F-QS-004). |
| **Akzeptanzkriterium** | `PATCH …/status` mit Ziel `DRAFT` und Pflichtkommentar; andere Rollen → 403; Verlauf und `metadaten.rueckgabeErgaenzung` gesetzt. |
| **Prototyp** | **umgesetzt** (siehe [UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md](../UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md)) |
