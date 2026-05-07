export const greekUppercaseLetters: Record<string, string> = {
  ALPHA: 'Α',
  BETA: 'Β',
  GAMMA: 'Γ',
  DELTA: 'Δ',
  EPSILON: 'Ε',
  ZETA: 'Ζ',
  ETA: 'Η',
  THETA: 'Θ',
  IOTA: 'Ι',
  KAPPA: 'Κ',
  LAMBDA: 'Λ',
  MU: 'Μ',
  NU: 'Ν',
  XI: 'Ξ',
  OMICRON: 'Ο',
  PI: 'Π',
  RHO: 'Ρ',
  SIGMA: 'Σ',
  TAU: 'Τ',
  UPSILON: 'Υ',
  PHI: 'Φ',
  CHI: 'Χ',
  PSI: 'Ψ',
  OMEGA: 'Ω',
}

const normalizeCategoryName = (name: string) => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

export const getGreekUppercaseLetter = (name: string) => {
  const normalized = normalizeCategoryName(name)
  const directMatch = greekUppercaseLetters[normalized]
  if (directMatch) return directMatch

  const foundKey = Object.keys(greekUppercaseLetters).find((key) => normalized.includes(key))
  return foundKey ? greekUppercaseLetters[foundKey] : normalized.charAt(0)
}
