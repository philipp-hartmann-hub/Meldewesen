/**
 * Persönlicher Arbeitskorb – API-Routen (Prototyp).
 */
import {
  abschliessenArbeitskorbAufgabe,
  getArbeitskorbAufgabe,
  listArbeitskorbAufgaben,
  uebernehmenArbeitskorbAufgabe,
  zuweisenArbeitskorbAufgabe,
} from '../services/arbeitskorbService.js'

export function registerArbeitskorbRoutes(router, prisma) {
  router.get('/arbeitskorb', async (req, res, next) => {
    try {
      const { status, bereich } = req.query
      const result = await listArbeitskorbAufgaben(prisma, req.mockNutzer, { status, bereich })
      res.json(result)
    } catch (err) { next(err) }
  })

  router.get('/arbeitskorb/:aufgabeId', async (req, res, next) => {
    try {
      const result = await getArbeitskorbAufgabe(prisma, req.mockNutzer, req.params.aufgabeId)
      res.json(result)
    } catch (err) { next(err) }
  })

  router.patch('/arbeitskorb/:aufgabeId/uebernehmen', async (req, res, next) => {
    try {
      const result = await uebernehmenArbeitskorbAufgabe(
        prisma,
        req.mockNutzer,
        req.params.aufgabeId,
      )
      res.json(result)
    } catch (err) { next(err) }
  })

  router.patch('/arbeitskorb/:aufgabeId/zuweisen', async (req, res, next) => {
    try {
      const result = await zuweisenArbeitskorbAufgabe(
        prisma,
        req.mockNutzer,
        req.params.aufgabeId,
        req.body,
      )
      res.json(result)
    } catch (err) { next(err) }
  })

  router.patch('/arbeitskorb/:aufgabeId/abschliessen', async (req, res, next) => {
    try {
      const result = await abschliessenArbeitskorbAufgabe(
        prisma,
        req.mockNutzer,
        req.params.aufgabeId,
        req.body,
      )
      res.json(result)
    } catch (err) { next(err) }
  })
}
