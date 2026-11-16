# Rückfragen und offene Punkte – A2 eMeldewesen

Dieses Dokument bündelt **strukturierte Rückfragen** aus dem Projektgespräch, **Ihre Antworten** (Stand der Dokumentation) sowie **offene Fragen** und **Empfehlungen** für Lastenheft, Workshops und spätere Umsetzung.

**Hinweis:** Wo im Code noch abweichende Standardeinstellungen existieren (z. B. Weiterleiten bei einzelnen Rollen), ist das im Lastenheft als **Soll** festzuhalten und bei der Implementierung abzugleichen.

---

## Arbeitsregel (Pflege dieses Dokuments)

**Verbindlich:** Alle neuen **Rückfragen** (egal ob strukturiert im Dialog oder frei formuliert) und alle **offenen Fragen**, **Annahmen** sowie **Empfehlungen**, die im Projekt zu A2 eMeldewesen auftauchen, werden **hier** dokumentiert – nicht ausschließlich im Chat belassen.

| Inhalt | Vorgehen |
|--------|----------|
| Neue Rückfrage mit Antwort | Passenden **Cluster** ergänzen oder neuen Cluster anlegen; Tabelle oder Liste mit Datum/Kontext falls nötig. |
| Noch unbeantwortet | Unter **„Offen / Empfehlung“** des passenden Clusters oder im Abschnitt **„Chronik neue Einträge“** (unten) eintragen. |
| Nur Empfehlung / Risiko | Als Bullet unter **Offen / Empfehlung** oder Chronik. |

---


## 1 Cluster A – Rollen- und Rechtemodell (Dokument „Matrix v2“)

| Rückfrage | Ihre Antwort |
|-----------|----------------|
| Sollen inaktive Meldungstypen (`VORFALL_EXTERN`, `STATISTIK_MELDUNG`, `SONSTIGE`) kurzfristig aktiviert werden? | Nein, vorerst **inaktiv** lassen. |
| Bleibt „Abschließen/Archivieren“ nur bei `val` und `anstaltsleitung`? | **Ja**, unverändert. |
| Dürfen `kammer`, `zahlstelle`, `arbeitskoordination` intern weiterleiten? | **Ja**. |
| Reihenfolge bei ERV-relevanten Meldungen: eGPA vor xJustiz oder umgekehrt? | **Zuerst xJustiz/beBPo, dann eGPA-Veraktung**. |
| Vier-Augen-Prinzip bei ERV-relevantem Abschluss (`ARCHIVED`)? | **Ja**, verbindlich. |

**Offen / Empfehlung**

- **Vier-Augen:** Wer darf **gegenzeichnen** (`val` ↔ `anstaltsleitung` oder andere Kombination)? Darf dieselbe Person Versand und Abschluss auslösen? → Im Lastenheft **verbindlich** regeln (inkl. Ausnahmen).
- **Code vs. Soll:** ~~Abweichung Weiterleiten Sonderdienste~~ → **behoben** (2026-05-13) in `mockAuth.js` und `RollenContext.jsx`.
- **Rolle Zentrale in der Rollenmatrix:** Fall-Rechte (Bündeln, Sichtbereich, Weiterleiten, DGL-Rückgabe) fehlen in `.cursorrules` §2.3 und Lastenheft 02 – **OP-R-01–08**, Detail [ZU_KLAERENDE_BEGRIFFLICHKEITEN.md](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md) §14.

---

## 2 Cluster B – Projektsteuerung und Dokumentation

| Rückfrage | Ihre Antwort |
|-----------|----------------|
| Priorität für die nächsten 2–4 Wochen? | **Lastenheft- / Stakeholder-Dokumentation**. |
| Primäre Zielgruppe der nächsten Demo? | **JVA-Bedienstete** (Workshop vor Ort). |
| Authentifizierung mittelfristig? | **Offen**, Klärung nach Pilot. |
| Prisma: echte Migrationen oder `db push`? | **`db push`** reicht für den Prototyp. |
| Inaktive Meldungstypen in der Produkt-UI? | **Sichtbar, deaktiviert**, Hinweis „in Planung“. |
| Format Lastenheft? | **Word/PDF** als Hauptformat. |
| Workshop-Scope? | **Mehrere JVAs** (gemeinsamer Kern + Abweichungen). |

**Offen / Empfehlung**

- **Word-Lastenheft:** Inhalt aus [LASTENHEFT_GLIEDERUNG.md](LASTENHEFT_GLIEDERUNG.md) übernehmen; **Anhang A** vor Workshop nur Vorlage + Beispielzeile, Befüllung **nach** gemeinsamem Workshop (Cluster 11).
- **UI „in Planung“:** Umsetzung im Frontend an `GET /api/meldungstypen` (`aktiv: false` → Eintrag disabled + Tooltip) – als Backlog-Eintrag für IT/Prototyp festhalten.
- **Auth nach Pilot:** Entscheidungsvorlage vorbereiten (nur Mock / SSO-Typ / Mandant).

---

## 3 Cluster C – Fachlicher Prozess (allgemein)

| Rückfrage | Ihre Antwort |
|-----------|----------------|
| Wer reicht von DRAFT nach SUBMITTED ein? | **Beides** kommt vor (gleiche Person oder Übergabe). |
| Muss jede Meldung einem Gefangenen zugeordnet sein? | **Typabhängig** festlegen. |
| Was bedeutet „Weiterleiten“? | **Intern und extern** getrennt denken: intern Weiterleitung; **extern nur beBPo/ERV**. |
| Wochenenden und Feiertage – Auswirkung auf Fristen? | **Arbeitsannahme (Validierung):** Fristen laufen **ohne Anhalten** weiter (Kalendertage bzw. Kalenderstunden; Wochenenden und Feiertage **pausieren** die Frist **nicht**). **Fachlich im Workshop bestätigen**; Abgleich mit Lastenheft („Werktag“ bei Eskalationsuhr, Anhang A). |
| Anhänge? | Bei **ERV-relevant** Pflichtlogik möglich; **keine** globale Mindestzahl; **typ-/fallabhängig**. |
| Darf eingereichte Meldung zurückgezogen/geändert werden? | **`val` / `anstaltsleitung`** dürfen **groß korrigieren** (Governance nötig). |

**Nachgefragt (Freitext) – Ihre Festlegungen**

| Thema | Festlegung |
|-------|------------|
| Externer Versand | **Ausschließlich** über **beBPo/ERV** (nicht mit internem FORWARDED verwechseln). |
| SLA-Kern | **24 h** bis Bearbeitungsaufnahme nach `SUBMITTED`; **3 Werktage** bis externem Versand nach „versandfähig“; Eskalation 24 h → SL/Führung; 3 Tage → VAL dann AL. |
| Anhänge Mindestzahl | **Keine** globale Mindestzahl; je Meldungstyp andere sinnvolle/relevante Anhänge. |

**Offen / Empfehlung**

- **Werktag- und Uhrzeitlogik:** z. B. nur Mo–Fr, Feiertage Hamburg, Fristbeginn bei Einreichung nachts am **nächsten Werktag 08:00** – im Lastenheft **ein** Satz + Verweis Anhang A. **Rückfrage:** Gilt die **24-h-SLA** (und ggf. weitere Fristen) als **reine Kalenderfrist** (Uhr läuft am Samstag/Sonntag/Feiertag weiter), oder sollen Wochenenden/Feiertage die Frist **aussetzen** bzw. den **Fristbeginn** verschieben? *(Aktuelle Arbeitsannahme: kein Aussetzen – siehe Tabelle Cluster C.)*
- **Definition „Übernahme“ / Bearbeitung aufgenommen:** reicht Status `IN_PROGRESS`, oder reicht **Kommentar + Zuständigkeit**? → Einheitlich für Messung der 24 h.
- **„Versandfähig“:** exakter fachlicher Startpunkt der **3 Werktage** (Freigabe VAL? ERV-Prüfung? Vier-Augen erledigt?) – im Lastenheft definieren.
- **Große Korrektur durch VAL/AL:** Revisionssicherheit (Versionierung, wer wann, optional neuer Status statt stiller Änderung); Abgleich mit **Vier-Augen** am Abschluss.
- **Technische Durchsetzung (Zielsystem):** Reihenfolge **xJustiz/beBPo vor eGPA** vor Abschluss prüfbar machen (Prototyp derzeit nur teilweise abbildbar).
- **Inhalt von „In Bearbeitung“:** welche **fachlichen Prüfpunkte** (Strafanzeige, intern, Gericht) mindestens abgearbeitet sein müssen, bevor beBPo / Abschluss – derzeit **nicht** im Lastenheft einzeln beschrieben (Workshop-Checkliste).
- **Kammer und gesicherte Beweismittel:** **Offen** – wie und wann soll die **Kammer** kommunizieren bzw. informiert werden, wenn **Beweismittel sichergestellt** wurden? (Zeitpunkt: bereits bei Ersterfassung / erst nach Einreichung / erst nach VAL; **Kanal:** Meldewesen, gesonderte Fachverfahren, telefonisch; **Pflicht vs. Fallgruppe** je Meldungstyp; Abgrenzung zu **Weiterleiten** und zu **ERV/beBPo**.) → Workshop abstimmen, im Lastenheft (Rollenmatrix + Prozess) festhalten.

**Ausformuliert in:** [02_QUERSCHNITT_ROLLEN_STATUS.md](LASTENHEFT/02_QUERSCHNITT_ROLLEN_STATUS.md), [03_QUERSCHNITT_SLA_UI.md](LASTENHEFT/03_QUERSCHNITT_SLA_UI.md) (Version 0.31).

---

Dies war eine **inhaltliche Empfehlung** (kein separates Abfrageformular), abgestimmt auf Station → Abteilung → Anstalt:

| Zeit nach `SUBMITTED` (Werktag) | Rolle | Vorgeschlagene Aktion |
|----------------------------------|--------|------------------------|
| 0 h | Warteschlange Station | sichtbar für `avd` / `stationsleitung` |
| +4 h | `stationsleitung` | Erinnerung / Kapazitätsprüfung |
| +8 h | `stationsleitung` → `val` | Eskalation 1 mit Eintrag im Verlauf |
| +16 h | `val` | Übernahme oder interne Zuweisung |
| +20 h | `anstaltsleitung` | Eskalation 2 nur bei Blockade |

**Offen / Empfehlung**

- `kammer` / `zahlstelle` / `arbeitskoordination` **nicht** als Pflichtstufe in der 24-h-Kette (optional nur **Informiert**).
- Nacht-/Wochenend-Einreichung: **Friststart** explizit regeln (siehe Cluster C).

---

## 5 Bereits im Lastenheft-Gliederungsdokument verankert

Siehe [LASTENHEFT_GLIEDERUNG.md](LASTENHEFT_GLIEDERUNG.md), Abschnitt **5.1 Beschlossene Prozessregeln** (Weiterleiten vs. beBPo/ERV, SLA-Tabelle, Anhänge).

---

## 6 Checkliste „Nächste Schritte“ (für Sie / Workshop)

- [ ] Vier-Augen-Regel schriftlich finalisieren (Wer/Wann).
- [ ] Werktags- und Nachtlogik für SLAs in Anhang A/Zentralregel.
- [ ] Pro Meldungstyp: Gefangenenbezug ja/nein + Anhang-Checkliste.
- [ ] JVA-Matrix Anhang A mit Eskalationsnamen je Standort.
- [ ] Abgleich Rollen-Soll mit Code (`mockAuth`, `RollenContext`, ggf. `PrototypBanner`).
- [ ] Kammer: Kommunikation bei **gesicherten Beweismitteln** fachlich klären (Cluster C).
- [ ] Backlog: UI für inaktive Meldungstypen (disabled + „in Planung“).

---

## 7 Cluster – Phase 0 Lastenheft (Arbeitssetup)

| Rückfrage | Ihre Antwort |
|-----------|----------------|
| Führende Quelle Word vs. Repo? | **Beides parallel**, wöchentlicher Abgleich |
| Versionierung / Freigabe? | **Entwurf 0.x**, keine formale Freigabe im Prototyp |
| Traceability neben A2-ID? | **HEUREKA-Referenz** als Freitextfeld pro Anforderung |
| NF-Anforderungen? | **Ja**, F und NF von Anfang an |
| Granularität? | **Mittel** (Feature/Regel-Ebene) |
| Sprache / Leserschaft? | **Deutsch, Sie**, Fach und IT gleichberechtigt |
| HEUREKA-Format? | **Fest:** `HEUREKA-2.0-A2-{Bereich}-{NNN}`, 1:1 zur A2-ID |
| Vertraulichkeit? | **Intern** |
| Abgleich-Verantwortung? | **Fachauftrag** |
| Priorität „Kann“? | **Ja** – Prototyp (Kann) |
| Word-Layout? | **Eine Tabelle je ID** |
| Testfälle? | **Gekoppelt** – `A2-F-TST-…` mit Feld „Verifiziert Anforderung“ |
| NF im Prototyp? | **Ja** – A11Y voll, AUD teilweise; PERF/SEC Zielsystem |
| Autor/in? | **PD** |

**Ausformuliert in:** [LASTENHEFT/00_PHASE0_ARBEITSHILFE.md](LASTENHEFT/00_PHASE0_ARBEITSHILFE.md) (Version **0.4**, Phase 0 abgeschlossen).

---

## 8 Cluster – Phase 1 Rahmen (Kap. 1–4)

| Rückfrage | Ihre Antwort |
|-----------|----------------|
| Pilot-JVAs im Text? | **Liste nach Workshop**; bis dahin „mehrere JVAs“ |
| Ist-Zustand Kap. 2.1? | **Stichpunkte jetzt**, Workshop ergänzt |
| LC-Plattform namentlich? | **Nur generisch** (LC-Plattform, Produkt offen) |
| Meilenstein-Termine? | **Konkrete Termine** – PD trägt nach (noch offen im Doc) |
| Verzahnung A1? | **JVP-Dashboard** gemeinsamer Einstieg |
| Datenschutz Tiefe? | **Kurz** + Verweis Rechtsreferat/Datenschutz |

**Offen:** Daten in Meilenstein-Tabelle M1–M4 eintragen (PD).

**Ausformuliert in:** [LASTENHEFT/01_KAPITEL_RAHMEN.md](LASTENHEFT/01_KAPITEL_RAHMEN.md) (Version 0.3).

---

## 9 Cluster – Phase 2 Querschnitt

| Rückfrage | Ihre Antwort |
|-----------|----------------|
| Weiterleiten Sonderdienste im Code? | **Ja, umgesetzt** |
| Vier-Augen ERV? | **VAL ↔ AL** gegenseitig |
| SLA im Prototyp? | **Eskalationslogik** (Verlauf/Mock; E-Mail Zielsystem) |
| 24-h am Wochenende? | **Je JVA**, Anhang A; **Rückfrage:** Kalenderfrist ohne Anhalten an WE/Feiertagen vs. aussetzende Werktagslogik → Cluster C, Chronik 2026-05-18 |
| UI Workshop-Muss? | **Liste + Neu + Detail** (+ Strafanzeige) |
| Inaktive Typen UI? | **Disabled + Tooltip „in Planung“** |

**Ausformuliert in:** [02_QUERSCHNITT_ROLLEN_STATUS.md](LASTENHEFT/02_QUERSCHNITT_ROLLEN_STATUS.md), [03_QUERSCHNITT_SLA_UI.md](LASTENHEFT/03_QUERSCHNITT_SLA_UI.md) (Version 0.3).

**Offen / Backlog Prototyp:** UI-Flow, SLA-Eskalation, Vier-Augen-Prüfung im Backend, A2-F-UI-005.

---

## 10 Cluster – Phase 3 Meldungstypen

### Strafanzeige

| Rückfrage | Antwort |
|-----------|---------|
| Empfänger StA | **Kein Formularfeld** bei Erfassung; Einreichung → **fachliche Prüfung (VAL)**; StA erst nach Prüfung/beBPo (Happy Path v0.3) |
| Zusatz-Pflichtfelder | **Workshop-Checkliste** |
| Gefangene | **Ein oder mehrere** (Prototyp: Hauptfeld + Metadaten) |
| Dringend | **Ja**, alle Erstellenden |
| Anhänge | **Typenliste**, keine Mindestzahl |

### Intern / Gericht / Querschnitt

| Rückfrage | Antwort |
|-----------|---------|
| Intern Empfänger | Bei Erstellung wählen: **Abteilung oder Leitung** |
| Intern Gefangener | **Workshop klären** |
| Gericht Empfänger | **Aktenzeichen → Gericht** (Zielsystem); Prototyp Freitext |
| Gericht ERV | **Gleiche Kette** wie Strafanzeige |
| DRAFT bearbeiten | **Alle** mit Bearbeitungsrecht im Sichtbereich |

**Offen:** Workshop-Checkliste Pflichtfelder Strafanzeige; Gefangenenbezug interner Vorfall.

**Ausformuliert in:** [04_MELDUNGSTYP_STRAFANZEIGE.md](LASTENHEFT/04_MELDUNGSTYP_STRAFANZEIGE.md), [05_MELDUNGSTYP_INTERN_GERICHT.md](LASTENHEFT/05_MELDUNGSTYP_INTERN_GERICHT.md), [ANHANG_B_FELDER.md](LASTENHEFT/ANHANG_B_FELDER.md).

---

## 11 Cluster – Phase 4/5 Abnahme & Anhang A

| Rückfrage | Antwort |
|-----------|---------|
| Abnahme Prototyp im Workshop? | **Fachliche Plausibilität** (Demo), keine vollständige TST-Matrix |
| Anhang A vor Workshop? | **Leervorlage + Beispielzeile** (keine Mindestzahl JVAs vorab) |
| Inaktive Typen im LH vertiefen? | **Nein** – Kurzprofil reicht |
| Risikotabelle pflegen? | **PD / Fachauftrag** |
| Wann „workshop-ready“ (0.x)? | Nach **Phase 3** + offene Punkte dokumentiert |
| Testfälle Kap. 9? | **Alle** als `A2-F-TST-…` an F-IDs gekoppelt (`A2-F-TST-001` … `015`) |

**Offen / Empfehlung**

- Nach Workshop: Anhang A für teilnehmende JVAs befüllen; Entwurf 0.x → 0.y in Word.
- Regression: `A2-F-TST-…` vor Pilot technisch abarbeiten (getrennt von Workshop-Abnahme).

**Ausformuliert in:** [06_MELDUNGSTYP_INAKTIV.md](LASTENHEFT/06_MELDUNGSTYP_INAKTIV.md), [07_ABNAHME_UND_ANHANG.md](LASTENHEFT/07_ABNAHME_UND_ANHANG.md), [ANHANG_A_JVA_MATRIX.md](LASTENHEFT/ANHANG_A_JVA_MATRIX.md).

---

## 12 Cluster – Strafanzeige Untertypen (BTM / aoV / Diebstahl)

| Rückfrage | Antwort / Stand |
|-----------|------------------|
| Gibt es unter „Strafanzeige“ die Untertypen BTM, aoV, Diebstahl? | **Fachlich ja** (Nutzerfeststellung); im System **ein** Typ `STRAFANZEIGE` |
| Eigene Meldungstypen im Code? | **Nein** – Tatvorwurf in `metadaten.tatvorwurf` (Legacy: `strafanzeigeUntertyp`) |
| Prozess je Untertyp unterschiedlich? | **Nein** (Annahme) – gleicher ERV-/Statusablauf |
| aoV – Bedeutung? | **Annahme:** Angriff auf Vollzugsbedienstete – **im Workshop bestätigen** |
| Prototyp | Pflicht-Dropdown **Tatvorwurf** (BTM / aoV / Diebstahl); Seed MEL-015/MEL-018 mit `tatvorwurf` |
| Tatvorwurf Freitext vs. Auswahl? | **Entschieden:** Pflicht-Auswahl (kein Freitext); UI-Label „Tatvorwurf“ |
| Zeugen / Zeugenaussagen | **Prototyp:** `zeugen[]` optional; drei Arten; bei Inhaftierten + ohne Meldewesen **Pflicht** Station/Hafthaus; Folgeaktionen bei Einreichung |
| Zeuge Bedienstete/r | **Entschieden:** **Mitteilung im System** mit Frist zur Zeugenaussage – **5 Werktage** (H5) |
| Zeuge Inhaftierte/r | **Entschieden:** Mitteilung an **Station/Hafthaus** (aVD/SL); Aufnahme der Zeugenaussage; Fallback Stammdaten nur wenn kein Standort gewählt |
| Zeuge ohne Meldewesen-Zugriff | **Entschieden:** wie Inhaftierte/r – Pflicht **Station/Hafthaus**; gleiche Mitteilung an aVD/SL |

**Offen / Workshop**

- Ist **aoV** bei allen JVAs gleich benannt?
- Gibt es **weitere** Untertypen oder nur diese drei?
- ~~**Frist** für Bedienstete als Zeugen~~ → **5 Werktage** (H5, 2026-06-11)
- **Standortliste** Station/Hafthaus: Prototyp feste Liste; Zielsystem aus BASIS/Personal?
- **Kanal** Benachrichtigung (E-Mail, Aufgabe LC-Plattform)?
- Zeugenaussage: wörtlich vs. sinngemäß – Vorgabe für Mitteilung?
- **Pflichtanlagen** oder Fristen je Untertyp unterschiedlich?

**Ausformuliert in:** [ANHANG_B_FELDER.md](LASTENHEFT/ANHANG_B_FELDER.md), [04_MELDUNGSTYP_STRAFANZEIGE.md](LASTENHEFT/04_MELDUNGSTYP_STRAFANZEIGE.md), `frontend/src/constants/zeugen.js`.

---

## Praxisfeedback – feedbacketer Prozess (offene Punkte)

| ID | Offener Punkt | Bezug |
|----|---------------|--------|
| **OP-FB-01** | **Workshop:** Gesamtprozess **Fall-Bündelung** (Phase ③, Zentrale → gebündelter Fall) **validieren** – bisher **Annahme** aus Praxisfeedback F1–F5 / P-01–P-02 (eine Perspektive); JVA-Abweichungen (OP-JVA-01) | F1–F5, P-01–P-02, A3; [ZU_KLAERENDE §3.1](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md#31-fall-bündelung--annahme-nicht-validiert) |
| **OP-ORG-01** | **Workshop (Phase ①, Schritt 1.3):** Gibt es eine **formale Freistellung** der beteiligten aVD für die Meldungserfassung — **je JVA** oder **übergreifend**? **Sicher:** Meldung soll **unmittelbar nach dem Ereignis** möglich sein; **Regelung unbekannt** | H4, B1; OP-JVA-01 |
| **OP-DGL-01** | **Konkrete Kriterienliste** für DGL-Prüfung (fachliche Kriterien an Meldung + inhaltliche Stimmigkeit im gebündelten Fall) – Workshop/Lastenheft | F3, P-02 |
| **OP-DGL-02** | ~~Frist/Eskalation fehlende aVD-Meldungen~~ → **teilweise (H4):** Meldungen **unmittelbar** nach Ereignis; **keine** gesonderte Zentrale-Wartefrist. **Offen:** formale **Freistellung** → **OP-ORG-01** | F2, H4 |
| **OP-DGL-03** | **Prototyp:** DGL-Rückgabe soll **aVD und Zentrale** erreichen (F4 **sicher**, 2026-06-17); aktuell nur Status `ZURUECK_AK` (Zentrale), keine aVD-Aufgaben | F4 |
| **OP-AL-01** | ~~AL-Entscheid auf Fall-Ebene~~ → **umgesetzt:** `POST /api/faelle/:id/entscheid-al` → `ABGESCHLOSSEN_INTERN` / `ERV_WEG` | G1–G4 |
| **OP-W-01** | **W-Fragen-Liste prüfen:** Vorentwurf Pflicht **Wer, Wann, Was, Wo, Wohin** (C1); BZ JV nennt **7 Fragen** (+ Wie, Warum, GZ-A4) – fachlich/rechtlich validieren | C1, E-02, GZ-A4 |
| **OP-M-01** | **Telefonische Vorabmeldung** in **besonders schwerwiegenden** Fällen **vor** schriftlicher Einzelmeldung (GZ-B2); **ggf.** Polizei informiert → in schriftlicher Meldung **Ja/Nein** (M1). **Sicher:** Grundsatz telefon vor schriftlich. **Zu validieren:** Kriterium „schwerwiegend“, Anrufempfänger, Dokumentation des Telefonats, Verknüpfung zur Einzelmeldung — Prozess/UI nicht modelliert | GZ-B2, M1, D2 |
| **OP-W-02** | **Offen (L4/C3):** Wer pflegt/freigibt **Textbausteine** (Zentrale, Rechtsreferat, VAL …)? W-Fragen **Pflicht**, Bausteine **optional** (L3) | L4, C3 |
| **OP-L-01** | ~~Fall-Typ~~ → **sicher (2026-06-17):** **Ein Fall = ein Meldungstyp** (L1); Prototyp entspricht Soll | L1 |
| **OP-L-02** | **Prototyp:** W-Fragen **Pflicht** vor Einreichung; Textvorlage optional (L3) | L3 |
| **OP-Z-01** | **Kein Zeugenkonzept** im Meldewesen — nur **Beteiligte**; `ZeugenEditor` **komplett entfernen** (nicht nur `inhaftierter`); Bedienstete über **eigene Einzelmeldung**; Mock-Folgeaktionen Zeugen streichen; **H5** (5 WT Zeugen) entfällt | D1, Workshop 2026-06-17 |
| **OP-Z-02** | ~~D2 Detail externe Zeugen~~ → **beantwortet (M1):** **Ja/Nein Polizei eingeschaltet** in der Meldung | D2, M1 |
| **OP-BM-01** | **Workshop (M2 / E3):** In welchen **bestimmten Fällen** ist die **Kammer** bei physischer Sicherstellung beteiligt? | E3, M2, BM-04 |
| **OP-BM-02** | **Workshop (M3 / E6):** Kammer bei Sicherstellung – **im System informieren** oder nur **außerhalb** (telefonisch o. ä.)? | E6, M3 |
| **OP-H-01** | **Prototyp:** `dringend`-Feld/UI entfernen (H7); SLA **Werktage** + WE/FT bis **Montag 08:00** (N1, H2–H3); externe 24 h ab **Ereignisende** (N2); Zeugen **5 WT** (H5) – **Detail:** [ZU_KLAERENDE_BEGRIFFLICHKEITEN.md](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md) §13, **OP-F-01–14** | H7, N1–N2, F-02 |
| **OP-H-02** | **Prototyp:** Eskalation Erststufe – **erste Anlaufstelle SL** (N3) | N3 |
| **OP-H-03** | **Workshop (N3):** **Eskalationsschleife** validieren (weitere Stufen nach SL, Fristen, Rollen, JVA-Abweichungen) | N3, Anhang A |
| **OP-V-01** | ~~ERV-Kette~~ → **teilweise:** Reihenfolge beBPo vor eGPA (O1) — **zu validieren:** eGPA **nicht ausgerollt**, **übergangsweise Veraktung** (**OP-EGPA-01**); Vier-Augen **OP-V-04** | O1–O4, OP-EGPA-01 |
| **OP-V-02** | **Teilweise umgesetzt:** versandfähig, beBPo, eGPA, Vier-Augen **am Fall**; **offen:** VAL-Befragung Anordnung/Ergebnis | O2–O4 |
| **OP-JVP-01** | **Workshop (P1):** **Basisbeobachtungen** = **Dienstprotokoll aVD** am Schichtende (Vorentwurf) – fachlich **validieren**; Abgrenzung eMeldewesen | P1, JVP-01 |
| **OP-JVA-01** | **Workshop (P2 / A4):** **JVA-Abweichungen** Rollenkette, Zentrale, DGL, Eskalation – Anhang A | P2, A4 |
| **OP-P-01** | **Workshop (P3):** Gesamtprozess auf **fehlende Schritte/Rollen** prüfen | P3 |
| **OP-ERV-02** | ~~ERV auf Fall-Ebene~~ → **umgesetzt** (Fall-ERV-API; Einzelmeldungs-ERV blockiert bei aktivem Fall) | J5, G4 |
| **OP-J-02** | **Prototyp:** DGL kann **fehlende Meldung anfordern**; aVD bearbeitet Einzelmeldung bei Rückgabe (J2–J3) | J2, J3, OP-DGL-03 |
| **OP-K-02** | ~~DGL → SL → AL~~ → **umgesetzt** (Prototyp Juni 2026) | K1, K4 |
| **OP-K-03** | **Workshop:** Wer entscheidet **Meldepflicht** — **AL oder VAL** (K2)? Prototyp: `entscheid-meldepflicht` für beide — **zu validieren** (2026-06-17) | K2, G1 |
| **OP-ABS-01** | **Interner Abschluss** bei „nicht meldepflichtig“: **AL** oder **ggf. auch VAL**? (2026-06-17) | J4, G3 |
| **OP-ERV-03** | **ERV-Weg:** Müssen **AL und VAL** beteiligt sein, oder reicht **eine Person**? (2026-06-17) | G4, O1–O3 |
| **OP-EGPA-01** | **eGPA nicht ausgerollt:** Welche **übergangsweise Veraktung** (intern + nach beBPo)? ERV-Kette **zu validieren** (2026-06-17) | O1, G3, G4 |
| **OP-V-04** | **Vier-Augen** Abschluss: Regeln, Rollen, eine vs. zwei Personen — **zu validieren** (2026-06-17) | O3, OP-ERV-03 |
| **OP-T-01** | **Vorkommnis (WABE)** ↔ Ereignis / `VORFALL_INTERN` / Fall – Mapping Workshop | [ZU_KLAERENDE_BEGRIFFLICHKEITEN.md](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md) §2 |
| **OP-T-02** | WABE **„Gruppenleitung“** / Zusammenführung – Rolle DGL vs. SL? | WABE.docx |
| **OP-T-03** | WABE **„Polizei informiert?“** ↔ M1 (Polizei eingeschaltet) | WABE.docx, M1 |
| **OP-T-04** | UI **Sicherstellung** statt Beweismittel | E1, BM-01 |
| **OP-T-05** | UI **Fachliche Prüfung** statt „In Bearbeitung“ | HAPPY_PATH |
| **OP-T-06** | Lastenheft **Vorfall** (Typ) vs. Prozess **Ereignis** – Kap. 3 Abgrenzung | Lastenheft |
| **OP-T-07** | **HAPPY_PATH** als Legacy/Parallel zum Fall-Pfad kennzeichnen | PROZESS_SOLL |
| **OP-T-08** | Feld **`ervRelevant`** umbenennen oder aus Typ ableiten | Schema (zurückgestellt) |
| **OP-F-01** | **24 h Ersterfassung** ab **Ereignisende** (`tatzeit`) statt `erstelltAm` | H1, N2; [ZU_KLAERENDE §13](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md) |
| **OP-F-02** | **Werktage** + **Montag 08:00** (WE/FT) vs. Kalendertage im Code | N1, H2–H3; §13 |
| **OP-F-03** | Messpunkt **„Bearbeitung aufgenommen“** (`IN_PROGRESS` vs. Übernahme) | SLA Lastenheft; §13 |
| **OP-F-04** | **2 h unverzüglich** (telefon/AoV) – AV 4400/73 I.3 bestätigen | GZ-B2; §13, Code F1 |
| **OP-F-05** | **3 Werktage schriftlicher Bericht** – 72-h-Näherung OK? | AV I.4; §13, Code F3 |
| **OP-F-06** | **3 Werktage** nach **versandfähig** – auch am **Fall** (`MeldungsFall`) | Lastenheft; §13, Code F4 |
| **OP-F-07** | **5 Werktage Zeugenaussage** – Kalendertage vs. Werktage vereinheitlichen | H5; §13, F5/F6 |
| **OP-F-08** | **5 Werktage Nachreichung** – Frist bei Rückgabe; Eskalation pausieren? | H6, GZ-B5; §13, F7 |
| **OP-F-09** | **`IN_PROGRESS` > 5 Tage** in SLA-Anzeige (A2-F-SLA-002) | Lastenheft; §13 – **Code fehlt** |
| **OP-F-10** | **Automatische Eskalation** 24 h → SL (A2-F-SLA-003) | N3; §13 – Zielsystem |
| **OP-F-11** | **Eskalationsschleife** nach SL (Stufen, Fristen) | OP-H-03; §13 |
| **OP-F-12** | **Fristbeginn** bei Nacht-/WE-Einreichung (je JVA) | Cluster C, Anhang A; §13 |
| **OP-F-13** | **`dringend` / `prioritaet`** aus UI und KPI entfernen | H7; §13, OP-H-01 |
| **OP-F-14** | **Quartalsauswertung 15 WT** (DWH) – außerhalb Prototyp | A2-F-QS-002; §13 |
| **OP-R-01** | **Fall-Matrix ergänzen** – Bündeln, Fall→DGL, E1/E2, fehlende Meldung (J2) | A3, J2; [ZU_KLAERENDE §14](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md) |
| **OP-R-02** | **Sichtbereich Zentrale** – JVA-weit vs. `siehtGesamteAnstalt: false` | E-03; §14 |
| **OP-R-03** | **Weiterleiten Einzelmeldung** (`FORWARDED`) vs. nur Fall-Workflow | A2-F-ROL-001; §14 |
| **OP-R-04** | **Meldungen erfassen** – Zentrale nur koordinieren oder auch eigene Einzelmeldungen? | A1; §14 |
| **OP-R-05** | **Entscheidungen E1/E2** als Fall-Recht in Rollenmatrix | GESAMTPROZESS; §14 |
| **OP-R-06** | **Rechte bei DGL-Rückgabe** (`ZURUECK_AK`); Verknüpfung **OP-DGL-03** | F4, J3; §14 |
| **OP-R-07** | **JVA-Abweichungen** Zentrale / Bündelrolle (A4) | OP-JVA-01; §14 |
| **OP-R-08** | **UI-Label** Rollenmatrix: „Arbeitskoordination (Zentrale)“ | §14 |

---

## Chronik neue Einträge

*(Neue Rückfragen und offene Punkte chronologisch **oben** einfügen. Format: `YYYY-MM-DD – Kurztext` + ggf. Link/Verweis.)*

- **2026-06-17** – **UEBERGABE §13:** Roadmap Schritte 1–6 und **Gesamtprozess-Abgleich** in [UEBERGABE_GESAMT.md](UEBERGABE_GESAMT.md) übernommen.
- **2026-06-17** – **Kapitelvorschlag Übergabe:** [UEBERGABE_KAPITEL_OFFENE_PUNKTE_VORSCHLAG.md](UEBERGABE_KAPITEL_OFFENE_PUNKTE_VORSCHLAG.md) → archiviert, Inhalt in §13.
- **2026-06-17** – **Validierungs-Matrix:** [VALIDIERUNG_PROZESS.md](VALIDIERUNG_PROZESS.md) v1.0 — kompakter Stand aus Dialog Phasen ①–⑥ (sicher / Vorentwurf / zu validieren / Annahme).
- **2026-06-17** – **Phase ⑥ (Validierung):** ERV-Kette **versandfähig → beBPo → eGPA** **zu validieren** — eGPA **nicht ausgerollt**, **übergangsweise Veraktung** (**OP-EGPA-01**). **Vier-Augen zu validieren** (OP-V-04). **VAL-Befragung nur nach „Ja“** — **sicher** (D3).
- **2026-06-17** – **Phase ⑤ (Validierung):** **K2 zu validieren** (OP-K-03). **G1 sicher:** meldepflichtig = ERV. **Abschluss „nein“:** AL **oder ggf. VAL** (OP-ABS-01). **ERV-Weg:** **ggf. eine Person** (OP-ERV-03).
- **2026-06-17** – **Phase ④ (Validierung):** **F4 sicher** — DGL-Rückgabe an **aVD + Zentrale**. **F5 sicher** — Rückgabe **unbegrenzt** wiederholbar. **DGL → SL → AL** — **zu validieren** (OP-FB-01, OP-JVA-01).
- **2026-06-17** – **Phase ③ (Validierung):** Gesamtphase **zu validieren** (**OP-FB-01**) — Zustimmung. **L1 sicher:** ein Meldungstyp pro Fall. **J2/F2 sicher:** Zentrale darf **ohne Hartblock** (fehlende aVD-Meldung) an DGL; Nachforderung bei DGL.
- **2026-06-17** – **Phase ② (Validierung):** **2.3 sicher** — Insassen **nach Hafthaus** filterbar (B5/E-03). **2.7 sicher** — **keine Zeugen**, nur **Beteiligte**; Bedienstete über eigene Einzelmeldung; **OP-Z-01** erweitert (ZeugenEditor entfernen); **H5** entfällt.
- **2026-06-17** – **Phase ① Schritt 1.4 (telefonische Vorabmeldung):** In **besonders schwerwiegenden** Fällen **telefonische Meldung vorab**, **ggf.** Polizei informiert; danach schriftliche Phase ②. Grundsatz **sicher**; Details → **OP-M-01** (Kriterium, Empfänger, Dokumentation).
- **2026-06-17** – **Phase ① Schritt 1.3 (Freistellung):** **Sicher** = aVD können Meldung **unmittelbar nach Ereignis** einreichen. **Zu validieren (OP-ORG-01):** Ob **formale Freistellung** existiert (je JVA oder übergreifend) — Regelung **unbekannt**. H4/OP-DGL-02 angepasst.
- **2026-06-17** – **Fall-Bündelung als Annahme:** Phase ③ (Zentrale bündelt → DGL → …) in Doku als **nicht validierte Annahme** gekennzeichnet; **OP-FB-01** (Workshop-Validierung). Praxisfeedback F1–F5 bleiben **Vorentwurf**, kein fachlicher Beschluss. → [ZU_KLAERENDE §3.1](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md#31-fall-bündelung--annahme-nicht-validiert), [UEBERGABE_GESAMT §2.1/§6](UEBERGABE_GESAMT.md).

- **2026-06-02** – **Rolle Zentrale / Rollenmatrix:** [ZU_KLAERENDE_BEGRIFFLICHKEITEN.md](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md) §14; **OP-R-01–08** (Fall-Rechte, Sichtbereich, Matrix-Lücken vs. `arbeitskoordination`).
- **2026-06-02** – **Fristen/SLA validieren:** [ZU_KLAERENDE_BEGRIFFLICHKEITEN.md](ZU_KLAERENDE_BEGRIFFLICHKEITEN.md) §13; **OP-F-01–14** (Soll vs. Prototyp-Code `meldungen.js`).
- **2026-06-02** – **Übergabedokument gesamt:** [UEBERGABE_GESAMT.md](UEBERGABE_GESAMT.md) – Gesamtprozess, Schemata, Prototyp-Stand, offene OP-*, Dateiverzeichnis.
- **2026-06-02** – **WABE.docx** im Repository: `docs/20260610_HEUREA_WABE.docx` + Kopie `docs/meldewesen-a2-main/docs/quellen/`; Index [quellen/README.md](quellen/README.md).
- **2026-06-02** – **Block O2–O4 (beantwortet):** Schritt **„versandfähig“** ja – setzen **AL und VAL** (O2). **Vier-Augen:** **beide** dürfen abschließen (O3). **VAL-Befragung Ergebnis** dokumentiert **am Fall** (O4). Prototyp → **OP-V-02**. → [GESAMTPROZESS.md](GESAMTPROZESS.md) v1.8.
- **2026-06-02** – **Block O1 (beantwortet):** **Nicht meldepflichtig** → **kein beBPo**, **direkt eGPA-Veraktung**. **Meldepflichtig ja** → **beBPo vor eGPA** (Fall-Ebene). O2–O4 offen (OP-V-01). → [GESAMTPROZESS.md](GESAMTPROZESS.md) v1.7, G3/G4 angepasst.
- **2026-06-02** – **Block N (N3 ergänzt):** **Eskalationsschleife** (weitere Stufen nach SL) → **Workshop OP-H-03**. Erststufe bleibt **Stationsleitung** (N3, OP-H-02).
- **2026-06-02** – **Block N (teilweise):** WE-Sammellogik **Montag 08:00** (N1). **24 h extern** ab **Ereignisende** (N2). → [GESAMTPROZESS.md](GESAMTPROZESS.md) v1.6.
- **2026-06-02** – **Block M (teilweise):** **M1** Polizei **Ja/Nein** in Meldung (schließt OP-Z-02). **M2** Kammer-Fälle Sicherstellung → **Workshop OP-BM-01**. **M3** Kammer-Benachrichtigung System vs. außerhalb → **Workshop OP-BM-02**. → [GESAMTPROZESS.md](GESAMTPROZESS.md) v1.5, [Praxisfeedback.md](Praxisfeedback.md) Block M.
- **2026-06-02** – **Grundsätze BZ JV** aus `docs/20260610_HEUREA_WABE.docx` übernommen: Abfassung **GZ-A1–A5**, Abgabe **GZ-B1–B5**. W-Katalog vollständig **7 Fragen**. **Offen:** mündliche Vorabmeldung → **OP-M-01**. → [GESAMTPROZESS.md](GESAMTPROZESS.md) v1.4, [Praxisfeedback.md](Praxisfeedback.md) Abschnitt 15.
- **2026-06-11** – **Gesamtprozess Block L (beantwortet):** Fall = **ein Meldungstyp** (L1). aVD-Meldung = **eigene** Handlungen/Beobachtungen; **ein oder mehrere** beteiligte Gefangene (L2). **W-Fragen Pflicht**; **Textbausteine optional** (L3). Pflege Bausteine → **OP-W-02** (L4). → [GESAMTPROZESS.md](GESAMTPROZESS.md) v1.3.
- **2026-06-11** – **Gesamtprozess Block K (beantwortet):** **SL** erhält **Fallmeldung** von DGL (K1). Weiterleitung **DGL → SL → AL** (K4). **VAL** optional – **VAL oder AL** entscheidet Meldepflicht (K2). DGL **nicht** (K3). **Prototyp:** OP-K-02, OP-K-03. → [GESAMTPROZESS.md](GESAMTPROZESS.md) v1.2.
- **2026-06-11** – **Gesamtprozess Block J (beantwortet):** Alle **Meldungstypen** gleicher Prozess (J1). Vollständigkeit **ohne Hartblock**; fehlende Meldung bei Prüfung **anfordern** (J2). Rückgabe: **aVD bearbeitet Einzelmeldung** (J3). Interner Abschluss **nur AL** (J4). **ERV Fall-Ebene** (J5, OP-ERV-02). → [GESAMTPROZESS.md](GESAMTPROZESS.md) v1.1.
- **2026-06-11** – **Gesamtprozess 1.0:** [GESAMTPROZESS.md](GESAMTPROZESS.md) – fachliche End-to-End-Referenz (6 Phasen, Rollen, Status, Fristen, Teilprozesse, offene Punkte).
- **2026-06-11** – **Prozessdoku 1.0:** [PROZESS_SOLL_UND_STAND.md](PROZESS_SOLL_UND_STAND.md) – Soll + Prototyp-Umsetzung und Backlog.
- **2026-06-11** – **Zurückgestellt (bewusst offen):** **C3** Textbausteine-Pflege (OP-W-02), **JVP-01** Basisbeobachtungen (OP-JVP-01), **OP-BM-01** Kammer-Fälle Sicherstellung, **V-02** ERV-Kette (OP-V-01) – Klärung in späterer Workshop-Runde.
- **2026-06-11** – **Fristen H1–H7 (beantwortet):** **24 h** Erfassung (H1). **24 h** auch fachliche Prüfung + **externe Meldung** bei meldepflichtigem Ereignis nach **Feststellung**; **Werktage**; WE **sammeln bis Montag früh** (H2–H3). aVD-Meldungen **sofort**, **Freistellung** – keine Zentrale-Wartefrist (H4, schließt OP-DGL-02). Zeugen **5 Werktage** (H5). Nachreichung **5 Werktage** (H6). **Dringend** entfällt (H7, OP-H-01). → [Praxisfeedback.md](Praxisfeedback.md) Block H.
- **2026-06-11** – **Beweismittel E1–E6 (beantwortet):** Keine Erhebung, nur **Sicherstellung** (E1). **Ja/Nein Pflicht** je Meldung (E2). **aVD** sichert physisch; Kammer nur in **bestimmten Fällen** (E3, **offen:** OP-BM-01). **Kein** Foto-Pflicht, **Nachreichung** (E4). Übergabe: **Hinweis in Meldung** genügt (E5). **Kammer** nur informieren wenn **betroffen** (E6). → [Praxisfeedback.md](Praxisfeedback.md) Block E, Abschnitt 12.
- **2026-06-09** – **Beteiligte/Zeugen D1–D5 (beantwortet):** Inhaftierte **nie** Zeugen (D1). Externe **Zeugenaussagen → Polizei**, ggf. Befragung (D2). VAL-Befragung **nach** AL-Entscheid (D3); **Anordnung** vorher, **Ergebnis** nachher (D4); **VAL selbst** (D5). **Prototyp:** OP-Z-01; **offen:** OP-Z-02. → [Praxisfeedback.md](Praxisfeedback.md) Block D, Abschnitt 13.
- **2026-06-09** – **W-Fragen C2/C4 (beantwortet):** **Ein** gemeinsamer Fragenkatalog; Zieltext = **Schilderung des Vorfalls aus Sicht des/der Meldenden mit Beteiligung**. Generierte Vorlage **vor Einreichung** bearbeitbar. **C3 offen** (OP-W-02). → Block C.
- **2026-06-09** – **W-Fragen C1 (vorläufig):** Pflichtfragen-Vorentwurf **Wer · Wann · Was · Wo · Wohin** – **nochmals prüfen** (OP-W-01). → [Praxisfeedback.md](Praxisfeedback.md) Block C, E-02.
- **2026-06-09** – **AL / Meldepflicht G1–G4 (beantwortet):** **meldepflichtig = ERV-pflichtig** (G1). **Keine** gesonderten Zusatzunterlagen – gebündelter Fall genügt (G2). **Nein** → interner Abschluss + Archivierung (G3). **Ja** → ERV-Weg **Anstaltsleitung und VAL** (G4). **Prototyp offen:** OP-AL-01. → [Praxisfeedback.md](Praxisfeedback.md) Block G, V-01.
- **2026-06-09** – **Fall-Bündelung F4/F5 (beantwortet):** DGL-Rückgabe an **aVD und Zentrale** (**beides**). **Keine** Begrenzung – bei unzureichender Qualität **beliebig oft** zurückgeben. **Prototyp-Lücke:** OP-DGL-03. → P-02.
- **2026-06-09** – **Fall-Bündelung F3 (beantwortet, Teil):** DGL prüft **fachliche Kriterien** an Meldung + **inhaltliche Stimmigkeit**. **Offen (OP-DGL-01):** ausformulierte **Kriterienliste** für Workshop/Lastenheft und Prototyp-Checkliste. → [Praxisfeedback.md](Praxisfeedback.md) Block F, P-02.
- **2026-06-09** – **Rollenzuordnung feedbacketer Prozess (Praxisfeedback, beantwortet):** **Zentrale** = Rolle **`arbeitskoordination`**; **Dienstgruppenleitung** = **eigene Rolle** (nicht `stationsleitung`/`val`); **Bündeln** nur Zentrale. **Offen:** JVA-Abweichungen unbekannt. → [Praxisfeedback.md](Praxisfeedback.md) Rollenzuordnung A1–A4.
- **2026-06-09** – **Prototyp:** Rolle **`dienstgruppenleitung`** (DGL) im Rollenmodell angelegt (`RollenContext`, `mockAuth`, `schema.prisma`, `PrototypBanner`; Demo-Nutzer DGL-01 Andrea Schmitz). Workflow Bündelung/DGL-Prüfung folgt in Block B.
- **2026-06-09** – **Prototyp:** **Zentrale** testbar als **`arbeitskoordination`** – Demo-Nutzer AK-01 Stefan Lindemann, Banner-Gruppe „Koordination (Zentrale)“, `istArbeitskoordination` in Frontend/Backend.
- **2026-06-09** – **Prototyp E-03/B5:** Gefangenen-Auswahl in `MeldungForm` mit **Hafthaus-Filter** (`getNutzerHafthaus`, API `?haus=`), Backend-Validierung bei Speichern.
- **2026-06-09** – **Ersterfassung B5 (beantwortet):** Gefangene/r-Auswahl aus **gesamtem Hafthaus** (alle Stationen), **alle Meldungstypen**. → [Praxisfeedback.md](Praxisfeedback.md).
- **2026-06-09** – **Ersterfassung B4 (beantwortet):** Pro Meldung **ein** Hauptbeteiligter (`gefangeneId`). → Block B [Praxisfeedback.md](Praxisfeedback.md).
- **2026-06-09** – **Ersterfassung B1 (beantwortet):** Meldepflicht **unmittelbar nach dem Ereignis**, ggf. **nachdem es aufgelöst** wurde (nicht während laufender Intervention). → E-01, Block B in [Praxisfeedback.md](Praxisfeedback.md).
- **2026-06-09** – **Ersterfassung B2 (beantwortet):** Alle Beteiligten melden **direkt nach dem Ereignis**; **alle** Meldungen werden **gebündelt und weitergeleitet** (Zentrale). **Offen:** technische Verknüpfungshilfe (Ereignis-ID, Tatort/Zeit-Vorschlag). → [Praxisfeedback.md](Praxisfeedback.md) Block B.
- **2026-06-09** – **Fall-Bündelung F1 (beantwortet):** Zentrale bündelt **alle Meldungen zum gleichen Fall** – **verschiedene Perspektiven** (je beteiligter aVD) auf **einen Vorfall**. → [Praxisfeedback.md](Praxisfeedback.md) Block F.
- **2026-06-09** – **Fall-Bündelung F2 (beantwortet):** **Alle** am Ereignis beteiligten aVDs melden Tun/Beobachtung; Meldungen **aller Beteiligten** **müssen** zu **einem** Fall gebündelt werden. **Offen:** Frist/Eskalation (OP-DGL-02). → E-01.
- **2026-06-09** – **Prototyp Fall-Bündelung (P-01/P-02):** Modell `MeldungsFall`, API `/api/faelle`, Hub-Bereich „Fall-Bündelung“/„Fall-Prüfung“, Seite `/faelle/:id`. Workflow: AK bündelt SUBMITTED-Meldungen → `ZUR_DGL` → DGL Rückgabe `ZURUECK_AK` oder Freigabe `ZUR_AL`. **Offen:** AL-Entscheid meldepflichtig; DGL-Kriterienliste (OP-DGL-01); Benachrichtigungen.
- **2026-06-09** – **Basisbeobachtungen (offen, Praxisfeedback):** **Basisbeobachtungen** zu **allen Gefangenen** als **eigene Option** auf der **Justizvollzugsplattform** – **nicht** Teil von eMeldewesen (A2). **Offen:** Fachdefinition, Rollen, Abgrenzung zu Meldewesen/BASIS-Web, Lastenheft Plattform vs. A2. → [Praxisfeedback.md](Praxisfeedback.md) Abschnitt 14, JVP-01.
- **2026-06-08** – **Gefangene / Zeugen (Praxisfeedback):** Inhaftierte **nicht** als Zeugen, nur als **Beteiligte**; **Befragung** durch **Abteilungsleitung (VAL)** – nicht Zeugenaufnahme Station. Prototyp: `ZeugenEditor`-Typ `inhaftierter` widerspricht Soll (H-P51/H-P52). → [Praxisfeedback.md](Praxisfeedback.md) Abschnitt 13.
- **2026-06-08** – **Beweismittel (Praxisfeedback):** JVA **erhebt** Beweismittel in der Regel **nicht**, sondern **sichert** sie ggf. für **Polizeiermittlungen**. UI/Lastenheft: Terminologie „Sicherstellung“; offen: Pflicht ja/nein, Kammer, Übergabe Polizei. → [Praxisfeedback.md](Praxisfeedback.md) Abschnitt 12, E-04.
- **2026-06-08** – **Gefangene-Auswahl (Praxisfeedback):** Bei Meldungserfassung alle Inhaftierten des **gesamten Hafthauses** wählbar (alle Stationen), nicht nur eigene Station. Prototyp: `haus`-Filter aus Mock-Nutzer; Abgrenzung JVA vs. Haus klären. → [Praxisfeedback.md](Praxisfeedback.md) E-03; Bezug H-P25.
- **2026-06-08** – **Textvorlagen / W-Fragen (Praxisfeedback):** Meldetext über strukturierte **W-Fragen** (Kurzantworten) → **Textvorlage** → **bearbeitbar** im Sachverhalt; je Meldungstyp/Rolle (aVD: Tun/Beobachtung). **Offen:** Pflege/Freigabe Bausteine, Pflichtfragen, PDF/beBPo-Bezug (H-P40). → [Praxisfeedback.md](Praxisfeedback.md) Abschnitt 11.
- **2026-06-08** – **Praxisfeedback Ist-Prozess:** Nach Ereignisende schreiben **alle beteiligten aVD** parallel Meldungen (Tun/Beobachtung) → **Zentrale** bündelt zum gleichen Fall → **Dienstgruppenleitung** prüft/gibt zurück → bei Qualität **Anstaltsleitung** entscheidet **meldepflichtig** ja/nein. **Offen:** Zuordnung Rollen (Zentrale = `arbeitskoordination`? DGL = `stationsleitung`/`val`?); Fall-Bündelung im Datenmodell; Abweichung zum Prototyp (VAL/beBPo-Kette). → [Praxisfeedback.md](Praxisfeedback.md).
- **2026-05-20** – **Happy Path ↔ Hackathon:** [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) v0.2 Abschnitt **7** – alle H-P/H-A mit HP-Bezug und Status; neue ID **H-P53** (Einreichungs-Dialog).
- **2026-05-20** – **Zeugen + Einreichen:** `ZeugenEditor` nach Beweismittel-Upload; Bestätigungsdialog vor Einreichung (`EinreichungFolgeaktionenDialog`) mit Vorschau Folgeaktionen.
- **2026-05-20** – **Beweismittel-Dateien:** Sachverhalt → Beweismittel Ja/Nein → Upload mit Formatliste + Kurzbeschreibung je Datei (`Anhang.beschreibung`, H-P23).
- **2026-05-20** – **Strafanzeige – Empfänger:** Kein Formularfeld; bei Einreichung Zuständigkeit **fachliche Prüfung (VAL)** statt Staatsanwaltschaft in der Erfassung (H-P27, [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) §3). Staatsanwaltschaft erst nach Prüfung/beBPo. **Annahme Prototyp** bis Workshop-Gegenbeweis.
- **2026-05-20** – **Formular:** Reihenfolge Typ → Tatvorwurf → **Gefangene (Dummy-DB)** → **Tatzeit/Tatort** → Sachverhalt (H-P22); [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) F2–F5.
- **2026-05-20** – **Formular Strafanzeige:** Tatvorwurf-Dropdown **direkt nach** Meldungstyp (H-P22); Reihenfolge in [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) F2.
- **2026-05-20** – **Happy Path Strafanzeige:** [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) – durchgängiger Workshop-/Demo-Pfad (Soll + IST, Abnahme-Checkliste); Änderungen weiter über [HACKATHON_A2_AUFNAHME_TODOS.md](HACKATHON_A2_AUFNAHME_TODOS.md).
- **2026-05-20** – **Workshop-Protokoll Prototyp:** To-dos in [HACKATHON_A2_AUFNAHME_TODOS.md](HACKATHON_A2_AUFNAHME_TODOS.md) Abschnitt **G** (Dashboard-Filter, Status „Prüfung“ vs. Entwurf, Tatzeit-Bug, Demo-Flow, PDF/Meldepflicht). Offen: **„Dringend“** neben 24-h-SLA (H-P50); Zeugen-Typ „ohne Meldewesen“ im JVA-Alltag (H-P51).
- **2026-05-20** – **Hackathon A2 Aufnahme – To-do Änderungsanforderungen:** [HACKATHON_A2_AUFNAHME_TODOS.md](HACKATHON_A2_AUFNAHME_TODOS.md) (Backlog/Zieloptionen/Rückfragen + Protokoll).
- **2026-05-19** – **Übergabe Entwicklung:** [UEBERGABE_PROTOTYP_ENTWICKLUNG.md](UEBERGABE_PROTOTYP_ENTWICKLUNG.md) (Dateiübersicht, Einstieg, Backlog).
- **2026-05-19** – **Plan + Prototyp:** Pop-up **Zielprozess-Optionen (nicht umgesetzt)** – [12_PROTOTYP_POPUP_ZIELOPTIONEN.md](LASTENHEFT/12_PROTOTYP_POPUP_ZIELOPTIONEN.md), A2-F-UI-007.
- **2026-05-19** – **Prototyp:** Modal „Meldungen zur fachlichen Prüfung“ bei eingereichten Meldungen (Bearbeitungsberechtigung; Mock für Zielsystem-Benachrichtigung) – [03_QUERSCHNITT_SLA_UI.md](LASTENHEFT/03_QUERSCHNITT_SLA_UI.md).
- **2026-05-19** – **Zeugen-Benachrichtigung** festgehalten: Bedienstete Zeugen → **Mitteilung im System** (Zeugenaussage); inhaftiert / ohne Meldewesen → Mitteilung an **Station/Hafthaus** (aVD/SL), **Zeugenaussage aufnehmen** – [ANHANG_B_FELDER.md](LASTENHEFT/ANHANG_B_FELDER.md), A2-F-STR-008, Mock-Texte Backend.
- **2026-05-19** – **Offen:** Kommunikation mit der **Kammer**, wenn **Beweismittel sichergestellt** werden (Zeitpunkt, Kanal, Pflicht vs. optional, je Meldungstyp) – siehe Cluster C, Bullet „Kammer und gesicherte Beweismittel“.
- **2026-05-19** – Optionale **Dateianhänge** (Fotos von Beweismitteln, Listen) – A2-F-ERF-003 in [ANHANG_B_FELDER.md](LASTENHEFT/ANHANG_B_FELDER.md); API `POST/GET …/anhaenge`, UI Formular + Detail-Download.
- **2026-05-22** – **Rückgabe Ergänzungserfassung (offen):** **A2-F-QS-004** / **A2-F-STA-003** – VAL/AL können Meldung zurückgeben, wenn Zeugen/Beweismittel nicht in 24 h vollständig; Happy Path HP-26b–f; Hackathon **H-P54**. **Offen:** konkrete **Frist Nachreichung** (Soll 5 Werktage) und ob 24-h-Eskalation bei Rückgabe pausiert.
- **2026-05-22** – **Anhörung beschuldigte Person** verbindlich: **A2-F-QS-003** (Querschnitt), **A2-F-STR-009** (Strafanzeige), **A2-F-GER-005** (Gericht); Datenmodell `metadaten.anhoerungBeschuldigte` in [ANHANG_B_FELDER.md](LASTENHEFT/ANHANG_B_FELDER.md); Abgrenzung zu Zeugen; beBPo-Sperre im Zielsystem. Prototyp: nicht umgesetzt (Z-22, Z-65).
- **2026-05-22** – **Quartalsauswertung** **A2-F-QS-002**: KPI-Katalog (KP-EV-01–12, KP-VF-01–09, KP-Ü-01–03) und Frist **15 Werktage** nach Quartalsende – [08_GESAMTPROZESS_ARIS.md](LASTENHEFT/08_GESAMTPROZESS_ARIS.md) Abschnitte 8.3–8.4. **Offen:** Zuordnung `VORFALL_EXTERN` (Ermittlungsverfahren vs. Vorfall) bei Aktivierung.
- **2026-05-19** – Pflichtangaben Ersterfassung verbindlich: **Tatzeit, Tatort, Sachverhalt, Beteiligte, Beweismittel (Ja/Nein + Kurztext bei Ja), Zeugen bedingt** – [ANHANG_B_FELDER.md](LASTENHEFT/ANHANG_B_FELDER.md) A2-F-ERF-001/002; Prototyp-Validierung Einreichung + Seed.
- **2026-05-19** – Prototyp **Klickpfad** (Routen, Rollen, API, Backlog): [11_PROTOTYP_KLICKPFAD_ERFASSUNG.md](LASTENHEFT/11_PROTOTYP_KLICKPFAD_ERFASSUNG.md).
- **2026-05-19** – Prozessdiagramme (Mermaid): [10_PROZESSDIAGRAMM.md](LASTENHEFT/10_PROZESSDIAGRAMM.md) – ARIS-Soll vs. Prototyp, Meldungstypen, Status, SLA, Zeugen.
- **2026-05-19** – Workshop-Checkliste **interne Bearbeitung** (Entwurf): [09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md](LASTENHEFT/09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md); löst ARIS-Punkt „Prüfcheckliste“ nach Termin durch Beschlüsse.
- **2026-05-19** – ARIS-Gesamtprozess strukturiert in [08_GESAMTPROZESS_ARIS.md](LASTENHEFT/08_GESAMTPROZESS_ARIS.md); Textbasis [eMeldewesen_Prozess_ARIS.txt](eMeldewesen_Prozess_ARIS.txt). Workshop-Gaps (QS, Zweiterfassung, Gutachten, versandfähig) in Kap. 8 des Dokuments.
- **2026-05-18** – Bearbeitung „In Bearbeitung“: fachlicher **Prüfinhalt** offen (Workshop-Checkliste); Rollen **dürfen** technisch bearbeiten siehe Matrix / Cluster C.
- **2026-05-18** – Nach Einreichung (`SUBMITTED`): Ablauf fachlich + Prototyp in [03_QUERSCHNITT_SLA_UI.md](LASTENHEFT/03_QUERSCHNITT_SLA_UI.md) ergänzt; A2-F-SLA-002 Prototyp-Status auf „umgesetzt“ korrigiert.
- **2026-05-18** – SLA/Fristen: Arbeitsannahme **kein Anhalten** der Frist an Wochenenden/Feiertagen; Rückfrage zur fachlichen Bestätigung und Abgleich „Werktag“ vs. Kalender in Cluster C eingetragen.
- **2026-05-15** – Zeugen Folgeaktionen: optional (Einzelfall); Bediensteter → Mock-Benachrichtigung mit Frist; Inhaftigter → Weiterleitung Station/Haus; A2-F-STR-008.
- **2026-05-15** – Strafanzeige Zeugen: Benennung + Zeugenaussage (eigene vs. mitgeteilte Aussage); Prototyp `metadaten.zeugen[]`, A2-F-STR-007.
- **2026-05-15** – Tatvorwurf Strafanzeige: Pflicht-Auswahl (BTM/aoV/Diebstahl), kein Freitext; Feld „Art der Strafanzeige“ entfällt in der UI.
- **2026-05-15** – Strafanzeige-Untertypen BTM/aoV/Diebstahl: Lastenheft Anhang B + Kap. 4, Prototyp-Dropdown, Rückfragen Cluster 12.
- **2026-05-15** – Prototyp-UI umgesetzt: MeldungenListe/Neu/Detail, Prozesslandkarte, ERV-Badges, SLA-Überfällig, inaktive Typen disabled, beBPo/eGPA-Aktionen (API + UI).
- **2026-05-15** – Phase 4/5: Abnahme (fachlich im Workshop), Anhang A Vorlage, Testkatalog TST-001–015, Risiken PD, workshop-ready nach Phase 3.
- **2026-05-13** – Phase 3: Rückfragen Strafanzeige / Intern / Gericht beantwortet und in Lastenheft übernommen.
- **2026-05-13** – Phase 2: Beschlüsse dokumentiert; `darfWeiterleiten` für Kammer/Zahlstelle/Arbeitskoordination im Code angepasst.
- **2026-05-13** – Phase 1 Rahmen ausformuliert (Ist-Stichpunkte, JVP-Dashboard, generische LC-Plattform); Meilenstein-Daten offen.
- **2026-05-13** – Phase 0 ergänzt: HEUREKA-Muster, Intern, Fachauftrag, Kann-Priorität, Tabellen/ID, Test-Kopplung, NF Prototyp, Autor PD.
- **2026-05-13** – Phase 0 per Rückfragen konkretisiert (Word+Repo, HEUREKA-Ref, NF-Schema, wöchentlicher Sync).
- **2026-05-13** – Lastenheft-Arbeitsdokumentation unter `docs/LASTENHEFT/` angelegt (Phasen 0–6, Anforderungs-IDs, Abnahme, Prototyp-Abgleich).
- **2026-05-13** – Arbeitsregel vereinbart: alle künftigen Rückfragen und offenen Punkte laufend in diesem Dokument pflegen; Verweis ergänzt in `.cursorrules` (Abschnitt Projektdokumentation).

---

*Stand: Sammeldokument aus Projektkonversation. Bei Widerspruch zu genehmigten Fachdokumenten gilt die behördliche Fassung.*
