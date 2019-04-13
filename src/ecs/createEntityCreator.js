import newId from 'uuid/v1'

export default ({ id }) => () => {
	const components = []
	return {
		id,
		instanceId: newId(),
		addComponent: ({ component }) => components.push(component),
		getComponent: ({ id }) =>
			components.find(({ id: componentId }) => id == componentId),
		getAllComponents: () => components
	}
}
