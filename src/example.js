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

import DataBufferController from './DataBufferController.js'

const logger = console

const controller = new DataBufferController({ logger })

const val = await controller.get('test')
logger.log('Should be undefined', val) // undefined
await controller.set('test', { val: 42 })
const valset = await controller.get('test')
logger.log('Should be an object', valset)

const vals = []
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

logger.log('Should be undefined', await vals[0]) // undefined
logger.log('Should be a list of Promises', vals) // Promise vals 1 - 9

logger.log('Setting value for multi test')
await controller.set('test_multi', { data: 'Buffer' })

logger.log(await Promise.all(vals))

controller.close()
