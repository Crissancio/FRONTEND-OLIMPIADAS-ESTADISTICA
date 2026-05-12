export const greekUppercaseLetters: Record<string, string> = {
  ALPHA: '\u0391',
  BETA: '\u0392',
  GAMMA: '\u0393',
  DELTA: '\u0394',
  EPSILON: '\u0395',
  ZETA: '\u0396',
  ETA: '\u0397',
  THETA: '\u0398',
  IOTA: '\u0399',
  KAPPA: '\u039A',
  LAMBDA: '\u039B',
  MU: '\u039C',
  NU: '\u039D',
  XI: '\u039E',
  OMICRON: '\u039F',
  PI: '\u03A0',
  RHO: '\u03A1',
  SIGMA: '\u03A3',
  TAU: '\u03A4',
  UPSILON: '\u03A5',
  PHI: '\u03A6',
  CHI: '\u03A7',
  PSI: '\u03A8',
  OMEGA: '\u03A9',
}

export const greekLowercaseLetters: Record<string, string> = {
  alpha: '\u03B1',
  beta: '\u03B2',
  gamma: '\u03B3',
  delta: '\u03B4',
  epsilon: '\u03B5',
  zeta: '\u03B6',
  eta: '\u03B7',
  theta: '\u03B8',
  iota: '\u03B9',
  kappa: '\u03BA',
  lambda: '\u03BB',
  mu: '\u03BC',
  nu: '\u03BD',
  xi: '\u03BE',
  omicron: '\u03BF',
  pi: '\u03C0',
  rho: '\u03C1',
  sigma: '\u03C3',
  tau: '\u03C4',
  upsilon: '\u03C5',
  phi: '\u03C6',
  chi: '\u03C7',
  psi: '\u03C8',
  omega: '\u03C9',
}

export const greekUppercaseOptions = Object.entries(greekUppercaseLetters).map(([name, symbol]) => ({
  name,
  symbol,
  caseType: 'uppercase' as const,
}))

export const greekLowercaseOptions = Object.entries(greekLowercaseLetters).map(([name, symbol]) => ({
  name,
  symbol,
  caseType: 'lowercase' as const,
}))

export type GreekLetterOption = (typeof greekUppercaseOptions | typeof greekLowercaseOptions)[number]

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
