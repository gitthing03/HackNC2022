const DEFAULT_CENTER = ol.proj.fromLonLat([-79.046761, 35.904613])

const STROKE_COLOR = "#800080"

const Map = React.forwardRef((props, ref) => {
	const [map, setMap] = React.useState()

	React.useEffect(() => {
		const attribution = new ol.control.Attribution({
			collapsible: false
		});

		const map = new ol.Map({
			controls: ol.control.defaults({attribution: false}).extend([attribution]),
			layers: [
				new ol.layer.Tile({
					source: new ol.source.OSM({
						url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
						attributions: [ ol.source.OSM.ATTRIBUTION, 'Tiles courtesy of <a href="https://openstreetmap.org/">OSM</a>' ],
						maxZoom: 20,
						minZoom: 16
					})
				})
			],
			target: "map",
			view: new ol.View({
				center: DEFAULT_CENTER,
				maxZoom: 20,
				zoom: 17,
				minZoom: 16
			})
		})

		setMap(map)

		const layer = new ol.layer.Vector({
			source: new ol.source.Vector({
				features: props.complaints.map(complaint => new ol.Feature({
					complaintId: complaint["id"],
					geometry: new ol.geom.Point(
						ol.proj.fromLonLat([complaint["longitude"], complaint["latitude"]])
					)
				}))
			}),

			style: [
				new ol.style.Style({
					image: new ol.style.Circle({
						radius: 10,

						fill: new ol.style.Fill({
							color: "red"
						}),
					})
				})
			],
		})

		map.addLayer(layer)
		map.on("singleclick", event => {
			if (map.hasFeatureAtPixel(event.pixel)) {
				map.forEachFeatureAtPixel(event.pixel, feature => {
					props.onClickComplaint(feature.get("complaintId"))
				})
			} else {
				props.onClick(ol.proj.toLonLat(event.coordinate))
			}
		})
	}, [])

	React.useImperativeHandle(ref, () => ({
		addPath: points => {
			// https://stackoverflow.com/a/52244847

			var lineString = new ol.geom.LineString(points);

			lineString.transform("EPSG:4326", "EPSG:3857");

			map.getLayers()
				.getArray()
				.filter(layer => layer.get("name") == "Path")
				.forEach(layer => map.removeLayer(layer))

			map.addLayer(
				new ol.layer.Vector({
					name: "Path",
					source: new ol.source.Vector({
						features: [
							new ol.Feature({
								geometry: lineString,
								name: "Line"
							})
						]
					}),

					style: [
						new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: STROKE_COLOR,
								width: 6
							})
						})
					],
				})
			)
		},
	}))

	return <div id="map" class="w-100 h-100"/>
})

Map.defaultProps = {
	complaints: [],

	onClick: () => {},
	onClickComplaint: () => {}
}

const MapAndSidebar = React.forwardRef((props, ref) => {
	return (
		<div class="d-flex h-100">
			<div class="card col-9 bg-light border me-3 shadow">
				<div class="card-body">
					<Map
						complaints={props.complaints}
						onClick={coordinate => props.onClick(coordinate)}
						onClickComplaint={complaintId => props.onClickComplaint(complaintId)}
						ref={ref}/>
				</div>
			</div>

			<div class="card flex-grow-1 bg-light border shadow">
				<div class="card-body d-flex flex-column">
					{props.children}
				</div>
			</div>
		</div>
	)
})

MapAndSidebar.defaultProps = {
	complaints: [],

	onClick: () => {},
	onClickComplaint: () => {}
}
