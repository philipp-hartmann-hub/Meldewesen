# Inaktive Meldungstypen (Kurzprofil)

**Version:** 0.4 | **Status:** Phase 4 abgeschlossen (Entwurf 0.x)

Laut Beschluss: in UI **sichtbar, deaktiviert**, Hinweis **„in Planung“**. Keine detaillierten Pflichtfelder bis Fachfreigabe. **Kein** zusätzlicher Zeitrahmen oder Rollen-Inhaber für spätere Aktivierung im Lastenheft (Kurzprofil reicht).

| Code | Bezeichnung | ERV | Aktiv API | Geplanter Zweck |
|------|-------------|-----|-----------|-----------------|
| `VORFALL_EXTERN` | Externe Behördenmeldung | ja | nein | Meldungen an Polizei/Behörden außerhalb Standard-ERV-Kette |
| `STATISTIK_MELDUNG` | Statistikmeldung | nein | nein | Aggregierte/statistische Meldungen ohne Einzelfall-ERV |
| `SONSTIGE` | Sonstige Meldung | nein | nein | Restkategorie mit Pflichtbegründung bei Aktivierung |

### Kriterien für spätere Aktivierung

1. Fachbeschluss JVA/Behörde  
2. Pflichtfelder in Anhang B ergänzt  
3. Rollenmatrix für Typ freigegeben  
4. UI: Eintrag aktiv + ggf. ERV-Workflow  

### A2-F-QS-001 – API liefert inaktive Typen

| Priorität | Prototyp (Muss) |
| Beschreibung | `GET /api/meldungstypen` enthält alle sechs Typen mit `aktiv: true/false`. |
| Prototyp | **umgesetzt** |

### Abnahme (gekoppelt)

| A2-F-TST-ID | Alias | Verifiziert Anforderung | Erwartung |
|-------------|-------|-------------------------|-----------|
| A2-F-TST-015 | TST-INA-01 | A2-F-QS-001, A2-F-UI-005 | API: sechs Typen; UI: inaktive disabled + Tooltip „in Planung“ (UI offen) |
