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
console.log(list)
await list[0]

console.log(singleCache.items)
list.push(controllerB.get(key))
list.push(controllerB.get(key))
list.push(controllerB.get(key))
console.log(list)

await new Promise(resolve => setTimeout(resolve, 5000))

controllerA.set(key, {found: 42})
Promise.all(list).then(res => {
  console.log(list)
  console.log(res)
  controllerA.close()
  controllerB.close()
})