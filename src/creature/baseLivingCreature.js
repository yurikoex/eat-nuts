import newId from 'uuid/v1'

import states from '../common/states'

export default () => ({
	id: newId(),
	state: states.living
})
