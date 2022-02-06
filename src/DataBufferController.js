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

/**
 * A Logger definition
 * @typedef {Object} Logger
 * @property {function(txt):void} info - log info information
 * @property {function(txt):void} debug - log debug information
 * @property {function(txt):void} trace - log trace information
 * @property {function(txt):void} warn - log warn information
 * @property {function(txt):void} error - log error information
 */

export default class DataBufferController {
  #items
  #cache
  #intervalRef

  /* eslint-disable valid-jsdoc */
  /**
   * Setup the Controller
   *
   * @param {object} obj
   * @param {import('./Cache.js').default} obj.cache -  A Cache object
   * @param {Logger} obj.logger -  A Logger object
   * @param {number} obj.ttl -  Time To Live in seconds
   * @param {number} obj.raceTime -  How long a request can be queued, before it is ignored and retried in seconds
   * @throws {Error} When the cache is not set
   */ /* eslint-enable valid-jsdoc */
  constructor ({ cache, logger = console, ttl = 300, raceTime = 30 }) {
    this.#items = {}
    this.ttl = ttl
    this.logger = logger
    this.raceTime = raceTime

    if (!cache) throw new Error('Cache is not set.')
    this.#cache = cache

    // start the cache
    this.cacheStart()

    // remove expired caches, call every 1/5 of the stdTTL
    this.#intervalRef = setInterval(this.cleanUp.bind(this), this.ttl * 200)
  }

  // cleanup
  close () {
    this.logger.debug('Stopping DataBufferController')
    this.#items = null
    clearInterval(this.#intervalRef)
  }

  /**
   * Sets a key with a value to the cache
   *
   * @param {string} key
   * @param {object|array} value
   * @param {number} ttl
   * @returns {any} - The result of the set function
   */
  set (key, value, ttl) {
    return this.getBuffer(key).set(value, ttl | this.ttl)
  }

  /**
   * Gets the data belonging to the key.
   * The Promise resolves to undefined if the data is not found, or the data expired.
   * If that happens you can fetch the data from an external source and set it,
   * waiting processes will resolve when the data is set.
   *
   * @param {string} key
   * @returns {Promise}
   */
  get (key) {
    return this.getBuffer(key).get()
  }

  // connect the cache and setup some catching
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

  // expire caches that are overdue
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

  // returns the size of the cache, usefull for tests
  get size () {
    return Object.keys(this.#items).length
  }
}
