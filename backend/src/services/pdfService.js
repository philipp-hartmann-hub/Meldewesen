import PDFDocument from 'pdfkit'

const TITEL = 'Meldung – Hamburg Justizvollzug'

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim()
}

export function erstelleMeldungPdf(meldung) {
  const doc = new PDFDocument({ margin: 50 })
  const meta = meldung.metadaten || {}

  // ---- Kopfzeile ----
  doc.fontSize(14).font('Helvetica-Bold').text(TITEL, { align: 'center' })
  doc.fontSize(10).font('Helvetica').moveDown(0.3)
    .text(`Erstellt am: ${new Date().toLocaleString('de-DE')}`, { align: 'right' })
  doc.moveDown(0.5)
  doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke()
  doc.moveDown(0.5)

  // ---- Stammdaten ----
  const felder = [
    ['Aktenzeichen',  meta.aktenzeichen || meldung.id],
    ['Meldungs-Nr.',  meldung.meldungsNr || '–'],
    ['Typ',           meldung.meldungsTyp],
    ['Status',        meldung.status],
    ['ERV-pflichtig', meldung.ervRelevant ? 'Ja' : 'Nein'],
    ['Tatvorwurf',    meta.tatvorwurf || meta.strafanzeigeUntertyp || '–'],
    ['Tatzeit',       meta.tatzeit || '–'],
    ['Tatort',        meta.tatort   || '–'],
    ['Beweismittel',  meta.beweismittelGesichert === true ? 'Ja' : meta.beweismittelGesichert === false ? 'Nein' : '–'],
  ]

  if (meldung.gefangene) {
    const g = meldung.gefangene
    felder.splice(2, 0, ['Gefangene/r', `${g.nachname || ''}, ${g.vorname || ''} (${g.gefangenenNr || '–'})`])
  }

  felder.forEach(([k, v]) => {
    if (!v || v === '–') return
    doc.font('Helvetica-Bold').fontSize(9).text(`${k}: `, { continued: true })
    doc.font('Helvetica').fontSize(9).text(String(v).substring(0, 300))
  })

  // ---- Sachverhalt ----
  if (meldung.sachverhalt) {
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#cccccc').stroke()
    doc.moveDown(0.5)
    doc.font('Helvetica-Bold').fontSize(10).text('Sachverhalt')
    doc.moveDown(0.2)
    doc.font('Helvetica').fontSize(9)
      .text(stripHtml(meldung.sachverhalt).substring(0, 2000), { width: doc.page.width - 100 })
  }

  // ---- Statusverlauf ----
  if (meldung.statusVerlauf?.length) {
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#cccccc').stroke()
    doc.moveDown(0.5)
    doc.font('Helvetica-Bold').fontSize(10).text('Statusverlauf')
    doc.moveDown(0.2)
    meldung.statusVerlauf.forEach(v => {
      const ts = new Date(v.erstelltAm).toLocaleString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
      const zeile = `${ts}  ${v.status}${v.kommentar ? '  – ' + stripHtml(v.kommentar) : ''}`
      doc.font('Helvetica').fontSize(8).text(zeile.substring(0, 300))
    })
  }

  // ---- Fußzeile ----
  doc.fontSize(7).fillColor('#888888')
    .text('Vertraulich – nur für den Dienstgebrauch', 50, doc.page.height - 40, {
      align: 'center',
      width: doc.page.width - 100,
    })

  doc.end()
  return doc
}
