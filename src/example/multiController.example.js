import { Cache, DataBufferController } from '../index.js'

const logger = console

const singleCache = new Cache()
const controllerA = await DataBufferController.create({ logger, cache: singleCache })
const controllerB = await DataBufferController.create({ logger, cache: singleCache })

const key = 'multitest'
const list = [
  controllerA.get(key),
  controllerA.get(key),
  controllerA.get(key),
  controllerA.get(key),
  controllerA.get(key)
]
await list[0]

list.push(controllerB.get(key))
list.push(controllerB.get(key))
list.push(controllerB.get(key))

await new Promise(resolve => setTimeout(resolve, 5000))

controllerA.set(key, { found: 42 })
Promise.all(list).then(res => {
  controllerA.close()
  controllerB.close()
})
