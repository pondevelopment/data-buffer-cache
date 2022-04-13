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

import { expect, describe, test, afterAll } from '@jest/globals'
import DataBufferController from '../DataBufferController.js'
import Cache from '../Cache.js'

const logger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  error: () => {}
}

const cache = new Cache()
const controller = new DataBufferController({ logger, ttl: 2, cache })

afterAll(() => controller.close())

describe('Test the Controller', () => {
  test('If the controller throws an error when the cache is not set', () => {
    expect(() => new DataBufferController({ logger, ttl: 1 })).toThrow('Cache is not provided.')
  })

  test.each([
    [{ logger, cache }, { ttl: 300, raceTime: 30000 }],
    [{ logger, cache, ttl: 200 }, { ttl: 200, raceTime: 30000 }],
    [{ logger, cache, raceTime: 20 }, { ttl: 300, raceTime: 20 }],
    [{ logger, cache, raceTime: 20, ttl: 200 }, { ttl: 200, raceTime: 20 }],
    [{ cache }, { ttl: 300, raceTime: 30000 }]
  ])('Basic initialization', (params, expected) => {
    const dbc = new DataBufferController(params)
    expect(dbc.ttl).toEqual(expected.ttl)
    expect(dbc.raceTime).toEqual(expected.raceTime)
    expect(dbc.logger).toBeDefined()
    dbc.close()
  })

  test('The basic functionallity', async () => {
    const key = 'controller_test'
    const expected = await controller.get(key)
    expect(expected).toEqual(undefined)
    await controller.set(key, { found: true }, 60)

    const expected2 = await controller.get(key)
    expect(expected2).toEqual({ found: true })
  })

  test('The sequential requests should be queued and waiting till the cache has been set', async () => {
    const key = 'test2'
    const list = [
      controller.get(key),
      controller.get(key),
      controller.get(key),
      controller.get(key),
      controller.get(key),
      controller.get(key),
      controller.get(key),
      controller.get(key),
      controller.get(key),
      controller.get(key)
    ]
    const expected = await list[0]
    expect(expected).toBe(undefined)
    controller.set(key, { found: true })
    const expected2 = await Promise.all(list)
    expect(expected2.filter(item => item).length).toBe(9)
  })
})
