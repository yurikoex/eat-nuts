import baseLivingCreature from '../baseLivingCreature'
import namer from '../../common/nameGenerator'
import actions from '../../common/actions'

export default ({
	x = 0,
	y = 0,
	male = Math.random() > 0.5,
	age = 1,
	name = namer.player(),
	awareness = { max: 2, distance: 6 },
	speed = 10,
	energy = 1
}) => ({
	...baseLivingCreature(),
	type: 'squirrel',
	mass: 10,
	male: male ? true : false,
	x: x || 0,
	y: y || 0,
	age,
	name,
	contains: [],
	awareness,
	speed,
	energy,
	action: actions.nothing
})
