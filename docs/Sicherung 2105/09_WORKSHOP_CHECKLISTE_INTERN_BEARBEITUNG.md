# Workshop-Checkliste: Interne Bearbeitung (nach Einreichung)

**Version:** 0.1 | **Status:** Entwurf für JVA-Workshop  
**Basis:** [08_GESAMTPROZESS_ARIS.md](08_GESAMTPROZESS_ARIS.md) Kap. 3.5–3.9 und Kap. 8  
**Geltung:** Status **Eingereicht** (`SUBMITTED`) bis **versandfähig** bzw. **Archiviert** – **ohne** erneute Erfassung (Entwurf)

---

## 1 Verwendung im Workshop

| Ziel | Vorgehen |
|------|----------|
| Fachlichen **Prüfinhalt** je Meldungstyp festlegen | Pro Typ die Abschnitte 3–5 durchgehen |
| **Versandfähig** definieren | Abschnitt 2.8 + typ-spezifische Zeilen |
| ARIS-Lücken schließen | Offene Spalte „Beschluss“ ausfüllen; Ergebnis in Lastenheft/Anhang A |
| Prototyp validieren | Spalte „Prototyp heute“ – reicht UI/Status oder fehlt Schritt? |

**Legende Spalten „Beschluss“:** `J` Ja · `N` Nein · `NA` entfällt · `OFFEN` noch klären  
**Legende „Pflicht“:** `M` Muss · `S` Soll · `K` Kann · `?` Workshop klären

**Teilnehmer:** je JVA mindestens aVD/Stationsleitung + VAL oder AL; Moderation protokolliert Abweichungen für [ANHANG_A_JVA_MATRIX.md](ANHANG_A_JVA_MATRIX.md).

---

## 2 Querschnitt – alle aktiven Meldungstypen

Gilt für **STRAFANZEIGE**, **VORFALL_INTERN**, **MELDUNG_GERICHT** (nach Einreichung).

### 2.1 Übernahme und SLA

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| Q-01 | Bearbeitung innerhalb **24 h** aufgenommen (`IN_PROGRESS` oder dokumentierte Übernahme) | Stationsleitung / aVD | M | SLA-Hinweis in Liste/Detail | | |
| Q-02 | Frist läuft an **Wochenenden/Feiertagen** weiter (keine Pause) | – | ? | Kalendertage, offen | | |
| Q-03 | Bei SLA-Verletzung Eskalation an SL, dann VAL, dann AL | siehe Lastenheft SLA | S | nicht automatisch | | |
| Q-04 | Zuständigkeit geklärt (wer bearbeitet, wer nur informiert wird) | SL / VAL | M | Rollenfilter, kein Zuweisungsworkflow | | |

### 2.2 Inhaltliche Prüfung (ARIS: „Richtigkeit und Vollständigkeit“)

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| Q-10 | Sachverhalt vollständig (Wer, Wann, Wo, Was) | Bearbeitende | M | Freitext `sachverhalt` | | |
| Q-11 | Stammdaten Gefangene/r stimmen (falls bezogen) | Bearbeitende | M | Autocomplete/Seed | | |
| Q-12 | Tatzeit/-ort bzw. Fundort plausibel und konsistent mit Sachverhalt | Bearbeitende | M | je Typ in metadaten | | |
| Q-13 | Empfänger / Empfängertyp fachlich korrekt | Bearbeitende | M | Formular | | |
| Q-14 | Anlagen vollständig **für diesen Fall** (keine Mindestanzahl, aber fehlende Belege nachholen) | Bearbeitende | S | Upload nicht umgesetzt | | |
| Q-15 | Beschreibung/Ereignisdarstellung angepasst oder bestätigt | Bearbeitende | S | nur `sachverhalt` | | |
| Q-16 | Rückfrage an Erfassende nötig? (Anpassungen/Ergänzungen) | QS / SL | K | Kommentar Statusverlauf | | |

### 2.3 Meldepflicht und Dringlichkeit (ARIS)

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| Q-20 | **Meldepflicht** geprüft und dokumentiert (meldepflichtig / nicht) | VAL / AL | ? | nicht als eigener Schritt | | |
| Q-21 | Bei **nicht meldepflichtig**: interner Abschluss ohne beBPo | VAL / AL | ? | ERV-Typen immer `ervRelevant` | | |
| Q-22 | **Eilmeldung** bei Frist &lt; 48 h erforderlich? | VAL / AL | ? | nur `prioritaet`, kein Eilmeldungsprozess | | |
| Q-23 | Dringende Vorabinformation an relevanten Empfänger vor vollständiger Meldung | VAL / AL | K | nicht umgesetzt | | |

### 2.4 Organisatorische Bearbeitung

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| Q-30 | **Intern weiterleiten** (andere Rolle/Abteilung) statt selbst abschließen | alle mit Weiterleiten-Recht | K | Status `FORWARDED` | | |
| Q-31 | Weiterleiten ersetzt **nicht** externen Versand | alle | M | dokumentiert in UI-Hinweis | | |
| Q-32 | **Anhörungen** durchgeführt, Ergebnisse dokumentiert und abgelegt | Bearbeitende | ? | nicht im Prototyp | | |
| Q-33 | **Beweismittel** gesichert/digitalisiert | aVD / Station | ? | nicht im Prototyp | | |
| Q-34 | **Expertise/Gutachten** (Revier, Revision, Experte) erforderlich? | VAL / AL | K | nicht im Prototyp | | |
| Q-35 | Gutachten eingegangen; Stellungnahme zu Gutachten erstellt | Bearbeitende | K | nicht im Prototyp | | |

### 2.5 Qualitätssicherung (ARIS – Zielsystem)

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| Q-40 | **QS Erstinstanz** vor Freigabe | QS / SL | ? | nicht abgebildet | | |
| Q-41 | **Zweiterfassung** verpflichtend? | zweite Erfassende | ? | nicht abgebildet | | |
| Q-42 | **QS Zweitinstanz** | QS / VAL | ? | nicht abgebildet | | |

*Workshop-Frage:* QS/Zweiterfassung für **alle** Typen, nur **ERV**, oder JVA-abhängig?

### 2.6 Versandfähig, extern, Abschluss (ERV-Typen)

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| Q-50 | Kriterien **„versandfähig“** erfüllt (Checkliste: _____________ ) | VAL / AL | M | **offen** – definieren! | | |
| Q-51 | **beBPo/xJustiz** versendet (ERV-Nachricht, Strukturdatei, Mitteilung PDF) | VAL / AL | M* | Mock-Button | | |
| Q-52 | **eGPA-Veraktung** nach externem Versand | VAL / AL | M* | Mock-Verakten | | |
| Q-53 | Reihenfolge: **beBPo vor eGPA** | VAL / AL | M | dokumentiert, nicht erzwungen | | |
| Q-54 | **Vier-Augen** Abschluss (VAL ↔ AL) bei ERV | VAL + AL | M | nicht erzwungen | | |
| Q-55 | Ausnahme **direktes Hochladen** statt beBPo zulässig? Wann? | VAL / AL | ? | nicht im Prototyp | | |
| Q-56 | **3 Werktage** SLA ab „versandfähig“ bis Versand | VAL / AL | M | nicht automatisch | | |

\* Nur wenn meldepflichtig / ERV-relevant.

### 2.7 Abschluss ohne externen Versand (nicht ERV)

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| Q-60 | Interne Bearbeitung abgeschlossen; keine externe Meldung | VAL / AL | M | `VORFALL_INTERN` | | |
| Q-61 | Archivierung / interne Dokumentation (eGPA optional?) | VAL / AL | ? | Archiv ohne eGPA | | |

---

## 3 STRAFANZEIGE (`STRAFANZEIGE`, ERV ja)

Zusätzlich zu Abschnitt 2.

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| S-01 | **Tatvorwurf** (BTM / aoV / Diebstahl) fachlich korrekt | Bearbeitende | M | Pflicht-Dropdown | | |
| S-02 | Tatzeit und Tatort plausibel | Bearbeitende | M | metadaten | | |
| S-03 | Empfänger **Staatsanwaltschaft** (oder abweichend begründet) | VAL / AL | M | Default im Formular | | |
| S-04 | **Zeugen**: nur erfasst wenn vorhanden; Angaben vollständig | Erfassende / Bearbeitende | S | Zeugen-Editor | | |
| S-05 | Zeuge **Bedienstete/r**: Aussage bestätigt oder innerhalb Frist nachgereicht | Zeuge / SL | S | Mock-Benachrichtigung 5 Tage | | |
| S-06 | Zeuge **Inhaftierte/r** oder **ohne Meldewesen**: Zeugenaufnahme an richtiger **Station/Haus** angestoßen | aVD / SL Zielstation | M | Mock-Weiterleitung | | |
| S-07 | **Pflichtanlagen** je Tatvorwurf (BTM / aoV / Diebstahl) – welche? | Bearbeitende | ? | offen | | |
| S-08 | Anlagentypen aus Katalog ausreichend? (Einsatzprotokoll, Foto, Arztbericht, …) | Workshop | S | Liste in Anhang B | | |
| S-09 | Vor Versand: Strafanzeige inhaltlich freigegeben durch | VAL / AL | M | nicht als Freigabe-Status | | |

**Untertyp-spezifisch (optional vertiefen):**

| Tatvorwurf | Zusätzliche Prüfpunkte (Workshop ausfüllen) |
|------------|---------------------------------------------|
| BTM | |
| aoV | |
| Diebstahl | |

---

## 4 VORFALL_INTERN (`VORFALL_INTERN`, ERV nein)

Zusätzlich zu Abschnitt 2; Zeilen Q-50–Q-55 mit **NA** markieren.

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| I-01 | Vorfall **ohne** Pflicht zu Staatsanwaltschaft/Gericht/ERV | Bearbeitende | M | kein ERV-Badge | | |
| I-02 | **Fundort** erfasst und plausibel | Bearbeitende | S | metadaten.fundort | | |
| I-03 | Empfänger intern: **Abteilung** oder **Leitung** korrekt gewählt | Bearbeitende | M | empfaengerTyp | | |
| I-04 | Gefangenenbezug: Pflicht, optional oder fallabhängig? | Workshop | ? | aktuell Pflicht im Formular | | |
| I-05 | Disziplinarische / interne Folgemaßnahmen dokumentiert (außerhalb Meldewesen?) | VAL / SL | K | nicht im System | | |
| I-06 | Abschluss durch VAL/AL ohne beBPo/eGPA | VAL / AL | M | Archiv ohne Versand | | |
| I-07 | Interne Weiterleitung an Kammer/Zahlstelle/Arbeitskoordination sinnvoll? | je Fall | K | Weiterleiten erlaubt | | |

---

## 5 MELDUNG_GERICHT (`MELDUNG_GERICHT`, ERV ja)

Zusätzlich zu Abschnitt 2 und ERV-Zeilen Q-50–Q-56.

| Nr | Prüfpunkt | Rolle (Vorschlag) | Pflicht | Prototyp heute | Beschluss | Notizen JVA |
|----|-----------|-------------------|---------|---------------|-----------|-------------|
| G-01 | **Aktenzeichen** vollständig und gültig | Bearbeitende | M | Soll-Feld, UI offen | | |
| G-02 | Zuständiges **Gericht** aus Aktenzeichen ableitbar (Zielsystem) | Bearbeitende | M | Freitext `empfaenger` | | |
| G-03 | Sachverhalt enthält Fristen/Termine relevant für Gericht | Bearbeitende | S | Freitext | | |
| G-04 | Anlagen für Gerichtsmeldung (welche Typen Pflicht?) | Bearbeitende | ? | offen | | |
| G-05 | Gleiche interne Prüfung wie Strafanzeige vor Versand? | VAL / AL | ? | gleicher Statusflow | | |
| G-06 | Nach Versand: Veraktung eGPA wie Strafanzeige | VAL / AL | M | Mock gleich | | |

---

## 6 Inaktive Typen (kurz, falls Workshop Zeit)

| Typ | Nur klären: interne Bearbeitung später gleich wie welcher aktive Typ? |
|-----|------------------------------------------------------------------------|
| `VORFALL_EXTERN` | wie STRAFANZEIGE / eigene Checkliste? |
| Weitere (Seed) | |

---

## 7 Beschluss-Vorlage: Definition „versandfähig“

*Gemeinsam ausfüllen – gilt für ERV-Typen (STRAFANZEIGE, MELDUNG_GERICHT).*

Eine Meldung gilt als **versandfähig**, wenn alle folgenden Punkte erfüllt sind:

1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________
4. Freigabe durch Rolle: ________________ (Unterschrift/Name im Protokoll)
5. Zeitpunkt „versandfähig“ im System: [ ] manuell dokumentieren [ ] Status/Flag (Zielsystem)

**Start 3-Werktage-SLA beBPo:** ab Zeitpunkt „versandfähig“ · Abweichung JVA: siehe Anhang A.

---

## 8 Workshop-Ergebnis übernehmen

| Ergebnis | Zielort |
|----------|---------|
| Beschlüsse Pflicht/Soll je Prüfpunkt | dieses Dokument v0.2 + Kap. 4/5/6 in [04](04_MELDUNGSTYP_STRAFANZEIGE.md) / [05](05_MELDUNGSTYP_INTERN_GERICHT.md) |
| JVA-Abweichungen | [ANHANG_A_JVA_MATRIX.md](ANHANG_A_JVA_MATRIX.md) |
| Offene Punkte | [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](../RUECKFRAGEN_UND_OFFENE_PUNKTE.md) |
| QS/Zweiterfassung Ja/Nein | [08_GESAMTPROZESS_ARIS.md](08_GESAMTPROZESS_ARIS.md) Kap. 8 |
| Prototyp-Backlog | Anforderungs-IDs A2-F-… |

---

## 9 Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2026-05-19 | 0.1 | Erstversion aus ARIS Kap. 8 und aktiven Meldungstypen |
