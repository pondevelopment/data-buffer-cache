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

// Mock Cache Client, uses in memory cache
import EventEmitter from 'events'

export default class Cache extends EventEmitter {
  #items = {}

  /**
   * Connects the cache
   */
  async connect () {
    this.emit('connect', true)
    this.emit('ready', true)
  }

  /**
   * Gets a value from the cache
   * @param {string} key
   * @returns {Promise}
   */
  async get (key) {
    return this.#items[key]
  }

  /**
   * Checks if a values exists in the cache
   * @param {string} key
   * @returns {Promise}
   */
  async exists (key) {
    return key in this.#items
  }

  /**
   * Sets a value in the cache
   * @param {string} key
   * @param {string} value
   * @returns {Promise}
   */
  async set (key, value) {
    this.#items[key] = value
    return true
  }

  /**
   * Deletes a value from the cache
   *
   * @param {string} key
   * @returns {Promise}
   */
  async del (key) {
    delete this.#items[key]
    return true
  }
}
