import { isRichTextEmpty } from '../../utils/richText'
import { normalizeZeugen } from '../../constants/zeugen'
import ZeugenAccordionListe from './ZeugenAccordionListe'

export default function ZeugenAnzeige({ metadaten }) {
  const zeugen = normalizeZeugen(metadaten).filter(
    z => z.zeugenTyp || z.name?.trim() || !isRichTextEmpty(z.aussage)
  )
  if (!zeugen.length) return null

  return (
    <section className="section-card">
      <h2 className="text-lg font-bold text-jhh-primary mb-4">Zeugen und Zeugenaussagen</h2>
      <ZeugenAccordionListe zeugen={zeugen} variant="full" />
    </section>
  )
}
