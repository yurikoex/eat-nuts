import newId from 'uuid/v1'

import states from '../common/states'

export default () => {
	// let state = states.whole
	// const destroy = () => {
	// 	state = states.destroyed
	// }
	return {
		id: newId(),
		state: states.whole
	}
}
