import newId from 'uuid/v1'

export default ({ id }) => ({
	id,
	create: (value, readonly = false) => {
		const data = {
			id,
			instanceId: newId(),
			type: typeof value,
			readonly
		}

		const set = newValue => {
			if (readonly) throw new Error(`Set called on read only component ${id}`)

			if (typeof newValue === data.type)
				throw new Error(
					`Type should have been ${
						data.type
					} but got ${typeof newValue} for ${id}`
				)

			value = newValue
		}

		const get = () => data.value

		return { ...data, set, get }
	}
})
