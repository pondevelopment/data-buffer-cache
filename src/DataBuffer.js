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

import EventEmitter from 'events'

export default class DataBuffer extends EventEmitter {
  #stdTTL
  #status = {
    init: 'init',
    running: 'running',
    finished: 'finished'
  }

  #allowedRaceTimeMS
  #currentStatus
  #cache

  /* eslint-disable valid-jsdoc */
  /**
   * Initialize the DataBuffer
   *
   * @constructor
   * @param {object} obj - Initialization of the class
   * @param {string} obj.key - The caching/buffer key
   * @param {import('./Cache.js').default} obj.cache - The cache object
   * @param {number} obj.ttl - Time To Live in seconds
   * @param {number} obj.raceTime - How long will the first request get before its been ignored in seconds
   * @param {*} obj.logger - A logger object, defaults to console
   */ /* eslint-enable valid-jsdoc */
  constructor ({ key, cache, ttl = 300, raceTime = 30, logger = console }) {
    super()
    this.key = key
    this.#allowedRaceTimeMS = raceTime * 1000
    this.#stdTTL = ttl // standard 5 minute availability
    this.setExpiry()
    this.#cache = cache
    this.#currentStatus = this.#status.init
    this.logger = logger
  }

  get ttl () {
    return this.#stdTTL
  }

  get raceTime () {
    return this.#allowedRaceTimeMS / 1000
  }

  get status () {
    return this.#currentStatus
  }

  setExpiry (ttl) {
    this.expire = Date.now() + (ttl || this.#stdTTL * 1000)
  }

  cleanUp () {
    this.removeAllListeners()
  }

  /**
   * Get the data
   * Return a promise that resolves with the data
   * or undefined when it was expired, not available or timed out
   *
   * @returns {Promise<undefined|object|Array>}
   */
  async get () {
    try {
      const result = await this.#cache.exists(this.key)
      if (result !== false) {
        this.#currentStatus = this.#status.finished
      }
    } catch (e) { }
    return this.waitForResponse()
  }

  /**
   * Set the data
   * @param {object} value - The object to put in the cache
   * @param {number} ttl - Time To Live for the cache object in seconds
   *
   * @returns {Promise} - The result of the Cache set Method
   */
  async set (value, ttl = this.#stdTTL) {
    if (!value || (value.constructor !== Object && value.constructor !== Array)) {
      throw new Error('value should be an object')
    }

    const result = await this.#cache.set(this.key, JSON.stringify(value), { EX: ttl })
    this.#currentStatus = this.#status.finished
    this.setExpiry(ttl) // reset expiry
    this.emit(this.#status.finished) // notify all observers waiting for this request
    return result
  }

  /**
   * Returns a response based on the current status of the this object
   * @returns {Promise<undefined|object|Array>}
   */
  async waitForResponse () {
    // the status is on init, set the status to running and let the first call set the value
    if (this.#currentStatus === this.#status.init) {
      this.#currentStatus = this.#status.running
      return undefined
    }

    // the status is finished if the data is still there return it
    if (this.#currentStatus === this.#status.finished) {
      const data = await this.#cache.get(this.key)

      // it is possible that the cache is expired between exists and the get
      if (data === undefined || data === null) {
        this.#currentStatus = this.#status.running
        return undefined
      }

      this.logger.trace(`Cache hit for key: ${this.key}`)
      return JSON.parse(data)
    }

    // the status is running, so we wait until the cache gets set
    // or till we waited long enough
    const p1 = new Promise((resolve) => {
      this.once(this.#status.finished, async () => {
        const data = await this.#cache.get(this.key)

        if (data === undefined) resolve(undefined)

        try {
          resolve(JSON.parse(data))
        } catch {
          resolve(undefined)
        }
      })
    }) // subscribe as observer; send response when request is finished

    // just wait for a few seconds and return undefined
    const p2 = new Promise((resolve) => setTimeout(() => resolve(undefined), this.#allowedRaceTimeMS))

    // return who's done first
    return Promise.race([p1, p2])
  }
}
