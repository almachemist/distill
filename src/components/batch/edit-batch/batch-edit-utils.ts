export const calculateLAL = (volume: number | null, abv: number | null): number | null => {
  if (volume === null || abv === null) return null
  if (isNaN(volume) || isNaN(abv)) return null
  return Math.round((volume * abv / 100) * 10) / 10
}

export const recalcLAL = (obj: any): any => {
  if (!obj) return obj
  const vol = obj.volume_l
  const abv = obj.abv_percent
  if (vol != null && abv != null && !isNaN(vol) && !isNaN(abv) && vol > 0 && abv > 0) {
    const calculatedLAL = calculateLAL(vol, abv)
    if (calculatedLAL != null && (obj.lal == null || obj.lal === 0)) {
      return { ...obj, lal: calculatedLAL }
    }
  }
  return obj
}

export const fmt = (n: number | null | undefined) => {
  if (n === null || n === undefined) return ''
  return n.toString()
}

export const parseNum = (s: string): number | null => {
  const v = parseFloat(s)
  return isNaN(v) ? null : v
}
