export default (run, writeComponentsList) => ({
	components,
	jobData = void 0
}) =>
	run(
		components.map(component => [
			component.id,
			component.get(),
			value =>
				writeComponentsList.indexOf(component.id) !== -1
					? component.set(value)
					: void 0
		]),
		jobData
	)
