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
						Map
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

function robertsStuff() {
	var attribution = new ol.control.Attribution({
		collapsible: false
	});

	var map = new ol.Map({
		controls: ol.control.defaults({attribution: false}).extend([attribution]),
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM({
					url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
					attributions: [ ol.source.OSM.ATTRIBUTION, 'Tiles courtesy of <a href="https://openstreetmap.org/">OSM</a>' ],
					maxZoom: 20,
					minZoom: 16
				})
			})
		],
		target: 'map',
		view: new ol.View({
		  //-79.046761, 35.904613
			center: ol.proj.fromLonLat([-79.046761, 35.904613]),
			maxZoom: 20,
			zoom: 17,
			minZoom: 16
		})
	});


	var layer = new ol.layer.Vector({
	  source: new ol.source.Vector({
		  features: [
			  new ol.Feature({
				  geometry: new ol.geom.Point(ol.proj.fromLonLat([-79.046761, 35.904613]))
			  })
		  ]
	  })
	});
	map.addLayer(layer);

	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');

	var overlay = new ol.Overlay({
		element: container,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	});
	map.addOverlay(overlay);

	closer.onclick = function() {
		overlay.setPosition(undefined);
		closer.blur();
		return false;
	};

	map.on('singleclick', function (event) {
	  if (map.hasFeatureAtPixel(event.pixel) === true) {
		  var coordinate = event.coordinate;

		  content.innerHTML = '<b>Hello world!</b><br />I am a popup.';
		  overlay.setPosition(coordinate);
	  } else {
		  overlay.setPosition(undefined);
		  closer.blur();
	  }
	});


	// LINE REFERENCE: https://stackoverflow.com/a/52244847

	var coordinates = [[-79.045869, 35.909347], [-79.0475, 35.91]];

	var lineString = new ol.geom.LineString(coordinates);
	lineString.transform('EPSG:4326', 'EPSG:3857');

	var feature = new ol.Feature({
	  geometry: lineString,
	  name: 'Line'
	});

	var lineStyle = new ol.style.Style({
	  stroke: new ol.style.Stroke({
		color: '#800080',
		width: 6
	  })
	});

	var source = new ol.source.Vector({
	  features: [feature]
	});
	var vector = new ol.layer.Vector({
	  source: source,
	  style: [lineStyle]
	});
	map.addLayer(vector);
}

ReactDOM.render(<Main/>, document.querySelector(".wrapper"))

<div id="map" style="width: 800px; height: 700px;"></div>
<div id="popup" class="ol-popup">
  <a href="#" id="popup-closer" class="ol-popup-closer"></a>
  <div id="popup-content"></div>
</div>

robertsStuff()
