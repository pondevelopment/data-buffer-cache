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
import DataBufferController from '../DataBufferController.js'
import Cache from '../Cache.js'

const logger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  error: () => {}
}

describe('Test the Controller', () => {
  test('The timer should call the CacheClean function periodically', () => {
    const cache = new Cache()
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date(2020, 12, 5, 20, 0, 0))
    const cleanSpy = jest.fn()
    const ttl = 2
    const controller = new DataBufferController({ logger, ttl, cache })
    controller.logger.trace = (txt) => cleanSpy(txt)
    expect(cleanSpy).toHaveBeenCalledTimes(0)
    expect(controller.size).toBe(0)
    jest.advanceTimersByTime(ttl * 200 * 2)
    expect(cleanSpy).toHaveBeenCalledTimes(2)
    expect(cleanSpy).toHaveBeenLastCalledWith('Cleanup Caches')

    controller.get('test1')
    expect(controller.size).toBe(1)
    controller.set('test1', { test: true })
    jest.setSystemTime(new Date(2020, 12, 5, 20, 10, 1))
    jest.advanceTimersByTime(ttl * 200 * 2)
    expect(controller.size).toBe(0)
    controller.close()
  })

  test('Test the Cache emitters', () => {
    const cache = new Cache()

    const cleanSpy1 = jest.fn()
    const cleanSpy2 = jest.fn()
    const loggerSpy = {
      error: (txt) => cleanSpy1(txt),
      debug: (txt) => cleanSpy2(txt),
      trace: (txt) => {},
      info: (txt) => {}
    }

    const ttl = 2
    const controller = new DataBufferController({ logger: loggerSpy, cache, ttl, raceTime: 20 })

    expect(cleanSpy2).toHaveBeenCalledTimes(2)
    expect(cleanSpy2).toHaveBeenCalledWith('Cache is Connected')
    expect(cleanSpy2).toHaveBeenLastCalledWith('Cache is Ready')
    cache.emit('error', 'Emitted Error')
    expect(cleanSpy1).toHaveBeenCalledTimes(2)
    expect(cleanSpy1).toHaveBeenCalledWith('CACHE ERROR')
    expect(cleanSpy1).toHaveBeenLastCalledWith('Emitted Error')
    controller.close()
    expect(cleanSpy2).toHaveBeenCalledWith('Stopping DataBufferController')
    expect(cleanSpy2).toHaveBeenLastCalledWith('Cache connection is closed')
  })
})
