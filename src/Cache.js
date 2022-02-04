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

  async set (key, value, { EX }) {
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