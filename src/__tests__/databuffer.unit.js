// Copyright 2022 Pon Holding

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { expect, describe, test } from '@jest/globals'
import DataBuffer from '../DataBuffer.js'
import Cache from '../Cache.js'

const cache = new Cache()
const logger = {
  trace: () => {},
  debug: () => {}
}

describe('Test the DataBuffer', () => {
  test.each([
    [{ key: '42', cache, logger }, { ttl: 300, raceTimeMs: 30000 }],
    [{ key: '42', cache, logger, ttl: 200 }, { ttl: 200, raceTimeMs: 30000 }],
    [{ key: '42', cache, logger, raceTimeMs: 20 }, { ttl: 300, raceTimeMs: 20 }],
    [{ key: '42', cache, logger, raceTimeMs: 20, ttl: 200 }, { ttl: 200, raceTimeMs: 20 }],
    [{ key: '42', cache }, { ttl: 300, raceTimeMs: 30000 }]
  ])('Basic initialization', (params, expected) => {
    const db = new DataBuffer(params)
    expect(db.ttl).toEqual(expected.ttl)
    expect(db.raceTimeMs).toEqual(expected.raceTimeMs)
    expect(db.raceTimeInSeconds).toEqual(expected.raceTimeMs / 1000)
    expect(db.logger).toBeDefined()
    db.cleanUp()
  })

  test('If the data is undefined, return undefined', async () => {
    const undefinedCache = new Cache()
    undefinedCache.get = async (key) => undefined
    const buffer = new DataBuffer({ key: 'undefined', cache: undefinedCache, logger })

    const expected1 = await buffer.waitForResponse()
    expect(expected1).toBe(undefined)
    expect(buffer.status).toBe('running')

    const expected2 = buffer.waitForResponse()
    await buffer.set({ found: true }) // set status to finished
    expect(buffer.status).toBe('finished')
    expect(expected2).resolves.toEqual(undefined)
  })

  test('If the data is not an object, reject with undefined', async () => {
    const stringCache = new Cache()
    stringCache.get = async (key) => 'string'
    const buffer = new DataBuffer({ key: 'undefined', cache: stringCache, logger })

    const expected1 = await buffer.waitForResponse()
    expect(expected1).toBe(undefined)
    expect(buffer.status).toBe('running')

    const expected2 = buffer.waitForResponse()
    await buffer.set({ found: true }) // set status to finished
    expect(buffer.status).toBe('finished')
    expect(expected2).resolves.toEqual(undefined)
  })

  test.each(['test', 1, undefined, null])('Throw an error when set value is not an object', async (a) => {
    const buffer = new DataBuffer({ key: 'test', cache, logger })
    await expect(buffer.set(a)).rejects.toThrow('value should be an object')
  })

  test('If the data has expired after te exist test, the get should respond with an undefined', async () => {
    const buffer = new DataBuffer({ key: 'test', cache, logger })
    await buffer.set({ found: true }) // set status to finished
    await cache.del('test') // delete the data
    const expected = await buffer.waitForResponse() // skip the exists
    expect(expected).toEqual(undefined)
  })

  test('Set and get the cache', async () => {
    const buffer = new DataBuffer({ key: 'test', cache, logger })
    const expected = await buffer.get()
    expect(expected).toBe(undefined)
    const data = { test: 42 }
    await buffer.set(data)
    const expected2 = await buffer.get()
    expect(expected2).toEqual(data)
    const expected3 = await cache.get('test')
    expect(expected3).toEqual(JSON.stringify(data))
  })

  test('It should queue bulk requests', async () => {
    const buffer = new DataBuffer({ key: 'test2', cache, logger })
    const list = [
      buffer.get(),
      buffer.get(),
      buffer.get(),
      buffer.get(),
      buffer.get(),
      buffer.get(),
      buffer.get(),
      buffer.get(),
      buffer.get(),
      buffer.get()
    ]

    const first = await list[0]
    expect(first).toBe(undefined)

    buffer.set({ found: true })
    const result = await Promise.all(list)
    expect(result.filter(l => l !== undefined).length).toEqual(9)
  })
})
