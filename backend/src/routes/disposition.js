import { getTeamUebersicht } from '../services/dispositionService.js'

export function registerDispositionRoutes(router, prisma) {
  router.get('/disposition/team-uebersicht', async (req, res, next) => {
    try {
      const result = await getTeamUebersicht(prisma, req.mockNutzer)
      res.json(result)
    } catch (err) { next(err) }
  })
}
