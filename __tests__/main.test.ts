import {run} from '../src/main'

// beforeEach(() => {
  // delete process.env[`INPUT_OWNER`]
  // delete process.env[`INPUT_REPO`]
// })

// test('action runs with required inputs', async () => {
//   process.env[`INPUT_OWNER`] = "tremor-rs"
//   process.env[`INPUT_REPO`] = "tremor-runtime"
//   await run()
// })

// test('action runs with optional inputs', async () => {
//   process.env[`INPUT_OWNER`] = "RoadieHQ"
//   process.env[`INPUT_REPO`] = "roadie-backstage-plugins"
//   process.env[`INPUT_ORG`] = "wayfair-contribs"
//   process.env[`INPUT_USER`] = "lelia"
//   process.env[`INPUT_ADDUSER`] = "true"
//   process.env[`INPUT_LICENSEWHITELIST`] = "0bsd\napache-2.0\nmit"
//   try {
//     await run()
//   } catch (err) {
//     console.log(err)
//   }
// })

test('action throws error without required inputs', async () => {
  delete process.env[`INPUT_OWNER`]
  delete process.env[`INPUT_REPO`]
  try {
    await run()
  } catch (err) {
    expect(err).toEqual(new Error("Input required and not supplied: owner"))
  }
})
