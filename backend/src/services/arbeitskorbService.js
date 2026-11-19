/**
 * Arbeitskorb – persönliche und Gruppenaufgaben (Prototyp).
 */
import { isRichTextEmpty } from '../utils/richText.js'
import {
  alleZeugenaussagenVollstaendig,
  zeugenAbschlussZeitpunkt,
} from './zeugenVollstaendigkeitService.js'
import {
  istBeweismittelNachreichungUeberfaellig,
  pruefeBeweismittelFristEskalationBatch,
} from './beweismittelEskalationService.js'
import { benachrichtigeZuweisung, erstelleBenachrichtigungen, BENACHRICHTIGUNG_TYPEN } from './benachrichtigungService.js'
import {
  setGruppenAufgabeZuweisung,
  setMeldungZuweisung,
} from './zuweisungMetaService.js'
import { validateZuweisungsZiel } from './zuweisungService.js'
import {
  einreichenNachBeweismittelNachreichung,
  validiereBeweismittelNachreichungAbschluss,
} from './beweismittelNachreichungService.js'

export const AUFGABEN_TYPEN = {
  ZEUGENAUSSAGE_BESTAETIGEN: 'zeugenaussage_bestaetigen',
  ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN: 'zeugenaussage_inhaftierter_erfassen',
  FACHLICHE_PRUEFUNG: 'fachliche_pruefung',
  BEWEISMITTEL_NACHREICHEN: 'beweismittel_nachreichen',
  DGL_RUECKGABE: 'dgl_rueckgabe',
  FALL_PRUEFEN: 'fall_pruefen',
  FALL_WEITERLEITEN: 'fall_weiterleiten',
  FALL_ENTSCHEID: 'fall_entscheid',
  FALL_ERV: 'fall_erv',
  FALL_RUECKGABE: 'fall_rueckgabe',
  MELDUNG_BEPO: 'meldung_bepo',
  MELDUNG_EGPA: 'meldung_egpa',
  MELDUNG_ABSCHLUSS: 'meldung_abschluss',
}

export const ZUWEISUNG = {
  PERSOENLICH: 'persoenlich',
  GRUPPE: 'gruppe',
}

const PRUEF_ZEUGE_ID = 'pruef'
export const BEWEISMITTEL_ZEUGE_ID = 'beweismittel'
export const DGL_RUECKGABE_ZEUGE_ID = 'dgl'

const TYP_LABELS = {
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN]: 'Zeugenaussage ausfüllen',
  [AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN]: 'Zeugenaussage Inhaftierte/r aufnehmen',
  [AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG]: 'Fachliche Prüfung',
  [AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN]: 'Beweismittel nachreichen',
  [AUFGABEN_TYPEN.DGL_RUECKGABE]: 'Meldung nach DGL-Rückgabe überarbeiten',
  [AUFGABEN_TYPEN.FALL_PRUEFEN]: 'Fall prüfen',
  [AUFGABEN_TYPEN.FALL_WEITERLEITEN]: 'Fall weiterleiten',
  [AUFGABEN_TYPEN.FALL_ENTSCHEID]: 'Meldepflicht entscheiden',
  [AUFGABEN_TYPEN.FALL_ERV]: 'ERV am Fall',
  [AUFGABEN_TYPEN.FALL_RUECKGABE]: 'Fall nach Rückgabe bearbeiten',
  [AUFGABEN_TYPEN.MELDUNG_BEPO]: 'Versand (beBPo)',
  [AUFGABEN_TYPEN.MELDUNG_EGPA]: 'eGPA-Veraktung',
  [AUFGABEN_TYPEN.MELDUNG_ABSCHLUSS]: 'Abschluss',
}

const FALL_AUFGABEN_TYPEN = new Set([
  AUFGABEN_TYPEN.FALL_PRUEFEN,
  AUFGABEN_TYPEN.FALL_WEITERLEITEN,
  AUFGABEN_TYPEN.FALL_ENTSCHEID,
  AUFGABEN_TYPEN.FALL_ERV,
  AUFGABEN_TYPEN.FALL_RUECKGABE,
])

/** Offener Fall-Schritt für die zuständige Rolle. null, wenn gerade nichts zu tun ist. */
export function beschreibeOffeneFallAufgabe(fall) {
  if (!fall?.fallNr) return null
  const nr = fall.fallNr
  if (fall.status === 'ZUR_DGL') {
    return { rollen: ['dienstgruppenleitung'], typ: AUFGABEN_TYPEN.FALL_PRUEFEN, titel: `Fall ${nr} prüfen` }
  }
  if (fall.status === 'ZUR_SL') {
    return { rollen: ['stationsleitung'], typ: AUFGABEN_TYPEN.FALL_WEITERLEITEN, titel: `Fall ${nr} weiterleiten` }
  }
  if (fall.status === 'ZUR_AL') {
    return {
      rollen: ['anstaltsleitung', 'val'],
      typ: AUFGABEN_TYPEN.FALL_ENTSCHEID,
      titel: `Meldepflicht für Fall ${nr} entscheiden`,
    }
  }
  if (fall.status === 'ZURUECK_AK') {
    return {
      rollen: ['arbeitskoordination'],
      typ: AUFGABEN_TYPEN.FALL_RUECKGABE,
      titel: `Fall ${nr} nach DGL-Rückgabe bearbeiten`,
    }
  }
  if (fall.status === 'ERV_WEG' && !fall.abgeschlossenAm) {
    let titel = `Fall ${nr} abschließen`
    if (!fall.versandfaehigAm) titel = `Fall ${nr} als versandfähig markieren`
    else if (!fall.bepoVersendetAm) titel = `Fall ${nr} per beBPo versenden`
    else if (!fall.egpaVeraktetAm) titel = `Fall ${nr} in eGPA verakten`
    return { rollen: ['anstaltsleitung', 'val'], typ: AUFGABEN_TYPEN.FALL_ERV, titel }
  }
  if (fall.status === 'EGPA_INTERN' && !fall.abgeschlossenAm) {
    const titel = fall.egpaVeraktetAm
      ? `Fall ${nr} abschließen`
      : `Fall ${nr} in eGPA verakten`
    return { rollen: ['anstaltsleitung', 'val'], typ: AUFGABEN_TYPEN.FALL_ERV, titel }
  }
  return null
}

function fallGruppenAufgabe(fall, beschreibung) {
  return {
    id: encodeAufgabeId(fall.id, beschreibung.typ, 'fall'),
    typ: beschreibung.typ,
    titel: beschreibung.titel,
    status: 'OFFEN',
    meldungId: null,
    fallId: fall.id,
    meldungsNr: fall.fallNr,
    meldungsTyp: null,
    meldungsStatus: fall.status,
    prioritaet: 0,
    dringend: false,
    zeugeId: null,
    zeugeName: '',
    fristBis: null,
    gesendetAm: fall.aktualisiertAm,
    erstelltAm: fall.erstelltAm,
    nachricht: fall.rueckgabeGrund || fall.bezeichnung || '',
    sachverhalt: fall.bezeichnung || '',
    gefangene: null,
    zuweisung: ZUWEISUNG.GRUPPE,
    fallAufgabe: true,
  }
}

function sammleFallAufgaben(faelle, nutzer) {
  return faelle.flatMap(fall => {
    const beschreibung = beschreibeOffeneFallAufgabe(fall)
    if (!beschreibung || !beschreibung.rollen.includes(nutzer.rolle)) return []
    return [fallGruppenAufgabe(fall, beschreibung)]
  })
}

export function istBeweismittelRueckgabeGrund(grund) {
  return grund === 'beweismittel' || grund === 'beides'
}

const ERFASSER_ROLLEN = new Set(['avd', 'stationsleitung'])

/** Ermittelt den zuständigen AVD/SL für Beweismittel-Nachreichung. */
export async function resolveBeweismittelEmpfaenger(prisma, meldung) {
  const meta = meldung.metadaten || {}
  const nachreichung = meta.beweismittelNachreichung || {}

  if (nachreichung.inGruppenpostfach || nachreichung.eskaliertAm) {
    return { id: null, name: null }
  }

  const ausMeta = async (id, name) => {
    if (!id) return null
    if (name) return { id, name }
    const bed = await prisma.bedienstete.findUnique({ where: { bediensteterID: id } })
    return { id, name: bed?.bediensteterName || id }
  }

  if (nachreichung.zugewiesenAn) {
    return ausMeta(nachreichung.zugewiesenAn, nachreichung.zugewiesenAnName)
  }
  if (meta.zugewiesenAn) {
    return ausMeta(meta.zugewiesenAn, meta.zugewiesenAnName)
  }
  if (nachreichung.erfassenderAn) {
    return ausMeta(nachreichung.erfassenderAn, nachreichung.erfassenderAnName)
  }

  const letzteEinreichung = await prisma.statusVerlauf.findFirst({
    where: { meldungId: meldung.id, status: 'SUBMITTED' },
    orderBy: { erstelltAm: 'desc' },
    include: { bedienstete: true },
  })
  if (letzteEinreichung?.bedienstete) {
    const b = letzteEinreichung.bedienstete
    if (ERFASSER_ROLLEN.has(b.bediensteterRolle)) {
      return { id: b.bediensteterID, name: b.bediensteterName }
    }
  }

  const betreuer = meldung.gefangene?.betreuenderBeamter
  if (betreuer) {
    const bed = await prisma.bedienstete.findUnique({ where: { bediensteterID: betreuer } })
    if (bed && ERFASSER_ROLLEN.has(bed.bediensteterRolle)) {
      return { id: betreuer, name: bed.bediensteterName }
    }
  }

  return { id: null, name: null }
}

export function encodeAufgabeId(meldungId, typ, zeugeId) {
  return `${meldungId}|${typ}|${zeugeId}`
}

export function decodeAufgabeId(aufgabeId) {
  const parts = String(aufgabeId || '').split('|')
  if (parts.length !== 3) return null
  const [meldungId, typ, zeugeId] = parts
  if (!meldungId || !typ || !zeugeId) return null
  if (!Object.values(AUFGABEN_TYPEN).includes(typ)) return null
  return { meldungId, typ, zeugeId }
}

export async function enrichMockNutzerStandort(prisma, mockNutzer) {
  const bed = await prisma.bedienstete.findUnique({
    where: { bediensteterID: mockNutzer.nutzerId },
  })
  return {
    ...mockNutzer,
    nutzerJva: bed?.bediensteterJVA || mockNutzer.jva,
    nutzerHaus: bed?.haus || mockNutzer.abteilung || null,
  }
}

function darfPruefAufgabenSehen(mockNutzer) {
  return mockNutzer.istVAL || mockNutzer.istAL
}

function findZeuge(metadaten, zeugeId) {
  const zeugen = metadaten?.zeugen
  if (!Array.isArray(zeugen)) return null
  return zeugen.find(z => z.id === zeugeId) || null
}

function passtNutzerZuGruppe(nutzer, ga) {
  if (!ga?.haus || !nutzer.nutzerHaus) return false
  return ga.jva === nutzer.nutzerJva && ga.haus === nutzer.nutzerHaus
}

function passtNutzerZuStation(meldung, nutzer) {
  const haus = meldung.gefangene?.haus
  const jva = meldung.gefangene?.jva
  if (!haus || !nutzer.nutzerHaus) return false
  return jva === nutzer.nutzerJva && haus === nutzer.nutzerHaus
}

function meldungsKontextAusMetadaten(metadaten, eigeneZeugeId) {
  const meta = metadaten || {}
  const zeugen = Array.isArray(meta.zeugen) ? meta.zeugen : []
  return {
    tatvorwurf: meta.tatvorwurf || meta.strafanzeigeUntertyp || null,
    tatzeit: meta.tatzeit || null,
    tatort: meta.tatort?.trim() || null,
    weitereZeugen: zeugen
      .filter(z => z.id !== eigeneZeugeId && z.name?.trim())
      .map(z => ({
        id: z.id,
        name: z.name.trim(),
        zeugenTyp: z.zeugenTyp || '',
        aussage: typeof z.aussage === 'string' ? z.aussage : '',
      })),
    zeugenVollstaendig: alleZeugenaussagenVollstaendig(meta),
    beweismittelGesichert: meta.beweismittelGesichert || null,
    beweismittelAngaben: meta.beweismittelAngaben || null,
  }
}

function aufgabeBasis(meldung, typ, zeugeId, folge, extra = {}) {
  return {
    id: encodeAufgabeId(meldung.id, typ, zeugeId),
    typ,
    titel: TYP_LABELS[typ] || typ,
    status: folge.status || 'OFFEN',
    meldungId: meldung.id,
    meldungsNr: meldung.meldungsNr,
    meldungsTyp: meldung.meldungsTyp,
    meldungsStatus: meldung.status,
    prioritaet: meldung.prioritaet ?? 0,
    dringend: (meldung.prioritaet ?? 0) > 0,
    zeugeId: zeugeId === PRUEF_ZEUGE_ID ? null : zeugeId,
    zeugeName: folge.zeugeName || extra.zeugeName || '',
    fristBis: folge.fristBis || null,
    gesendetAm: folge.gesendetAm || folge.ausgeloestAm || null,
    nachricht: folge.nachricht || '',
    sachverhalt: meldung.sachverhalt,
    meldungsKontext: meldungsKontextAusMetadaten(
      meldung.metadaten,
      zeugeId === PRUEF_ZEUGE_ID ? null : zeugeId,
    ),
    gefangene: meldung.gefangene
      ? {
        nachname: meldung.gefangene.nachname,
        vorname: meldung.gefangene.vorname,
        gefangenenNr: meldung.gefangene.gefangenenNr,
      }
      : null,
    zuweisung: extra.zuweisung || ZUWEISUNG.PERSOENLICH,
    ...extra,
  }
}

function istPruefbereit(meldung) {
  if (meldung.meldungsTyp === 'STRAFANZEIGE') {
    return alleZeugenaussagenVollstaendig(meldung.metadaten)
  }
  return true
}

function sammlePersoenlicheAufgabenAusMeldung(meldung, nutzer) {
  const fa = meldung.metadaten?.zeugenFolgeaktionen
  if (!fa) return []

  const aufgaben = []

  for (const b of fa.bediensteteBenachrichtigungen || []) {
    if (!b.bediensteterId || b.bediensteterId !== nutzer.nutzerId) continue
    aufgaben.push(aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN,
      b.zeugeId,
      b,
      {
        zeuge: findZeuge(meldung.metadaten, b.zeugeId),
        zuweisung: ZUWEISUNG.PERSOENLICH,
      },
    ))
  }

  for (const g of fa.gruppenAufgaben || []) {
    if (g.uebernommenVon !== nutzer.nutzerId) continue
    aufgaben.push(aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN,
      g.zeugeId,
      g,
      {
        zeuge: findZeuge(meldung.metadaten, g.zeugeId),
        zuweisung: ZUWEISUNG.PERSOENLICH,
        standort: [g.jva, g.haus, g.haftraum].filter(Boolean).join(' · '),
        uebernommen: {
          von: g.uebernommenVon,
          name: g.uebernommenVonName,
          am: g.uebernommenAm,
        },
        kannUebernehmen: false,
        uebernommenVonMir: true,
      },
    ))
  }

  return aufgaben
}

function sammleGruppenAufgabenAusMeldung(meldung, nutzer) {
  const fa = meldung.metadaten?.zeugenFolgeaktionen
  if (!fa) return []

  const aufgaben = []

  for (const g of fa.gruppenAufgaben || []) {
    if (g.uebernommenVon) continue
    if (g.status === 'ERLEDIGT') continue
    if (!passtNutzerZuGruppe(nutzer, g)) continue

    aufgaben.push(aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN,
      g.zeugeId,
      g,
      {
        zeuge: findZeuge(meldung.metadaten, g.zeugeId),
        zuweisung: ZUWEISUNG.GRUPPE,
        standort: [g.jva, g.haus, g.haftraum].filter(Boolean).join(' · '),
        empfaengerAnzahl: g.empfaengerAnzahl ?? null,
        kannUebernehmen: true,
        uebernommenVonMir: false,
      },
    ))
  }

  return aufgaben
}

function versandErledigt(meldung) {
  return (meldung.xJustizVersand || []).some(v => ['VERSENDET', 'BESTAETIGT'].includes(v.status))
}

function egpaErledigt(meldung) {
  return (meldung.veraktungen || []).some(v => v.status === 'UEBERMITTELT')
}

/** Nächster noch offener Schritt, wie in der Schrittleiste der Meldung. */
export function naechsterProzessschritt(meldung) {
  if (!meldung || meldung.fallId || meldung.status === 'ARCHIVED' || meldung.status === 'DRAFT') return null
  const hatZeugen = meldung.meldungsTyp === 'STRAFANZEIGE'
    && Array.isArray(meldung.metadaten?.zeugen)
    && meldung.metadaten.zeugen.length > 0
  if (hatZeugen && !alleZeugenaussagenVollstaendig(meldung.metadaten)) return 'zeugen'
  const bepo = versandErledigt(meldung)
  const egpa = egpaErledigt(meldung)
  const pruefungAufgenommen = meldung.status === 'IN_PROGRESS' || bepo || egpa
  if (!pruefungAufgenommen) return 'bearbeitung'
  if (meldung.ervRelevant && !bepo) return 'bepo'
  if (meldung.ervRelevant && !egpa) return 'egpa'
  return 'archiv'
}

const PROZESS_AUFGABEN = {
  bearbeitung: {
    rollen: ['val', 'anstaltsleitung'],
    typ: AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG,
    zeugeId: PRUEF_ZEUGE_ID,
    titel: m => `Fachliche Prüfung ${m.meldungsNr}`,
    nachricht: 'Alle vorherigen Schritte sind erledigt. Bitte nehmen Sie die fachliche Prüfung auf.',
  },
  bepo: {
    rollen: ['val', 'anstaltsleitung'],
    typ: AUFGABEN_TYPEN.MELDUNG_BEPO,
    zeugeId: 'bepo',
    titel: m => `${m.meldungsNr} per beBPo versenden`,
    nachricht: 'Fachliche Prüfung ist erfolgt. Nächster Schritt: Versand per beBPo.',
    zielPfad: m => `/meldungen/${m.id}`,
  },
  egpa: {
    rollen: ['val', 'anstaltsleitung'],
    typ: AUFGABEN_TYPEN.MELDUNG_EGPA,
    zeugeId: 'egpa',
    titel: m => `${m.meldungsNr} in eGPA verakten`,
    nachricht: 'beBPo-Versand ist erfolgt. Nächster Schritt: eGPA-Veraktung.',
    zielPfad: m => `/meldungen/${m.id}`,
  },
  archiv: {
    rollen: ['val', 'anstaltsleitung'],
    typ: AUFGABEN_TYPEN.MELDUNG_ABSCHLUSS,
    zeugeId: 'abschluss',
    titel: m => `${m.meldungsNr} abschließen`,
    nachricht: 'Nächster Schritt: Meldung abschließen.',
    zielPfad: m => `/meldungen/${m.id}`,
  },
}

function sammlePruefAufgabeAusMeldung(meldung, mockNutzer) {
  const schritt = naechsterProzessschritt(meldung)
  const beschreibung = PROZESS_AUFGABEN[schritt]
  if (!beschreibung || !beschreibung.rollen.includes(mockNutzer.rolle)) return null
  return aufgabeBasis(
    meldung,
    beschreibung.typ,
    beschreibung.zeugeId,
    {
      status: 'OFFEN',
      gesendetAm: zeugenAbschlussZeitpunkt(meldung.metadaten) || meldung.aktualisiertAm || meldung.erstelltAm,
      nachricht: beschreibung.nachricht,
    },
    {
      zuweisung: ZUWEISUNG.PERSOENLICH,
      titel: beschreibung.titel(meldung),
      ...(beschreibung.zielPfad ? { zielPfad: beschreibung.zielPfad(meldung), aktionLabel: 'Meldung öffnen' } : {}),
    },
  )
}

function sammleBeweismittelAufgabeAusMeldung(meldung, nutzer, beweismittelEmpfaengerId = null) {
  if (meldung.status !== 'DRAFT') return []

  const meta = meldung.metadaten || {}
  const rueckgabe = meta.rueckgabeErgaenzung
  const nachreichung = meta.beweismittelNachreichung
  if (!rueckgabe || !istBeweismittelRueckgabeGrund(rueckgabe.grund)) return []
  if (!nachreichung || nachreichung.status === 'ERLEDIGT') return []

  const station = meldung.gefangene?.haus || null
  const zugewiesenAn = beweismittelEmpfaengerId
    || nachreichung.zugewiesenAn
    || meta.zugewiesenAn
    || nachreichung.erfassenderAn
    || null

  if (zugewiesenAn) {
    if (zugewiesenAn !== nutzer.nutzerId) return []
    return [aufgabeBasis(
      meldung,
      AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
      BEWEISMITTEL_ZEUGE_ID,
      {
        status: nachreichung.status || 'OFFEN',
        fristBis: nachreichung.fristBis || rueckgabe.fristBis || null,
        gesendetAm: nachreichung.angefordertAm || rueckgabe.zurueckgegebenAm || meldung.erstelltAm,
        nachricht: nachreichung.kommentar || rueckgabe.kommentar || '',
      },
      {
        zuweisung: ZUWEISUNG.PERSOENLICH,
        rueckgabeGrund: rueckgabe.grund,
        standort: station,
        kannUebernehmen: false,
        uebernommenVonMir: true,
        eskaliert: !!(nachreichung.eskaliertAm || nachreichung.inGruppenpostfach),
      },
    )]
  }

  if (!passtNutzerZuStation(meldung, nutzer)) return []

  return [aufgabeBasis(
    meldung,
    AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
    BEWEISMITTEL_ZEUGE_ID,
    {
      status: nachreichung.status || 'OFFEN',
      fristBis: nachreichung.fristBis || rueckgabe.fristBis || null,
      gesendetAm: nachreichung.angefordertAm || rueckgabe.zurueckgegebenAm || meldung.erstelltAm,
      nachricht: nachreichung.kommentar || rueckgabe.kommentar || '',
    },
    {
      zuweisung: ZUWEISUNG.GRUPPE,
      rueckgabeGrund: rueckgabe.grund,
      standort: station,
      kannUebernehmen: true,
      kannZuweisen: true,
      uebernommenVonMir: false,
      eskaliert: !!(nachreichung.eskaliertAm || nachreichung.inGruppenpostfach),
    },
  )]
}

/** Für Team-Übersicht: alle offenen Beweismittel-Aufgaben (ohne Nutzerfilter). */
export function sammleBeweismittelDispositionAufgaben(meldung, beweismittelEmpfaenger = null) {
  if (meldung.status !== 'DRAFT') return []

  const meta = meldung.metadaten || {}
  const rueckgabe = meta.rueckgabeErgaenzung
  const nachreichung = meta.beweismittelNachreichung
  if (!rueckgabe || !istBeweismittelRueckgabeGrund(rueckgabe.grund)) return []
  if (!nachreichung || nachreichung.status === 'ERLEDIGT') return []

  const station = meldung.gefangene?.haus || null
  const zugewiesenAn = beweismittelEmpfaenger?.id
    || nachreichung.zugewiesenAn
    || meta.zugewiesenAn
    || nachreichung.erfassenderAn
    || null
  const zugewiesenAnName = beweismittelEmpfaenger?.name || nachreichung.zugewiesenAnName || null
  const istGruppe = !zugewiesenAn

  return [{
    id: encodeAufgabeId(meldung.id, AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN, BEWEISMITTEL_ZEUGE_ID),
    typ: AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN,
    titel: 'Beweismittel nachreichen',
    status: nachreichung.status || 'OFFEN',
    meldungId: meldung.id,
    meldungsNr: meldung.meldungsNr,
    meldungsStatus: meldung.status,
    zugewiesenAn,
    zugewiesenAnName,
    zuweisung: istGruppe ? ZUWEISUNG.GRUPPE : ZUWEISUNG.PERSOENLICH,
    station,
    rueckgabeGrund: rueckgabe.grund,
    kannZuweisen: true,
    eskaliert: !!(nachreichung.eskaliertAm || nachreichung.inGruppenpostfach),
    gesendetAm: nachreichung.angefordertAm || rueckgabe.zurueckgegebenAm || meldung.erstelltAm,
    ueberfaellig: istBeweismittelNachreichungUeberfaellig(meldung),
  }]
}

export async function benachrichtigeNaechstenProzessschritt(prisma, meldung) {
  const schritt = naechsterProzessschritt(meldung)
  const beschreibung = PROZESS_AUFGABEN[schritt]
  if (!beschreibung) return
  const jva = meldung.gefangene?.jva
  if (!jva) return
  const leute = await prisma.bedienstete.findMany({
    where: { bediensteterJVA: jva, bediensteterRolle: { in: beschreibung.rollen } },
    select: { bediensteterID: true },
  })
  if (!leute.length) return
  const titel = beschreibung.titel(meldung)
  await erstelleBenachrichtigungen(prisma, leute.map(b => ({
    empfaengerId: b.bediensteterID,
    typ: BENACHRICHTIGUNG_TYPEN.AUFGABE_NEU,
    text: `Neue Aufgabe: ${titel}`,
    meldungId: meldung.id,
    aufgabeId: encodeAufgabeId(meldung.id, beschreibung.typ, beschreibung.zeugeId),
  })))
}

function sammleDglRueckgabeAufgabe(meldung, nutzer) {
  if (meldung.status !== 'DRAFT') return []
  const rueckgabe = meldung.metadaten?.rueckgabeDgl
  if (!rueckgabe) return []
  if (meldung.zustaendig?.bediensteterID !== nutzer.nutzerId) return []
  return [aufgabeBasis(
    meldung,
    AUFGABEN_TYPEN.DGL_RUECKGABE,
    DGL_RUECKGABE_ZEUGE_ID,
    {
      status: 'OFFEN',
      gesendetAm: rueckgabe.zurueckgegebenAm || meldung.aktualisiertAm,
      nachricht: rueckgabe.kommentar || 'Die Dienstgruppenleitung hat diese Meldung zur Nachbesserung zurückgegeben.',
    },
    { zuweisung: ZUWEISUNG.PERSOENLICH },
  )]
}

function sammleAlleAufgabenAusMeldung(meldung, nutzer, beweismittelEmpfaengerId = null) {
  const persoenlich = sammlePersoenlicheAufgabenAusMeldung(meldung, nutzer)
  const gruppe = sammleGruppenAufgabenAusMeldung(meldung, nutzer)
  const beweismittel = sammleBeweismittelAufgabeAusMeldung(meldung, nutzer, beweismittelEmpfaengerId)
  const dglRueckgabe = sammleDglRueckgabeAufgabe(meldung, nutzer)
  const pruefAufgabe = sammlePruefAufgabeAusMeldung(meldung, nutzer)
  const basis = [...persoenlich, ...gruppe, ...beweismittel, ...dglRueckgabe]
  return pruefAufgabe ? [...basis, pruefAufgabe] : basis
}

async function sammleAufgabenFuerMeldung(prisma, meldung, nutzer) {
  const emp = await resolveBeweismittelEmpfaenger(prisma, meldung)
  return sammleAlleAufgabenAusMeldung(meldung, nutzer, emp.id)
}

function filterNachBereich(aufgaben, bereich) {
  if (bereich === ZUWEISUNG.PERSOENLICH) {
    return aufgaben.filter(a => a.zuweisung === ZUWEISUNG.PERSOENLICH)
  }
  if (bereich === ZUWEISUNG.GRUPPE) {
    return aufgaben.filter(a => a.zuweisung === ZUWEISUNG.GRUPPE)
  }
  return aufgaben
}

function sortArbeitskorbAufgaben(aufgaben) {
  return aufgaben.sort((a, b) => {
    const statusOffenZuerst = a.status === 'OFFEN' ? 0 : 1
    const statusOffenZuerstB = b.status === 'OFFEN' ? 0 : 1
    if (statusOffenZuerst !== statusOffenZuerstB) {
      return statusOffenZuerst - statusOffenZuerstB
    }

    const dringendZuerst = a.dringend ? 0 : 1
    const dringendZuerstB = b.dringend ? 0 : 1
    if (dringendZuerst !== dringendZuerstB) {
      return dringendZuerst - dringendZuerstB
    }

    return new Date(b.gesendetAm || 0) - new Date(a.gesendetAm || 0)
  })
}

export async function listArbeitskorbAufgaben(prisma, mockNutzer, { status, bereich } = {}) {
  const nutzer = await enrichMockNutzerStandort(prisma, mockNutzer)
  const { siehtAlleJVAs } = nutzer

  const where = {
    status: { not: 'ARCHIVED' },
  }
  if (!siehtAlleJVAs) where.gefangene = { jva: nutzer.nutzerJva }

  let meldungen = await prisma.meldung.findMany({
    where,
    include: { gefangene: true, zustaendig: true, xJustizVersand: true, veraktungen: true },
    orderBy: { erstelltAm: 'desc' },
  })

  meldungen = await pruefeBeweismittelFristEskalationBatch(prisma, meldungen)

  const aufgabenNested = await Promise.all(
    meldungen.map(async (m) => {
      const emp = await resolveBeweismittelEmpfaenger(prisma, m)
      return sammleAlleAufgabenAusMeldung(m, nutzer, emp.id)
    }),
  )
  let aufgaben = aufgabenNested.flat()

  const fallWhere = {
    status: { in: ['ZUR_DGL', 'ZUR_SL', 'ZUR_AL', 'ZURUECK_AK', 'ERV_WEG', 'EGPA_INTERN'] },
  }
  if (!siehtAlleJVAs) fallWhere.jva = nutzer.nutzerJva
  const faelle = await prisma.meldungsFall.findMany({ where: fallWhere })
  aufgaben = aufgaben.concat(sammleFallAufgaben(faelle, nutzer))

  if (status === 'OFFEN') aufgaben = aufgaben.filter(a => a.status === 'OFFEN')
  else if (status === 'ERLEDIGT') aufgaben = aufgaben.filter(a => a.status === 'ERLEDIGT')

  const offenPersoenlich = aufgaben.filter(
    a => a.status === 'OFFEN' && a.zuweisung === ZUWEISUNG.PERSOENLICH,
  ).length
  const offenGruppe = aufgaben.filter(
    a => a.status === 'OFFEN' && a.zuweisung === ZUWEISUNG.GRUPPE,
  ).length

  aufgaben = filterNachBereich(aufgaben, bereich)

  sortArbeitskorbAufgaben(aufgaben)

  const offen = aufgaben.filter(a => a.status === 'OFFEN').length

  return {
    data: aufgaben,
    total: aufgaben.length,
    offen,
    offenPersoenlich,
    offenGruppe,
  }
}

export async function getArbeitskorbAufgabe(prisma, mockNutzer, aufgabeId) {
  const nutzer = await enrichMockNutzerStandort(prisma, mockNutzer)
  const parsed = decodeAufgabeId(aufgabeId)
  if (!parsed) {
    const err = new Error('Ungültige Aufgaben-ID.')
    err.status = 400
    throw err
  }

  if (FALL_AUFGABEN_TYPEN.has(parsed.typ)) {
    const fall = await prisma.meldungsFall.findUnique({ where: { id: parsed.meldungId } })
    if (!fall) {
      const err = new Error('Fall nicht gefunden.')
      err.status = 404
      throw err
    }
    if (!nutzer.siehtAlleJVAs && fall.jva !== nutzer.nutzerJva) {
      const err = new Error('Kein Zugriff auf diesen Fall.')
      err.status = 403
      throw err
    }
    const beschreibung = beschreibeOffeneFallAufgabe(fall)
    if (!beschreibung || beschreibung.typ !== parsed.typ || !beschreibung.rollen.includes(nutzer.rolle)) {
      const err = new Error('Aufgabe nicht gefunden oder nicht für Sie bestimmt.')
      err.status = 404
      throw err
    }
    return { data: fallGruppenAufgabe(fall, beschreibung) }
  }

  const meldung = await prisma.meldung.findUnique({
    where: { id: parsed.meldungId },
    include: {
      gefangene: true,
      zustaendig: true,
      xJustizVersand: true,
      veraktungen: true,
      statusVerlauf: { orderBy: { erstelltAm: 'asc' } },
    },
  })
  if (!meldung) {
    const err = new Error('Meldung nicht gefunden.')
    err.status = 404
    throw err
  }

  const alle = await sammleAufgabenFuerMeldung(prisma, meldung, nutzer)
  const aufgabe = alle.find(a => a.id === aufgabeId)
  if (!aufgabe) {
    const err = new Error('Aufgabe nicht gefunden oder nicht für Sie bestimmt.')
    err.status = 404
    throw err
  }

  return { data: aufgabe }
}

function findGruppenAufgabeMeta(metadaten, zeugeId) {
  const fa = metadaten?.zeugenFolgeaktionen
  const gruppen = fa?.gruppenAufgaben || []
  const idx = gruppen.findIndex(g => g.zeugeId === zeugeId)
  if (idx < 0) return { idx: -1, gruppen, fa: fa || {} }
  return { idx, gruppen: [...gruppen], fa: { ...(fa || {}) } }
}

async function uebernehmenBeweismittelAufgabe(prisma, nutzer, meldung, parsed) {
  const meta = { ...(meldung.metadaten || {}) }
  const nachreichung = meta.beweismittelNachreichung
  if (!nachreichung || nachreichung.status === 'ERLEDIGT') {
    const err = new Error('Beweismittel-Aufgabe nicht gefunden.')
    err.status = 404
    throw err
  }
  if (nachreichung.zugewiesenAn && nachreichung.zugewiesenAn !== nutzer.nutzerId) {
    const err = new Error('Diese Aufgabe wurde bereits zugewiesen.')
    err.status = 409
    throw err
  }
  if (!passtNutzerZuStation(meldung, nutzer)) {
    const err = new Error('Sie gehören nicht zur zuständigen Station für diese Aufgabe.')
    err.status = 403
    throw err
  }

  const bedienstete = await prisma.bedienstete.findUnique({
    where: { bediensteterID: nutzer.nutzerId },
  })
  const jetzt = new Date().toISOString()

  meta.beweismittelNachreichung = {
    ...nachreichung,
    zugewiesenAn: nutzer.nutzerId,
    zugewiesenAnName: bedienstete?.bediensteterName || nutzer.nutzerId,
    uebernommenAm: jetzt,
  }

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: meta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar: `Arbeitskorb: Beweismittel-Nachreichung übernommen (${nutzer.nutzerId}).`,
        bediensteteId: bedienstete?.id || null,
      },
    }),
  ])

  const aufgabeId = encodeAufgabeId(parsed.meldungId, parsed.typ, parsed.zeugeId)
  const neu = sammleBeweismittelAufgabeAusMeldung(
    { ...updated, gefangene: meldung.gefangene },
    nutzer,
  ).find(a => a.id === aufgabeId)

  return { data: neu, message: 'Aufgabe übernommen.' }
}

export async function uebernehmenArbeitskorbAufgabe(prisma, mockNutzer, aufgabeId) {
  const nutzer = await enrichMockNutzerStandort(prisma, mockNutzer)
  const parsed = decodeAufgabeId(aufgabeId)
  if (!parsed) {
    const err = new Error('Diese Aufgabe kann nicht übernommen werden.')
    err.status = 400
    throw err
  }

  if (parsed.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN) {
    const meldung = await prisma.meldung.findUnique({
      where: { id: parsed.meldungId },
      include: { gefangene: true },
    })
    if (!meldung) {
      const err = new Error('Meldung nicht gefunden.')
      err.status = 404
      throw err
    }
    return uebernehmenBeweismittelAufgabe(prisma, nutzer, meldung, parsed)
  }

  if (parsed.typ !== AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN) {
    const err = new Error('Diese Aufgabe kann nicht übernommen werden.')
    err.status = 400
    throw err
  }

  const meldung = await prisma.meldung.findUnique({
    where: { id: parsed.meldungId },
    include: { gefangene: true },
  })
  if (!meldung) {
    const err = new Error('Meldung nicht gefunden.')
    err.status = 404
    throw err
  }

  const meta = { ...(meldung.metadaten || {}) }
  const { idx, gruppen, fa } = findGruppenAufgabeMeta(meta, parsed.zeugeId)
  if (idx < 0) {
    const err = new Error('Gruppenaufgabe nicht gefunden.')
    err.status = 404
    throw err
  }

  const ga = gruppen[idx]
  if (ga.status === 'ERLEDIGT') {
    const err = new Error('Diese Aufgabe ist bereits abgeschlossen.')
    err.status = 409
    throw err
  }
  if (ga.uebernommenVon && ga.uebernommenVon !== nutzer.nutzerId) {
    const err = new Error('Diese Aufgabe wurde bereits von einer anderen Person übernommen.')
    err.status = 409
    throw err
  }
  if (!passtNutzerZuGruppe(nutzer, ga)) {
    const err = new Error('Sie gehören nicht zur zuständigen Abteilung für diese Aufgabe.')
    err.status = 403
    throw err
  }

  const bedienstete = await prisma.bedienstete.findUnique({
    where: { bediensteterID: nutzer.nutzerId },
  })
  const jetzt = new Date().toISOString()

  gruppen[idx] = {
    ...ga,
    uebernommenVon: nutzer.nutzerId,
    uebernommenVonName: bedienstete?.bediensteterName || nutzer.nutzerId,
    uebernommenAm: jetzt,
  }
  meta.zeugenFolgeaktionen = { ...fa, gruppenAufgaben: gruppen }

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: meta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar: `Arbeitskorb: Gruppenaufgabe Zeugenaussage übernommen (${nutzer.nutzerId}).`,
        bediensteteId: bedienstete?.id || null,
      },
    }),
  ])

  const neu = (await sammleAufgabenFuerMeldung(
    prisma,
    { ...updated, gefangene: meldung.gefangene },
    nutzer,
  )).find(a => a.id === aufgabeId && a.zuweisung === ZUWEISUNG.PERSOENLICH)

  return { data: neu, message: 'Aufgabe übernommen.' }
}

export async function zuweisenArbeitskorbAufgabe(prisma, mockNutzer, aufgabeId, { zugewiesenAn, kommentar } = {}) {
  if (!mockNutzer.istVAL && !mockNutzer.istAL) {
    const err = new Error('Nur VAL/AL dürfen Arbeitskorb-Aufgaben zuweisen.')
    err.status = 403
    throw err
  }

  const zurueckAnGruppe = zugewiesenAn === null || zugewiesenAn === ''
  let zielBedienstete = null
  if (!zurueckAnGruppe) {
    zielBedienstete = await validateZuweisungsZiel(prisma, mockNutzer, zugewiesenAn)
  }

  const parsed = decodeAufgabeId(aufgabeId)
  if (!parsed) {
    const err = new Error('Diese Aufgabe kann nicht zugewiesen werden.')
    err.status = 400
    throw err
  }

  const meldung = await prisma.meldung.findUnique({
    where: { id: parsed.meldungId },
    include: { gefangene: true },
  })
  if (!meldung) {
    const err = new Error('Meldung nicht gefunden.')
    err.status = 404
    throw err
  }

  const zuweiser = await prisma.bedienstete.findUnique({
    where: { bediensteterID: mockNutzer.nutzerId },
  })
  const jetzt = new Date().toISOString()
  let meta = { ...(meldung.metadaten || {}) }
  let alterEmpfaengerId = null
  let zuweisungText = ''

  if (parsed.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN) {
    const nachreichung = meta.beweismittelNachreichung
    if (!nachreichung || nachreichung.status === 'ERLEDIGT') {
      const err = new Error('Beweismittel-Aufgabe nicht gefunden.')
      err.status = 404
      throw err
    }
    alterEmpfaengerId = nachreichung.zugewiesenAn || meta.zugewiesenAn || null
    if (zurueckAnGruppe) {
      meta = setMeldungZuweisung(meta, {
        zielId: null,
        vonId: mockNutzer.nutzerId,
        vonName: zuweiser?.bediensteterName,
        jetzt,
        inGruppenpostfach: true,
      })
      zuweisungText = 'Arbeitskorb: Beweismittel-Nachreichung zurück an Gruppe gegeben'
    } else {
      meta = setMeldungZuweisung(meta, {
        zielId: zielBedienstete.bediensteterID,
        zielName: zielBedienstete.bediensteterName,
        vonId: mockNutzer.nutzerId,
        vonName: zuweiser?.bediensteterName,
        jetzt,
      })
      zuweisungText = `Arbeitskorb: Beweismittel-Nachreichung zugewiesen an ${zielBedienstete.bediensteterName} (${zielBedienstete.bediensteterID})`
    }
  } else if (parsed.typ === AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN) {
    const { idx, gruppen } = findGruppenAufgabeMeta(meta, parsed.zeugeId)
    if (idx < 0) {
      const err = new Error('Gruppenaufgabe nicht gefunden.')
      err.status = 404
      throw err
    }
    const ga = gruppen[idx]
    if (ga.status === 'ERLEDIGT') {
      const err = new Error('Diese Aufgabe ist bereits abgeschlossen.')
      err.status = 409
      throw err
    }
    alterEmpfaengerId = ga.uebernommenVon || null
    if (zurueckAnGruppe) {
      const res = setGruppenAufgabeZuweisung(meta, parsed.zeugeId, {
        vonId: mockNutzer.nutzerId,
        jetzt,
        freigeben: true,
      })
      meta = res.meta
      zuweisungText = 'Arbeitskorb: Zeugenaussage-Aufgabe zurück an Gruppe gegeben'
    } else {
      const res = setGruppenAufgabeZuweisung(meta, parsed.zeugeId, {
        zielId: zielBedienstete.bediensteterID,
        zielName: zielBedienstete.bediensteterName,
        vonId: mockNutzer.nutzerId,
        vonName: zuweiser?.bediensteterName,
        jetzt,
      })
      meta = res.meta
      zuweisungText = `Arbeitskorb: Zeugenaussage-Aufgabe zugewiesen an ${zielBedienstete.bediensteterName} (${zielBedienstete.bediensteterID})`
    }
  } else {
    const err = new Error('Diese Aufgabe kann nicht zugewiesen werden.')
    err.status = 400
    throw err
  }

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: meta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar: [zuweisungText, kommentar?.trim()].filter(Boolean).join(' – '),
        bediensteteId: zuweiser?.id || null,
      },
    }),
  ])

  await benachrichtigeZuweisung(prisma, {
    meldung,
    zielId: zurueckAnGruppe ? null : zielBedienstete.bediensteterID,
    zielName: zurueckAnGruppe ? null : zielBedienstete.bediensteterName,
    alterEmpfaengerId,
    kommentar: kommentar?.trim(),
    aufgabeId,
    vonNutzerId: mockNutzer.nutzerId,
  })

  const zielNutzer = zurueckAnGruppe
    ? mockNutzer
    : {
      ...mockNutzer,
      nutzerId: zielBedienstete.bediensteterID,
      nutzerHaus: zielBedienstete.haus,
      nutzerJva: zielBedienstete.bediensteterJVA,
    }
  const angereichert = await enrichMockNutzerStandort(prisma, zielNutzer)
  const neu = (await sammleAufgabenFuerMeldung(
    prisma,
    { ...updated, gefangene: meldung.gefangene },
    angereichert,
  )).find(a => a.id === aufgabeId)

  return {
    data: neu || null,
    message: zurueckAnGruppe ? 'Aufgabe an Gruppe zurückgegeben.' : 'Aufgabe zugewiesen.',
  }
}

export async function abschliessenArbeitskorbAufgabe(prisma, mockNutzer, aufgabeId, body) {
  const nutzer = await enrichMockNutzerStandort(prisma, mockNutzer)
  const parsed = decodeAufgabeId(aufgabeId)
  if (!parsed) {
    const err = new Error('Ungültige Aufgaben-ID.')
    err.status = 400
    throw err
  }

  const meldung = await prisma.meldung.findUnique({
    where: { id: parsed.meldungId },
    include: { gefangene: true },
  })
  if (!meldung) {
    const err = new Error('Meldung nicht gefunden.')
    err.status = 404
    throw err
  }

  const alle = await sammleAufgabenFuerMeldung(prisma, meldung, nutzer)
  const aufgabe = alle.find(a => a.id === aufgabeId)
  if (!aufgabe) {
    const err = new Error('Aufgabe nicht gefunden oder nicht für Sie bestimmt.')
    err.status = 404
    throw err
  }
  if (aufgabe.status === 'ERLEDIGT') {
    const err = new Error('Diese Aufgabe ist bereits abgeschlossen.')
    err.status = 409
    throw err
  }

  const bedienstete = await prisma.bedienstete.findUnique({
    where: { bediensteterID: nutzer.nutzerId },
  })

  if (parsed.typ === AUFGABEN_TYPEN.FACHLICHE_PRUEFUNG) {
    if (!darfPruefAufgabenSehen(nutzer)) {
      const err = new Error('Keine Berechtigung für fachliche Prüfung.')
      err.status = 403
      throw err
    }
    if (!['SUBMITTED', 'FORWARDED'].includes(meldung.status)) {
      const err = new Error('Die Meldung ist nicht mehr zur Prüfung vorgemerkt.')
      err.status = 409
      throw err
    }
    if (!istPruefbereit(meldung)) {
      const err = new Error('Es liegen noch nicht alle Zeugenaussagen vor.')
      err.status = 409
      throw err
    }

    const kommentar = body?.kommentar?.trim()
      || `Arbeitskorb: Fachliche Prüfung aufgenommen (${nutzer.nutzerId}).`

    const [updated] = await prisma.$transaction([
      prisma.meldung.update({
        where: { id: meldung.id },
        data: { status: 'IN_PROGRESS' },
      }),
      prisma.statusVerlauf.create({
        data: {
          meldungId: meldung.id,
          status: 'IN_PROGRESS',
          kommentar,
          bediensteteId: bedienstete?.id || null,
        },
      }),
    ])

    await benachrichtigeNaechstenProzessschritt(prisma, {
      ...updated,
      gefangene: meldung.gefangene,
      metadaten: meldung.metadaten,
      meldungsTyp: meldung.meldungsTyp,
      ervRelevant: meldung.ervRelevant,
      xJustizVersand: meldung.xJustizVersand,
      veraktungen: meldung.veraktungen,
    })

    const neu = (await sammleAufgabenFuerMeldung(
      prisma,
      { ...updated, gefangene: meldung.gefangene, metadaten: meldung.metadaten },
      nutzer,
    )).find(a => a.id === aufgabeId)

    return {
      data: neu ? { ...neu, status: 'ERLEDIGT', meldungsStatus: 'IN_PROGRESS' } : null,
      message: 'Fachliche Prüfung aufgenommen.',
    }
  }

  if (parsed.typ === AUFGABEN_TYPEN.BEWEISMITTEL_NACHREICHEN) {
    if (meldung.status !== 'DRAFT') {
      const err = new Error('Die Meldung ist nicht mehr im Entwurfsstatus.')
      err.status = 409
      throw err
    }

    const meta = { ...(meldung.metadaten || {}) }
    const nachreichung = meta.beweismittelNachreichung
    if (!nachreichung || nachreichung.status === 'ERLEDIGT') {
      const err = new Error('Beweismittel-Aufgabe nicht gefunden.')
      err.status = 404
      throw err
    }

    const zustaendig = nachreichung.zugewiesenAn || nachreichung.erfassenderAn
    if (zustaendig && zustaendig !== nutzer.nutzerId) {
      const err = new Error('Diese Aufgabe ist einer anderen Person zugewiesen.')
      err.status = 403
      throw err
    }
    if (!zustaendig && !passtNutzerZuStation(meldung, nutzer)) {
      const err = new Error('Sie gehören nicht zur zuständigen Station für diese Aufgabe.')
      err.status = 403
      throw err
    }

    const {
      beweismittelGesichert,
      beweismittelAngaben,
      beweismittelKeineBegruendung,
    } = body || {}

    const metaUpdate = {
      ...meta,
      beweismittelGesichert: beweismittelGesichert || meta.beweismittelGesichert,
      beweismittelAngaben: beweismittelAngaben ?? meta.beweismittelAngaben,
      beweismittelKeineBegruendung: beweismittelKeineBegruendung ?? meta.beweismittelKeineBegruendung,
    }

    const validierungsFehler = validiereBeweismittelNachreichungAbschluss(metaUpdate)
    if (validierungsFehler) {
      const err = new Error(validierungsFehler)
      err.status = 400
      throw err
    }

    const { meldung: updated } = await einreichenNachBeweismittelNachreichung(prisma, {
      meldung,
      meta: metaUpdate,
      nutzerId: nutzer.nutzerId,
      bediensteteId: bedienstete?.id || null,
      kommentar: `Arbeitskorb: Beweismittel-Nachreichung abgeschlossen (${nutzer.nutzerId}).`,
    })

    const neu = (await sammleAufgabenFuerMeldung(
      prisma,
      { ...updated, gefangene: meldung.gefangene },
      nutzer,
    )).find(a => a.id === aufgabeId)

    return {
      data: neu ? { ...neu, status: 'ERLEDIGT', meldungsStatus: 'SUBMITTED' } : null,
      message: 'Beweismittel-Nachreichung abgeschlossen und Meldung eingereicht.',
    }
  }

  if (parsed.typ === AUFGABEN_TYPEN.ZEUGENAUSSAGE_INHAFTIERTER_ERFASSEN) {
    const { aussage } = body || {}
    if (isRichTextEmpty(aussage)) {
      const err = new Error('Bitte halten Sie die Zeugenaussage fest.')
      err.status = 400
      throw err
    }

    const meta = { ...(meldung.metadaten || {}) }
    const { idx, gruppen, fa } = findGruppenAufgabeMeta(meta, parsed.zeugeId)
    if (idx < 0) {
      const err = new Error('Gruppenaufgabe nicht gefunden.')
      err.status = 404
      throw err
    }

    const ga = gruppen[idx]
    if (!ga.uebernommenVon || ga.uebernommenVon !== nutzer.nutzerId) {
      const err = new Error('Bitte übernehmen Sie die Aufgabe zuerst.')
      err.status = 409
      throw err
    }

    const zeugen = Array.isArray(meta.zeugen) ? [...meta.zeugen] : []
    const zIdx = zeugen.findIndex(z => z.id === parsed.zeugeId)
    if (zIdx < 0) {
      const err = new Error('Zeuge nicht in der Meldung gefunden.')
      err.status = 404
      throw err
    }

    const jetzt = new Date().toISOString()
    zeugen[zIdx] = {
      ...zeugen[zIdx],
      aussage: String(aussage).trim(),
      aussageAufgenommenAm: jetzt,
      aussageAufgenommenVon: nutzer.nutzerId,
    }

    gruppen[idx] = {
      ...ga,
      status: 'ERLEDIGT',
      erledigtAm: jetzt,
      erledigtVon: nutzer.nutzerId,
    }
    meta.zeugen = zeugen
    meta.zeugenFolgeaktionen = { ...fa, gruppenAufgaben: gruppen }

    const vorherVollstaendig = alleZeugenaussagenVollstaendig(meldung.metadaten)
    const [updated] = await prisma.$transaction([
      prisma.meldung.update({
        where: { id: meldung.id },
        data: { metadaten: meta },
      }),
      prisma.statusVerlauf.create({
        data: {
          meldungId: meldung.id,
          status: meldung.status,
          kommentar: `Arbeitskorb: Zeugenaussage Inhaftierte/r aufgenommen (${nutzer.nutzerId}).`,
          bediensteteId: bedienstete?.id || null,
        },
      }),
    ])
    if (!vorherVollstaendig) {
      await benachrichtigeNaechstenProzessschritt(prisma, {
        ...updated,
        gefangene: meldung.gefangene,
        fallId: meldung.fallId,
        meldungsTyp: meldung.meldungsTyp,
        meldungsNr: meldung.meldungsNr,
        metadaten: meta,
      })
    }

    const neu = sammlePersoenlicheAufgabenAusMeldung(
      { ...updated, gefangene: meldung.gefangene },
      nutzer,
    ).find(a => a.id === aufgabeId)

    return { data: neu ? { ...neu, status: 'ERLEDIGT' } : null, message: 'Aufgabe abgeschlossen.' }
  }

  if (parsed.typ !== AUFGABEN_TYPEN.ZEUGENAUSSAGE_BESTAETIGEN) {
    const err = new Error('Dieser Aufgabentyp ist nicht mehr verfügbar.')
    err.status = 410
    throw err
  }

  const { aussage, bestaetigt } = body || {}
  if (isRichTextEmpty(aussage)) {
    const err = new Error('Bitte halten Sie die Zeugenaussage fest.')
    err.status = 400
    throw err
  }

  const meta = { ...(meldung.metadaten || {}) }
  const zeugen = Array.isArray(meta.zeugen) ? [...meta.zeugen] : []
  const zIdx = zeugen.findIndex(z => z.id === parsed.zeugeId)
  if (zIdx < 0) {
    const err = new Error('Zeuge nicht in der Meldung gefunden.')
    err.status = 404
    throw err
  }

  const jetzt = new Date().toISOString()
  const fa = { ...(meta.zeugenFolgeaktionen || {}) }

  if (bestaetigt !== true) {
    const err = new Error('Bitte bestätigen Sie die Richtigkeit Ihrer Zeugenaussage.')
    err.status = 400
    throw err
  }

  zeugen[zIdx] = {
    ...zeugen[zIdx],
    aussage: String(aussage).trim(),
    aussageBestaetigtAm: jetzt,
    aussageBestaetigtVon: nutzer.nutzerId,
  }

  const benachr = (fa.bediensteteBenachrichtigungen || []).map(b => {
    if (b.zeugeId !== parsed.zeugeId) return b
    return {
      ...b,
      status: 'ERLEDIGT',
      erledigtAm: jetzt,
      erledigtVon: nutzer.nutzerId,
    }
  })
  fa.bediensteteBenachrichtigungen = benachr

  meta.zeugen = zeugen
  meta.zeugenFolgeaktionen = fa

  const kommentar = `Arbeitskorb: Zeugenaussage bestätigt (${nutzer.nutzerId}).`
  const vorherVollstaendig = alleZeugenaussagenVollstaendig(meldung.metadaten)

  const [updated] = await prisma.$transaction([
    prisma.meldung.update({
      where: { id: meldung.id },
      data: { metadaten: meta },
    }),
    prisma.statusVerlauf.create({
      data: {
        meldungId: meldung.id,
        status: meldung.status,
        kommentar,
        bediensteteId: bedienstete?.id || null,
      },
    }),
  ])

  if (!vorherVollstaendig) {
    await benachrichtigeNaechstenProzessschritt(prisma, {
      ...updated,
      gefangene: meldung.gefangene,
      fallId: meldung.fallId,
      meldungsTyp: meldung.meldungsTyp,
      meldungsNr: meldung.meldungsNr,
      metadaten: meta,
    })
  }

  const neu = sammlePersoenlicheAufgabenAusMeldung(
    { ...updated, gefangene: meldung.gefangene },
    nutzer,
  ).find(a => a.id === aufgabeId)

  return { data: neu, message: 'Aufgabe abgeschlossen.' }
}
