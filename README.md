[![Node CI][npm-image]][npm-url] [![Bugs][bugs-image]][bugs-url] [![Code Smells][code-smells-image]][code-smells-url] [![Duplicated Lines (%)][duplicate-lines-image]][duplicate-lines-url] [![Maintainability Rating][maintainability-rate-image]][maintainability-rate-url] [![Reliability Rating][reliability-rate-image]][reliability-rate-url] [![Security Rating][security-rate-image]][security-rate-url] [![Technical Debt][technical-debt-image]][technical-debt-url] [![Vulnerabilities][vulnerabilitiest-image]][vulnerabilitiest-url] [![Quality Gate Status][quality-gate-image]][quality-gate-url] [![Coverage][coverage-image]][coverage-url]
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


[npm-url]: https://github.com/pondevelopment/data-buffer-cache/actions/workflows/nodejs.yml
[npm-image]: https://github.com/pondevelopment/data-buffer-cache/actions/workflows/nodejs.yml/badge.svg

[bugs-url]: https://sonarcloud.io/project/issues?id=pondevelopment_data-buffer-cache&resolved=false&types=BUG
[bugs-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=bugs&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[code-smells-url]: https://sonarcloud.io/project/issues?id=pondevelopment_data-buffer-cache&resolved=false&types=CODE_SMELL
[code-smells-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=code_smells&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[duplicate-lines-url]: https://sonarcloud.io/component_measures?id=pondevelopment_data-buffer-cache&metric=duplicated_lines_density&view=list
[duplicate-lines-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=duplicated_lines_density&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[maintainability-rate-url]: https://sonarcloud.io/project/issues?id=pondevelopment_data-buffer-cache&resolved=false&types=CODE_SMELL
[maintainability-rate-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=sqale_rating&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[reliability-rate-url]: https://sonarcloud.io/component_measures?id=pondevelopment_data-buffer-cache&metric=Reliability
[reliability-rate-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=reliability_rating&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[security-rate-url]: https://sonarcloud.io/project/security_hotspots?id=pondevelopment_data-buffer-cache
[security-rate-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=security_rating&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[technical-debt-url]: https://sonarcloud.io/component_measures?id=pondevelopment_data-buffer-cache
[technical-debt-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=sqale_index&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[vulnerabilitiest-url]: https://sonarcloud.io/project/issues?id=pondevelopment_data-buffer-cache&resolved=false&types=VULNERABILITY
[vulnerabilitiest-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=vulnerabilities&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[quality-gate-url]: https://sonarcloud.io/summary/new_code?id=pondevelopment_data-buffer-cache
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=alert_status&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59

[coverage-url]: https://sonarcloud.io/component_measures?id=pondevelopment_data-buffer-cache&metric=coverage&view=list
[coverage-image]: https://sonarcloud.io/api/project_badges/measure?project=pondevelopment_data-buffer-cache&metric=coverage&token=3c2bde258cf1d9b6d4f0b30732880058e5e0ef59
