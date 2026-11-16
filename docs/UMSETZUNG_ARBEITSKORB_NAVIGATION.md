# Umsetzungsdokumentation: Arbeitskorb-Navigation & Rollen-Konsistenz

**Stand:** 2026-06-05  
**Bezug:** A2-F-SLA-003/004, A2-F-QS-004, Happy Path HP-16–26  

---

## 1. Ziel

Einheitliche Regeln, **wohin** Nutzer nach Aufgaben-Abschluss geleitet werden und **welche Primäraktionen** je Rolle sichtbar sind. Verhindert z. B., dass AVD nach Zeugenaussage (MEL-115) fälschlich „Fachliche Prüfung aufnehmen“ sieht.

---

## 2. Navigation nach Arbeitskorb-Abschluss

Zentrale Funktion: `frontend/src/utils/arbeitskorb.js` → `getNavigationNachAufgabenAbschluss(typ, meldungId)`

| Aufgabentyp | Rolle | Ziel nach Abschluss | Erfolgsmeldung |
|-------------|-------|---------------------|----------------|
| `zeugenaussage_bestaetigen` | AVD/SL (Zeuge) | `/arbeitskorb` | „Aufgabe ‚Zeugenaussage bestätigen' abgeschlossen." |
| `zeugenaussage_inhaftierter_erfassen` | AVD/SL (Station) | `/arbeitskorb` | „Aufgabe ‚Zeugenaussage (Inhaftierter)' abgeschlossen." |
| `beweismittel_nachreichen` | AVD/SL | `/arbeitskorb` | „Aufgabe ‚Beweismittel nachreichen' abgeschlossen." |
| `fachliche_pruefung` | VAL/AL | `/meldungen/:id` | Banner „Fachliche Prüfung abgeschlossen“ + nächster Schritt (ERV o. Prüfung) |

**Anzeige Erfolg:** `Arbeitskorb.jsx` (grüner Banner via `location.state.erfolgsMeldung`).

Alternativweg: Vollständige Bearbeitung weiterhin über `/meldungen/:id/bearbeiten` (Entwurf).

---

## 3. Primäraktionen im Meldungsdetail (`MeldungAktionen`)

| Aktion | Rolle | Status-Voraussetzung |
|--------|-------|----------------------|
| Einreichen | AVD/SL (+ andere mit Erstellrecht) | `DRAFT` |
| **Fachliche Prüfung aufnehmen** | **nur VAL/AL** | `SUBMITTED`/`FORWARDED`, alle Zeugen vollständig |
| beBPo / eGPA / Archiv | VAL/AL (ERV) | siehe ERV-Ablauf |
| Zur Ergänzung zurückgeben | nur VAL/AL | `SUBMITTED`/`IN_PROGRESS`/`FORWARDED` |

**AVD bei `SUBMITTED`:** Kein Primärbutton; Hinweis: *„Fachliche Prüfung obliegt der VAL. Offene Aufgaben finden Sie im Arbeitskorb.“*

**Backend-Absicherung:** `PATCH /api/meldungen/:id/status` mit `IN_PROGRESS` → 403 für Nicht-VAL/AL.

---

## 4. Prüf-Hinweis-Modal (Prototyp)

| Aspekt | Verhalten |
|--------|-----------|
| Zielgruppe | **nur VAL/AL** (`istPruefer` in `useMeldungPruefPopup`) |
| Datenquelle VAL | Offene Arbeitskorb-Tasks `fachliche_pruefung` |
| AVD | Modal **nicht** angezeigt (kein Hinweis auf fachliche Prüfung) |
| Dashboard-Stat AVD | „Eingereichte Meldungen“ (nicht „zur Prüfung“) |

Siehe auch `LASTENHEFT/03_QUERSCHNITT_SLA_UI.md` (A2-F-SLA-004).

---

## 5. Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `frontend/src/utils/arbeitskorb.js` | `getNavigationNachAufgabenAbschluss`, `ARBEITSKORB_NACH_ABSCHLUSS_TYPEN` |
| `frontend/src/pages/ArbeitskorbAufgabe.jsx` | `navigateNachAbschluss` nutzt Utility |
| `frontend/src/pages/Arbeitskorb.jsx` | Erfolgs-Banner |
| `frontend/src/components/meldung/MeldungAktionen.jsx` | `darfFachlichPruefen`; AVD-Hinweis |
| `frontend/src/pages/MeldungDetail.jsx` | Banner „Nächster Schritt“ nur bei fachlicher Prüfung + VAL/AL |
| `frontend/src/hooks/useMeldungPruefPopup.js` | nur `istPruefer` |
| `frontend/src/pages/JVPDashboard.jsx` | Stat-Label AVD |
| `frontend/src/pages/EMeldewesenHub.jsx` | Arbeitskorb-Beschreibung rollenabhängig |
| `backend/src/routes/index.js` | Guard `IN_PROGRESS` |

---

## 6. Manuelle Abnahme

### Szenario A: Zeugenaussage (MEL-115, Jana Fischer / AVD-07)

1. AVD schließt persönliche Zeugenaussage im Arbeitskorb ab  
2. → Weiterleitung **`/arbeitskorb`** mit grünem Hinweis  
3. → **Kein** Button „Fachliche Prüfung“ auf Meldungsdetail (falls manuell geöffnet)

### Szenario B: Fachliche Prüfung (VAL-01)

1. VAL schließt Arbeitskorb-Task „Fachliche Prüfung“ ab  
2. → Weiterleitung **`/meldungen/:id`** mit Erfolgs-Banner und ERV-Hinweisen  
3. Status `IN_PROGRESS`

### Szenario C: Backend-Guard

1. Als AVD `PATCH /api/meldungen/:id/status` mit `{ status: "IN_PROGRESS" }`  
2. → **403** „Nur VAL oder Anstaltsleitung …“

---

## 7. Verwandte Dokumente

| Dokument | Bezug |
|----------|-------|
| [UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md](UMSETZUNG_BEWEISMITTEL_NACHREICHUNG.md) | Inline-UI Beweismittel im Arbeitskorb |
| [UMSETZUNG_BENACHRICHTIGUNGEN.md](UMSETZUNG_BENACHRICHTIGUNGEN.md) | Glocke bei Zuweisung |
| [HAPPY_PATH_STRAFANZEIGE.md](HAPPY_PATH_STRAFANZEIGE.md) | HP-26d/e, Zeugen-Folgeaktionen |
| [PROTOKOLL_AENDERUNGEN.md](PROTOKOLL_AENDERUNGEN.md) | Chronik |
