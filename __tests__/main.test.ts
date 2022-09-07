import {test} from '@jest/globals'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

test('forker action runs with env inputs', () => {
  process.env['INPUT_OWNER'] = 'tremor-rs'
  process.env['INPUT_REPO'] = 'tremor-bot'
  process.env['INPUT_ORG'] = 'wayfair-contribs'
  process.env['INPUT_CHECKUSER'] = 'false'
  process.env['INPUT_PROMOTEUSER'] = 'false'
  process.env['INPUT_LICENSEALLOWLIST'] =
    '0bsd\napache-2.0\nbsd-2-clause\nbsd-3-clause\nmit'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
