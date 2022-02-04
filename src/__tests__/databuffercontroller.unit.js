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

const logger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  error: () => {}
}

const controller = new DataBufferController({ logger, ttl: 2 })

afterAll(() => controller.close())

describe('Test the Controller', () => {
  test('The basic functionallity', async () => {
    const key = 'controller_test'
    const expected = await controller.get(key)
    expect(expected).toEqual(undefined)
    await controller.set(key, { found: true }, 60)

    const expected2 = await controller.get(key)
    expect(expected2).toEqual({ found: true })
  })

  test('', async () => {
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
