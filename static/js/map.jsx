function ComplaintOrComment(props) {
	const date = new Date(props.timestamp * 1000)

	return (
		<div class={`card bg-light border shadow-sm mb-2${props.imageSrc == null ? " complaint" : ""}`}>
			<div class="card-body">
				<div class="d-flex align-items-center justify-content-between">
					<span>{props.name == null || props.name == "" ? "(Anonymous)" : props.name}</span>
					<span class="text-secondary">
						{`${date.toLocaleDateString("en-US")} ${date.toLocaleTimeString("en-US", {timeStyle: "short"})}`}
					</span>
				</div>

				<p class="text-truncate">{props.body ?? props.description}</p>

				{props.imageSrc == null ? null :
					<img
						class="w-100"
						src={props.imageSrc}
						onError={event => event.currentTarget.style.display = "none"}/>}
			</div>
		</div>
	)
}

function Main() {
	const [complaints, setComplaints] = React.useState(null)

	const [modalVisible, setModalVisible] = React.useState(false)

	const [modalLocation, setModalLocation] = React.useState(null)

	const [selectedComplaint, setSelectedComplaint] = React.useState(null)

	const [comments, setComments] = React.useState([])

	const [commentBody, setCommentBody] = React.useState("")

	const commentNameRef = React.useRef()

	function handleCommentButtonClick() {
		fetch(`/complaint/${selectedComplaint["id"]}/comments`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},

			body: JSON.stringify({
				name: commentNameRef.current.value,
				body: commentBody
			})
		}).then(() => window.location.reload())
	}

	function handleFormSubmit(event) {
		event.preventDefault()

		const formData = new FormData(event.currentTarget)

		formData.append("latitude", modalLocation[0])
		formData.append("longitude", modalLocation[1])

		fetch("/complaints", {
			"method": "POST",
			"body": formData
		}).then(() => window.location.reload())
	}

	function handleMapClick(coordinate) {
		setModalVisible(true)
		setModalLocation([coordinate[1], coordinate[0]])
	}

	function handleMapComplaintClick(complaintId) {
		const newSelectedComplaint = complaints.find(complaint => complaint["id"] == complaintId)

		setSelectedComplaint(newSelectedComplaint)

		fetch(`/complaint/${newSelectedComplaint["id"]}/comments`)
			.then(response => response.json())
			.then(json => setComments(json))
	}

	React.useEffect(() => {
		fetch("/complaints")
			.then(response => response.json())
			.then(json => setComplaints(json))
	}, [])

	return <>
		{complaints == null ? null :
			<MapAndSidebar
				complaints={complaints}
				onClick={coordinate => handleMapClick(coordinate)}
				onClickComplaint={complaintId => handleMapComplaintClick(complaintId)}>
				<div class="d-flex justify-content-between">
					<h3>{selectedComplaint == null ? "Complaints" :"Selected complaint"}</h3>
				</div>

				{selectedComplaint == null ?
					<div class="overflow-scroll">
						{complaints.map(complaint => (
							<ComplaintOrComment
								imageSrc={`/complaint/${complaint["id"]}/image`}

								{...complaint}/>
						))}
					</div> :

					<>
						<ComplaintOrComment
							imageSrc={`/complaint/${selectedComplaint["id"]}/image`}

							{...selectedComplaint}/>

						<hr class="mt-2 mb-3"/>

						<div class="d-flex flex-column flex-grow-1 justify-content-between">
							<div class="overflow-scroll">
								{comments.map(comment => <ComplaintOrComment {...comment}/>)}
							</div>

							<div class="d-flex align-items-end">
								<div class="flex-grow-1 me-2">
									<input type="text"
										class="form-control mb-1 rounded-pill"
										placeholder="Your name (optional)"
										ref={commentNameRef}/>

									<input type="text"
										class="form-control rounded-pill"
										placeholder="Leave a comment"
										autoComplete="off"
										onInput={event => setCommentBody(event.currentTarget.value)}/>
								</div>

								<button type="button"
									class="btn btn-lg btn-primary rounded-pill"
									onClick={() => handleCommentButtonClick()}
									{...commentBody.length == 0 ? {disabled: true} : {}}>
									Send
								</button>
							</div>
						</div>
					</>}
			</MapAndSidebar>}

		<div class="modal" style={modalVisible ? {display: "block"} : {}} tabindex="-1">
			<div class="modal-dialog">
				<div class="modal-content border shadow">
					<form onSubmit={event => handleFormSubmit(event)}>
						<div class="modal-header">
							<h5 class="modal-title">Submit an Accessibility Concern</h5>

							<button type="button"
								class="btn-close"
								onClick={() => setModalVisible(false)}></button>
						</div>

						<div class="modal-body">
							<div class="form-floating mb-2">
								<input type="text"
									id="name-input"
									class="form-control"
									name="name"
									placeholder="What's your name?"/>

								<label for="name-input">Name (optional)</label>
							</div>

							<div class="form-floating mb-2">
								<textarea
									id="description-textarea"
									class="form-control"
									name="description"
									placeholder="Please describe your concern."
									required/>

								<label for="description-textarea">Description</label>
							</div>

							<div class="position-relative">
								<input type="file" id="image-input" class="opacity-0" name="image"/>

								<label
									class="image-input-label bg-white border position-absolute rounded-1 text-secondary w-100"
									for="image-input">
									Choose file
								</label>
							</div>
						</div>

						<div class="modal-footer border-top-0 d-flex justify-content-between">
							<div class="form-check">
								<input type="checkbox"
									id="student-verification-input"
									class="form-check-input"
									autoComplete="off"
									required/>

								<label
									class="form-check-label"
									for="student-verification-input">
									I affirm I am a current UNC student.
								</label>
							</div>

							<button class="btn btn-primary">Submit</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</>
}

ReactDOM.render(<Main/>, document.querySelector(".wrapper"))
