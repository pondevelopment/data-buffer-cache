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

import { expect, describe, test, jest } from '@jest/globals'
import Cache from '../Cache.js'

describe('Test the cache mock', () => {
  const cache = new Cache()

  test('Set and get the cache', async () => {
    const data = { a: 'b' }
    await cache.set('1', data)
    const expected = await cache.get('1')
    expect(expected).toEqual(data)
  })

  test('Get unkown key from the cache', async () => {
    const expected = await cache.get('5')
    expect(expected).toEqual(null)
  })

  test('Test if the cache key exists', async () => {
    const data = { a: 'b' }
    await cache.set('2', data)
    const expected2 = await cache.exists('2')
    expect(expected2).toEqual(true)
    const expected3 = await cache.exists('3')
    expect(expected3).toEqual(false)
  })

  test('Test if the cache key can be deleted', async () => {
    const data = { a: 'b' }
    await cache.set('3', data)
    const expected3 = await cache.exists('3')
    expect(expected3).toEqual(true)
    await cache.del('3')
    const expected3del = await cache.exists('3')
    expect(expected3del).toEqual(false)
  })

  test('Test if an unkown cache key can be deleted', async () => {
    const expecting = await cache.del('unkown')
    expect(expecting).toEqual(false)
  })
})

describe('Test the cache mock emitter', () => {
  const cache = new Cache()

  test('Event handler', async () => {
    const connectSpy = jest.fn()
    const readySpy = jest.fn()
    const endSpy = jest.fn()

    cache.on('connect', connectSpy)
    cache.on('ready', readySpy)
    cache.on('end', endSpy)

    await cache.connect()
    await cache.quit()

    expect(connectSpy).toHaveBeenCalledTimes(1)
    expect(readySpy).toHaveBeenCalledTimes(1)
    expect(endSpy).toHaveBeenCalledTimes(1)

    await cache.connect()
    await cache.disconnect()

    expect(connectSpy).toHaveBeenCalledTimes(2)
    expect(readySpy).toHaveBeenCalledTimes(2)
    expect(endSpy).toHaveBeenCalledTimes(2)
  })
})
