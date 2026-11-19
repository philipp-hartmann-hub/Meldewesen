// seed.js – HEUREKA 2.0 | A2 eMeldewesen
// Rollencodes: kanonisch lowercase (anstaltsleitung, val, stationsleitung, avd, ...)

import './src/env.js'
import { PrismaClient } from '@prisma/client'
import { BASIS_WEB_DUMMY_GEFANGENE } from './data/basisWebDummyGefangene.js'
import { berechneZeugenFolgeaktionen } from './src/services/zeugenFolgeaktionenService.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 A2-Seed-Daten werden geladen...')

  const SEED_BEDIENTSTE = [
    { id: 'AL-01',  name: 'Dr. Christine Möller', rolle: 'anstaltsleitung', jva: 'JVA Billwerder', abteilung: 'Leitung',      station: null },
    { id: 'AL-02',  name: 'Thomas Brandt',         rolle: 'anstaltsleitung', jva: 'JVA Billwerder', abteilung: 'Leitung',      station: null },
    { id: 'VAL-01', name: 'Sabine Werner',          rolle: 'val',             jva: 'JVA Billwerder', abteilung: 'Abteilung 1',  station: null },
    { id: 'VAL-02', name: 'Ralf Hoffmann',          rolle: 'val',             jva: 'JVA Billwerder', abteilung: 'Abteilung 2',  station: null },
    { id: 'VAL-03', name: 'Maria Kovacs',           rolle: 'val',             jva: 'JVA Billwerder', abteilung: 'Abteilung 3',  station: null },
    { id: 'DGL-01', name: 'Andrea Schmitz',         rolle: 'dienstgruppenleitung', jva: 'JVA Billwerder', abteilung: 'Leitung', station: null },
    { id: 'AK-01',  name: 'Stefan Lindemann',       rolle: 'arbeitskoordination', jva: 'JVA Billwerder', abteilung: 'Zentrale Meldewesen', station: null },
    { id: 'SL-01',  name: 'Pedro Guerrero',   rolle: 'stationsleitung', jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A1' },
    { id: 'SL-02',  name: 'Katrin Hofer',     rolle: 'stationsleitung', jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A2' },
    { id: 'SL-03',  name: 'Frank Bauer',      rolle: 'stationsleitung', jva: 'JVA Billwerder', abteilung: 'Abteilung 2', station: 'B1' },
    { id: 'AVD-01', name: 'Yasmin Özdemir',   rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A1' },
    { id: 'AVD-02', name: 'Tobias Klein',     rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A1' },
    { id: 'AVD-03', name: 'Sandra Meier',     rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 1', station: 'A2' },
    { id: 'AVD-04', name: 'Kevin Schulz',     rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 2', station: 'B1' },
    { id: 'AVD-05', name: 'Nina Bergmann',    rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 2', station: 'B2' },
    { id: 'AVD-06', name: 'Marcus Petric',    rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Aufnahme',    station: 'Aufnahme' },
    { id: 'AVD-07', name: 'Jana Fischer',     rolle: 'avd',             jva: 'JVA Billwerder', abteilung: 'Abteilung 3', station: 'C1' },
    { id: 'SD-01',  name: 'Dr. Lena Richter',      rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Psychologischer Dienst', station: null },
    { id: 'SD-02',  name: 'Klaus Weber',           rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Sozialdienst',           station: null },
    { id: 'SD-03',  name: 'Dr. Ahmad Karimi',      rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Medizinischer Dienst',   station: null },
    { id: 'SD-04',  name: 'Pfarrerin E. Krause',   rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Seelsorge',              station: null },
    { id: 'SD-05',  name: 'Gunnar Svensson',       rolle: 'sonderdienst', jva: 'JVA Billwerder', abteilung: 'Werkdienst',             station: null },
  ]

  const bedienstete = await Promise.all(
    SEED_BEDIENTSTE.map(b =>
      prisma.bedienstete.upsert({
        where: { bediensteterID: b.id },
        update: {
          bediensteterName: b.name,
          bediensteterRolle: b.rolle,
          bediensteterJVA: b.jva,
          haus: b.abteilung,
          station: b.station,
        },
        create: {
          bediensteterID: b.id,
          bediensteterName: b.name,
          bediensteterRolle: b.rolle,
          bediensteterJVA: b.jva,
          haus: b.abteilung,
          station: b.station,
        },
      })
    )
  )

  const gefangene = await Promise.all(
    BASIS_WEB_DUMMY_GEFANGENE.map(row =>
      prisma.gefangene.upsert({
        where: { gefangenenNr: row.gefangenenNr },
        update: {},
        create: row,
      })
    )
  )

  const gefMap = Object.fromEntries(gefangene.map(g => [g.gefangenenNr, g]))
  const bdMap  = Object.fromEntries(bedienstete.map(b => [b.bediensteterID, b]))

  const meldungenData = [
    { meldungsNr: 'MEL-018', meldungsTyp: 'STRAFANZEIGE', status: 'SUBMITTED',
      sachverhalt: 'Körperverletzung im Haftraum B2-14',
      ervRelevant: true, prioritaet: 1,
      empfaenger: 'Staatsanwaltschaft Hamburg', empfaengerTyp: 'STAATSANWALTSCHAFT',
      gefangeneId: gefMap['GEF-021'].id, zustaendigId: bdMap['VAL-01'].id,
      metadaten: {
        strafanzeigeUntertyp: 'aov',
        tatvorwurf: 'koerperverletzung',
        tatzeit: '2026-04-22T14:30:00',
        tatort: 'Haftraum B2-14',
        beweismittelGesichert: 'nein',
        zeugen: [
          {
            id: 'z-mel018-1',
            zeugenTyp: 'bediensteter',
            name: 'Pedro Guerrero',
            aussage: 'Ich habe am 22.04.2026 gegen 14:30 Uhr einen handgreiflichen Angriff im Haftraum B2-14 beobachtet.',
          },
          {
            id: 'z-mel018-2',
            zeugenTyp: 'inhaftierter',
            name: 'Müller, Hans',
            gefangenenNr: 'GEF-001',
            benachrichtigungJva: 'JVA Billwerder',
            benachrichtigungHaus: 'Abteilung 1',
          },
        ],
      } },
    { meldungsNr: 'MEL-017', meldungsTyp: 'VORFALL_INTERN', status: 'SUBMITTED',
      sachverhalt: 'Disziplinarverstoß: unerlaubter Besitz Mobiltelefon',
      ervRelevant: false, prioritaet: 0, empfaengerTyp: 'INTERN_ABTEILUNG',
      gefangeneId: gefMap['GEF-001'].id, zustaendigId: bdMap['AVD-01'].id,
      metadaten: {
        zugewiesenAn: 'VAL-01',
        tatzeit: '2026-04-01T08:00:00',
        tatort: 'Zelle A2-11',
        fundort: 'Zelle A2-11',
        beweismittelGesichert: 'ja',
        beweismittelAngaben: 'Mobiltelefon sichergestellt und fotografiert',
      } },
    { meldungsNr: 'MEL-016', meldungsTyp: 'MELDUNG_GERICHT', status: 'FORWARDED',
      sachverhalt: 'Vollstreckungsplanmeldung: Strafende 30.06.2027',
      ervRelevant: true, prioritaet: 0,
      empfaenger: 'Amtsgericht Hamburg-Bergedorf', empfaengerTyp: 'GERICHT',
      gefangeneId: gefMap['GEF-001'].id, zustaendigId: bdMap['VAL-01'].id,
      metadaten: {
        aktenzeichen: 'AZ-2024-5512',
        tatzeit: '2026-03-28T10:00:00',
        tatort: 'JVA Billwerder',
        beweismittelGesichert: 'nein',
      } },
    { meldungsNr: 'MEL-015', meldungsTyp: 'STRAFANZEIGE', status: 'SUBMITTED',
      sachverhalt: 'Diebstahl in der Anstaltsküche',
      ervRelevant: true, prioritaet: 0,
      empfaenger: 'Staatsanwaltschaft Hamburg', empfaengerTyp: 'STAATSANWALTSCHAFT',
      gefangeneId: gefMap['GEF-017'].id, zustaendigId: bdMap['AVD-04'].id,
      metadaten: {
        strafanzeigeUntertyp: 'diebstahl',
        tatvorwurf: 'diebstahl',
        tatzeit: '2026-03-10T09:00:00',
        tatort: 'Anstaltsküche',
        beweismittelGesichert: 'nein',
      } },
    { meldungsNr: 'MEL-014', meldungsTyp: 'VORFALL_INTERN', status: 'DRAFT',
      sachverhalt: 'Auseinandersetzung zwischen zwei Gefangenen im Hof',
      ervRelevant: false, prioritaet: 0, empfaengerTyp: 'INTERN_LEITUNG',
      gefangeneId: gefMap['GEF-021'].id, zustaendigId: bdMap['AVD-01'].id,
      metadaten: {
        tatzeit: '2026-05-10T16:00:00',
        tatort: 'Hof JVA Billwerder',
        beweismittelGesichert: 'nein',
      } },
    { meldungsNr: 'MEL-013', meldungsTyp: 'VORFALL_INTERN', status: 'SUBMITTED',
      sachverhalt: 'Beobachtung: Schlägerei im Hof – eigene Intervention und Deeskalation',
      ervRelevant: false, prioritaet: 1, empfaengerTyp: 'INTERN_ABTEILUNG',
      gefangeneId: gefMap['GEF-021'].id, zustaendigId: bdMap['AVD-02'].id,
      metadaten: {
        tatzeit: '2026-05-10T16:05:00',
        tatort: 'Hof JVA Billwerder',
        beweismittelGesichert: 'nein',
        erfassungFokus: 'tun_beobachtung',
      } },
    { meldungsNr: 'MEL-012', meldungsTyp: 'VORFALL_INTERN', status: 'SUBMITTED',
      sachverhalt: 'Beobachtung: Schlägerei im Hof – zweiter aVD, Sicht aus anderem Winkel',
      ervRelevant: false, prioritaet: 1, empfaengerTyp: 'INTERN_ABTEILUNG',
      gefangeneId: gefMap['GEF-017'].id, zustaendigId: bdMap['AVD-04'].id,
      metadaten: {
        tatzeit: '2026-05-10T16:05:00',
        tatort: 'Hof JVA Billwerder',
        beweismittelGesichert: 'nein',
        erfassungFokus: 'tun_beobachtung',
      } },
    { meldungsNr: 'MEL-020', meldungsTyp: 'STRAFANZEIGE', status: 'SUBMITTED',
      sachverhalt: 'Körperverletzung Haftraum B2-14 – Perspektive aVD Yasmin Özdemir',
      ervRelevant: true, prioritaet: 1,
      empfaenger: 'Staatsanwaltschaft Hamburg', empfaengerTyp: 'STAATSANWALTSCHAFT',
      gefangeneId: gefMap['GEF-021'].id, zustaendigId: bdMap['AVD-01'].id,
      metadaten: {
        strafanzeigeUntertyp: 'aov',
        tatvorwurf: 'koerperverletzung',
        tatzeit: '2026-04-22T14:32:00',
        tatort: 'Haftraum B2-14',
        beweismittelGesichert: 'nein',
        erfassungFokus: 'tun_beobachtung',
      } },
    { meldungsNr: 'MEL-019', meldungsTyp: 'STRAFANZEIGE', status: 'SUBMITTED',
      sachverhalt: 'Körperverletzung Haftraum B2-14 – Perspektive aVD Tobias Klein',
      ervRelevant: true, prioritaet: 1,
      empfaenger: 'Staatsanwaltschaft Hamburg', empfaengerTyp: 'STAATSANWALTSCHAFT',
      gefangeneId: gefMap['GEF-021'].id, zustaendigId: bdMap['AVD-02'].id,
      metadaten: {
        strafanzeigeUntertyp: 'aov',
        tatvorwurf: 'koerperverletzung',
        tatzeit: '2026-04-22T14:32:00',
        tatort: 'Haftraum B2-14',
        beweismittelGesichert: 'nein',
        erfassungFokus: 'tun_beobachtung',
      } },
  ]

  for (const d of meldungenData) {
    await prisma.meldung.upsert({
      where: { meldungsNr: d.meldungsNr },
      update: { metadaten: d.metadaten, sachverhalt: d.sachverhalt, status: d.status },
      create: d,
    })
  }

  const mel018 = await prisma.meldung.findUnique({ where: { meldungsNr: 'MEL-018' } })
  if (mel018?.status === 'SUBMITTED' && mel018.meldungsTyp === 'STRAFANZEIGE') {
    const meta = await berechneZeugenFolgeaktionen(prisma, {
      meldungsTyp: mel018.meldungsTyp,
      metadaten: mel018.metadaten,
      gefangeneId: mel018.gefangeneId,
    })
    await prisma.meldung.update({ where: { meldungsNr: 'MEL-018' }, data: { metadaten: meta } })
  }

  const faelleDemo = await seedDemoFaelle(prisma, bdMap)

  console.log(`✅ Seed:
  Bedienstete: ${bedienstete.length} (20 Demo-Nutzer, JVA Billwerder)
  Gefangene:   ${gefangene.length} (BASIS-Web-Dummy, ${BASIS_WEB_DUMMY_GEFANGENE.length} Stammdatensätze)
  Meldungen:   ${meldungenData.length}
  Demo-Fälle:  ${faelleDemo.length}

  📦 Demo-Klickpfad Fall-Bündelung (neuer Prozess):
  • AK-01:  MEL-018 ungebunden → Fall bündeln → DGL
  • DGL-01: FALL-001 (ZUR_SL) → „Qualität ok – an Stationsleitung“
  • SL-01:  FALL-001 → Fallmeldung an AL/VAL
  • AL-01:  FALL-002 (ZUR_AL) → Meldepflicht entscheiden → ERV am Fall
  • Parallele aVD-Perspektiven: MEL-012 + MEL-013 (FALL-001) · MEL-019 + MEL-020 (FALL-002)`)
}

/** Demo-Fälle für den neuen Fall-Pfad (DGL → SL → AL/VAL → ERV am Fall). */
async function seedDemoFaelle(prisma, bdMap) {
  const ak = bdMap['AK-01']
  const jva = 'JVA Billwerder'

  const fallDefaults = {
    meldepflichtig: null,
    alEntscheidKommentar: null,
    alEntscheidAm: null,
    entscheidVonRolle: null,
    entscheidVonId: null,
    egpaVeraktetVonId: null,
    rueckgabeGrund: null,
    versandfaehigAm: null,
    bepoVersendetAm: null,
    bepoNachrichtenId: null,
    egpaVeraktetAm: null,
    egpaAktenzeichen: null,
    abgeschlossenAm: null,
  }

  async function verknuepfeMeldungen(fallId, meldungsNrs, { status = 'FORWARDED', ervRelevant } = {}) {
    const meldungen = await prisma.meldung.findMany({
      where: { meldungsNr: { in: meldungsNrs } },
    })
    for (const m of meldungen) {
      await prisma.meldung.update({
        where: { id: m.id },
        data: {
          fallId,
          status,
          ...(typeof ervRelevant === 'boolean' ? { ervRelevant } : {}),
        },
      })
    }
    return meldungen
  }

  const fall001 = await prisma.meldungsFall.upsert({
    where: { fallNr: 'FALL-001' },
    update: {
      ...fallDefaults,
      status: 'ZUR_SL',
      bezeichnung: 'Hof JVA Billwerder – Schlägerei (parallele aVD-Perspektiven)',
      jva,
      erstelltVonId: ak?.id ?? null,
    },
    create: {
      fallNr: 'FALL-001',
      status: 'ZUR_SL',
      bezeichnung: 'Hof JVA Billwerder – Schlägerei (parallele aVD-Perspektiven)',
      jva,
      erstelltVonId: ak?.id ?? null,
    },
  })

  await verknuepfeMeldungen(fall001.id, ['MEL-012', 'MEL-013'], { ervRelevant: false })

  const fall002 = await prisma.meldungsFall.upsert({
    where: { fallNr: 'FALL-002' },
    update: {
      ...fallDefaults,
      status: 'ZUR_AL',
      bezeichnung: 'Haftraum B2-14 – Körperverletzung (zwei aVD-Meldungen)',
      jva,
      erstelltVonId: ak?.id ?? null,
    },
    create: {
      fallNr: 'FALL-002',
      status: 'ZUR_AL',
      bezeichnung: 'Haftraum B2-14 – Körperverletzung (zwei aVD-Meldungen)',
      jva,
      erstelltVonId: ak?.id ?? null,
    },
  })

  await verknuepfeMeldungen(fall002.id, ['MEL-019', 'MEL-020'], { ervRelevant: false })

  return [fall001, fall002]
}

main()
  .catch(e => { console.error('❌ Seed-Fehler:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
