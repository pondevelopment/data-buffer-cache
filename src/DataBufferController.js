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

import DataBuffer from './DataBuffer.js'
import Cache from './Cache.js'

export default class DataBufferController {
  #items
  #cache
  #intervalRef

  constructor ({ cache = null, logger = console, ttl = 300, raceTime = 30 }) {
    this.#items = {}
    this.#cache = (cache) || new Cache()
    this.ttl = ttl
    this.logger = logger
    this.raceTime = raceTime

    // start the cache
    this.cacheStart()

    // remove expired caches, call every 1/5 of the stdTTL
    this.#intervalRef = setInterval(this.cleanUp.bind(this), this.ttl * 200)
  }

  close () {
    this.logger.debug('Stopping DataBufferController')
    this.#items = null
    clearInterval(this.#intervalRef)
  }

  set (key, value, ttl) {
    return this.getBuffer(key).set(value, ttl | this.ttl)
  }

  get (key) {
    return this.getBuffer(key).get()
  }

  async cacheStart () {
    this.#cache.on('connect', () => this.logger.debug('Cache is Connected'))
    this.#cache.on('ready', () => this.logger.debug('Cache is Ready'))
    this.#cache.on('error', (error) => {
      this.logger.error('CACHE ERROR')
      return this.logger.error(error)
    })
    await this.#cache.connect()
    this.logger.debug('Cache is Setup')
  }

  cleanUp () {
    this.logger.trace('Cleanup Caches')
    // collect caches that are expired
    const removals = Object.values(this.#items).filter(dataBuffer => dataBuffer.expire < Date.now())
    removals.forEach(dataBuffer => {
      dataBuffer.cleanUp()
      delete this.#items[dataBuffer.key]
      this.logger.trace(`Cache removed ${dataBuffer.key}`)
    })
  }

  /**
   * returns a DataBuffer, if it does not exists it will create one
   *
   * @param {string} key
   * @returns {DataBuffer}
   */
  getBuffer (key) {
    if (!this.#items[key]) {
      this.#items[key] = new DataBuffer({
        key,
        cache: this.#cache,
        ttl: this.ttl,
        raceTime: this.raceTime,
        logger: this.logger
      })
    }
    return this.#items[key]
  }

  get size () {
    return Object.keys(this.#items).length
  }
}
