# Gesamtprozess eMeldewesen (strukturiert aus ARIS)

**Version:** 0.3 | **Status:** Entwurf aus ARIS-BPMN (13.03.2026)  
**Quelle:** `eMeldewesen Prozess ARIS.pdf` → Textbasis [../eMeldewesen_Prozess_ARIS.txt](../eMeldewesen_Prozess_ARIS.txt)  
**Abgleich:** Prototyp HEUREKA A2, Kapitel [02_QUERSCHNITT_ROLLEN_STATUS.md](02_QUERSCHNITT_ROLLEN_STATUS.md), [03_QUERSCHNITT_SLA_UI.md](03_QUERSCHNITT_SLA_UI.md)

---

## 1 Einordnung

Das ARIS-Modell **„eMeldewesen (BPMN FHH – Operativer Prozess+)“** beschreibt den **vollständigen operativen Soll-Prozess** inklusive Ersterfassung, paralleler Zweiterfassung, zweistufiger Qualitätssicherung (QS), Meldepflichtprüfung, Expertise/Gutachten, Eilmeldung, ERV-Versand und Ablage in eGPA/Generalakte.

Der **HEUREKA-2.0-Prototyp A2** bildet bewusst nur einen **Teilpfad** ab (Meldung anlegen → Status → optional beBPo/eGPA → Archiv). Dieses Kapitel strukturiert den **ARIS-Gesamtprozess** und markiert den **Prototyp-Abgleich**.

| Kennzeichen | ARIS-Soll | Prototyp A2 |
|-------------|-----------|-------------|
| Ersterfassung / Zweiterfassung / QS | ja, ausführlich | nein (vereinfachte „Bearbeitung“) |
| Meldepflichtprüfung, Eilmeldung | ja | nein |
| Expertise / Gutachten (Revier, Revision, Experte) | ja | nein |
| Zeugen-Folgeaktionen (Strafanzeige) | nicht explizit im ARIS-Text | ja (Mock bei Einreichung) |
| Statusmodell | fachlich feiner | `DRAFT` → `SUBMITTED` → `IN_PROGRESS` / `FORWARDED` → `ARCHIVED` |
| beBPo / eGPA / Vier-Augen | ja | Mock, VAL/AL |

---

## 2 Prozess auf einen Blick

**Ausführliche Diagramme:** [10_PROZESSDIAGRAMM.md](10_PROZESSDIAGRAMM.md) (Gesamtprozess Abschnitt 1, Prototyp Abschnitt 2, Meldungstypen, Status, SLA, Zeugen). **Rollen entlang des Kernpfads (vereinfacht):** dort Abschnitt 5. **ARIS-erweiterte Swimlane:** unten Abschnitt 2.5.

```mermaid
flowchart TB
  subgraph erfassung [Erfassung]
    A[Erfassungsfrist beginnt] --> B[Eckdaten + Aussage + Anlagen]
    B --> C{Weitere Beteiligte?}
    C -->|ja| D[Beteiligte hinzuziehen / Bestätigung]
    C -->|nein| E[Richtigkeit und Vollständigkeit]
    D --> E
  end

  subgraph qs [Qualitätssicherung]
    E --> F[QS Erstinstanz]
    F --> G{Zweiterfassung / QS 2?}
    G --> H[QS Zweitinstanz]
    H --> I{Meldepflicht?}
  end

  subgraph bearbeitung [Bearbeitung und Expertise]
    I -->|meldepflichtig| J[Bearbeitung / Anhörungen / Beweismittel]
    I -->|nicht meldepflichtig| Z[Abschluss / kein externer Versand]
    J --> K{Eilmeldung nötig?}
    K -->|ja| L[Eilmeldung an Empfänger]
    K -->|nein| M[Prüfung Meldungsfristen]
    M --> N{Expertise / Gutachten?}
    N -->|ja| O[Gutachten einholen]
    N -->|nein| P[Versandfähig]
    O --> P
  end

  subgraph extern [Extern und Archiv]
    P --> Q[beBPo / ERV oder direktes Hochladen]
    Q --> R[eGPA / Generalakte]
    R --> S[Abschluss / Datenexport / Auswertung]
  end
```

**Hinweis:** Die Grafik ist eine **Lesehilfe**; Verzweigungen und Parallelität folgen dem ARIS-Diagramm, nicht dieser Vereinfachung.

### 2.1 Schema: Phasenfolge Kapitel 3 (linearer Lesepfad)

Lesepfad der Unterkapitel – **kein** striktes BPMN; Meldepflicht (3.5) verzweigt fachlich zu „mit externer Meldung“ vs. „ohne“.

```mermaid
flowchart TB
  K31["3.1 Start + Stammdaten"]
  K32["3.2 Ersterfassung"]
  K33["3.3 Zweiterfassung"]
  K34["3.4 QS Erst- und Zweitinstanz"]
  K35{"3.5 Meldepflicht?"}
  K36["3.6 Bearbeitung / Anhörungen"]
  K37["3.7 Eilmeldung + Fristen"]
  K38["3.8 Expertise + Gutachten"]
  K39["3.9 ERV / beBPo"]
  K310["3.10 Veraktung + Abschluss"]
  K311["3.11 Varianten ohne Gefangenenbezug"]

  K31 --> K32 --> K33 --> K34 --> K35
  K35 -->|meldepflichtig| K36 --> K37 --> K38 --> K39 --> K310
  K35 -->|nicht meldepflichtig| K310
  K311 -.->|alternativer Einstieg| K32
```

### 2.2 Schema: Zentrale Weichen (Auszug aus Kapitel 4)

Die vollständige **Entscheidungsübersicht** bleibt die **Tabelle in Abschnitt 4**. Hier nur die zentralen Weichen als Leseschema:

```mermaid
flowchart TB
  MF{Meldepflicht?}
  MF -->|ja| BEAR[Bearbeitung Anhörungen Beweismittel]
  BEAR --> EL{Eilmeldung nötig?}
  EL -->|ja| EIL[Eilmeldung vor vollständiger Meldung]
  EL -->|nein| FR[Prüfung Meldungsfristen]
  FR --> EX{Expertise Gutachten?}
  EX -->|ja| GU[Gutachtenpfad]
  EX -->|nein| VF[Versandfähig]
  GU --> VF
  VF --> BP[beBPo ERV oder direktes Hochladen]
  MF -->|nein| ABS[Abschluss ohne externe Meldung]
```

Weitere Gateways (Beteiligte, Bestätigung, Aufgabenübernahme, Rückfragen an Erfassende): **Abschnitt 4** Tabelle.

### 2.3 Schema: ARIS ↔ Prototyp-Status (Mapping)

Entspricht Kapitel **7 Abgleich**; für LC-Umsetzung und Workshop.

```mermaid
flowchart LR
  subgraph aris [ARIS vereinfacht]
    A1[Erfassung offen]
    A2[Eingereicht / QS / Meldepflicht]
    A3[Bearbeitung / Gutachten / Anhörung]
    A4[ERV versendet]
    A5[eGPA / Ablage]
    A6[Prozessende]
  end
  subgraph proto [Prototyp A2]
    P1["DRAFT"]
    P2["SUBMITTED"]
    P3["IN_PROGRESS / FORWARDED"]
    P4["Versandverlauf"]
    P5["Veraktungen"]
    P6["ARCHIVED"]
  end
  A1 --> P1
  A2 --> P2
  A3 --> P3
  A4 --> P4
  A5 --> P5
  A6 --> P6
```

### 2.4 Schema: Systemlandschaft (Kapitel 6)

```mermaid
flowchart LR
  EM[eMeldewesen Kern]
  BW[BASIS-Web]
  BP[beBPo]
  GPA["eGPA / GPA"]
  EL[Eldorado]
  DWH[DWH / Auswertung]

  EM --> BW
  EM --> BP
  BP --> GPA
  GPA --> EL
  EL --> DWH
```

**Prototyp:** nur Mock für beBPo und eGPA; keine Live-Schnittstellen.

### 2.5 Schema: Rollen-Swimlanes (ARIS-Soll, Abgleich Prototyp)

Leseschema zur **Verteilung von Aufgaben** auf Akteure und Systeme. Es ist **kein** BPMN mit strikter Reihenfolge aller parallelen Pfade; die Phasennummern verweisen auf **Abschnitt 3** dieses Dokuments.

**Abgleich:** Vereinfachte Darstellung der Rollenblöcke wie in [10_PROZESSDIAGRAMM.md](10_PROZESSDIAGRAMM.md) Abschnitt **5 Rollen entlang des Kernpfads**; hier zusätzlich **QS**, **Gutachten/Expertise** und **Systeme** aus ARIS (Kapitel 5 und 6).

```mermaid
flowchart TB
  subgraph lane_sys[Systeme und Fachstellen ARIS]
    direction LR
    BW[BASIS-Web Stammdaten]
    BP[beBPo ERV]
    GPA[eGPA Generalakte]
    EXP[Revier Revision DB-Experte]
  end

  subgraph lane_st[Station aVD Stationsleitung]
    direction TB
    ST1["3.1 Start, Beweise, Beobachtung"]
    ST2["3.2 Ersterfassung, Beteiligte"]
    ST3["Rücklauf QS, Anpassungen Erfassung"]
    ST1 --> ST2 --> ST3
  end

  subgraph lane_mixed[Kammer Zahlstelle Arbeitskoordination]
    direction TB
    MX1["Erstellen, Bearbeiten"]
    MX2["Intern weiterleiten"]
    MX1 --> MX2
  end

  subgraph lane_val[VAL Anstaltsleitung]
    direction TB
    V1["3.4 QS, 3.5 Meldepflicht"]
    V2["3.6 Bearbeitung, 3.7 Fristen, 3.8 Gutachten"]
    V3["3.9 ERV, 3.10 Veraktung, Abschluss"]
    V1 --> V2 --> V3
  end

  ST1 -.-> BW
  ST2 --> V1
  ST3 --> V1
  MX1 --> V1
  MX2 --> V2
  V2 -.-> EXP
  V3 --> BP --> GPA
```

| Bereich | Prototyp A2 (Mindestbild) |
|---------|---------------------------|
| Station | Meldung anlegen, Entwurf, Einreichung; Zeugen-Folgeaktionen bei Strafanzeige nach [10_PROZESSDIAGRAMM.md](10_PROZESSDIAGRAMM.md) Abschnitt 7 |
| Kammer / Zahlstelle / Arbeitskoordination | Wie Station: Erstellen und Bearbeiten; Weiterleiten ohne beBPo ([02_QUERSCHNITT_ROLLEN_STATUS.md](02_QUERSCHNITT_ROLLEN_STATUS.md)) |
| VAL / AL | Bearbeitung, Weiterleiten, beBPo, eGPA, Archiv; **keine** getrennten QS-/Gutachten-Status |
| BASIS-Web, Revier, Revision, Experte | nicht angebunden bzw. nicht als Rolle modelliert |

---

## 3 Phasen und Hauptschritte

### 3.1 Start und Stammdaten

| Schritt | Beschreibung | Typische Akteure / Systeme |
|---------|--------------|----------------------------|
| Erfassungsfrist hat begonnen | Zeitliche Einordnung des Vorgangs; Fristen laufen | Planer, JVA |
| Gefangenen-Stammdaten abrufen | Wer ist betroffen? | **BASIS-Web** (Analog eMeldewesen) |
| Geschäftsvorgangsnummer generieren | Pro 4-Augen-Prinzip (4W) eine Nummer; verbundene Sachverhalte ggf. mit `.x` | eMeldewesen |
| Beobachtungsbogen (Freitext) | Dokumentation des Beobachteten | aVD / Erfassende |
| Beweismittel sichern / digitalisieren | Vor formaler Meldung | Station, aVD |

**ARIS-Hinweis:** Während der Erfassung soll die Geschäftsvorgangsnummer pro 4W generiert werden; bei mehreren Gefangenen im selben Sachverhalt Kennzeichnung mit `.x`.

**Prototyp:** Meldungs-ID im System; keine separate GV-Nummer-Logik; kein BASIS-Web-Anbindung (Seed-Daten).

---

### 3.2 Ersterfassung

| Schritt | Beschreibung |
|---------|--------------|
| Eckdaten erfassen | Wer, Wann, Wo, Was |
| Aussage erstellen | Inhaltliche Darstellung |
| Beweismittel und Dokumente hochladen | Anlagen |
| Weitere Beteiligte nötig? | Gateway |
| Beteiligte hinzuziehen | Bei Bedarf weitere Personen einbinden |
| Bestätigung der Beteiligung liegt vor? | Gateway |
| Die Richtigkeit und Vollständigkeit prüfen | Vor Übergabe an QS |
| Eine Beschreibung des Ereignisses erstellen | Zusammenfassung für nachgelagerte Stufen |
| Erfassung ist abgeschlossen | Übergabe |

**Prototyp:** Entspricht grob **Meldung anlegen** (`MeldungForm`, Status `DRAFT`) und **Einreichung** (`SUBMITTED`). Zeugen, Tatvorwurf (Strafanzeige) sind prototypspezifisch erweitert.

---

### 3.3 Zweiterfassung (parallel, wiederholbar)

| Schritt | Beschreibung |
|---------|--------------|
| Zweiterfassung | Unabhängige zweite inhaltliche Erfassung |
| 2. Aussage anpassen | Korrektur/Ergänzung der Aussage |
| Aussagen anpassen | Bei Rückfragen |
| Der Prozess wird für weitere Zweiterfassende unabhängig vom ursprünglichen Zweiterfassenden wiederholt | ARIS-Anmerkung |

**Prototyp:** nicht abgebildet.

---

### 3.4 Qualitätssicherung (Erst- und Zweitinstanz)

| Schritt | Beschreibung |
|---------|--------------|
| Qualitätssicherung Erstinstanz | 1. QS-Instanz |
| Fragen hinsichtlich der Ersterfassung | Rückfragen an Erfassende |
| Zurück an der 1. QS-Instanz mit Fragen | Schleife |
| Qualitätssicherung Zweitinstanz | 2. QS-Instanz |
| Fragen hinsichtlich der Zweiterfassung | Rückfragen |
| 2. Prüfung der Richtigkeit und Vollständigkeit | Nach Zweiterfassung |
| QS ist abgeschlossen und eine Meldepflicht besteht | Gateway-Ergebnis |
| QS wird gestoppt | Bei laufenden Anpassungen der Erfassung |
| Anpassungen der Erfassung wurden angefragt / sind eingegangen | Rückkopplung zur Erfassung |
| An Meldende zur Bearbeitung weiterleiten | Bei offenen Punkten |

**Prototyp:** keine getrennten QS-Instanzen; fachliche Prüfung als **„In Bearbeitung“** ohne QS-Status.

---

### 3.5 Meldepflicht und Beschreibung

| Entscheidung | Folge |
|--------------|-------|
| Besteht eine Meldepflicht? | zentrale Weiche |
| Meldepflichtig | weiter in Bearbeitung / Versandpfad |
| Nicht meldepflichtig | Abschluss ohne externe Meldung (siehe 3.9) |
| Den Meldepflicht prüfen | Aufgabe |
| Bestätigung der Meldepflicht | dokumentiert |
| Meldungspflichtmitteilung | Mitteilung über Ergebnis der Prüfung |
| Die Beschreibung anpassen | bei inhaltlichen Korrekturen |
| Anpassungen oder Ergänzungen nötig | Rückkopplung |
| Keine weitere Informationen nötig | QS/Bearbeitung kann fortgesetzt werden |

**Prototyp:** Meldepflicht nicht als eigener Prozessschritt; ERV-Relevanz über **Meldungstyp** / `ervRelevant`.

---

### 3.6 Bearbeitung (nach Meldepflicht)

| Schritt | Beschreibung |
|---------|--------------|
| Bearbeitungsanfrage | formale Bearbeitung starten |
| Bestätigung der Bearbeitung | Übernahme |
| Bearbeitung abgeschlossen / Bearbeitung ist abgeschlossen | interner Abschluss der Bearbeitungsphase |
| Anhörungen durchführen, falls nötig | inkl. Dokumentation und Ablage der Ergebnisse (ARIS: unter „Anpassungen“ ergänzt) |
| Stellungnahmen zu Anhörungen und Zeugenaussagen | Nach Anhörung |
| Fragen / Anmerkungen an Erfassende schicken | Rückfragen |
| Aufgabe Übernahme? / Aufgabe wurde übernommen / nicht übernommen | Zuweisung an Bearbeitende (z. B. Kammer, Revier) |
| Übernahme Aufgabe | Organisatorische Zuweisung |

**Prototyp:** Status **In Bearbeitung** / **Weitergeleitet**; Zeugen-Folgeaktionen bei Strafanzeige **nur bei Einreichung** (Benachrichtigung aVD/SL, Frist Bedienstete).

---

### 3.7 Eilmeldung und Fristen

| Schritt / Entscheidung | Beschreibung |
|------------------------|--------------|
| Prüfung der Meldungsfristen | Fristenkontrolle |
| Meldungsfrist &lt; 48 Stunden | Kriterium für Eilmeldung |
| Meldung nötig? | Gateway |
| Eilmeldung nötig / nicht nötig | Verzweigung |
| Erstellung Eilmeldung | Dringliche Vorabinformation |
| Übermittlung an relevanten Empfänger | vor vollständiger Meldung |
| Prüfung Richtigkeit und Vollständigkeit | vor Versand |

**Prototyp:** SLA **24 h** Bearbeitung aufnehmen, **5 Tage** Überfällig-Anzeige; keine Eilmeldung als eigener Vorgangstyp.

**Lastenheft-SLA:** siehe [03_QUERSCHNITT_SLA_UI.md](03_QUERSCHNITT_SLA_UI.md) (24 h / 3 Werktage beBPo).

---

### 3.8 Expertise und Gutachten

| Schritt | Beschreibung | Akteure |
|---------|--------------|---------|
| Anforderung Expertise | Bedarf feststellen | VAL, AL |
| Experte Gutachten einholen (Standard-Abfrage) | an DB Experte | eMeldewesen |
| Anfrage Gutachten | formal | |
| Revision für Gutachten anfragen / Revier für Gutachten anfragen | je nach Thema | Revision, Revier |
| bezüglich Gesundheitszustand Beteiligter / Sachgegenstand | Spezialisierung | |
| Expertengutachten wurde angefragt | Status | |
| Rückmeldung Gutachter ist eingegangen | | |
| Erfassung Gutachten | im System | |
| Gutachten ist erstellt und versendet | Abschluss Gutachten | |
| Stellungnahme zu Gutachten | Verarbeitung | |
| Beweismittelbegutachtung | fachlich | Begutachtung |
| Ende der Gutachtenanfrage | | |
| Von wem kam die Aufforderung zu Stellungnahme? | Aufforderung kam von AL / VL·VAL | |

**Prototyp:** nicht abgebildet.

---

### 3.9 Erstellung Meldung und externer Versand (ERV)

| Schritt | Artefakt / System |
|---------|-------------------|
| Erstellung Meldung | fachlicher Kern |
| XJustiz-Strukturdatei | ERV |
| Mitteilung (PDF) | ERV |
| ERV-Nachricht | ERV |
| Versand an ERV oder direktes Hochladen | beBPo oder manuell |
| Übermittlung an relevanten Empfänger | extern |
| Anlagen, Beweismittel und Dokumente hochladen | |

**Prototyp:** Mock **POST** `/api/meldungen/:id/xjustiz-versand` (VAL/AL); ERV-Badge in UI.

**Lastenheft:** beBPo **vor** eGPA; internes Weiterleiten ≠ externer Versand ([02_QUERSCHNITT_ROLLEN_STATUS.md](02_QUERSCHNITT_ROLLEN_STATUS.md)).

---

### 3.10 Veraktung, Abschluss, Nachgelagertes

| Schritt | System / Ziel |
|---------|---------------|
| Verfügung an die eGPA / Generalakte | Ablage |
| (e)GPA | elektronische Personalakte |
| Eldorado | (Schnittstelle im ARIS-Modell) |
| Abschluss des Prozesses | Endzustand fachlich |
| Datenauszug / Datenexport | Export |
| Auswertung / Fachaufsicht | DWH, Auswertung |
| Endereignis | BPMN-Ende |

**Prototyp:** Mock **Verakten** (`POST …/verakten`), Status **Archiviert**; Vier-Augen VAL↔AL dokumentiert, **nicht durchgesetzt**.

---

### 3.11 Varianten ohne Gefangenenbezug

| Entscheidung | Bedeutung (ARIS) |
|--------------|------------------|
| Ereignis mit Gefangenenbezug | Standardpfad mit Stammdaten aus BASIS-Web |
| Ereignis mit keinen / keinem Gefangenenbezug | abweichender Pfad (weniger Stammdatenbezug) |

**Prototyp:** Gefangenen-Autocomplete optional je Typ; keine getrennte Prozessvariante.

---

## 4 Entscheidungsübersicht (Gateways)

| Frage im Modell | Ja → typische Folge | Nein → typische Folge |
|-----------------|---------------------|------------------------|
| Weitere Beteiligte nötig für die Erfassung? | Beteiligte hinzuziehen | Richtigkeit/Vollständigkeit |
| Bestätigung der Beteiligung liegt vor? | weiter | ggf. warten / nachfassen |
| Weitere Beteiligung nötig? | Schleife Beteiligung | Erfassung abschließen |
| Besteht eine Meldepflicht? | Bearbeitung / Versandpfad | Abschluss ohne Meldung |
| Meldungsfrist &lt; 48 h / Eilmeldung nötig? | Eilmeldung | regulärer Pfad |
| Meldung nötig? | Erstellung / Versand | interner Abschluss |
| Anpassungen oder Ergänzungen nötig? | zurück an Erfassung/QS | weiter |
| Aufgabe wurde übernommen? | Bearbeitung durch Übernehmer | andere Zuweisung |
| Weitere Informationen von der Erfassenden nötig? | Rückfrage | QS/Bearbeitung fortsetzen |

---

## 5 Rollen und Organisation (ARIS → Prototyp)

Schematische Swimlane: **Abschnitt 2.5**; vereinfachtes Rollendiagramm Prototyp: [10_PROZESSDIAGRAMM.md](10_PROZESSDIAGRAMM.md) Abschnitt 5.

| ARIS / Fachlich | Rolle im Prototyp (kanonisch) | Anmerkung |
|-----------------|-------------------------------|-----------|
| Allgemeiner Vollzugsdienst (AVD) | `avd` | Ersterfassung, Station |
| Stationsleitung | `stationsleitung` | Sichtbereich Station |
| Vollzugsabteilungsleitung (VAL) | `val` | QS, beBPo, eGPA, Abschluss |
| Anstaltsleitung (AL) | `anstaltsleitung` | wie VAL + gesamte Anstalt |
| Kammer | `kammer` | Weiterleiten |
| Planer | – | nicht als Rolle im Prototyp |
| Revier / Revision | – | Gutachtenpfad |
| DB Experte / Expertise | – | Gutachten |
| JVAen (organisatorisch) | JVA-Filter Mock-Nutzer | |
| Fachaufsicht / Auswertung | – | nachgelagert (DWH) |

---

## 6 Systemlandschaft (aus ARIS)

| System | Funktion im Prozess |
|--------|---------------------|
| **eMeldewesen** | Kernanwendung Erfassung, QS, Bearbeitung, Versandsteuerung |
| **BASIS-Web** | Gefangenen-Stammdaten (Analog-Anbindung im Modell) |
| **beBPo** | ERV-Versand (xJustiz) |
| **(e)GPA / eGPA** | Veraktung, Generalakte |
| **Eldorado** | im Modell am Abschlusspfad |
| **DWH** | Auswertung / Fachaufsicht |
| **DB eMeldewesen / DB Bedienstete / DB Experte** | Datenhaltung / Fachdaten im Modell |

**Prototyp:** nur Mock für beBPo und eGPA; keine echten Schnittstellen (.cursorrules Kap. 8).

---

## 7 Abgleich: ARIS-Hauptpfad ↔ Prototyp-Status

| ARIS (vereinfacht) | Prototyp-Status / UI |
|--------------------|----------------------|
| Erfassung (offen) | `DRAFT` (Entwurf) |
| Erfassung abgeschlossen / QS / Meldepflicht | `SUBMITTED` (Eingereicht) |
| Bearbeitung, Weiterleitung, Gutachten, Anhörung | `IN_PROGRESS`, `FORWARDED` |
| beBPo / ERV versendet | Versandverlauf, Badge |
| eGPA-Veraktung | Veraktungsliste |
| Abschluss des Prozesses | `ARCHIVED` (Archiviert) |

**Prozesslandkarte UI:** `getProzessSchritte()` – Entwurf → Eingereicht → Bearbeitung → [beBPo] → [eGPA] → Archiviert.

---

## 8 Offene Punkte und Workshop-Themen

Aus ARIS und Prototyp-Gap abgeleitet; ergänzend [RUECKFRAGEN_UND_OFFENE_PUNKTE.md](../RUECKFRAGEN_UND_OFFENE_PUNKTE.md):

1. **Inhaltliche Prüfcheckliste** in der Bearbeitungsphase → Workshop-Vorlage [09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md](09_WORKSHOP_CHECKLISTE_INTERN_BEARBEITUNG.md) (Beschlüsse nach Termin eintragen).
2. **Definition „versandfähig“** vor beBPo (SLA 3 Werktage).
3. **Werktage / Wochenenden** bei Erfassungs- und Meldungsfristen (ARIS: 48 h Eilmeldung; Lastenheft: 24 h SLA).
4. **Zweiterfassung und QS** – verpflichtend für alle Typen oder nur ERV?
5. **Geschäftsvorgangsnummer (4W)** – führende Nummer vs. System-ID.
6. **Gutachtenpfad** – wann Revision vs. Revier vs. externer Experte?
7. **Direktes Hochladen** vs. beBPo – zulässige Ausnahmen?
8. **Anhörungsergebnisse** – Pflichtdokumente je Meldungstyp (ARIS-Hinweis „Anpassungen“).

---

## 9 Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2026-05-20 | 0.3 | Abschnitt 2.5 Rollen-Swimlanes; Verweise auf [10_PROZESSDIAGRAMM.md](10_PROZESSDIAGRAMM.md) Abschnitte 1, 5 und 7 |
| 2026-05-20 | 0.2 | Schema-Darstellung ergänzt (Abschnitt 2.1–2.4: Phasen, Gateways, Status-Mapping, Systeme) |
| 2026-05-19 | 0.1 | Erstfassung aus ARIS-PDF-Textextraktion, Abgleich Lastenheft/Prototyp |
