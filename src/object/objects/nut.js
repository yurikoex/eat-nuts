import baseObject from '../baseObject'

export default ({ x = 0, y = 0 }) => ({
	...baseObject(),
	type: 'nut',
	mass: 0.5,
	position: {
		x: x || 0,
		y: y || 0
	}
})
