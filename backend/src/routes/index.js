// routes/index.js – HEUREKA 2.0 | A2 eMeldewesen
import { Router } from 'express'
import { erstelleMeldungPdf } from '../services/pdfService.js'
import { validateZuweisungsZiel } from '../services/zuweisungService.js'
import { prisma } from '../prisma.js'
import { normalisiereRolle, istVAL } from '../utils/rollen.js'
import {
  berechneZeugenFolgeaktionen,
  folgeaktionenKommentar,
} from '../services/zeugenFolgeaktionenService.js'
import { alleZeugenaussagenVollstaendig } from '../services/zeugenVollstaendigkeitService.js'
import {
  validiereMeldungEinreichung,
  aufloesenEmpfaengerStrafanzeige,
} from '../utils/meldungPflichtfelder.js'
import {
  getGefangeneById,
  listGefangene,
  validiereGefangeneId,
} from '../services/gefangeneService.js'
import {
  getBediensteteById,
  listBedienstete,
  listVerfuegbareStationen,
} from '../services/bediensteteService.js'
import {
  benachrichtigeNeueAufgabe,
  benachrichtigeZuweisung,
} from '../services/benachrichtigungService.js'
import {
  AUFGABEN_TYPEN,
  BEWEISMITTEL_ZEUGE_ID,
  benachrichtigeNaechstenProzessschritt,
  naechsterProzessschritt,
  encodeAufgabeId,
} from '../services/arbeitskorbService.js'
import {
  enrichMeldungenMitZuweisungNamen,
  getAktuellerEmpfaengerId,
  setMeldungZuweisung,
} from '../services/zuweisungMetaService.js'
import { compareMeldungstypByLabel } from '../utils/meldungstypLabels.js'
import { compareMeldungsStatusByLabel } from '../utils/meldungsStatusLabels.js'
import {
  meldungWirdAmFallBearbeitet,
  pruefeStatusUebergang,
} from '../utils/meldungStatusUebergaenge.js'
import { istDringendOderUeberfaellig } from '../utils/meldungenSla.js'
import { registerMeldungAnhaengeRoutes } from './meldungAnhaenge.js'
import { registerArbeitskorbRoutes } from './arbeitskorb.js'
import { registerDispositionRoutes } from './disposition.js'
import { registerBenachrichtigungenRoutes } from './benachrichtigungen.js'
import { registerFaelleRoutes } from './faelle.js'
import { resolveBeweismittelEmpfaenger } from '../services/arbeitskorbService.js'

const router = Router()

// ---- Healthcheck ----
router.get('/health', (req, res) =>
  res.json({ status: 'ok', projekt: 'HEUREKA 2.0 A2 eMeldewesen', version: '1.0.0' })
)

// ---- Meldungstypen ----
router.get('/meldungstypen', (req, res) => res.json({ data: [
  { id: 'STRAFANZEIGE',      label: 'Strafanzeige',            aktiv: true,  ervRelevant: true  },
  { id: 'VORFALL_INTERN',    label: 'Interner Vorfall',         aktiv: true,  ervRelevant: false },
  { id: 'MELDUNG_GERICHT',   label: 'Meldung an Gericht',      aktiv: true,  ervRelevant: true  },
  { id: 'VORFALL_EXTERN',    label: 'Externe Behördenmeldung',  aktiv: false, ervRelevant: true  },
  { id: 'STATISTIK_MELDUNG', label: 'Statistikmeldung',         aktiv: false, ervRelevant: false },
  { id: 'SONSTIGE',          label: 'Sonstige Meldung',         aktiv: false, ervRelevant: false },
]}))

// ---- Rollen-Info (für Debugging) ----
router.get('/rollen', (req, res) => res.json({
  aktuelleRolle: req.mockNutzer.rolle,
  rawRolle:      req.mockNutzer.rawRolle,
  berechtigungen: {
    darfVerakten:       req.mockNutzer.darfVerakten,
    darfXJustizSenden:  req.mockNutzer.darfXJustizSenden,
    siehtAlleJVAs:      req.mockNutzer.siehtAlleJVAs,
  }
}))

// ---- Gefangene (Stammdaten aus PostgreSQL, BASIS-Web-Ersatz) ----
router.get('/gefangene', async (req, res, next) => {
  try {
    const { search, list, limit, jva, haus } = req.query
    const q = String(search || '').trim()
    // list=1 oder leere Suche: erste Datensätze der sichtbaren JVA (Autocomplete beim Fokus)
    const searchArg = list === '1' || list === 'true' || !q ? undefined : q
    const take = list === '1' || list === 'true' ? (limit || 30) : (limit || 50)
    const gefangene = await listGefangene(prisma, req.mockNutzer, {
      search: searchArg,
      take,
      jva: jva ? String(jva).trim() : undefined,
      haus: haus ? String(haus).trim() : undefined,
    })
    res.json({
      data: gefangene,
      total: gefangene.length,
      quelle: 'postgresql',
    })
  } catch (err) { next(err) }
})

router.get('/gefangene/:id', async (req, res, next) => {
  try {
    const g = await getGefangeneById(prisma, req.mockNutzer, req.params.id)
    if (!g) {
      return res.status(404).json({
        error: 'Gefangene/r nicht gefunden',
        message: 'Gefangene/r nicht gefunden oder nicht für Ihre JVA sichtbar.',
      })
    }
    res.json({ data: g, quelle: 'postgresql' })
  } catch (err) { next(err) }
})

// ---- Bedienstete (Stammdaten aus PostgreSQL, AD-Ersatz) ----
router.get('/bedienstete', async (req, res, next) => {
  try {
    const { search, list, limit, haus, station, rolle } = req.query
    const q = String(search || '').trim()
    const searchArg = list === '1' || list === 'true' || !q ? undefined : q
    const take = list === '1' || list === 'true' ? (limit || 30) : (limit || 50)
    const bedienstete = await listBedienstete(prisma, req.mockNutzer, {
      search: searchArg,
      haus,
      station,
      rolle,
      take,
    })
    res.json({
      data: bedienstete,
      total: bedienstete.length,
      quelle: 'postgresql',
    })
  } catch (err) { next(err) }
})

router.get('/bedienstete/stationen/liste', async (req, res, next) => {
  try {
    const stationen = await listVerfuegbareStationen(prisma, req.mockNutzer)
    res.json({ data: stationen })
  } catch (err) { next(err) }
})

router.get('/bedienstete/:id', async (req, res, next) => {
  try {
    const b = await getBediensteteById(prisma, req.mockNutzer, req.params.id)
    if (!b) {
      return res.status(404).json({
        error: 'Bedienstete/r nicht gefunden',
        message: 'Bedienstete/r nicht gefunden oder nicht für Ihre JVA sichtbar.',
      })
    }
    res.json({ data: b, quelle: 'postgresql' })
  } catch (err) { next(err) }
})

const MELDUNGEN_SORT_FIELDS = new Set(['meldungsNr', 'meldungsTyp', 'status', 'erstelltAm', 'gefangene'])

function buildMeldungenOrderBy(sortBy, sortDir) {
  const dir = sortDir === 'asc' ? 'asc' : 'desc'
  if (!sortBy || !MELDUNGEN_SORT_FIELDS.has(sortBy)) {
    return [{ prioritaet: 'desc' }, { erstelltAm: 'desc' }]
  }
  if (sortBy === 'gefangene') {
    return [{ gefangene: { nachname: dir } }]
  }
  if (sortBy === 'meldungsTyp' || sortBy === 'status') {
    return null
  }
  return [{ [sortBy]: dir }]
}

function sortMeldungenInMemory(items, sortBy, sortDir) {
  const dir = sortDir === 'asc' ? 1 : -1
  if (!sortBy || !MELDUNGEN_SORT_FIELDS.has(sortBy)) {
    items.sort((a, b) => {
      const pd = (b.prioritaet ?? 0) - (a.prioritaet ?? 0)
      if (pd !== 0) return pd
      return new Date(b.erstelltAm) - new Date(a.erstelltAm)
    })
    return
  }
  if (sortBy === 'meldungsTyp') {
    items.sort((a, b) => compareMeldungstypByLabel(a.meldungsTyp, b.meldungsTyp, sortDir))
    return
  }
  if (sortBy === 'status') {
    items.sort((a, b) => compareMeldungsStatusByLabel(a.status, b.status, sortDir))
    return
  }
  if (sortBy === 'ueberfaellig') {
    items.sort((a, b) => {
      const ua = istDringendOderUeberfaellig(a) ? 1 : 0
      const ub = istDringendOderUeberfaellig(b) ? 1 : 0
      if (ub !== ua) return ub - ua
      return new Date(b.erstelltAm) - new Date(a.erstelltAm)
    })
    return
  }
  if (sortBy === 'gefangene') {
    items.sort((a, b) =>
      dir * (a.gefangene?.nachname || '').localeCompare(b.gefangene?.nachname || '', 'de')
    )
    return
  }
  items.sort((a, b) => {
    if (sortBy === 'erstelltAm') return dir * (new Date(a.erstelltAm) - new Date(b.erstelltAm))
    return dir * String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? ''), 'de')
  })
}

// ---- Meldungen ----
function getZugewiesenAn(meldung) {
  const meta = meldung.metadaten
  if (meta && typeof meta === 'object' && meta.zugewiesenAn) {
    return String(meta.zugewiesenAn)
  }
  return null
}

function filterSichtbereich(meldungen, sichtbereich, nutzerId) {
  if (!sichtbereich) return meldungen
  // "offen": alle SUBMITTED/IN_PROGRESS im JVA-Sichtbereich (where-Filter reicht)
  if (sichtbereich === 'offen') return meldungen
  // "unvergeben": SUBMITTED, noch niemandem zugewiesen (Gruppenaufgaben)
  if (sichtbereich === 'unvergeben') {
    return meldungen.filter(m =>
      m.status === 'SUBMITTED' && !getZugewiesenAn(m),
    )
  }
  // "gruppe": SUBMITTED/IN_PROGRESS, nicht dem aktuellen Nutzer zugewiesen
  if (sichtbereich === 'gruppe') {
    return meldungen.filter(m =>
      ['SUBMITTED', 'IN_PROGRESS'].includes(m.status)
      && getZugewiesenAn(m) !== nutzerId,
    )
  }
  if (sichtbereich === 'meine') {
    return meldungen.filter(m => getZugewiesenAn(m) === nutzerId)
  }
  if (sichtbereich === 'erledigt') {
    return meldungen.filter(m => m.status === 'ARCHIVED')
  }
  return meldungen
}

router.get('/meldungen', async (req, res, next) => {
  try {
    const {
      status,
      meldungsTyp,
      search,
      sichtbereich,
      page = 1,
      limit = 20,
      sortBy,
      sortDir,
      ervRelevant,
      ervOffen,
      dringend,
      gefangeneId,
    } = req.query
    const { jva, siehtAlleJVAs, nutzerId } = req.mockNutzer
    const GUELTIGE_SICHTBEREICHE = ['offen', 'unvergeben', 'gruppe', 'meine', 'erledigt']
    const gueltigerSichtbereich = GUELTIGE_SICHTBEREICHE.includes(sichtbereich)

    let where = {}
    if (!siehtAlleJVAs) where.gefangene = { jva }
    const filterErvOffen = ervOffen === 'true' || ervOffen === '1' || ervRelevant === 'offen'
    if (gueltigerSichtbereich) {
      if (sichtbereich === 'erledigt') {
        where.status = 'ARCHIVED'
      } else if (sichtbereich === 'unvergeben') {
        where.status = 'SUBMITTED'
      } else if (sichtbereich === 'offen' || sichtbereich === 'gruppe') {
        where.status = { in: ['SUBMITTED', 'IN_PROGRESS'] }
      }
      if (filterErvOffen) where.ervRelevant = true
    } else if (filterErvOffen) {
      where.ervRelevant = true
      where.status = status || { notIn: ['ARCHIVED', 'DRAFT'] }
    } else {
      if (status) where.status = status
      if (ervRelevant === 'true' || ervRelevant === '1') where.ervRelevant = true
      else if (ervRelevant === 'false' || ervRelevant === '0') where.ervRelevant = false
    }
    if (meldungsTyp) where.meldungsTyp = meldungsTyp
    if (gefangeneId && String(gefangeneId).trim()) {
      where.gefangeneId = String(gefangeneId).trim()
    }
    if (search) where.OR = [
      { meldungsNr:  { contains: search, mode: 'insensitive' } },
      { sachverhalt: { contains: search, mode: 'insensitive' } },
      { gefangene:   { OR: [
        { nachname:     { contains: search, mode: 'insensitive' } },
        { gefangenenNr: { contains: search, mode: 'insensitive' } },
      ]}},
    ]

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)
    const include = {
      gefangene: true,
      zustaendig: true,
      fall: { select: { id: true, fallNr: true, status: true, bezeichnung: true } },
    }
    const filterDringend = dringend === 'true' || dringend === '1'
    const needsInMemory =
      gueltigerSichtbereich ||
      filterDringend ||
      sortBy === 'ueberfaellig' ||
      ((sortBy === 'meldungsTyp' || sortBy === 'status') && MELDUNGEN_SORT_FIELDS.has(sortBy))

    if (needsInMemory) {
      let all = await prisma.meldung.findMany({ where, include })
      if (gueltigerSichtbereich) all = filterSichtbereich(all, sichtbereich, nutzerId)
      if (filterDringend) all = all.filter(istDringendOderUeberfaellig)
      sortMeldungenInMemory(all, sortBy, sortDir)
      const enriched = await enrichMeldungenMitZuweisungNamen(prisma, all.slice(skip, skip + take))
      return res.json({
        data: enriched,
        total: all.length,
        page: Number(page),
        limit: take,
      })
    }

    const orderBy = buildMeldungenOrderBy(sortBy, sortDir)
    const [meldungen, total] = await Promise.all([
      prisma.meldung.findMany({
        where,
        include,
        orderBy,
        skip, take,
      }),
      prisma.meldung.count({ where }),
    ])
    const enriched = await enrichMeldungenMitZuweisungNamen(prisma, meldungen)
    res.json({ data: enriched, total, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get('/meldungen/:id', async (req, res, next) => {
  try {
    const meldung = await prisma.meldung.findUnique({
      where: { id: req.params.id },
      include: {
        gefangene: true,
        zustaendig: true,
        fall: {
          select: {
            id: true,
            fallNr: true,
            status: true,
            bezeichnung: true,
            meldepflichtig: true,
            versandfaehigAm: true,
            bepoVersendetAm: true,
            egpaVeraktetAm: true,
            abgeschlossenAm: true,
          },
        },
        statusVerlauf: { include: { bedienstete: true }, orderBy: { erstelltAm: 'asc' } },
        veraktungen: true,
        xJustizVersand: true,
        anhaenge: { orderBy: { erstelltAm: 'asc' } },
        notizen: { orderBy: { erstelltAm: 'asc' } },
      },
    })
    if (!meldung) return res.status(404).json({ error: 'Meldung nicht gefunden' })
    const [angereichert] = await enrichMeldungenMitZuweisungNamen(prisma, [meldung])
    res.json({ data: angereichert })
  } catch (err) { next(err) }
})

// ---- PDF-Export ----
router.get('/meldungen/:id/pdf', async (req, res, next) => {
  try {
    const meldung = await prisma.meldung.findUnique({
      where: { id: req.params.id },
      include: {
        gefangene: true,
        statusVerlauf: { orderBy: { erstelltAm: 'asc' } },
      },
    })
    if (!meldung) return res.status(404).json({ error: 'Meldung nicht gefunden' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="meldung-${meldung.meldungsNr || req.params.id}.pdf"`)
    erstelleMeldungPdf(meldung).pipe(res)
  } catch (err) { next(err) }
})

const ERV_TYPEN = new Set(['STRAFANZEIGE', 'MELDUNG_GERICHT', 'VORFALL_EXTERN'])

const JVA_KUERZEL = {
  'JVA Billwerder': 'BWD',
  'JVA Fuhlsbüttel': 'FUL',
  'JVA Hahnöfersand': 'HAN',
  'default': 'HH',
}

async function generiereAktenzeichen(prisma, jva, count) {
  const k = JVA_KUERZEL[jva] || JVA_KUERZEL.default
  const jahr = new Date().getFullYear()
  return `${k}/${jahr}/${String(count + 1).padStart(4, '0')}`
}

router.post('/meldungen', async (req, res, next) => {
  try {
    const { nutzerId } = req.mockNutzer
    const {
      gefangeneId, meldungsTyp, sachverhalt, metadaten, ervRelevant,
      empfaenger, empfaengerTyp, prioritaet, alsEntwurf,
    } = req.body
    const count = await prisma.meldung.count()
    const meldungsNr = `MEL-${String(count + 100).padStart(3, '0')}`
    const autoAktenzeichen = await generiereAktenzeichen(prisma, req.mockNutzer.jva, count)
    const status = alsEntwurf === false ? 'SUBMITTED' : 'DRAFT'
    const gefErr = await validiereGefangeneId(prisma, req.mockNutzer, gefangeneId)
    if (gefErr) {
      return res.status(400).json({ error: 'Gefangene/r', message: gefErr })
    }
    if (status === 'SUBMITTED') {
      const pflichtErr = validiereMeldungEinreichung({
        meldungsTyp, sachverhalt, gefangeneId, metadaten, empfaenger, empfaengerTyp,
      })
      if (pflichtErr) {
        return res.status(400).json({ error: 'Pflichtfelder', message: pflichtErr })
      }
    }
    const erv = ervRelevant ?? ERV_TYPEN.has(meldungsTyp)
    const bedienstete = await prisma.bedienstete.findUnique({ where: { bediensteterID: nutzerId } })

    let empfaengerFinal = empfaenger
    let empfaengerTypFinal = empfaengerTyp
    if (status === 'SUBMITTED' && meldungsTyp === 'STRAFANZEIGE') {
      const resolved = aufloesenEmpfaengerStrafanzeige(empfaenger, empfaengerTyp)
      empfaengerFinal = resolved.empfaenger
      empfaengerTypFinal = resolved.empfaengerTyp
    }

    let metaFinal = { ...(metadaten || {}), aktenzeichen: autoAktenzeichen }
    if (status === 'SUBMITTED' && meldungsTyp === 'STRAFANZEIGE') {
      metaFinal = {
        ...(await berechneZeugenFolgeaktionen(prisma, { meldungsTyp, metadaten, gefangeneId })),
        aktenzeichen: autoAktenzeichen,
      }
    }

    const meldung = await prisma.$transaction(async tx => {
      const created = await tx.meldung.create({
        data: {
          meldungsNr, gefangeneId, meldungsTyp, sachverhalt, metadaten: metaFinal,
          ervRelevant: erv, empfaenger: empfaengerFinal, empfaengerTyp: empfaengerTypFinal,
          prioritaet: prioritaet ? 1 : 0,
          status,
        },
        include: { gefangene: true },
      })
      const kommentarTeile = [status === 'SUBMITTED' ? 'Eingereicht' : 'Entwurf angelegt']
      const faKommentar = folgeaktionenKommentar(metaFinal)
      if (faKommentar) kommentarTeile.push(faKommentar)
      await tx.statusVerlauf.create({
        data: {
          meldungId: created.id,
          status,
          kommentar: kommentarTeile.join(' – '),
          bediensteteId: bedienstete?.id,
        },
      })
      return created
    })
    res.status(201).json({ data: meldung })
  } catch (err) { next(err) }
})

router.patch('/meldungen/:id', async (req, res, next) => {
  try {
    const existing = await prisma.meldung.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Meldung nicht gefunden', message: 'Meldung nicht gefunden' })
    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        error: 'Nur Entwürfe können bearbeitet werden.',
        message: 'Nur Entwürfe können bearbeitet werden.',
      })
    }
    if (req.body.gefangeneId !== undefined) {
      const gefErr = await validiereGefangeneId(prisma, req.mockNutzer, req.body.gefangeneId)
      if (gefErr) {
        return res.status(400).json({ error: 'Gefangene/r', message: gefErr })
      }
    }
    const {
      gefangeneId, meldungsTyp, sachverhalt, metadaten, ervRelevant,
      empfaenger, empfaengerTyp, prioritaet,
    } = req.body
    const meldung = await prisma.meldung.update({
      where: { id: req.params.id },
      data: {
        ...(gefangeneId !== undefined && { gefangeneId }),
        ...(meldungsTyp !== undefined && { meldungsTyp }),
        ...(sachverhalt !== undefined && { sachverhalt }),
        ...(metadaten !== undefined && { metadaten }),
        ...(ervRelevant !== undefined && { ervRelevant }),
        ...(empfaenger !== undefined && { empfaenger }),
        ...(empfaengerTyp !== undefined && { empfaengerTyp }),
        ...(prioritaet !== undefined && { prioritaet: prioritaet ? 1 : 0 }),
      },
      include: { gefangene: true },
    })
    res.json({ data: meldung })
  } catch (err) { next(err) }
})

router.patch('/meldungen/:id/status', async (req, res, next) => {
  try {
    const { nutzerId, rolle } = req.mockNutzer
    let { status, kommentar, rueckgabeErgaenzung } = req.body
    if (!status) {
      return res.status(400).json({
        error: 'Status fehlt',
        message: 'Bitte geben Sie einen Zielstatus an.',
      })
    }

    const existing = await prisma.meldung.findUnique({
      where: { id: req.params.id },
      include: { xJustizVersand: true, veraktungen: true, gefangene: true, fall: { select: { fallNr: true } } },
    })
    if (!existing) return res.status(404).json({ error: 'Meldung nicht gefunden', message: 'Meldung nicht gefunden' })

    const fallHinweis = meldungWirdAmFallBearbeitet(existing, status)
    if (fallHinweis) {
      return res.status(409).json({ error: fallHinweis, message: fallHinweis })
    }
    const uebergangHinweis = pruefeStatusUebergang(existing.status, status, rolle)
    if (uebergangHinweis) {
      return res.status(409).json({ error: uebergangHinweis, message: uebergangHinweis })
    }
    const schrittVorher = naechsterProzessschritt(existing)
    if (status === 'DRAFT' && rueckgabeErgaenzung !== undefined && !rueckgabeErgaenzung?.kommentar?.trim()) {
      return res.status(400).json({ error: 'Kommentar fehlt', message: 'Ein Kommentar ist für die Rückgabe erforderlich.' })
    }

    if (status === 'ARCHIVED' && existing.ervRelevant) {
      const hatBePo = existing.xJustizVersand?.some(
        v => ['VERSENDET', 'BESTAETIGT'].includes(v.status),
      )
      const hatEgpa = existing.veraktungen?.some(v => v.status === 'UEBERMITTELT')
      if (!hatBePo || !hatEgpa) {
        return res.status(409).json({
          error: 'Vor dem Abschluss: beBPo-Versand und eGPA-Veraktung erforderlich.',
          message: 'Vor dem Abschluss: beBPo-Versand und eGPA-Veraktung erforderlich.',
        })
      }
    }

    if (status === 'SUBMITTED' && existing.status === 'DRAFT') {
      const pflichtErr = validiereMeldungEinreichung({
        meldungsTyp: existing.meldungsTyp,
        sachverhalt: existing.sachverhalt,
        gefangeneId: existing.gefangeneId,
        metadaten: existing.metadaten,
        empfaenger: existing.empfaenger,
        empfaengerTyp: existing.empfaengerTyp,
      })
      if (pflichtErr) {
        return res.status(400).json({ error: 'Pflichtfelder', message: pflichtErr })
      }
    }

    if (status === 'IN_PROGRESS' && existing.meldungsTyp === 'STRAFANZEIGE') {
      if (!alleZeugenaussagenVollstaendig(existing.metadaten)) {
        return res.status(409).json({
          error: 'Zeugenaussagen unvollständig',
          message: 'Fachliche Prüfung erst möglich, wenn alle Zeugenaussagen eingeholt bzw. bestätigt wurden.',
        })
      }
    }

    let metaUpdate = existing.metadaten
    if (status === 'SUBMITTED' && existing.meldungsTyp === 'STRAFANZEIGE') {
      metaUpdate = await berechneZeugenFolgeaktionen(prisma, {
        meldungsTyp: existing.meldungsTyp,
        metadaten: existing.metadaten,
        gefangeneId: existing.gefangeneId,
      })
    }
    if (status === 'DRAFT' && rueckgabeErgaenzung) {
      const meta = metaUpdate && typeof metaUpdate === 'object' ? metaUpdate : {}
      const grund = rueckgabeErgaenzung.grund || 'sonstiges'
      const jetzt = new Date().toISOString()
      metaUpdate = {
        ...meta,
        rueckgabeErgaenzung: {
          grund,
          kommentar: (rueckgabeErgaenzung.kommentar || '').trim(),
          fristBis: rueckgabeErgaenzung.fristBis || null,
          zurueckgegebenVon: nutzerId,
          zurueckgegebenAm: jetzt,
        },
      }
      if (grund === 'beweismittel' || grund === 'beides') {
        const emp = await resolveBeweismittelEmpfaenger(prisma, {
          ...existing,
          metadaten: metaUpdate,
        })
        metaUpdate.beweismittelNachreichung = {
          status: 'OFFEN',
          fristBis: rueckgabeErgaenzung.fristBis || null,
          kommentar: (rueckgabeErgaenzung.kommentar || '').trim(),
          angefordertVon: nutzerId,
          angefordertAm: jetzt,
          erfassenderAn: emp.id || null,
          erfassenderAnName: emp.name || null,
          zugewiesenAn: emp.id || null,
          zugewiesenAnName: emp.name || null,
        }
      }
    }

    if (status === 'SUBMITTED' && existing.status === 'DRAFT') {
      const meta = metaUpdate && typeof metaUpdate === 'object' ? metaUpdate : {}
      if (meta.beweismittelNachreichung?.status === 'OFFEN') {
        const ergebnis = meta.beweismittelGesichert === 'ja' ? 'nachgereicht' : 'keine'
        const begruendungKeine = meta.beweismittelGesichert === 'nein'
          ? (meta.beweismittelKeineBegruendung || '').trim()
          : null
        metaUpdate = {
          ...meta,
          beweismittelNachreichung: {
            ...meta.beweismittelNachreichung,
            status: 'ERLEDIGT',
            ergebnis,
            begruendungKeine,
            erledigtAm: new Date().toISOString(),
            erledigtVon: nutzerId,
          },
          rueckgabeErgaenzung: undefined,
        }
        if (ergebnis === 'keine' && begruendungKeine) {
          const bed = await prisma.bedienstete.findUnique({ where: { bediensteterID: nutzerId } })
          const name = bed?.bediensteterName || nutzerId
          await prisma.notiz.create({
            data: {
              text: `Beweismittel-Nachreichung: Keine Beweismittel vorhanden (AVD ${name}). Begründung: ${begruendungKeine.replace(/<[^>]+>/g, '')}`,
              erstelltVon: nutzerId,
              meldungId: req.params.id,
            },
          })
        }
      }
      const aktuell = metaUpdate && typeof metaUpdate === 'object' ? metaUpdate : meta
      if (aktuell.rueckgabeDgl) {
        const verlauf = Array.isArray(aktuell.rueckgabeDglVerlauf) ? aktuell.rueckgabeDglVerlauf : []
        metaUpdate = {
          ...aktuell,
          rueckgabeDglVerlauf: [
            ...verlauf,
            { ...aktuell.rueckgabeDgl, erneutEingereichtAm: new Date().toISOString() },
          ],
        }
        delete metaUpdate.rueckgabeDgl
      }
    }

    const bedienstete = await prisma.bedienstete.findUnique({ where: { bediensteterID: nutzerId } })
    const GRUND_LABELS = { zeugen: 'Zeugen', beweismittel: 'Beweismittel', beides: 'Zeugen & Beweismittel', sonstiges: 'Sonstiges' }
    const kommentarTeile = rueckgabeErgaenzung
      ? [`Zur Ergänzungserfassung zurückgegeben: ${GRUND_LABELS[rueckgabeErgaenzung.grund] || rueckgabeErgaenzung.grund}`, rueckgabeErgaenzung.kommentar]
      : [kommentar || `Status: ${status}`]
    const faKommentar = folgeaktionenKommentar(metaUpdate)
    if (faKommentar) kommentarTeile.push(faKommentar)

    let empfaengerUpdate = {}
    if (status === 'SUBMITTED' && existing.meldungsTyp === 'STRAFANZEIGE') {
      empfaengerUpdate = aufloesenEmpfaengerStrafanzeige(existing.empfaenger, existing.empfaengerTyp)
    }

    const [meldung] = await prisma.$transaction([
      prisma.meldung.update({
        where: { id: req.params.id },
        data: {
          status,
          ...(metaUpdate !== existing.metadaten && { metadaten: metaUpdate }),
          ...empfaengerUpdate,
        },
      }),
      prisma.statusVerlauf.create({
        data: {
          meldungId: req.params.id,
          status,
          kommentar: kommentarTeile.filter(Boolean).join(' – '),
          bediensteteId: bedienstete?.id,
        },
      }),
    ])

    const schrittNachher = naechsterProzessschritt({
      ...existing,
      ...meldung,
      gefangene: existing.gefangene,
      xJustizVersand: existing.xJustizVersand,
      veraktungen: existing.veraktungen,
    })
    if (schrittNachher && schrittNachher !== schrittVorher && schrittNachher !== 'zeugen') {
      await benachrichtigeNaechstenProzessschritt(prisma, {
        ...existing,
        ...meldung,
        gefangene: existing.gefangene,
        xJustizVersand: existing.xJustizVersand,
        veraktungen: existing.veraktungen,
      })
    }

    const nachreichung = metaUpdate?.beweismittelNachreichung
    if (
      status === 'DRAFT'
      && rueckgabeErgaenzung
      && nachreichung?.status === 'OFFEN'
      && nachreichung.zugewiesenAn
    ) {
      const aufgabeId = encodeAufgabeId(
        req.params.id,
        AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
        BEWEISMITTEL_ZEUGE_ID,
      )
      await benachrichtigeNeueAufgabe(prisma, {
        empfaengerId: nachreichung.zugewiesenAn,
        meldung: { ...existing, meldungsNr: existing.meldungsNr },
        aufgabeId,
        titel: 'Beweismittel nachreichen',
      })
    }

    res.json({ data: meldung })
  } catch (err) { next(err) }
})

// ---- Meldung einem Nutzer zuweisen ("Übernehmen" / Disposition) ----
router.patch('/meldungen/:id/zuweisen', async (req, res, next) => {
  try {
    const { nutzerId, istVAL, istAL } = req.mockNutzer
    const body = req.body || {}
    const { zugewiesenAn: zielId, kommentar } = body
    const hatZielFeld = 'zugewiesenAn' in body

    const existing = await prisma.meldung.findUnique({
      where: { id: req.params.id },
      include: { gefangene: true },
    })
    if (!existing) {
      return res.status(404).json({ error: 'Meldung nicht gefunden', message: 'Meldung nicht gefunden' })
    }

    const meta = existing.metadaten && typeof existing.metadaten === 'object' ? existing.metadaten : {}
    const alterEmpfaengerId = getAktuellerEmpfaengerId(meta)
    const jetzt = new Date().toISOString()
    const bedienstete = await prisma.bedienstete.findUnique({ where: { bediensteterID: nutzerId } })

    let neuesMeta = meta
    let zuweisungText = ''
    let zielNutzerId = null
    let zielName = null

    if (!hatZielFeld) {
      zielNutzerId = nutzerId
      zielName = bedienstete?.bediensteterName || nutzerId
      neuesMeta = setMeldungZuweisung(meta, {
        zielId: zielNutzerId,
        zielName,
        vonId: nutzerId,
        vonName: zielName,
        jetzt,
      })
      zuweisungText = `Aufgabe übernommen von ${nutzerId}`
    } else if (zielId === null || zielId === '') {
      if (!istVAL && !istAL) {
        return res.status(403).json({
          error: 'Keine Berechtigung',
          message: 'Nur VAL/AL dürfen Aufgaben an die Gruppe zurückgeben.',
        })
      }
      neuesMeta = setMeldungZuweisung(meta, {
        zielId: null,
        vonId: nutzerId,
        vonName: bedienstete?.bediensteterName,
        jetzt,
        inGruppenpostfach: true,
      })
      zuweisungText = 'Aufgabe zurück an Gruppe gegeben'
    } else {
      if (!istVAL && !istAL) {
        return res.status(403).json({
          error: 'Keine Berechtigung',
          message: 'Nur VAL/AL dürfen Aufgaben an andere zuweisen.',
        })
      }
      const zielBedienstete = await validateZuweisungsZiel(prisma, req.mockNutzer, zielId)
      zielNutzerId = zielBedienstete.bediensteterID
      zielName = zielBedienstete.bediensteterName
      neuesMeta = setMeldungZuweisung(meta, {
        zielId: zielNutzerId,
        zielName,
        vonId: nutzerId,
        vonName: bedienstete?.bediensteterName,
        jetzt,
      })
      zuweisungText = `Zugewiesen an ${zielName} (${zielNutzerId})`
    }

    const meldung = await prisma.meldung.update({
      where: { id: req.params.id },
      data: {
        metadaten: neuesMeta,
        statusVerlauf: {
          create: {
            status: existing.status,
            kommentar: [zuweisungText, kommentar?.trim()].filter(Boolean).join(' – '),
            bediensteteId: bedienstete?.id || null,
          },
        },
      },
      include: { gefangene: true, statusVerlauf: true },
    })

    if (hatZielFeld) {
      await benachrichtigeZuweisung(prisma, {
        meldung: existing,
        zielId: zielNutzerId,
        zielName,
        alterEmpfaengerId,
        kommentar: kommentar?.trim(),
        vonNutzerId: nutzerId,
      })
    }

    const [angereichert] = await enrichMeldungenMitZuweisungNamen(prisma, [meldung])
    res.json({ data: angereichert })
  } catch (err) { next(err) }
})

// ---- Notizen ----
router.post('/meldungen/:id/notizen', async (req, res, next) => {
  try {
    const { nutzerId } = req.mockNutzer
    const { text } = req.body
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Text fehlt', message: 'Notiztext darf nicht leer sein.' })
    }
    const existing = await prisma.meldung.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Meldung nicht gefunden', message: 'Meldung nicht gefunden' })
    const notiz = await prisma.notiz.create({
      data: {
        text: String(text).trim(),
        erstelltVon: nutzerId,
        meldungId: req.params.id,
      },
    })
    res.status(201).json({ data: notiz })
  } catch (err) { next(err) }
})

// ---- eGPA-Veraktung ----
router.post('/meldungen/:id/verakten', async (req, res, next) => {
  try {
    const { nutzerId, rolle } = req.mockNutzer
    if (!istVAL(rolle) && rolle !== 'anstaltsleitung' && rolle !== 'admin') {
      return res.status(403).json({ error: 'Nur VAL oder AL darf verakten', message: 'Nur VAL oder AL darf verakten' })
    }
    const meldung = await prisma.meldung.findUnique({
      where: { id: req.params.id },
      include: { xJustizVersand: true, fall: true, gefangene: true },
    })
    if (!meldung) return res.status(404).json({ error: 'Meldung nicht gefunden', message: 'Meldung nicht gefunden' })
    const fallHinweisVeraktung = meldungWirdAmFallBearbeitet(meldung)
    if (fallHinweisVeraktung) {
      return res.status(409).json({ error: fallHinweisVeraktung, message: fallHinweisVeraktung })
    }

    const hatBePo = meldung.xJustizVersand?.some(
      v => ['VERSENDET', 'BESTAETIGT'].includes(v.status),
    )
    if (meldung.ervRelevant && !hatBePo) {
      return res.status(409).json({
        error: 'beBPo-Versand muss vor eGPA-Veraktung erfolgen.',
        message: 'beBPo-Versand muss vor eGPA-Veraktung erfolgen.',
      })
    }

    const bedienstete = await prisma.bedienstete.findUnique({ where: { bediensteterID: nutzerId } })
    const veraktung = await prisma.veraktung.create({
      data: {
        meldungId:       req.params.id,
        pdfPfad:         `/mock/pdfs/${req.params.id}.pdf`,
        egpaAktenzeichen:`EGPA-MEL-${Date.now()}`,
        status:          'UEBERMITTELT',
        ausgefuehrtVonId: bedienstete?.id,
      },
    })
    await benachrichtigeNaechstenProzessschritt(prisma, {
      ...meldung,
      veraktungen: [veraktung],
    })
    res.json({ data: veraktung })
  } catch (err) { next(err) }
})

// ---- xJustiz/beBPo-Versand ----
router.post('/meldungen/:id/xjustiz-versand', async (req, res, next) => {
  try {
    const { nutzerId, rolle } = req.mockNutzer
    if (!istVAL(rolle) && rolle !== 'anstaltsleitung' && rolle !== 'admin') {
      return res.status(403).json({ error: 'Nur VAL oder AL darf xJustiz-Nachrichten versenden', message: 'Nur VAL oder AL darf xJustiz-Nachrichten versenden' })
    }
    const meldung = await prisma.meldung.findUnique({
      where: { id: req.params.id },
      include: { fall: true, gefangene: true, veraktungen: true },
    })
    if (!meldung) return res.status(404).json({ error: 'Meldung nicht gefunden', message: 'Meldung nicht gefunden' })
    const fallHinweisVersand = meldungWirdAmFallBearbeitet(meldung)
    if (fallHinweisVersand) {
      return res.status(409).json({ error: fallHinweisVersand, message: fallHinweisVersand })
    }
    if (!meldung.ervRelevant) return res.status(400).json({ error: 'Meldung ist nicht ERV-relevant', message: 'Meldung ist nicht ERV-relevant' })
    const bedienstete = await prisma.bedienstete.findUnique({ where: { bediensteterID: nutzerId } })
    const versand = await prisma.xJustizVersand.create({
      data: {
        meldungId:        req.params.id,
        pdfPfad:          `/mock/pdfs/${req.params.id}.pdf`,
        xJustizXmlPfad:   `/mock/xjustiz/${req.params.id}.xml`,
        empfaenger:       meldung.empfaenger || 'Staatsanwaltschaft Hamburg',
        empfaengerTyp:    meldung.empfaengerTyp || 'STAATSANWALTSCHAFT',
        bepoNachrichtenId:`BEPO-${Date.now()}`,
        status:           'VERSENDET',
        versendetVonId:   bedienstete?.id,
      },
    })
    await benachrichtigeNaechstenProzessschritt(prisma, {
      ...meldung,
      xJustizVersand: [versand],
    })
    res.json({ data: versand })
  } catch (err) { next(err) }
})

router.get('/meldungen/:id/xjustiz-versand', async (req, res, next) => {
  try {
    const versand = await prisma.xJustizVersand.findMany({
      where: { meldungId: req.params.id }, orderBy: { erstelltAm: 'desc' }
    })
    res.json({ data: versand })
  } catch (err) { next(err) }
})

registerMeldungAnhaengeRoutes(router, prisma)
registerArbeitskorbRoutes(router, prisma)
registerDispositionRoutes(router, prisma)
registerBenachrichtigungenRoutes(router, prisma)
registerFaelleRoutes(router, prisma)

// TODO: weitere A2-Endpunkte hier ergänzen

export default router
