/**
 * One-command runner for scripts/demo-security-tests.mjs.
 *
 * It starts five throw-away servers from the production build (.output), each with different demo settings,
 * creates a random secret in memory (never printed or written to disk), runs the tests, and stops the servers.
 *
 * Usage (works in PowerShell, cmd and bash):
 *   1. Stop `npm run dev` if it is running (the build writes to .nuxt/.output).
 *   2. npm run build
 *   3. node scripts/run-demo-tests.mjs
 *
 * Local tests only. They do not prove how a deployment behaves behind a CDN or across serverless instances.
 */
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const entry = resolve('.output/server/index.mjs')
if (!existsSync(entry)) {
  console.error('Missing .output/server/index.mjs. Run "npm run build" first (and stop "npm run dev").')
  process.exit(2)
}

const secret = randomBytes(32).toString('hex')
const base = (port) => `http://127.0.0.1:${port}`
const servers = [
  { name: 'ON', port: 5190, env: { NUXT_DEMO_ENABLED: 'true', NUXT_DEMO_SESSION_SECRET: secret, NUXT_PUBLIC_DEMO: 'true' } },
  { name: 'OFF', port: 5191, env: { NUXT_DEMO_SESSION_SECRET: secret } },
  { name: 'NOSECRET', port: 5192, env: { NUXT_DEMO_ENABLED: 'true' } },
  { name: 'SHORT', port: 5193, env: { NUXT_DEMO_ENABLED: 'true', NUXT_DEMO_SESSION_SECRET: 'short' } },
  {
    name: 'NODB',
    port: 5194,
    env: { NUXT_DEMO_ENABLED: 'true', NUXT_DEMO_SESSION_SECRET: secret, NUXT_DB_PATH: 'Q:/lumina-test-nodb/x.sqlite' },
  },
]

const children = []
const stopAll = () => children.forEach((c) => { try { c.kill() } catch { /* already stopped */ } })
process.on('SIGINT', () => { stopAll(); process.exit(130) })

async function waitFor(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { if ((await fetch(url)).ok) return true } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000))
  }
  return false
}

// Start the first server alone so it creates and seeds the database; the others share the same file.
for (const [i, s] of servers.entries()) {
  const child = spawn(process.execPath, [entry], {
    env: { ...process.env, PORT: String(s.port), HOST: '127.0.0.1', ...s.env },
    stdio: 'ignore',
  })
  children.push(child)
  if (i === 0 && !(await waitFor(`${base(s.port)}/login`))) {
    console.error(`Server ${s.name} did not start.`)
    stopAll()
    process.exit(1)
  }
}
for (const s of servers.slice(1)) {
  if (!(await waitFor(`${base(s.port)}/login`))) {
    console.error(`Server ${s.name} did not start.`)
    stopAll()
    process.exit(1)
  }
}

const tests = spawn(process.execPath, ['scripts/demo-security-tests.mjs'], {
  env: {
    ...process.env,
    DEMO_SECRET: secret,
    ON: base(5190), OFF: base(5191), NOSECRET: base(5192), SHORT: base(5193), NODB: base(5194),
  },
  stdio: 'inherit',
})
tests.on('exit', (code) => {
  stopAll()
  process.exit(code ?? 1)
})
