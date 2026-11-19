import {
  addMeldungenToFall,
  createFall,
  entscheidMeldepflicht,
  fallAbschliessen,
  fallBepoVersand,
  fallEgpaVerakten,
  getFall,
  listBuendlungsVorschlaege,
  listFaelle,
  listUngebundeneMeldungen,
  markVersandfaehig,
  removeMeldungFromFall,
  rueckgabeAnAk,
  weiterleitenAnAl,
  weiterleitenAnDgl,
  weiterleitenAnSl,
} from '../services/fallService.js'

export function registerFaelleRoutes(router, prisma) {
  router.get('/faelle', async (req, res, next) => {
    try {
      const { status } = req.query
      const result = await listFaelle(prisma, req.mockNutzer, { status })
      res.json(result)
    } catch (err) { next(err) }
  })

  router.get('/faelle/ungebundene-meldungen', async (req, res, next) => {
    try {
      const result = await listUngebundeneMeldungen(prisma, req.mockNutzer)
      res.json(result)
    } catch (err) { next(err) }
  })

  router.get('/faelle/buendlungs-vorschlaege', async (req, res, next) => {
    try {
      const result = await listBuendlungsVorschlaege(prisma, req.mockNutzer)
      res.json(result)
    } catch (err) { next(err) }
  })

  router.get('/faelle/:id', async (req, res, next) => {
    try {
      const result = await getFall(prisma, req.mockNutzer, req.params.id)
      res.json({ data: result })
    } catch (err) { next(err) }
  })

  router.post('/faelle', async (req, res, next) => {
    try {
      const { bezeichnung, meldungIds } = req.body || {}
      const result = await createFall(prisma, req.mockNutzer, { bezeichnung, meldungIds })
      res.status(201).json(result)
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/meldungen', async (req, res, next) => {
    try {
      const { meldungIds } = req.body || {}
      const result = await addMeldungenToFall(prisma, req.mockNutzer, req.params.id, meldungIds)
      res.json({ data: result })
    } catch (err) { next(err) }
  })

  router.delete('/faelle/:id/meldungen/:meldungId', async (req, res, next) => {
    try {
      const result = await removeMeldungFromFall(
        prisma,
        req.mockNutzer,
        req.params.id,
        req.params.meldungId,
      )
      res.json(result)
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/weiterleiten-dgl', async (req, res, next) => {
    try {
      const result = await weiterleitenAnDgl(prisma, req.mockNutzer, req.params.id)
      res.json({ data: result, message: 'Fall wurde an die Dienstgruppenleitung weitergeleitet.' })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/rueckgabe', async (req, res, next) => {
    try {
      const { kommentar, meldungIds } = req.body || {}
      const result = await rueckgabeAnAk(prisma, req.mockNutzer, req.params.id, { kommentar, meldungIds })
      res.json({ data: result, message: 'Fall wurde an die Zentrale zurückgegeben.' })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/weiterleiten-sl', async (req, res, next) => {
    try {
      const result = await weiterleitenAnSl(prisma, req.mockNutzer, req.params.id)
      res.json({ data: result, message: 'Fall wurde an die Stationsleitung weitergeleitet.' })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/weiterleiten-al', async (req, res, next) => {
    try {
      const result = await weiterleitenAnAl(prisma, req.mockNutzer, req.params.id)
      res.json({ data: result, message: 'Fall wurde an die Anstaltsleitung zur Entscheidung weitergeleitet.' })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/entscheid-meldepflicht', async (req, res, next) => {
    try {
      const { meldepflichtig, kommentar } = req.body || {}
      const result = await entscheidMeldepflicht(prisma, req.mockNutzer, req.params.id, {
        meldepflichtig,
        kommentar,
      })
      const msg = meldepflichtig
        ? 'Fall als meldepflichtig entschieden – ERV-Weg am Fall freigegeben.'
        : 'Fall als nicht meldepflichtig entschieden – eGPA am Fall (ohne beBPo).'
      res.json({ data: result, message: msg })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/entscheid-al', async (req, res, next) => {
    try {
      const { meldepflichtig, kommentar } = req.body || {}
      const result = await entscheidMeldepflicht(prisma, req.mockNutzer, req.params.id, {
        meldepflichtig,
        kommentar,
      })
      const msg = meldepflichtig
        ? 'Fall als meldepflichtig entschieden – ERV-Weg am Fall freigegeben.'
        : 'Fall als nicht meldepflichtig entschieden – eGPA am Fall (ohne beBPo).'
      res.json({ data: result, message: msg })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/versandfaehig', async (req, res, next) => {
    try {
      const result = await markVersandfaehig(prisma, req.mockNutzer, req.params.id)
      res.json({ data: result, message: 'Fall als versandfähig markiert.' })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/xjustiz-versand', async (req, res, next) => {
    try {
      const result = await fallBepoVersand(prisma, req.mockNutzer, req.params.id)
      res.json({
        data: result,
        message: `Per beBPo versendet (${result.bepoNachrichtenId}).`,
      })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/verakten', async (req, res, next) => {
    try {
      const result = await fallEgpaVerakten(prisma, req.mockNutzer, req.params.id)
      res.json({
        data: result,
        message: `In eGPA veraktet (${result.egpaAktenzeichen}).`,
      })
    } catch (err) { next(err) }
  })

  router.post('/faelle/:id/abschliessen', async (req, res, next) => {
    try {
      const { kommentar } = req.body || {}
      const result = await fallAbschliessen(prisma, req.mockNutzer, req.params.id, { kommentar })
      res.json({ data: result, message: 'Fall mit Vier-Augen abgeschlossen.' })
    } catch (err) { next(err) }
  })
}
