import flat from '../common/flat'

export default ({ entities, systems }) => async jobData => {
	systems.foreach(system => {
		entities.foreach(entity => {
			system(entity.getAllComponents(), jobData)
		})
	})
}
