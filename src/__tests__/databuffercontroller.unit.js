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
import DataBufferController from '../DataBufferController.js'
import Cache from '../Cache.js'

const logger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  error: () => {}
}

const cache = new Cache()

describe('Test the Controller', () => {
  test('If the controller throws an error when the cache is not set', () => {
    expect(DataBufferController.create({ logger, ttl: 1 })).rejects.toThrow('Cache is not provided.')
  })

  test.each([
    [{ logger, cache }, { ttl: 300, raceTime: 30000 }],
    [{ logger, cache, ttl: 200 }, { ttl: 200, raceTime: 30000 }],
    [{ logger, cache, raceTime: 20 }, { ttl: 300, raceTime: 20 }],
    [{ logger, cache, raceTime: 20, ttl: 200 }, { ttl: 200, raceTime: 20 }],
    [{ cache }, { ttl: 300, raceTime: 30000 }]
  ])('Basic initialization', async (params, expected) => {
    const dbc = await DataBufferController.create(params)
    expect(dbc.ttl).toEqual(expected.ttl)
    expect(dbc.raceTime).toEqual(expected.raceTime)
    expect(dbc.logger).toBeDefined()
    await dbc.close()
  })

  test('The basic functionallity', async () => {
    const controller = await DataBufferController.create({ logger, ttl: 2, cache })
    const key = 'controller_test'
    const expected = await controller.get(key)
    expect(expected).toEqual(undefined)
    await controller.set(key, { found: true }, 60)

    const expected2 = await controller.get(key)
    expect(expected2).toEqual({ found: true })
    await controller.close()
  })

  test('The sequential requests should be queued and waiting till the cache has been set', async () => {
    const controller = await DataBufferController.create({ logger, ttl: 2, cache })
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
    await controller.close()
  })
})

describe('Multicontroller - single cache usecase', () => {
  test('The sequential requests should be queued, also over multiple controllers, and waiting till the cache has been set', async () => {
    const singleCache = new Cache()
    const controllerA = await DataBufferController.create({ logger, cache: singleCache, ttl: 5 })
    const controllerB = await DataBufferController.create({ logger, cache: singleCache, ttl: 5 })

    const key = 'multitest'
    const list = [
      controllerA.get(key),
      controllerA.get(key),
      controllerA.get(key),
      controllerA.get(key),
      controllerA.get(key)
    ]

    const expectedA = await list[0]
    expect(expectedA).toBe(undefined)    
    expect(controllerA.bufferStatus).toEqual(['running'])
    expect(controllerB.bufferStatus).toEqual([])

    list.push(controllerB.get(key))
    //give async job a change to initialize
    await new Promise(resolve => setTimeout(resolve, 500))

    const expectedB = list[5]
    expect(expectedB).not.toBe(undefined)
    
    list.push(controllerB.get(key))
    list.push(controllerB.get(key))
    list.push(controllerB.get(key))
    list.push(controllerB.get(key))

    expect(controllerB.bufferStatus).toEqual(['running'])

    controllerA.set(key, {found: 42})

    console.log(list)
    const expectedList = await Promise.all(list)
    console.log(expectedList)
    expect(expectedList.filter(item => item).length).toBe(9)

    await Promise.all([controllerA.close(), controllerB.close()])
  })
})
