import actions from '../../common/actions'
import states from '../../common/states'

export default async ({ squirrel, surroundings }) => {
	const [otherLivingSquirrel] = surroundings.filter(
		i => i.type === 'squirrel' && i.state === states.living
	)
	const [closestNut] = surroundings.filter(i => i.type === 'nut')
	switch (squirrel.action) {
		case '':
		case null:
		case undefined:
		case actions.nothing:
			if (squirrel.contains.length < 0 && closestNut)
				return {
					...squirrel,
					action: action.moving,
					position: { x: closestNut.x, y: closestNut.y }
				}
			break

		default:
			break
	}
}

// export default {
// 	moving: 'moving',
// 	resting: 'resting',
// 	thinking: 'thinking',
// 	eating: 'eating',
// 	panicing: 'panicing',
// 	watching: 'watching',
// 	nothing: 'nothing'
// }
