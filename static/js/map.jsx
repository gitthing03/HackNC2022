// function MapMain() { 
//     // const [complaints, setComplaints] = React.useState([])
//     // // useEffect is basically Vue's watch
//     // React.useEffect(() => {
//     //     fetch("/complaints").
//     //     then(response => response.json()).
//     //     then(json => setComplaints(response))
//     // }, [])

function ComplaintList(props) {
    const complaints = props.complaints;
    const complaintItems = complaints.map((complaint) =>
    //   <li>{complaint}</li>
      <tr><td>{complaint}</td></tr>
    );
    return (
        //   <ul>{complaintItems}</ul>
        complaintItems
    );
}

const complaints = ["bad", "poor","heklo"];

function Main() {
	return (
		<div class="d-flex flex-column h-100 p-3">
			<div class="d-flex flex-grow-1">
				<div class="card col-9 bg-light border me-3 shadow">
					<div class="card-body">
						<Map/>
					</div>
				</div>

				<div class="card flex-grow-1 bg-light border shadow">
					<div class="card-body">
                        <table>
                            <tr>
                                <th>Complaints</th>
                            </tr>
                            <ComplaintList complaints={complaints} />
                        </table>
					</div>
				</div>
			</div>
		</div>
	)
}

ReactDOM.render(<Main/>, document.getElementById("map-main"))