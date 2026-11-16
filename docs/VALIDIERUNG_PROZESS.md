# Validierungs-Matrix – Gesamtprozess A2 eMeldewesen

**HEUREKA 2.0 · FHH Hamburg Justiz · Justizvollzug**  
**Version:** 1.0 | **Stand:** 2026-06-17  
**Zielgruppe:** Workshop-Leitung, Fachliche Projektbeteiligte, Lastenheft-Autoren

Kompakte Übersicht aus dem **Schritt-für-Schritt-Validierungsdialog** (Juni 2026): Welche Prozessschritte gelten als **sicher**, welche als **Vorentwurf** oder **zu validieren**.

**Maßgebliche Prozessreferenz:** [GESAMTPROZESS.md](GESAMTPROZESS.md) v2.0  
**Offene Punkte (Detail):** [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md)  
**Prototyp-Abgleich:** [PROZESS_SOLL_UND_STAND.md](PROZESS_SOLL_UND_STAND.md)

---

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| **Sicher** | Im Validierungsdialog bestätigt bzw. fachlich geklärt — für Workshop eher Bestätigung als Neuentscheidung |
| **Vorentwurf** | Plausible Antwort (Praxisfeedback / eine JVA-Perspektive) — Workshop mit mehreren JVAs empfohlen |
| **Zu validieren** | Explizit offen, widersprüchlich oder Workshop-Pflicht (OP-* vorhanden) |
| **Annahme** | Modellierter Prozessschritt ohne fachlichen Beschluss — **nicht** als Soll verkaufen |

---

## Matrix nach Phasen

### Phase ① – Ereignis

| Schritt / Regel | Status | Referenz |
|-----------------|--------|----------|
| 1.1 Ereignis wahrnehmen / eindämmen | **Sicher** | organisatorisch, außerhalb eMeldewesen |
| 1.2 Ereignis beendet / aufgelöst | **Vorentwurf** | B1; Fristmesspunkt **OP-F-01** |
| 1.3 aVD können **unmittelbar** melden | **Sicher** | H4 (teilweise) |
| 1.3 **Formale Freistellung** | **Zu validieren** | **OP-ORG-01** |
| 1.4 **Telefonische Vorabmeldung** (schwerwiegende Fälle) | **Sicher** (Grundsatz) | GZ-B2; Details **OP-M-01** |
| 1.4 ggf. Polizei informiert | **Sicher** (Möglichkeit) | schriftlich Ja/Nein **OP-Z-02** |
| Frist Ersterfassung 24 h | **Zu validieren** | **OP-F-01–14** |
| Alle beteiligten aVD melden | **Vorentwurf** | B3, F2; hängt an **OP-FB-01** |

---

### Phase ② – Parallele Ersterfassung

| Schritt / Regel | Status | Referenz |
|-----------------|--------|----------|
| 2.1 Meldungstyp wählen | **Vorentwurf** | J1, L1; **OP-P-01** |
| 2.2 Beteiligte Gefangene (`gefangeneId`, L2) | **Sicher** | B4 |
| 2.3 **Insassen nach Hafthaus** filterbar | **Sicher** | B5, E-03 ✅ Prototyp |
| 2.4 Tatzeit, Tatort, Sachverhalt (Pflicht) | **Sicher** (Pflicht) | Frist **OP-F-01** |
| 2.5 W-Fragen (5 vs. 7) | **Zu validieren** | **OP-W-01**, **OP-W-02** |
| 2.6 Sicherstellung Ja/Nein | **Sicher** | E1, E2; Kammer **OP-BM-01/02** |
| 2.7 **Keine Zeugen**, nur Beteiligte | **Sicher** | D1; Prototyp **OP-Z-01** |
| 2.8 Einreichen → `SUBMITTED` | **Vorentwurf** | B3; SLA **OP-F-*** |
| Ich-Perspektive (ein Text) | **Sicher** | C2 |
| Dringend-Flag | **Sicher – entfällt** | H7 → Telefonat Phase ①.4 |

---

### Phase ③ – Fall-Bündelung (Zentrale)

| Schritt / Regel | Status | Referenz |
|-----------------|--------|----------|
| **Gesamtphase ③** | **Annahme / zu validieren** | **OP-FB-01** |
| 3.1 Gleichen Vorfall identifizieren (E1) | **Zu validieren** | F1, B2 |
| 3.2 Alle aVD-Meldungen bündeln | **Zu validieren** | F1, F2 |
| 3.3 Fall optional benennen | **Vorentwurf** | |
| 3.4 Weiterleitung an DGL | **Zu validieren** | P-01 |
| Nur Zentrale bündelt (A3) | **Vorentwurf** | **OP-JVA-01** |
| Zentrale = `arbeitskoordination` (A1) | **Vorentwurf** | Prototyp ✅ |
| **Ein Fall = ein Meldungstyp** (L1) | **Sicher** | **OP-L-01** |
| Keine Auto-Bündelung | **Vorentwurf** | F1 |
| Weiterleitung DGL **ohne Hartblock** | **Sicher** | J2, F2 |
| Tatzeit/Tatort → Vorschlag | **Vorentwurf** | Assistenz |

---

### Phase ④ – DGL-Qualitätsprüfung

| Schritt / Regel | Status | Referenz |
|-----------------|--------|----------|
| 4.1 Fall sichten (alle Perspektiven) | **Zu validieren** | **OP-FB-01** |
| 4.2 Fachliche Kriterien je Meldung | **Zu validieren** | **OP-DGL-01** |
| 4.3 Inhaltliche Stimmigkeit | **Vorentwurf** | F3, **OP-DGL-01** |
| 4.4a Freigabe → **Stationsleitung** | **Zu validieren** | K1, K4, **OP-FB-01** |
| 4.5 SL → AL/VAL | **Zu validieren** | K4, **OP-JVA-01** |
| 4.4b Rückgabe **aVD + Zentrale** | **Sicher** | F4; Prototyp **OP-DGL-03** |
| 4.4c Fehlende Meldung anfordern | **Sicher** (J2) | **OP-J-02** |
| DGL keine Meldepflicht (K3) | **Vorentwurf** | |
| Rückgabe unbegrenzt (F5) | **Sicher** | |

---

### Phase ⑤ – Entscheid Meldepflicht

| Schritt / Regel | Status | Referenz |
|-----------------|--------|----------|
| 5.1 Fall prüfen (keine Extra-Unterlagen) | **Zu validieren** (Zugang SL-Kette) | G2 **sicher** |
| 5.2 Entscheider **AL oder VAL** (K2) | **Zu validieren** | **OP-K-03** |
| **Meldepflichtig = ERV** (G1) | **Sicher** | |
| Entscheid **„Nein“** → kein beBPo, Veraktung | **Vorentwurf** | O1, G3 |
| Abschluss „Nein“: **AL oder ggf. VAL** | **Zu validieren** | **OP-ABS-01** |
| Entscheid **„Ja“** → ERV-Weg | **Vorentwurf** | |
| ERV-Weg: **ggf. eine Person** | **Zu validieren** | **OP-ERV-03** |
| Frist extern 24 h | **Zu validieren** | **OP-F-01–14**, H2 |

---

### Phase ⑥ – Nachgelagert (Abschluss / ERV / VAL)

| Schritt / Regel | Status | Referenz |
|-----------------|--------|----------|
| ERV-Kette: versandfähig → beBPo → Veraktung | **Zu validieren** | **OP-EGPA-01** |
| **eGPA nicht ausgerollt** → Übergangs-Veraktung | **Zu validieren** | **OP-EGPA-01** |
| „Nein“: Veraktung ohne beBPo | **Vorentwurf** | O1 |
| **Vier-Augen** Abschluss | **Zu validieren** | **OP-V-04** |
| VAL-Befragung **nur nach „Ja“** | **Sicher** | D3 |
| VAL-Befragung Anordnung/Ergebnis am Fall | **Vorentwurf** | O4; **OP-V-02** |

---

## Workshop-Prioritäten (OP-* aus Validierung)

### Blockierend / Prozesskern

| ID | Kurzthema |
|----|-----------|
| **OP-FB-01** | Gesamtprozess **Fall-Bündelung** (Phase ③) und Anschluss **DGL → SL → AL** |
| **OP-JVA-01** | JVA-Abweichungen Rollenkette |
| **OP-EGPA-01** | **Übergangs-Veraktung** (eGPA nicht ausgerollt); ERV-Kette |
| **OP-K-03** | Wer entscheidet **Meldepflicht** (AL / VAL)? |
| **OP-ABS-01** | Interner Abschluss „nein“: AL / ggf. VAL? |
| **OP-ERV-03** | ERV: eine oder zwei Personen? |
| **OP-V-04** | **Vier-Augen**-Regeln |

### Organisatorisch / Ersterfassung

| ID | Kurzthema |
|----|-----------|
| **OP-ORG-01** | Formale **Freistellung** aVD |
| **OP-M-01** | Telefonische Vorabmeldung (Details) |
| **OP-W-01 / OP-W-02** | W-Fragen (5 vs. 7), Textbausteine |
| **OP-F-01–14** | Fristen / SLA |

### Prototyp-Lücken (fachlich geklärt)

| ID | Kurzthema |
|----|-----------|
| **OP-Z-01** | `ZeugenEditor` entfernen |
| **OP-Z-02** | Polizei Ja/Nein (UI) |
| **OP-DGL-01** | DGL-Checkliste |
| **OP-DGL-03** | Rückgabe erreicht aVD (F4 **sicher**) |
| **OP-V-02** | VAL-Befragung Felder/UI am Fall |

---

## Bereits als sicher bestätigt (Kernliste)

- Insassen **nach Hafthaus** filterbar (②.3)
- **Kein Zeugenkonzept** — nur Beteiligte; Bedienstete über eigene Meldung (②.7)
- **Ein Meldungstyp pro Fall** (③, L1)
- Zentrale darf an DGL **ohne Hartblock** bei fehlender aVD-Meldung (③, J2)
- DGL-Rückgabe an **aVD + Zentrale** (④, F4)
- DGL-Rückgabe **unbegrenzt** wiederholbar (④, F5)
- **Meldepflichtig = ERV** (⑤, G1)
- VAL-Befragung **nur nach Entscheid „Ja“** (⑥, D3)
- Telefonische Vorabmeldung bei **schwerwiegenden** Fällen (①.4, Grundsatz)

---

## Pflege

Neue Validierungsentscheidungen aus Workshops:

1. Zeile in dieser Matrix anpassen (Status + Datum in Klammern).
2. Eintrag in [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](RUECKFRAGEN_UND_OFFENE_PUNKTE.md) Chronik **oben**.
3. Soll → [GESAMTPROZESS](GESAMTPROZESS.md) (nach Gesamtprozess-Abgleich, UEBERGABE **§13.4** Schritt 3).
4. Roadmap/Checklisten → [UEBERGABE_GESAMT.md](UEBERGABE_GESAMT.md) **§13**.

---

## Chronik

| Datum | Änderung |
|-------|----------|
| 2026-06-17 | Dokument 1.0 – Matrix aus Validierungsdialog (Phasen ①–⑥) |
