import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

function decodeBase64Url(value) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

export function inspectJwt(token) {
  if (typeof token !== 'string' || !token.trim()) {
    return { valid: false, reason: 'missing' }
  }

  const parts = token.trim().split('.')
  if (parts.length < 2) {
    return { valid: false, reason: 'malformed' }
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    if (typeof payload.exp === 'number' && now >= payload.exp) {
      return { valid: false, reason: 'expired', expiresAt: payload.exp }
    }

    return { valid: true, reason: 'valid', expiresAt: typeof payload.exp === 'number' ? payload.exp : null }
  } catch {
    return { valid: false, reason: 'unreadable' }
  }
}

async function promptForFreshJwt(label, reason) {
  const rl = readline.createInterface({ input, output })

  try {
    const confirmation = (await rl.question(`${label} JWT is ${reason}. Enter a new one now? [y/N] `)).trim().toLowerCase()
    if (confirmation !== 'y' && confirmation !== 'yes') {
      throw new Error(`No fresh ${label} JWT provided`)
    }

    const token = (await rl.question(`Paste ${label} JWT: `)).trim()
    const validation = inspectJwt(token)
    if (!validation.valid) {
      throw new Error(`Provided ${label} JWT is ${validation.reason}`)
    }

    return token
  } finally {
    rl.close()
  }
}

export async function loadJwtToken({
  label,
  envNames = [],
  argvValue,
} = {}) {
  const candidates = []

  if (typeof argvValue === 'string' && argvValue.trim()) {
    candidates.push({ source: 'argv', token: argvValue.trim() })
  }

  for (const envName of envNames) {
    const envToken = process.env[envName]
    if (typeof envToken === 'string' && envToken.trim()) {
      candidates.push({ source: envName, token: envToken.trim() })
    }
  }

  for (const candidate of candidates) {
    const validation = inspectJwt(candidate.token)
    if (validation.valid) {
      return candidate.token
    }
  }

  const existing = candidates[0]
  const reason = existing ? inspectJwt(existing.token).reason : 'missing'
  return promptForFreshJwt(label, reason)
}