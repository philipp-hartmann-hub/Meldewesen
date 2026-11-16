# Umsetzungsdokumentation: Benachrichtigungs-Glocke (Prototyp)

**Stand:** 2026-06-05  
**Ersetzt (teilweise):** `MeldungPruefHinweisModal` für Zuweisungs-/Task-Ereignisse; Session-Modal bleibt für VAL-Prüfhinweis.

---

## 1. Ziel

In-App-Benachrichtigungen für **Zuweisungsereignisse** und **neue Arbeitskorb-Aufgaben** – Ersatz für E-Mail/LC-Plattform im Prototyp (H-Z50).

---

## 2. Ereignistypen

| Typ | Auslöser | Empfänger |
|-----|----------|-----------|
| `AUFGABE_ZUGEWIESEN` | VAL/AL weist zu oder ummeldet | Ziel-AVD/SL |
| `AUFGABE_ZURUECKGEZOGEN` | Zurück an Gruppe / Ummeldung weg vom bisherigen AVD | Alter Empfänger |
| `AUFGABE_NEU` | Beweismittel-Nachreichung angefordert (Rückgabe) | Ermittelter AVD |
| `AUFGABE_ESKALIERT` | Beweismittel-Frist abgelaufen → Gruppenpostfach | VAL + SL der Gefangenen-Station |

---

## 3. Datenmodell

Prisma-Model `Benachrichtigung` (`benachrichtigungen`):

- `empfaengerId` – `bediensteterID`
- `typ`, `text`, `meldungId?`, `aufgabeId?`
- `gelesen` (default `false`)

---

## 4. API

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET | `/api/benachrichtigungen?limit=10` | Letzte Einträge + `ungelesen`-Zähler |
| PATCH | `/api/benachrichtigungen/gelesen` | Alle (oder `ids[]`) als gelesen markieren |

Service: `backend/src/services/benachrichtigungService.js`  
Routes: `backend/src/routes/benachrichtigungen.js`

---

## 5. Frontend

| Komponente | Pfad |
|------------|------|
| Glocke im Header | `frontend/src/components/layout/BenachrichtigungenGlocke.jsx` |
| Polling-Hook (30 s) | `frontend/src/hooks/useBenachrichtigungen.js` |
| Einbindung | `frontend/src/components/layout/Header.jsx` |

Beim Öffnen des Dropdowns: `PATCH /api/benachrichtigungen/gelesen`.  
Klick auf Eintrag: Deep-Link zu Meldung oder Arbeitskorb-Aufgabe.

---

## 6. Abgrenzung

- Keine E-Mail, kein LC-Plattform-Anbindung (bewusst Prototyp).
- Arbeitskorb-Badge „X neu“ (localStorage) bleibt parallel bestehen.
- `MeldungPruefHinweisModal` bleibt für VAL-Session-Hinweis bei eingereichten Meldungen.
