import baseLivingCreature from '../baseLivingCreature'
import namer from '../../common/nameGenerator'

export default ({
	x = 0,
	y = 0,
	male = Math.random() > 0.5,
	age = 1,
	name = namer.player(),
	awareness = { max: 2, distance: 50 }
}) => ({
	...baseLivingCreature(),
	type: 'squirrel',
	mass: 10,
	male: male ? true : false,
	position: {
		x: x || 0,
		y: y || 0
	},
	age,
	name,
	contains: [],
	awareness
})
