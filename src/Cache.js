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
export default class Cache {
  #items = {}

  async connect () {
    return true
  }

  async get (key) {
    return this.#items[key]
  }

  async exists (key) {
    return key in this.#items
  }

  async set (key, value) {
    this.#items[key] = value
    return true
  }

  async del (key) {
    delete this.#items[key]
    return true
  }

  on () {
    return true
  }
}
