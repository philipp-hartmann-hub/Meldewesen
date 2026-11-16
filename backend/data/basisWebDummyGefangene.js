/**
 * Dummy-Stammdaten als Ersatz für BASIS-Web (lesend, nur Prototyp).
 * 30 Datensätze, ausschließlich JVA Billwerder (Autocomplete / Rollen-Tests).
 */

function d(y, m, day) {
  return new Date(`${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
}

export const BASIS_WEB_DUMMY_GEFANGENE = [
  {
    gefangenenNr: 'GEF-001', nachname: 'Müller', vorname: 'Hans',
    geburtsdatum: d(1980, 3, 15), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch',
    jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'A2-11', haftart: 'Strafhaft',
    strafende: d(2027, 6, 30), betreuenderBeamter: 'AVD-01',
  },
  { gefangenenNr: 'GEF-002', nachname: 'Schneider', vorname: 'Luca', geburtsdatum: d(1992, 1, 8), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'A1-03', haftart: 'Strafhaft', strafende: d(2028, 1, 10), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-003', nachname: 'Fischer', vorname: 'Jonas', geburtsdatum: d(1987, 11, 22), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'A1-07', haftart: 'Strafhaft', strafende: d(2026, 9, 1), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-004', nachname: 'Weber', vorname: 'Anna', geburtsdatum: d(1995, 4, 3), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'A2-02', haftart: 'Strafhaft', strafende: d(2027, 3, 20), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-005', nachname: 'Wagner', vorname: 'Tom', geburtsdatum: d(1984, 7, 19), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'B1-01', haftart: 'Strafhaft', strafende: d(2029, 5, 5), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-006', nachname: 'Becker', vorname: 'Finn', geburtsdatum: d(1991, 2, 28), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'B1-05', haftart: 'Strafhaft', strafende: d(2027, 11, 30), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-007', nachname: 'Schulz', vorname: 'Elena', geburtsdatum: d(1989, 9, 9), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'B2-03', haftart: 'Strafhaft', strafende: d(2028, 8, 15), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-008', nachname: 'Hoffmann', vorname: 'Paul', geburtsdatum: d(1983, 12, 1), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'B2-08', haftart: 'Strafhaft', strafende: d(2026, 4, 12), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-009', nachname: 'Koch', vorname: 'Nora', geburtsdatum: d(1996, 5, 17), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'C1-12', haftart: 'Strafhaft', strafende: d(2027, 7, 7), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-010', nachname: 'Richter', vorname: 'Leon', geburtsdatum: d(1988, 8, 24), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'C1-15', haftart: 'Strafhaft', strafende: d(2029, 2, 1), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-011', nachname: 'Klein', vorname: 'Sara', geburtsdatum: d(1993, 3, 6), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'C2-04', haftart: 'Strafhaft', strafende: d(2028, 6, 18), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-012', nachname: 'Wolf', vorname: 'Max', geburtsdatum: d(1986, 10, 30), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'C2-09', haftart: 'Strafhaft', strafende: d(2027, 1, 25), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-013', nachname: 'Neumann', vorname: 'Lisa', geburtsdatum: d(1994, 6, 14), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'F1-02', haftart: 'Strafhaft', strafende: d(2028, 4, 4), betreuenderBeamter: 'AVD-04' },
  { gefangenenNr: 'GEF-014', nachname: 'Schwarz', vorname: 'Tim', geburtsdatum: d(1990, 1, 21), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'F1-06', haftart: 'Strafhaft', strafende: d(2027, 10, 10), betreuenderBeamter: 'AVD-04' },
  { gefangenenNr: 'GEF-015', nachname: 'Braun', vorname: 'Felix', geburtsdatum: d(1985, 4, 11), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'F2-01', haftart: 'Strafhaft', strafende: d(2026, 12, 20), betreuenderBeamter: 'AVD-04' },
  { gefangenenNr: 'GEF-016', nachname: 'Zimmermann', vorname: 'Mia', geburtsdatum: d(1997, 7, 7), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'F2-08', haftart: 'Strafhaft', strafende: d(2029, 3, 3), betreuenderBeamter: 'AVD-04' },
  {
    gefangenenNr: 'GEF-017', nachname: 'Ibrahim', vorname: 'Omar',
    geburtsdatum: d(1990, 7, 4), staatsangehoerigkeit: 'Syrisch', muttersprache: 'Arabisch',
    jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'B1-09', haftart: 'Strafhaft',
    strafende: d(2026, 12, 31), betreuenderBeamter: 'AVD-04',
  },
  { gefangenenNr: 'GEF-018', nachname: 'Albrecht', vorname: 'Jan', geburtsdatum: d(1982, 2, 18), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'F3-11', haftart: 'Strafhaft', strafende: d(2027, 5, 28), betreuenderBeamter: 'AVD-04' },
  { gefangenenNr: 'GEF-019', nachname: 'Peters', vorname: 'Sophie', geburtsdatum: d(1998, 9, 25), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'F3-14', haftart: 'Strafhaft', strafende: d(2028, 11, 11), betreuenderBeamter: 'AVD-04' },
  { gefangenenNr: 'GEF-020', nachname: 'Krüger', vorname: 'Nils', geburtsdatum: d(1981, 11, 5), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'F4-02', haftart: 'Strafhaft', strafende: d(2026, 8, 8), betreuenderBeamter: 'AVD-04' },
  {
    gefangenenNr: 'GEF-021', nachname: 'Yilmaz', vorname: 'Mehmet',
    geburtsdatum: d(1988, 5, 12), staatsangehoerigkeit: 'Türkisch', muttersprache: 'Türkisch',
    jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'B2-14', haftart: 'Strafhaft',
    strafende: d(2028, 3, 15), betreuenderBeamter: 'AVD-01',
  },
  { gefangenenNr: 'GEF-022', nachname: 'Hartmann', vorname: 'Uwe', geburtsdatum: d(1979, 6, 2), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'D1-07', haftart: 'Strafhaft', strafende: d(2027, 9, 9), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-023', nachname: 'Lange', vorname: 'Julia', geburtsdatum: d(1993, 4, 16), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 3', haftraum: 'H-A-04', haftart: 'Strafhaft', strafende: d(2028, 2, 20), betreuenderBeamter: 'AVD-07' },
  { gefangenenNr: 'GEF-024', nachname: 'Schmitt', vorname: 'Kai', geburtsdatum: d(1987, 8, 8), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 3', haftraum: 'H-A-09', haftart: 'Strafhaft', strafende: d(2029, 1, 5), betreuenderBeamter: 'AVD-07' },
  { gefangenenNr: 'GEF-025', nachname: 'Werner', vorname: 'Toni', geburtsdatum: d(1991, 12, 12), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 3', haftraum: 'H-B-02', haftart: 'Strafhaft', strafende: d(2027, 4, 14), betreuenderBeamter: 'AVD-07' },
  { gefangenenNr: 'GEF-026', nachname: 'Mayer', vorname: 'Ines', geburtsdatum: d(1995, 1, 29), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 3', haftraum: 'H-B-11', haftart: 'Strafhaft', strafende: d(2028, 7, 30), betreuenderBeamter: 'AVD-07' },
  { gefangenenNr: 'GEF-027', nachname: 'Herrmann', vorname: 'Ben', geburtsdatum: d(1984, 5, 5), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 3', haftraum: 'H-C-01', haftart: 'Strafhaft', strafende: d(2026, 11, 22), betreuenderBeamter: 'AVD-07' },
  { gefangenenNr: 'GEF-028', nachname: 'Frank', vorname: 'Jörg', geburtsdatum: d(1980, 10, 19), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'D2-05', haftart: 'Strafhaft', strafende: d(2029, 6, 1), betreuenderBeamter: 'AVD-01' },
  { gefangenenNr: 'GEF-029', nachname: 'Berger', vorname: 'Ute', geburtsdatum: d(1992, 3, 3), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 2', haftraum: 'F4-18', haftart: 'Strafhaft', strafende: d(2027, 12, 12), betreuenderBeamter: 'AVD-04' },
  { gefangenenNr: 'GEF-030', nachname: 'König', vorname: 'Lars', geburtsdatum: d(1986, 6, 21), staatsangehoerigkeit: 'Deutsch', muttersprache: 'Deutsch', jva: 'JVA Billwerder', haus: 'Abteilung 1', haftraum: 'D2-12', haftart: 'Strafhaft', strafende: d(2028, 10, 8), betreuenderBeamter: 'AVD-01' },
]
