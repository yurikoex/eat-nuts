import Victor from 'victor'
import * as kdTree from 'kd-tree-javascript'

import distance from './common/distance'

import squirrel from './creature/creatures/squirrel'
import nut from './object/objects/nut'

import range from './common/range'
import actions from './common/actions'

const numOfSquirrels = process.argv[2] || 1000
const numOfNuts = process.argv[3] || 1000
const x = process.argv[4] || 100
const y = process.argv[5] || 100

export default async ({
	processSquirrel,
	processNut,
	disposeParallelJobRunner
}) => {
	const topLeft = new Victor(0, y)
	const bottomRight = new Victor(x, 0)

	const initialNuts = range(numOfNuts)
		.map(() => Victor(1, 1).randomize(topLeft, bottomRight))
		.map(({ x, y }) => nut({ x, y }))

	const initialSquirrels = range(numOfSquirrels)
		.map(() => Victor(1, 1).randomize(topLeft, bottomRight))
		.map(({ x, y }) => squirrel({ x, y }))

	const getNeighbors = values => new kdTree.kdTree(values, distance, ['x', 'y'])

	const tick = async ({
		nuts = initialNuts,
		squirrels = initialSquirrels
	} = {}) => {
		const start = Date.now()
		// console.log('tick starting')

		// console.log('building neighbors')
		const neighbors = getNeighbors([...nuts, ...squirrels])

		// console.log('process each squirrel')
		const squirrelsCompleted = await Promise.all(
			squirrels.map(async squirrel => {
				const surroundings = neighbors.nearest(
					squirrel,
					squirrel.awareness.max,
					squirrel.awareness.distance
				)

				return await processSquirrel({
					squirrel,
					surroundings: surroundings.map(([item]) => item)
				})
			})
		)

		// console.log(`Squirrels Complete`)
		// console.log(JSON.stringify(squirrelsCompleted, null, '\t'))

		// console.log(`Removing nuts eating by squirrels`)
		const eatenIds = squirrelsCompleted
			.filter(s => s.action === actions.eating)
			.reduce((ids, { contains }) => [...ids, contains.map(({ id }) => id)], [])

		const remainingNuts = nuts.filter(({ id }) => eatenIds.indexOf(id) !== -1) //nasty o^2
		const end = Date.now()
		console.log('duration:', end - start)
		tick({ squirrels: squirrelsCompleted, nuts: remainingNuts })
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
