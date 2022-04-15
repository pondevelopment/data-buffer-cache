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

/**
 * A Cache definition
 * @typedef {import('./Cache.js').default} Cache
 */

export default class DataBuffer extends EventEmitter {
  #stdTTL
  #status = {
    init: 'init',
    running: 'running',
    finished: 'finished'
  }

  #allowedRaceTimeMs
  #currentStatus
  #cache

  #semaphore = 'DIBS'
  #closing = false
  #foundSemaphore = false
  #semaphoreChecking = false

  /**
   * Initialize the DataBuffer
   *
   * @constructor
   * @param {object} obj - Initialization of the class
   * @param {string} obj.key - The caching/buffer key
   * @param {Cache} obj.cache - The cache object
   * @param {number} obj.ttl - Time To Live in seconds
   * @param {number} obj.raceTimeMs - How long will the first request get before its been ignored in milli-seconds
   * @param {*} obj.logger - A logger object, defaults to console
   */
  constructor ({ key, cache, ttl = 300, raceTimeMs = 30000, logger = console }) {
    super()
    this.key = key
    this.logger = logger

    this.#allowedRaceTimeMs = raceTimeMs
    this.#stdTTL = ttl // standard 5 minute availability (300s)
    this.setExpiry()

    this.#cache = cache
    this.#currentStatus = this.#status.init
  }

  close () {
    this.logger.debug('Closing DataBuffer')
    this.removeAllListeners()
    this.#closing = true
  }

  get ttl () {
    return this.#stdTTL
  }

  get raceTimeMs () {
    return this.#allowedRaceTimeMs
  }

  get raceTimeInSeconds () {
    return this.#allowedRaceTimeMs / 1000
  }

  get status () {
    return this.#currentStatus
  }

  /**
   * Set the expiry
   *
   * @param {number} ttl expiry in seconds
   */
  setExpiry (ttl = this.#stdTTL) {
    this.expire = Date.now() + (ttl * 1000)
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

    if (this.#currentStatus === this.#status.init) {
      this.#cache.set(this.key, this.#semaphore)
    }

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
    this.triggerItemSet(ttl)
    return result
  }

  async checkSemaphore () {
    this.#semaphoreChecking = true
    await new Promise(resolve => setTimeout(resolve, this.#allowedRaceTimeMs / 10))
    this.logger.debug('checking semaphore')
    const data = await this.#cache.get(this.key)
    if (data !== this.#semaphore) {
      this.logger.debug('semaphore is replaced with real data!')
      this.triggerItemSet()
      this.#semaphoreChecking = false
      this.#foundSemaphore = false
      return true
    }
    return this.checkSemaphore()
  }

  triggerItemSet (ttl = this.#stdTTL) {
    this.#currentStatus = this.#status.finished
    this.setExpiry(ttl) // reset expiry
    this.emit(this.#status.finished) // notify all observers waiting for this request
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

      if (data === this.#semaphore) {
        this.#currentStatus = this.#status.running
        this.#foundSemaphore = true
        this.logger.debug('Semaphore found')
        if (this.#semaphoreChecking === false) this.checkSemaphore()
        return this.waitForResponse()
      }

      // it is possible that the cache is expired between exists call and the get call
      // if that happens restart the process
      if (data === undefined || data === null) {
        this.#currentStatus = this.#status.running
        return undefined
      }

      this.logger.debug(`Cache hit for key: ${this.key}`)
      return JSON.parse(data)
    }

    // the status is running, so we wait until the cache gets set
    // or till we waited long enough
    const dataPromise = new Promise((resolve) => {
      this.once(this.#status.finished, async () => {
        const data = await this.#cache.get(this.key)

        if (data === undefined) {
          resolve(undefined)
        }

        // this should not happen, but if you for some reason cannot parse the data
        // return undefined and try again.
        try {
          resolve(JSON.parse(data))
        } catch {
          resolve(undefined)
        }
      })
    })

    // create a Promise that returns undefined after the allowedRaceTime
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(undefined), this.#allowedRaceTimeMs))

    // return who's done first
    return Promise.race([dataPromise, timeoutPromise])
  }
}
