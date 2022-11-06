function LocationInput(props) {
	return <>
		<input type="text"
			class={`location-input form-control mb-2${props.disabled ? " opacity-50" : ""}`}
			placeholder="Search for a location"
			onClick={() => props.onClick()}
			{...props.disabled ? {readOnly: true} : {}}></input>

		{props.disabled ? <></> : <span class="mb-2 mx-1 text-secondary">→</span>}
	</>
}

LocationInput.defaultProps = {
	disabled: false,

	onClick: () => {}
}

function Main() {
	const [numLocations, setNumLocations] = React.useState(0)

	const inputs = []

	for (let i = 0; i < numLocations; i++) {
		inputs.push(<LocationInput/>)
	}

	return (
		<div class="d-flex flex-column h-100 p-3">
			<div class="d-flex align-items-center flex-wrap">
				{inputs}

				<LocationInput disabled onClick={event => setNumLocations(numLocations + 1)}/>
			</div>

			<div class="d-flex flex-grow-1">
				<div class="card col-9 bg-light border me-3 shadow">
					<div class="card-body">
						<Map/>
					</div>
				</div>

				<div class="card flex-grow-1 bg-light border shadow">
					<div class="card-body">
						Sequential directions
					</div>
				</div>
			</div>
		</div>
	)
}

ReactDOM.render(<Main/>, document.querySelector(".wrapper"))
