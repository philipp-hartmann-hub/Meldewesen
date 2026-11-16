# Anhang B – Typ-spezifische Datenfelder



Speicherung zusätzlicher Felder in `Meldung.metadaten` (JSON). Keys **lowercase**, englische technische Namen.



---



## Querschnitt: Pflichtangaben der meldenden Person (alle aktiven Typen)



Die meldende Person wählt den **Meldungstyp** und trägt die für die Sachaufklärung **entscheidenden Angaben** ein. Daraus folgt fachlich die **vollständige Darstellung des Geschehens** (Wann, Wo, Was, Wer) sowie – falls einschlägig – **Zeugen** und **gesicherte Beweismittel**.



### Inhaltliche Mindestangaben (fachlich / Lastenheft)



| Thema | Inhalt | Speicherort | Pflicht bei **Einreichung** |

|-------|--------|-------------|----------------------------|

| **Wann** | Zeitpunkt des Geschehens | `metadaten.tatzeit` (ISO-Datum/Zeit) | **ja** (alle aktiven Typen) |

| **Was** | Darstellung des Sachverhalts | `sachverhalt` | **ja** |

| **Wo** | Ort des Geschehens | `metadaten.tatort` (Text) | **ja** (alle aktiven Typen) |

| **Wer (beteiligt)** | Hauptbetroffene/r Gefangene/r; ggf. weitere Beteiligte | `gefangeneId` (Pflicht); optional `metadaten.beteiligteGefangene[]` | Hauptperson **ja** |

| **Wie / Umstände** | Ablauf, Kontext, Art des Geschehens | im **Sachverhalt** (Freitext) mitzudenken | **ja** (im Sachverhalt abzudecken) |

| **Zeugen** | Benennung und Aussage, **wenn** es Zeugen gab | `metadaten.zeugen[]` | **bedingt**: nur wenn Zeugen vorkommen (Einzelfall); dann vollständige Zeilen siehe unten |

| **Beweismittel** | Angabe, ob gesichert; bei Ja Kurzbezeichnung | `metadaten.beweismittelGesichert` (`ja` \| `nein`), bei `ja` zusätzlich `metadaten.beweismittelAngaben` | **ja** (explizite Ja/Nein-Entscheidung; bei Ja Kurztext) |



**Hinweis Entwurf:** Im **Entwurf** (`DRAFT`) können Angaben schrittweise ergänzt werden; die vollständige Prüfung erfolgt bei **Einreichung** (`SUBMITTED`).



### Anforderungen (HEUREKA-IDs)



#### A2-F-ERF-001 – Kerndaten Einreichung



| Feld | Inhalt |

|------|--------|

| Priorität | Lastenheft (Muss) / Prototyp (Muss) |

| HEUREKA-Referenz | HEUREKA-2.0-A2-ERF-001 |

| Beschreibung | Bei Einreichung einer Meldung (alle aktiven Typen) sind **Tatzeit**, **Tatort**, **Sachverhalt** und **Gefangene/r (Hauptbeteiligte/r)** anzugeben. |

| Akzeptanzkriterium | Validierung bei Einreichung (Frontend + Backend); fehlende Felder mit verständlicher deutscher Meldung. |

| Prototyp | **umgesetzt** (`MeldungForm`, `meldungPflichtfelder.js`, `POST/PATCH status`) |



#### A2-F-ERF-002 – Zeugen und Beweismittel (bedingt)



| Feld | Inhalt |

|------|--------|

| Priorität | Lastenheft (Muss) / Prototyp (Muss) |

| HEUREKA-Referenz | HEUREKA-2.0-A2-ERF-002 |

| Beschreibung | **Zeugen:** Wenn Zeugen beteiligt waren, sind sie zu benennen und die Aussage festzuhalten (siehe `zeugen[]` und Strafanzeige-Kapitel). **Beweismittel:** Es ist anzugeben, ob relevante Beweismittel bereits **gesichert** wurden; bei **Ja** ist eine **Kurzbezeichnung** der gesicherten Beweismittel erforderlich. |

| Akzeptanzkriterium | Ja/Nein zu Beweismitteln Pflicht; bei Ja Textfeld Pflicht; Zeugen-Validierung wenn Zeugenzeile begonnen (bestehende Regel). |

| Prototyp | **umgesetzt** (Formularfeldset Beweismittel; Zeugen unverändert Strafanzeige) |



#### A2-F-ERF-003 – Optionale Dateianhänge (Beweismittel)



| Feld | Inhalt |

|------|--------|

| Priorität | Lastenheft (Soll) / Prototyp (Muss) |

| HEUREKA-Referenz | HEUREKA-2.0-A2-ERF-003 |

| Beschreibung | Die meldende Person kann **optional Dateien anhängen**, z. B. **Fotos** von Beweismitteln oder eine **Datei**, die die gesicherten Beweismittel **auflistet**. Kein Ersatz für die Pflichtangaben zu Beweismitteln im Formular. |

| Akzeptanzkriterium | Upload nur bei Meldung im Status **Entwurf**; nach Einreichung keine Ergänzung; sinnvolle Dateitypen (Bilder, PDF, Text, Word); Größenlimit (Prototyp: max. 15 MB pro Datei, bis zu 20 Dateien); Anzeige und Download in der Detailansicht. |

| Prototyp | **umgesetzt** (`POST /api/meldungen/:id/anhaenge`, `MeldungForm`, `MeldungDetail`) |



---



## STRAFANZEIGE



### Meldungstyp vs. Untertyp



| Ebene | System | Wert |

|-------|--------|------|

| **Meldungstyp** | `meldungsTyp` | `STRAFANZEIGE` (ein Typ, ERV-pflichtig) |

| **Tatvorwurf** | `metadaten.tatvorwurf` (+ Legacy `strafanzeigeUntertyp`) | `btm` \| `aov` \| `diebstahl` |



Der **Prozess** (Status, Rollen, beBPo, eGPA, Archiv) ist für alle drei Tatvorwürfe **gleich**. Unterschiede betreffen fachliche Einordnung, ggf. Pflichtanlagen und Auswertung (Workshop).



| Key | Label (DE) | Pflicht (Einreichung) | Werte | Hinweis |

|-----|------------|------------------------|-------|---------|

| tatzeit | Tatzeit | **ja** | ISO-Datum/Zeit | Querschnitt A2-F-ERF-001 |

| tatort | Tatort | **ja** | Text | Querschnitt A2-F-ERF-001 |

| tatvorwurf | Tatvorwurf | **ja** | `btm`, `aov`, `diebstahl` | Kein Freitext; bei Speichern auch `strafanzeigeUntertyp` (Legacy) |

| strafanzeigeUntertyp | (technisch, Legacy) | – | wie `tatvorwurf` | Abwärtskompatibel |

| beweismittelGesichert | Beweismittel gesichert | **ja** | `ja` \| `nein` | A2-F-ERF-002 |

| beweismittelAngaben | Kurzbezeichnung Beweismittel | **ja**, wenn `beweismittelGesichert` = `ja` | Text | |

| zeugen | Zeugen und Zeugenaussagen | bedingt | Array, siehe unten | A2-F-ERF-002 |

| beteiligteGefangene | Weitere Beteiligte | optional | Array (gefangenenNr) | Soll Mehrfach; Prototyp optional |



#### Zeugen (`metadaten.zeugen[]`)



**Fachregel Benachrichtigung (Zielsystem, inhaltlich):** Wird eine **bedienstete Person** als Zeuge benannt, erhält sie im System eine **Mitteilung**, dass sie zur **Zeugenaussage** aufgefordert wird (Bestätigung oder Ergänzung der erfassten Aussage; im Prototyp Mock mit Frist). Ist die benannte Person **inhaftiert** oder hat sie **keinen Zugang zum Meldewesen**, erhalten die **Bediensteten der zuständigen Station bzw. des Hafthauses** die Mitteilung, die **Zeugenaussage aufzunehmen** (im Prototyp: Benachrichtigung an **aVD** und **Stationsleitung** am gewählten Standort).



| Key (je Eintrag) | Label | Pflicht | Werte |

|------------------|-------|---------|-------|

| `id` | (technisch) | ja | UUID/ID |

| `zeugenTyp` | Art des Zeugen | ja | `bediensteter` \| `inhaftierter` \| `ohne_meldeberechtigung` |

| `name` | Benennung Zeuge/Zeugin | ja | Text |

| `gefangenenNr` | Gefangenen-Nr. | optional | nur bei `inhaftierter` (Stammdaten) |

| `benachrichtigungJva` | JVA für Stations-Benachrichtigung | **ja** bei `inhaftierter`, `ohne_meldeberechtigung` | Text |

| `benachrichtigungHaus` | Station / Hafthaus | **ja** bei `inhaftierter`, `ohne_meldeberechtigung` | Text (z. B. „Abteilung 1“) |

| `aussage` | Zeugenaussage | ja | Text |



| `zeugenTyp` | Bedeutung |

|-------------|-----------|

| `bediensteter` | JVA-Bedienstete/r, **eigene** Zeugenaussage |

| `inhaftierter` | **Mitgeteilte** Aussage; Benachrichtigung aVD/SL am gewählten **Haus/Station** |

| `ohne_meldeberechtigung` | Person **ohne Zugriff auf das Meldewesen**; Benachrichtigung aVD/SL am gewählten **Haus/Station** |



*Mindestanzahl Zeugen: **keine** – Einzelfallentscheidung (nur erfassen, wenn es Zeugen gab).*



#### Folgeaktionen (`metadaten.zeugenFolgeaktionen`, nach Einreichung)



| Auslöser | Aktion (Zielsystem) | Prototyp |

|----------|---------------------|----------|

| `zeugenTyp: bediensteter` | **Mitteilung im System** an die benannte/n Bedienstete/n: Aufforderung zur **Zeugenaussage** (Bestätigung/Ergänzung der eigenen Aussage) inkl. **Frist** | `bediensteteBenachrichtigungen[]`, Mock-Portal |

| `zeugenTyp: inhaftierter` \| `ohne_meldeberechtigung` | **Mitteilung** an **aVD + Stationsleitung** am in `benachrichtigungJva` + `benachrichtigungHaus` gewählten Standort: **Zeugenaussage aufnehmen** (Koordination an der zuständigen Station bzw. am zuständigen Hafthaus). Ohne Standort: Fallback nur bei `inhaftierter` aus Stammdaten des Zeugen (falls vorhanden). | `stationWeiterleitungen[]` |



Frist Bedienstete (Prototyp): **5 Kalendertage** ab Einreichung (`fristBis`).



#### Tatvorwurf-Optionen (fachliche Zuordnung)



| Wert | Anzeige | Bedeutung (Annahme bis Workshop) |

|------|---------|----------------------------------|

| `btm` | BTM – Betäubungsmittel | Delikte im Zusammenhang mit Betäubungsmitteln |

| `aov` | aoV – Angriff auf Vollzugsbedienstete | Angriff auf Bedienstete (*Bezeichnung bestätigen*) |

| `diebstahl` | Diebstahl | Diebstahl / Unterschlagung o. Ä. |



### Mögliche Anlagentypen (ohne Mindestzahl)



Einsatzprotokoll · Fotodokumentation · Ärztlicher Bericht · Zeugenaussage · Sonstiges (Freitext)



*Ob je Untertyp andere Anlagen Pflicht sind: **Workshop** (offen).* Datei-Upload im Prototyp: **nicht** umgesetzt.



---



## VORFALL_INTERN



| Key | Label | Pflicht (Einreichung) | Typ |

|-----|-------|------------------------|-----|

| tatzeit | Tatzeit | **ja** | ISO-Datum/Zeit |

| tatort | Tatort | **ja** | Text |

| fundort | Zusätzlicher Fundort / genauer Ort | optional | Text (Ergänzung zu Tatort) |

| beweismittelGesichert | Beweismittel gesichert | **ja** | `ja` \| `nein` |

| beweismittelAngaben | Kurzbezeichnung | **ja**, wenn `ja` | Text |



---



## MELDUNG_GERICHT



| Key | Label | Pflicht (Einreichung) | Typ |

|-----|-------|------------------------|-----|

| tatzeit | Tatzeit | **ja** | ISO-Datum/Zeit |

| tatort | Tatort | **ja** | Text |

| aktenzeichen | Aktenzeichen | Soll | Text |

| beweismittelGesichert | Beweismittel gesichert | **ja** | `ja` \| `nein` |

| beweismittelAngaben | Kurzbezeichnung | **ja**, wenn `ja` | Text |



---



## Gemeinsam (alle Typen)



| Feld | Speicherort | Pflicht (Einreichung) |

|------|-------------|------------------------|

| Sachverhalt | `sachverhalt` | ja |

| Gefangener (Hauptbeteiligte/r) | `gefangeneId` | ja (alle drei aktiven Typen im Prototyp) |

| Empfänger | `empfaenger`, `empfaengerTyp` | STR/GER: ja; INT: `empfaengerTyp` intern + abgeleiteter `empfaenger` |


