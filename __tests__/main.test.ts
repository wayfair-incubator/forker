import {run} from '../src/main'

test('action throws error without required inputs', async () => {
  delete process.env[`INPUT_OWNER`]
  delete process.env[`INPUT_REPO`]
  try {
    await run()
  } catch (err) {
    expect(err).toEqual(new Error("Input required and not supplied: owner"))
  }
})
