import actions from '../../common/actions'
import states from '../../common/states'
import victor from 'victor'

const consumeEnergy = (creature, action) => {
	if (creature.energy <= 0) {
		return { state: states.dead }
	} else {
		return { energy: creature.energy - 0.01 }
	}
}

const randomMove = squirrel => {
	const randAngle = (Math.random() * 360) | 0
	return {
		action: actions.moving,
		x: Math.cos((randAngle * Math.PI) / 180) * squirrel.speed + squirrel.x,
		y: Math.sin((randAngle * Math.PI) / 180) * squirrel.speed + squirrel.y
	}
}

export default async ({ squirrel, surroundings }) => {
	const [otherLivingSquirrel] = surroundings.filter(
		i => i.type === 'squirrel' && i.state === states.living
	)
	const [closestNut] = surroundings.filter(i => i.type === 'nut')
	switch (squirrel.action) {
		case actions.eating:
			return {
				...squirrel,
				action: actions.nothing,
				contains: [],
				energy: squirrel.energy < 1 ? squirrel.energy + 0.1 : 1
			}
		case '':
		case null:
		case undefined:
		case actions.nothing:
			if (
				squirrel.contains.length < 1 &&
				closestNut &&
				closestNut.x === squirrel.x &&
				closestNut.y === squirrel.y
			) {
				return {
					...squirrel,
					action: actions.eating,
					contains: squirrel.contains.concat(closestNut)
				}
			} else if (squirrel.contains.length < 1 && closestNut)
				return {
					...squirrel,
					action: actions.moving,
					position: { x: closestNut.x, y: closestNut.y }
				}
			else if (
				otherLivingSquirrel &&
				otherLivingSquirrel.action === actions.nothing
			) {
				return {
					...squirrel,
					action: actions.playing,
					position: { x: otherLivingSquirrel.x, y: otherLivingSquirrel.y }
				}
			} else {
				return {
					...squirrel,
					...randomMove(squirrel)
				}
			}
		case actions.playing:
			if (
				otherLivingSquirrel &&
				otherLivingSquirrel.action === actions.playing
			) {
				return {
					...squirrel,
					...randomMove(squirrel)
				}
			}
		case actions.moving:
			if (
				otherLivingSquirrel &&
				otherLivingSquirrel.action === actions.playing
			) {
				const randAngle = (Math.random() * 360) | 0
				return {
					...squirrel,
					action: actions.nothing,
					...consumeEnergy(squirrel, actions.moving)
				}
			}

		default:
			return { ...squirrel }
	}
}

// export default {
// 	moving: 'moving',
// 	resting: 'resting',
// 	thinking: 'thinking',
// 	eating: 'eating',
// 	panicing: 'panicing',
// 	watching: 'watching',
// 	playing: 'playing',
// 	nothing: 'nothing'
// }
