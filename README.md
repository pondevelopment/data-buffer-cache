# data-buffer-cache
A way to buffer and cache data to minimize requests to a backend.
Reduce the amount of requests that are being made to a backend if the cache key is not found in the cache. 

The first request is responsible for setting the cache with the correct data. The sequential requests are waiting for it to be set. 

More examples in the src/example directory

```javascript
import DataBufferController from './DataBufferController.js'

const controller = new DataBufferController(null, console )

const val = await controller.get('test')
console.log('Should be undefined', val) // undefined
await controller.set('test', {val: 42})
const valset = await controller.get('test')
console.log('Should be an object', valset)

const vals=[]
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))
vals.push(controller.get('test_multi'))

const val_0 = await vals[0]
console.log('Should be undefined', val_0) // undefined
console.log('Should be a list of Promises', vals) // Promise vals 1 - 9

console.log('Setting value for multi test')
await controller.set('test_multi', {data: 'Buffer'})

console.log( await Promise.all(vals))

controller.close() // clean up

```