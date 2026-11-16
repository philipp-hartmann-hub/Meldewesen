/**
 * Zielprozess-Optionen, die im HEUREKA-A2-Prototyp noch nicht klickbar sind.
 * Pflege synchron mit docs/LASTENHEFT/12_PROTOTYP_POPUP_ZIELOPTIONEN.md
 */
export const ZIELPROZESS_GRUPPEN = [
  {
    id: 'rueckgabe',
    titel: 'Rückgabe, Korrektur, Erfassung',
    optionen: [
      { id: 'Z-01', titel: 'An Erfassende zurücksenden', beschreibung: 'Meldung zur Bearbeitung oder Ergänzung an die erfassende Person.', rolle: 'QS / SL / VAL' },
      { id: 'Z-02', titel: 'Inhalt nach Einreichung bearbeiten', beschreibung: 'Sachverhalt und Metadaten ändern ohne vollständige Rückgabe (große Korrektur).', rolle: 'VAL / AL' },
      { id: 'Z-03', titel: 'Zweiterfassung', beschreibung: 'Zweite unabhängige inhaltliche Erfassung, parallel und wiederholbar.', rolle: 'Zweiterfassende' },
      { id: 'Z-04', titel: 'Weitere Beteiligte einbinden', beschreibung: 'Zusätzliche Gefangene oder Beteiligte nach der Ersterfassung.', rolle: 'Erfassende / Bearbeitende' },
      { id: 'Z-05', titel: 'Geschäftsvorgangsnummer (4W)', beschreibung: 'Führende 4W-Nummer und Verknüpfung verbundener Sachverhalte.', rolle: 'System' },
    ],
  },
  {
    id: 'qs',
    titel: 'Qualitätssicherung',
    optionen: [
      { id: 'Z-10', titel: 'QS Erstinstanz', beschreibung: 'Erste Qualitätssicherung mit Rückfragen an die Ersterfassung.', rolle: 'QS / SL' },
      { id: 'Z-11', titel: 'QS Zweitinstanz', beschreibung: 'Zweite QS-Instanz nach der Zweiterfassung.', rolle: 'QS / VAL' },
      { id: 'Z-12', titel: 'QS abschließen oder stoppen', beschreibung: 'QS abgeschlossen oder gestoppt bei laufenden Anpassungen.', rolle: 'QS' },
      { id: 'Z-13', titel: 'Meldepflicht prüfen', beschreibung: 'Dokumentieren, ob eine Meldepflicht besteht.', rolle: 'VAL / AL' },
    ],
  },
  {
    id: 'organisation',
    titel: 'Bearbeitung und Organisation',
    optionen: [
      { id: 'Z-22', titel: 'Anhörungen dokumentieren', beschreibung: 'Anhörung durchgeführt und Ergebnis abgelegt.', rolle: 'Bearbeitende' },
      { id: 'Z-23', titel: 'Beweismittel (fachliche Nachverfolgung)', beschreibung: 'Sicherung und Digitalisierung über die Formularangabe hinaus.', rolle: 'aVD / Station' },
      { id: 'Z-24', titel: 'Kammer informieren (Beweismittel)', beschreibung: 'Kammer bei gesicherten Beweismitteln einbinden.', rolle: 'Kammer / VAL' },
    ],
  },
  {
    id: 'fristen',
    titel: 'Fristen, Eilmeldung, Eskalation',
    optionen: [
      { id: 'Z-30', titel: 'Eilmeldung (Frist unter 48 h)', beschreibung: 'Dringliche Vorabinformation vor der vollständigen Meldung.', rolle: 'VAL / AL' },
      { id: 'Z-31', titel: 'Automatische SLA-Eskalation', beschreibung: 'E-Mail oder Aufgabe bei Verstoß gegen 24-h- oder 3-Tage-Frist.', rolle: 'System → SL / VAL / AL' },
      { id: 'Z-32', titel: 'Werktags- und Feiertagslogik', beschreibung: 'Frist pausiert oder verschoben je JVA (Anhang A).', rolle: 'System' },
    ],
  },
  {
    id: 'expertise',
    titel: 'Expertise, Gutachten, ERV-Regeln',
    optionen: [
      { id: 'Z-40', titel: 'Gutachten anfordern', beschreibung: 'Experte, Revision oder Revier einbinden.', rolle: 'VAL / AL' },
      { id: 'Z-41', titel: 'Gutachten und Stellungnahme', beschreibung: 'Gutachten erfassen und Stellungnahme verarbeiten.', rolle: 'Bearbeitende' },
      { id: 'Z-42', titel: 'Beweismittelbegutachtung', beschreibung: 'Fachliche Begutachtung von Beweismitteln.', rolle: 'Begutachtung' },
      { id: 'Z-43', titel: 'Direktes Hochladen (ohne beBPo)', beschreibung: 'Ausnahmefall statt ERV-Versand über beBPo.', rolle: 'VAL / AL' },
      { id: 'Z-44', titel: 'Vier-Augen erzwingen', beschreibung: 'Archivierung nur mit zweiter Leitungsrolle (VAL ↔ AL).', rolle: 'System' },
      { id: 'Z-45', titel: 'beBPo vor eGPA erzwingen', beschreibung: 'Reihenfolge technisch absichern.', rolle: 'System' },
    ],
  },
  {
    id: 'benachrichtigung',
    titel: 'Benachrichtigungen und Anbindungen',
    optionen: [
      { id: 'Z-50', titel: 'E-Mail-Benachrichtigung (LC-Plattform)', beschreibung: 'E-Mail/Kanäle außerhalb der App – In-App-Glocke (Zuweisung/Tasks) ist als Prototyp umgesetzt.', rolle: 'System' },
      { id: 'Z-51', titel: 'Zeugen: echte Kanäle', beschreibung: 'E-Mail oder Aufgabe statt Mock-Portal für Zeugen-Folgeaktionen.', rolle: 'System' },
      { id: 'Z-52', titel: 'BASIS-Web Live-Anbindung', beschreibung: 'Stammdaten Gefangene und Bedienstete aus dem Fachsystem.', rolle: 'System' },
    ],
  },
  {
    id: 'typen',
    titel: 'Meldungstypen und UI-Erweiterungen',
    optionen: [
      { id: 'Z-60', titel: 'Externe Behördenmeldung', beschreibung: 'Meldungstyp VORFALL_EXTERN aktiv und durchgängiger Prozess.', rolle: '–' },
      { id: 'Z-61', titel: 'Statistik- und Sonstigmeldung', beschreibung: 'Weitere Meldungstypen aktiv mit Feldern und Prozess.', rolle: '–' },
      { id: 'Z-62', titel: 'ERV-Badge in der Liste', beschreibung: 'Durchgängige ERV-Kennzeichnung in der Meldungsliste.', rolle: '–' },
      { id: 'Z-63', titel: 'Mehrere Hauptbeteiligte', beschreibung: 'UI für mehrere Gefangene als Hauptbeteiligte.', rolle: 'Erfassende' },
    ],
  },
]
