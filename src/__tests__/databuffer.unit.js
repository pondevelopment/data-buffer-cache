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
  test.each(['test', 1, undefined, null])('Throw an error when set value is not an object', async (a) => {
    const buffer = new DataBuffer({ key: 'test', cache, logger })
    await expect(buffer.set(a)).rejects.toThrow('value should be an object')
  })

  test('', async () => {
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
