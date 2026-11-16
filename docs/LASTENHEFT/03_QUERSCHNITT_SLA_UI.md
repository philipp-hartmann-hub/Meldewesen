# Kapitel 6 – Querschnitt SLA, Eskalation, UI

**Version:** 0.31 | **Status:** Phase 2 ausformuliert (Entwurf 0.x)

## 6.5 ERV-Prozess (Querschnitt)

1. Meldung ERV-relevant anlegen (`ervRelevant: true` oder aus Meldungstyp abgeleitet).
2. Interne Bearbeitung / Weiterleitung bis **versandfähig** (Definition: offen, siehe Rückfragen).
3. **xJustiz/beBPo** (Mock) durch VAL/AL.
4. **eGPA-Veraktung** (Mock) durch VAL/AL.
5. Abschluss **Archiviert** mit **Vier-Augen** (VAL ↔ AL) bei ERV.

### A2-F-SLA-001 – ERV-Reihenfolge vor Abschluss (Zielsystem)

| Feld | Inhalt |
|------|--------|
| Priorität | Zielsystem |
| Beschreibung | Bei ERV-relevanten Meldungen darf Abschluss nur erfolgen, wenn beBPo-Versand und Veraktung dokumentiert sind (Reihenfolge: beBPo vor eGPA). |
| Prototyp | **nicht durchgesetzt** (manueller Workshop-Ablauf) |

---

## SLA und Eskalation

### Kern-SLA (Beschluss)

| Meilenstein | Frist | Messpunkt |
|-------------|-------|-----------|
| Bearbeitung aufnehmen | **24 h** nach `SUBMITTED` (Werktage) | `IN_PROGRESS` oder dokumentierte Übernahme |
| **Nicht Inhalt der 24-h-SLA** | Vollständige **Zeugenaufnahme** und **Beweismittel-Anlagen** | separate Frist über **Rückgabe Ergänzungserfassung** (A2-F-QS-004) |
| **Fristbeginn Wochenende** | **Je JVA in Anhang A** (Kern: Platzhalter) | z. B. nächster Werktag 08:00 |
| Externer Versand | **3 Werktage** nach „versandfähig“ | Versandstatus beBPo/ERV |
| Eskalation 24 h | → Stationsleitung / Führung | Anhang A je JVA |
| Eskalation 3 Tage | → VAL, dann AL | |

### Eskalationsuhr 24 h (Empfehlung, Zielsystem)

| Zeit | Rolle | Aktion |
|------|-------|--------|
| 0 h | Station | Warteschlange |
| +4 h | `stationsleitung` | Erinnerung |
| +8 h | SL → `val` | Eskalation 1 |
| +16 h | `val` | Übernahme |
| +20 h | `anstaltsleitung` | Eskalation 2 bei Blockade |

`kammer` / `zahlstelle` / `arbeitskoordination`: nicht Pflichtstufe; optional informiert.

### A2-F-SLA-002 – Überfälligkeit anzeigen (Prototyp)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| HEUREKA-Referenz | HEUREKA-2.0-A2-SLA-002 |
| Beschreibung | Meldungen in Status *In Bearbeitung* länger als **5 Tage** sowie Verstöße gegen die **24-h-Regel** nach `SUBMITTED` werden in der Liste kenntlich gemacht. |
| Akzeptanzkriterium | Visuelle Kennzeichnung (Text + Farbe/Icon). |
| Prototyp | **umgesetzt** (Listen- und Detail-Hinweis; Kalendertage, siehe Rückfragen Cluster C zu WE/Feiertagen) |

### A2-F-SLA-003 – Eskalationslogik (Prototyp Soll / Zielsystem Muss)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Soll), Zielsystem (Muss) |
| HEUREKA-Referenz | HEUREKA-2.0-A2-SLA-003 |
| Beschreibung | Bei SLA-Verletzung löst das System Eskalationen aus (24 h → SL/Führung; 3 Tage extern → VAL → AL) und protokolliert sie im Statusverlauf. |
| Akzeptanzkriterium (Prototyp) | Mindestens: Eintrag im Statusverlauf „Eskalation an …“; optional Mock-Hinweis in UI (Banner). Kein E-Mail-Versand im Prototyp. |
| Akzeptanzkriterium (Zielsystem) | Benachrichtigung/E-Mail an definierte Rollen gemäß Anhang A. |
| Prototyp | **nicht umgesetzt** (Lastenheft-Soll für Workshop-Phase) |

### A2-F-SLA-004 – Hinweisdialog Prüfpflicht (Prototyp Mock)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Soll) / Zielsystem (Muss, anderer Kanal) |
| HEUREKA-Referenz | HEUREKA-2.0-A2-SLA-004 |
| Beschreibung | **VAL/AL** erhalten eine **sichtbare Mitteilung** (Prototyp: **Modal** auf Dashboard und Meldungsliste), wenn offene Arbeitskorb-Tasks **Fachliche Prüfung** vorliegen. **AVD** erhält dieses Modal nicht (fachliche Prüfung ist VAL-Aufgabe). Im **fertigen Prozess** ersetzt dies durch Aufgabe/E-Mail (A2-F-SLA-003). |
| Akzeptanzkriterium | Dialog mit Anzahl, „Verstanden“, optional Link zur gefilterten Liste; Hinweis „Prototyp“ vs. Zielsystem; einmal pro Session und Demo-Person schließbar; **nur VAL/AL**. |
| Prototyp | **umgesetzt** (`MeldungPruefHinweisModal`, `useMeldungPruefPopup` mit `istPruefer`) – siehe [UMSETZUNG_ARBEITSKORB_NAVIGATION.md](../UMSETZUNG_ARBEITSKORB_NAVIGATION.md) |

---

## Was passiert nach Einreichung (`SUBMITTED`)?

Dieser Abschnitt beschreibt den **unmittelbaren und kurzfristigen** Ablauf nach Übergang von Entwurf zu **Eingereicht** (Status `SUBMITTED`). Statusübergänge und Rollen siehe [02_QUERSCHNITT_ROLLEN_STATUS.md](02_QUERSCHNITT_ROLLEN_STATUS.md).

### Fachlich / Zielsystem

1. **Festlegung:** Die Meldung gilt als **offiziell eingegangen**; sie steht in der Bearbeitungs- bzw. Warteschlange der zuständigen Organisationseinheit (rollen- und ggf. JVA-gefiltert).
2. **Bearbeitung aufnehmen:** Start der **24-h-SLA** (Messpunkt: `IN_PROGRESS` oder dokumentierte Übernahme; Eskalationsuhr siehe oben). Fristlogik zu Wochenenden/Feiertagen: **Rückfrage / Arbeitsannahme** in [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](../RUECKFRAGEN_UND_OFFENE_PUNKTE.md) Cluster C.
3. **ERV-relevante Meldungen:** Interne Bearbeitung / optionales **Weiterleiten** bis **versandfähig**; anschließend **beBPo**, **eGPA**, Abschluss (Reihenfolge und Vier-Augen siehe Abschnitt 6.5).
4. **Strafanzeige mit Zeugen:** Nach Einreichung Folgeaktionen (Benachrichtigung Bedienstete als Zeuge mit Frist; Benachrichtigung Station/Haus bei Inhaftierten / ohne Meldewesen-Zugriff) – siehe [ANHANG_B_FELDER.md](ANHANG_B_FELDER.md), [04_MELDUNGSTYP_STRAFANZEIGE.md](04_MELDUNGSTYP_STRAFANZEIGE.md).

### Technisch (Prototyp HEUREKA A2)

| Schritt | Umsetzung |
|---------|-----------|
| Speichern | `POST /api/meldungen` mit `alsEntwurf: false` **oder** `PATCH /api/meldungen/:id/status` mit `SUBMITTED` (bei bereits angelegter Meldung). |
| Datenbank | `status = SUBMITTED`; neuer Eintrag in `status_verlauf` (Kommentar z. B. „Eingereicht“; bei Strafanzeige ggf. Zusatz zu Zeugen-Folgeaktionen). |
| Strafanzeige + Zeugen | `metadaten` werden bei Einreichung um **`zeugenFolgeaktionen`** (Mock) ergänzt, sofern Zeugen erfasst sind. |
| UI | Weiterleitung zur **Detailansicht**; Status-Badge **Eingereicht**; bei Überschreitung der 24-h- bzw. 5-Tage-Regel **Hinweisbanner** in Liste und Detail (`getSlaHinweise`). |
| Aktionen | Rollengerecht z. B. **In Bearbeitung nehmen**, **Weiterleiten** (siehe `MeldungAktionen` / `mockAuth`). |
| Hinweisdialog (Mock) | Beim Aufruf von **JVP-Dashboard** oder **Meldungsliste**: **Modal** für Nutzer:innen mit Meldungs-Bearbeitungsrecht, wenn mindestens eine Meldung **Eingereicht** (`SUBMITTED`) im Sichtbereich liegt – simuliert die Benachrichtigung prüf-/bearbeitungsberechtigter Personen im **fertigen Prozess** (Zielsystem: Aufgabe/E-Mail, A2-F-SLA-003). Einmal pro Session und Demo-Person per „Verstanden“ schließbar (`sessionStorage`). |
| Nicht im Prototyp | Automatische Eskalationsjobs, **echte** E-Mail-/Push-Benachrichtigungen, Sperre der Meldung für alle Bearbeitenden außerhalb der definierten Rollen (nur teilweise durch Entwurf vs. eingereicht abgebildet). |

---

## UI-Querschnitt (Prototyp)

### A2-F-UI-001 – PageLayout und Design-Tokens

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | Alle Meldeseiten nutzen `PageLayout`, `jhh-*`-Farben, Open Sans, Logo ohne CSS-Filter. |
| Prototyp | Layout-Komponenten – **teilweise** (Dashboard) |

### A2-F-UI-002 – Prototyp-Banner Rollenwechsel

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | Gelbes Banner mit Schnellwechsel der Demo-Rolle; setzt Mock-Header für API. |
| Prototyp | `PrototypBanner.jsx` – **umgesetzt** |

### A2-F-UI-003 – ERV-Badge

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | ERV-relevante Meldungen zeigen `ERVBadge` in Liste und Detail. |
| Prototyp | `StatusBadge` – **Detail/Liste nicht umgesetzt** |

### A2-F-UI-004 – Meldungsrouten und Vollständiger Flow (Workshop-Muss)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| HEUREKA-Referenz | HEUREKA-2.0-A2-UI-004 |
| Beschreibung | Routen aktiv: `/meldungen`, `/meldungen/neu`, `/meldungen/:id`, `/meldungen/:id/bearbeiten` inkl. **Strafanzeige-Formular** (Pflichtfelder Anhang B). |
| Akzeptanzkriterium | Workshop-Durchlauf: anlegen → einreichen → Detail → VAL beBPo (Mock) ohne API-only-Demo. |
| Prototyp | `App.jsx` – **auskommentiert** |

### A2-F-UI-005 – Inaktive Meldungstypen sichtbar

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| HEUREKA-Referenz | HEUREKA-2.0-A2-UI-005 |
| Beschreibung | Typen mit `aktiv: false` erscheinen in der Typauswahl **disabled** mit Tooltip **„in Planung“** (nicht ausblenden). |
| Akzeptanzkriterium | `VORFALL_EXTERN`, `STATISTIK_MELDUNG`, `SONSTIGE` sichtbar aber nicht wählbar. |
| Prototyp | API liefert Flag – **UI nicht umgesetzt** |

---

## Beschlüsse Phase 2

| Thema | Beschluss |
|-------|-----------|
| Weiterleiten Sonderdienste | **Im Code umgesetzt** (Muss) |
| Vier-Augen | **VAL ↔ AL** gegenseitig |
| SLA Prototyp | **Eskalationslogik** (Verlauf + Mock-UI; E-Mail Zielsystem) |
| 24-h Wochenende | **Je JVA**, Anhang A |
| UI Workshop | **Liste + Neu + Detail** inkl. Strafanzeige |
| Inaktive Typen | **Disabled + Tooltip** |

### A2-F-UI-007 – Pop-up Zieloptionen (nicht im Prototyp)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Soll, Workshop) |
| HEUREKA-Referenz | HEUREKA-2.0-A2-UI-007 |
| Beschreibung | Modal mit allen im **Zielprozess** vorgesehenen, im Prototyp **noch nicht klickbaren** Optionen (gruppierte Liste). |
| Prototyp | **umgesetzt** – siehe [12_PROTOTYP_POPUP_ZIELOPTIONEN.md](12_PROTOTYP_POPUP_ZIELOPTIONEN.md), `MeldungZieloptionenModal` |

### A2-F-UI-006 – Barrierefreiheit Formulare

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Soll) |
| Beschreibung | Labels mit `htmlFor`, Pflichtfelder mit `*`, Fokus-Ring, min. 44×44 px Klickfläche. |
| Prototyp | bei Umsetzung MeldungNeu |
