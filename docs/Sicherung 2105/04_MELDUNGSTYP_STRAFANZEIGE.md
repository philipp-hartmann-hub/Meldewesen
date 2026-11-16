# Meldungstyp STRAFANZEIGE (Strafanzeige)

**Code:** `STRAFANZEIGE` | **Aktiv:** ja | **ERV-relevant:** ja  
**Version:** 0.5 | **Untertypen** BTM / aoV / Diebstahl (Prototyp)

---

## 1 Zweck und Auslöser

Strafrechtlich relevante Vorfälle in der JVA (z. B. Körperverletzung, Diebstahl) werden als Meldung erfasst und nach interner Prüfung an die zuständige **Staatsanwaltschaft** (Mock: beBPo/xJustiz) übermittelt. Veraktung in eGPA erfolgt nach externem Versand.

**Workshop-Priorität:** Pilot-Typ für JVA-Bedienstete.

---

## 2 Gefangenenbezug

| Feld | Soll |
|------|------|
| Gefangener | **Mindestens ein** Beteiligter (Pflicht); **mehrere** Beteiligte fachlich möglich |
| Prototyp | Ein Feld `gefangeneId` (Hauptbetroffener); weitere in `metadaten.beteiligteGefangene[]` (Soll) – Workshop/Technik |

---

## 3 Pflicht- und optionale Felder

Querschnitt **Tatzeit, Tatort, Sachverhalt, Beteiligte, Beweismittel, Zeugen (bedingt):** [ANHANG_B_FELDER.md](ANHANG_B_FELDER.md) (A2-F-ERF-001, A2-F-ERF-002). Zusätzlich typ-spezifisch:

| Feld | Speicherort | Pflicht (Einreichung) |
|------|-------------|------------------------|
| **Tatvorwurf** | `metadaten.tatvorwurf` (Auswahl) | **ja**: `btm`, `aov`, `diebstahl` – kein Freitext |
| Sachverhalt | `sachverhalt` | ja |
| Tatzeit / Tatort | `metadaten.tatzeit`, `metadaten.tatort` | ja (Querschnitt) |
| Beweismittel gesichert + ggf. Kurztext | `metadaten.beweismittelGesichert`, `beweismittelAngaben` | ja (Querschnitt) |
| Empfänger / Typ | `empfaenger`, `empfaengerTyp` | ja; **Default** „Staatsanwaltschaft Hamburg“, **im Formular änderbar** |
| Zeugen / Zeugenaussagen | `metadaten.zeugen[]` | **Einzelfall** – nur wenn es Zeugen gab; sonst leer |
| Dringend | `prioritaet` (1 = dringend) | setzbar bei Erstellung durch **alle** Rollen mit Erstellungsrecht |

### 3.1 Untertypen (kein eigener Meldungstyp)

Fachlich drei **Arten** unter einem Meldungstyp `STRAFANZEIGE` – **nicht** drei Systemtypen:

| Untertyp | Bedeutung (Annahme) |
|----------|---------------------|
| BTM | Betäubungsmitteldelikte |
| aoV | Angriff auf Vollzugsbedienstete (*Bezeichnung im Workshop bestätigen*) |
| Diebstahl | Diebstahl / Unterschlagung |

**Prozess** identisch für alle Untertypen. Abweichende Pflichtanlagen je Untertyp: **offen** (Workshop).

### A2-F-STR-006 – Untertyp Strafanzeige (Prototyp)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Muss) |
| Beschreibung | Formular Strafanzeige: Pflichtauswahl **Tatvorwurf** (BTM / aoV / Diebstahl). |
| Akzeptanzkriterium | Wert in `metadaten.tatvorwurf` (und `strafanzeigeUntertyp`); Anzeige in Liste und Detail. |
| Prototyp | **umgesetzt** |

### A2-F-STR-007 – Zeugen und Zeugenaussagen (Prototyp)

| Feld | Inhalt |
|------|--------|
| Priorität | Prototyp (Soll) |
| Beschreibung | Bei Strafanzeige: Zeugen benennen; Zeugenaussage festhalten. Bedienstete geben eigene Aussage ab oder dokumentieren mitgeteilte Aussage von Inhaftierten bzw. Personen ohne Meldeberechtigung. |
| Akzeptanzkriterium | `metadaten.zeugen[]` mit `zeugenTyp`, `name`, `aussage`; bei Inhaftierten/Personen ohne Meldewesen-Zugriff zusätzlich `benachrichtigungJva` + `benachrichtigungHaus`; Anzeige in Detail; Validierung wenn Zeuge begonnen. |
| Prototyp | **umgesetzt** |

### A2-F-STR-008 – Folgeaktionen Zeugen (Prototyp)

| Feld | Inhalt |
|------|--------|
| Priorität | Soll (Ziel) / Prototyp Mock |
| Beschreibung | **Einzelfall:** Zeugen nur bei Bedarf. **Bedienstete/r** als Zeuge → **Mitteilung im System**, dass die **Zeugenaussage** zu bestätigen bzw. zu ergänzen ist, mit **Frist** (Prototyp: 5 Kalendertage). **Inhaftierte/r** und **Person ohne Zugriff auf das Meldewesen** → Pflichtauswahl **JVA + Station/Hafthaus**; **Mitteilung** an **aVD und Stationsleitung** dieses Standorts, die **Zeugenaussage aufzunehmen** (Fallback JVA/Haus aus Stammdaten nur bei Inhaftiertem mit Gefangenen-Nr.). |
| Speicherort | `metadaten.zeugenFolgeaktionen` (Mock, kein E-Mail) |
| Akzeptanzkriterium | `benachrichtigungJva` + `benachrichtigungHaus` bei den beiden genannten Typen; Folgeaktionen wie beschrieben. |
| Auslöser | Einreichung (`SUBMITTED`) |
| Prototyp | **umgesetzt** (Mock im Portal) |

---

## 4 Prozessablauf

Referenz: [02_QUERSCHNITT_ROLLEN_STATUS.md](02_QUERSCHNITT_ROLLEN_STATUS.md), [03_QUERSCHNITT_SLA_UI.md](03_QUERSCHNITT_SLA_UI.md).

1. aVD/SL: Entwurf inkl. Zeugen (Art, ggf. Station/Hafthaus) und Zeugenaussagen → Eingereicht  
2. SL/VAL: In Bearbeitung (24-h-SLA)  
3. Optional: intern Weitergeleitet  
4. VAL/AL: beBPo → eGPA (Mock)  
5. VAL/AL: Archiviert (Vier-Augen)

---

## 5 Anhänge

- Keine globale Mindestanzahl.
- **Soll:** feste **Liste möglicher Anlagentypen** (z. B. Einsatzprotokoll, Fotodokumentation, ärztlicher Bericht, Zeugenaussage) – Auswahl je Fall, ohne Mindestzahl.
- Prototyp: Modell `Anhang` vorhanden; Upload optional bei **Entwurf** (siehe A2-F-ERF-003).

## Beschlüsse Phase 3 – Strafanzeige

| Thema | Beschluss |
|-------|-----------|
| Empfänger StA | Default Hamburg, änderbar |
| Pflichtfelder Zusatz | **Workshop-Checkliste** |
| Gefangene | Ein oder mehrere (Prototyp: ein Hauptfeld + Metadaten) |
| Dringend | Ja, alle Erstellenden |
| Anhänge | Typenliste, keine Mindestzahl |

---

## Anforderungen

### A2-F-STR-001 – Meldungstyp auswählbar

| Priorität | Prototyp (Muss) |
| Beschreibung | `STRAFANZEIGE` ist in `GET /api/meldungstypen` mit `aktiv: true`, `ervRelevant: true`. |
| Prototyp | **umgesetzt** |

### A2-F-STR-002 – ERV-Flag setzen

| Priorität | Prototyp (Muss) |
| Beschreibung | Beim Anlegen wird `ervRelevant` auf true gesetzt (Client oder Server aus Typ). |
| Akzeptanzkriterium | POST `/api/meldungen` speichert `ervRelevant: true`. |
| Prototyp | **teilweise** (Client muss mitsenden) |

### A2-F-STR-003 – Pflichtfelder validieren

| Priorität | Prototyp (Soll) |
| Beschreibung | Vor Einreichung müssen Sachverhalt, Tatzeit, Tatort und Gefangener gesetzt sein. |
| Prototyp | **nicht umgesetzt** |

### A2-F-STR-004 – beBPo-Button nur VAL/AL

| Priorität | Prototyp (Muss) |
| Beschreibung | Button „Per beBPo versenden“ nur bei ERV und Rolle VAL/AL. |
| Prototyp | API **umgesetzt**; UI **nicht umgesetzt** |

### A2-F-STR-005 – Typ-spezifisches Formular

| Priorität | Prototyp (Muss) |
| Beschreibung | Formular „Neue Meldung“ zeigt bei Strafanzeige zusätzliche Felder (Tatzeit, Tatort). |
| Prototyp | **nicht umgesetzt** |

---

## Abnahmeszenarien (Kap. 9)

| ID | Rolle | Szenario | Erwartung |
|----|-------|----------|-----------|
| TST-STR-01 | aVD | Strafanzeige anlegen, einreichen | Status SUBMITTED, ERV-Badge |
| TST-STR-02 | VAL | MEL-018 bearbeiten, beBPo senden | Versand protokolliert |
| TST-STR-03 | aVD | beBPo senden versuchen | 403 |
| TST-STR-04 | VAL | Nach beBPo+eGPA abschließen | ARCHIVED (Vier-Augen: manuell prüfen) |
| TST-STR-05 | Seed | MEL-015 archiviert | Referenzdaten in Demo |

*Seed:* [backend/seed.js](../../backend/seed.js) MEL-018, MEL-015.
