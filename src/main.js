import Victor from 'victor'
import * as kdTree from 'kd-tree-javascript'

import distance from './common/distance'

import squirrel from './creature/creatures/squirrel'
import nut from './object/objects/nut'
import doProcessSquirrel from './job/jobs/processSquirrel'
import doProcessNut from './job/jobs/processNut'

import createParallelJobRunner from 'parallel-job-runner'
import states from './common/states'
import range from './common/range'
import actions from './common/actions'

import master from './master'

const numOfSquirrels = process.argv[2] || 1000
const numOfNuts = process.argv[3] || 1000
const x = process.argv[4] || 100
const y = process.argv[5] || 100

const start = async () => {
    const {
        meta: { workerCount, isMaster },
        createJob,
        dispose: disposeParallelJobRunner,
    } = await createParallelJobRunner({
        workerCount: 3,
    })

    const { startJob: processSquirrel } = createJob({
        name: 'squirrel-job',
        work: state => doProcessSquirrel(state),
    })

    const { startJob: processNut } = createJob({
        name: 'nut-job',
        work: state => doProcessNut(state),
    })

    if (isMaster) {
        master({ processNut, processSquirrel, disposeParallelJobRunner })
    }
}

start()
