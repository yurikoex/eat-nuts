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

const numOfSquirrels = process.argv[2] || 100
const numOfNuts = process.argv[3] || 100
const x = process.argv[4] || 100
const y = process.argv[5] || 100

const {
	meta: { workerCount, isMaster },
	createJob,
	dispose: disposeParallelJobRunner
} = await createParallelJobRunner()

const { startJob: processSquirrel } = createJob({
	name: 'squirrel-job',
	work: state => doProcessSquirrel(state)
})

const { startJob: processNut } = createJob({
	name: 'nut-job',
	work: state => doProcessNut(state)
})

if (isMaster) {
	const topLeft = new Victor(0, y)
	const bottomRight = new Victor(x, 0)

	const initialNuts = range(numOfNuts)
		.map(() => Victor(1, 1).randomize(topLeft, bottomRight))
		.map(({ x, y }) => nut({ x, y }))

	const initialSquirrels = range(numOfSquirrels)
		.map(() => Victor(1, 1).randomize(topLeft, bottomRight))
		.map(({ x, y }) => squirrel({ x, y }))

	const neighbors = new kdTree.kdTree(
		[...initialNuts, ...initialSquirrels],
		distance,
		['x', 'y']
	)

	const tick = async ({
		nuts = initialNuts,
		squirrels = initialSquirrels
	} = {}) => {
		console.log('tick starting')

		console.log('process each squirrel')
		const squirrelsCompleted = await Promise.all(
			squirrels.map(async squirrel => {
				const surroundings = neighbors.nearest(
					squirrel,
					squirrel.awareness.max,
					squirrel.awareness.distance
				)

				return await doProcessSquirrel({
					squirrel,
					surroundings: surroundings.map(([item]) => item)
				})
			})
		)

		console.log(`Squirrels Complete`)
		console.log(JSON.stringify(squirrelsCompleted, null, '\t'))
		//tick({squirrels:squirrelsCompleted, nuts})
	}

	try {
		await tick()
		await disposeParallelJobRunner()
		process.exit(0)
	} catch (error) {
		console.log(error)

		await disposeParallelJobRunner()
		process.exit(1)
	}
}
