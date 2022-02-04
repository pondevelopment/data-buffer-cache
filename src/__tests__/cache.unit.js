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
import Cache from '../Cache.js'

const cache = new Cache()

describe('Test the cache mock', () => {
  test('Set and get the cache', async () => {
    const data = { a: 'b' }
    await cache.set('1', data)
    const expected = await cache.get('1')
    expect(expected).toEqual(data)
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
})
