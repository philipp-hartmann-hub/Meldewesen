// mockAuth.js – HEUREKA 2.0 | A2
import { istVAL, istSonderdienst } from '../utils/rollen.js'
// Kanonische Rollencodes: lowercase, keine Aliase
// Neue Rolle: GUELTIGE_ROLLEN + BERECHTIGUNGEN_MAP + RollenContext.jsx + schema.prisma + PrototypBanner.jsx

const GUELTIGE_ROLLEN = new Set([
  'anstaltsleitung', 'val', 'dienstgruppenleitung', 'stationsleitung', 'avd', 'sonderdienst',
  'kammer', 'zahlstelle', 'arbeitskoordination', 'admin',
  // Fachdienste (zurückgestellt): 'sozialdienst', 'medizin', 'pforte', 'werkdienst', 'psychologie',
])

const B = {
  anstaltsleitung: { siehtGesamteAnstalt:true,  siehtEigeneAbteilung:true,  siehtAlleJVAs:false, darfWeiterleiten:true,  darfVerakten:true,  darfXJustizSenden:true,  darfMeldungAbschliessen:true  },
  val:             { siehtGesamteAnstalt:false, siehtEigeneAbteilung:true,  siehtAlleJVAs:false, darfWeiterleiten:true,  darfVerakten:true,  darfXJustizSenden:true,  darfMeldungAbschliessen:true  },
  dienstgruppenleitung: { siehtGesamteAnstalt:true, siehtEigeneAbteilung:false, siehtAlleJVAs:false, darfWeiterleiten:true, darfVerakten:false, darfXJustizSenden:false, darfMeldungAbschliessen:false },
  stationsleitung: { siehtGesamteAnstalt:false, siehtEigeneAbteilung:false, siehtAlleJVAs:false, darfWeiterleiten:true,  darfVerakten:false, darfXJustizSenden:false, darfMeldungAbschliessen:false },
  avd:             { siehtGesamteAnstalt:false, siehtEigeneAbteilung:false, siehtAlleJVAs:false, darfWeiterleiten:true,  darfVerakten:false, darfXJustizSenden:false, darfMeldungAbschliessen:false },
  sonderdienst:    { siehtGesamteAnstalt:true,  siehtEigeneAbteilung:true,  siehtAlleJVAs:false, darfWeiterleiten:false, darfVerakten:false, darfXJustizSenden:false, darfMeldungAbschliessen:false },
  kammer:          { siehtGesamteAnstalt:false, siehtEigeneAbteilung:false, siehtAlleJVAs:false, darfWeiterleiten:true,  darfVerakten:false, darfXJustizSenden:false, darfMeldungAbschliessen:false },
  zahlstelle:      { siehtGesamteAnstalt:false, siehtEigeneAbteilung:false, siehtAlleJVAs:false, darfWeiterleiten:true,  darfVerakten:false, darfXJustizSenden:false, darfMeldungAbschliessen:false },
  arbeitskoordination: { siehtGesamteAnstalt:false, siehtEigeneAbteilung:false, siehtAlleJVAs:false, darfWeiterleiten:true,  darfVerakten:false, darfXJustizSenden:false, darfMeldungAbschliessen:false },
  admin:           { siehtGesamteAnstalt:true,  siehtEigeneAbteilung:true,  siehtAlleJVAs:true,  darfWeiterleiten:true,  darfVerakten:true,  darfXJustizSenden:true,  darfMeldungAbschliessen:true  },
}

export function mockAuth(req, res, next) {
  const rolle     = (req.headers['x-mock-rolle']    || 'avd').toLowerCase().trim()
  const nutzerId  = req.headers['x-mock-nutzer-id'] || 'AVD-01'
  const jva       = req.headers['x-mock-jva']       || 'JVA Billwerder'
  const abteilung = req.headers['x-mock-abteilung'] || 'Abteilung 1'
  const station   = req.headers['x-mock-station']   || ''

  if (!GUELTIGE_ROLLEN.has(rolle))
    return res.status(400).json({ error: `Ungültige Rolle: "${rolle}". Gültig: ${[...GUELTIGE_ROLLEN].join(', ')}` })

  const berecht = B[rolle] || B.avd
  const sonderdienst = istSonderdienst(rolle)
  const istAL = rolle === 'anstaltsleitung'
  const istValRolle = istVAL(rolle)
  req.mockNutzer = {
    rolle, nutzerId, jva, abteilung, station,
    kannMeldungErstellen:  !sonderdienst && rolle !== 'dienstgruppenleitung',
    kannMeldungBearbeiten: true,
    istAL,
    istVAL:   istValRolle,
    istDienstgruppenleitung: rolle === 'dienstgruppenleitung',
    istArbeitskoordination:  rolle === 'arbeitskoordination',
    istStationsleitung: rolle === 'stationsleitung',
    istSonderdienst: sonderdienst,
    istAdmin: rolle === 'admin',
    ...berecht,
    darfVerakten:      istValRolle || istAL || rolle === 'admin',
    darfXJustizSenden: istValRolle || istAL || rolle === 'admin',
  }
  next()
}
