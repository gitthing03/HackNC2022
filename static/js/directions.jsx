function LocationInput(props) {
	return <>
		<input type="text"
			class={`location-input form-control mb-2${props.disabled ? " opacity-50" : ""}`}
			placeholder="Search for a location"
			onBlur={event => props.onBlur(event)}
			onClick={() => props.onClick()}
			onFocus={() => props.onFocus()}
			onInput={event => props.onInput(event)}
			{...props.disabled ? {readOnly: true} : {}}></input>

		{props.disabled ? <></> : <span class="mb-2 mx-1 text-secondary">→</span>}
	</>
}

LocationInput.defaultProps = {
	disabled: false,

	onBlur: () => {},
	onClick: () => {},
	onFocus: () => {},
	onInput: () => {}
}

function Main() {
	const [numLocations, setNumLocations] = React.useState(0)

	const [focusedLocation, setFocusedLocation] = React.useState(null)

	const [searchResults, setSearchResults] = React.useState([])

	const [submitEnabled, setSubmitEnabled] = React.useState(false)

	const [path, setPath] = React.useState(null)

	const locationInputsRef = React.useRef()

	const mapRef = React.useRef()

	function handleLocationClick() {
		setNumLocations(numLocations + 1)
		setSearchResults([...searchResults, []])
	}

	function handleLocationInput(query, i) {
		fetch(`/location_search?q=${encodeURIComponent(query)}`)
			.then(response => response.json())
			.then(json => {
				const newResults = [...searchResults]

				newResults[i] = json

				if (newResults.length == 0) {
					setFocusedLocation(null)
				} else {
					setSearchResults(newResults)
					setSubmitEnabled(numLocations > 1 && newResults.every(result => result.length == 1))
				}
			})
	}

	function handleSearchResultClick(result, i) {
		const input = Array.from(locationInputsRef.current.getElementsByClassName("location-input"))[i]

		handleLocationInput(input.value = result["name"], i)

		setFocusedLocation(null)
	}

	function handleFindClick() {
		fetch(`/location_path`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(searchResults.map(result => result[0]["location"]))
		})
			.then(response => response.status == 200 ? response.json() : Promise.reject())
			.then(json => {
				setPath(json)

				mapRef.current.addPath(json.map(node => [node["longitude"], node["latitude"]]))
			})
	}

	const inputs = []

	for (let i = 0; i < numLocations; i++) {
		inputs.push(
			<div class="d-flex align-items-center position-relative">
				<LocationInput
					onFocus={() => setFocusedLocation(i)}
					onBlur={event => {
						if (event.relatedTarget == null || !event.relatedTarget.classList.contains("search-result")) {
							setFocusedLocation(null)
						}
					}}

					onInput={event => handleLocationInput(event.currentTarget.value, i)}/>

				<div class={`search-results list-group position-absolute${focusedLocation == i ? "" : " d-none"}`}>
					{searchResults[i].map(result =>
						<button type="button"
							class="search-result list-group-item list-group-item-action"
							onClick={() => handleSearchResultClick(result, i)}>
							{result["name"]}
						</button>
					)}
				</div>
			</div>
		)
	}

	return (
		<div class="d-flex flex-column h-100">
			<div class="d-flex align-items-center justify-content-between me-3">
				<div class="d-flex align-items-center flex-wrap" ref={locationInputsRef}>
					{inputs}

					<LocationInput disabled onClick={() => handleLocationClick()}/>
				</div>

				<button type="button"
					class="btn btn-primary mb-2 text-nowrap"
					disabled={!submitEnabled}
					onClick={() => handleFindClick()}>
					Find an accessible route
				</button>
			</div>

			<div class="flex-grow-1">
				<MapAndSidebar ref={mapRef}>
					{path == null ? "Choose your route to find the most accessible path." :
						(() => {
							const instructions = []

							let last_nbn = null;

							for (let i = 1; i < path.length - 1; i++) {
								if (i == 1 || (
									path[i]["nearest_building_name"] != null &&
									path[i]["nearest_building_name"] != last_nbn
								)) {
									instructions.push((
										<div class="card bg-light border shadow mb-2">
											<div class="card-body d-flex align-items-center">
												<span class="badge bg-secondary rounded-pill me-3">
													{instructions.length + 1}
												</span>

												{`Continue along ${path[i]["nearest_building_name"]}`}
											</div>
										</div>
									))

									last_nbn = path[i]["nearest_building_name"];
								}
							}

							return instructions
						})()}
				</MapAndSidebar>
			</div>
		</div>
	)
}

ReactDOM.render(<Main/>, document.querySelector(".wrapper"))
