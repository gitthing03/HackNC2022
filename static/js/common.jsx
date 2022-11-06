const DEFAULT_CENTER = ol.proj.fromLonLat([-79.046761, 35.904613])
// coordsList = [[-79.046761, 35.904613], [-70, 40]]

const STROKE_COLOR = "#800080"

// function createLocator(map, CoordinatesList) {
// 	for (const coord in CoordinatesList) {
// 		console.log('hello')
// 		long = coord[0]
// 		lat = coord[1]
// 		centre = ol.proj.fromLonLat([long, lat])
// 		const layer = new ol.layer.Vector({
// 		source: new ol.source.Vector({
// 			features: [
// 				new ol.Feature({
// 					geometry: new ol.geom.Point([centre])
// 				})
// 			]
// 		})});
// 	}
// 	map.addLayer(layer);
// }


function Map() {
	const popupContainerRef = React.useRef()

	const [popupContent, setPopupContent] = React.useState("")

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
		});

		console.log("printing 1")
		// createLocator(map, coordsList)
		const layer = new ol.layer.Vector({
			  source: new ol.source.Vector({
				  features: [
					  new ol.Feature({
						  geometry: new ol.geom.Point(DEFAULT_CENTER)
					  })
				  ]
			  })
		});

		map.addLayer(layer);

		const overlay = new ol.Overlay({
			element: popupContainerRef.current,
			autoPan: true,
			autoPanAnimation: {
				duration: 250
			}
		});

		map.addOverlay(overlay);
		map.on("singleclick", event => {
			if (map.hasFeatureAtPixel(event.pixel) === true) {
				overlay.setPosition(event.coordinate)

				setPopupContent("<b>Hello world!</b><br/>I am a popup.")
			} else {
			  overlay.setPosition(undefined);
			}
	  	});

		// https://stackoverflow.com/a/52244847

		var coordinates = [[-79.045869, 35.909347], [-79.0475, 35.91]];

		var lineString = new ol.geom.LineString(coordinates);

		lineString.transform("EPSG:4326", "EPSG:3857");

		map.addLayer(
			new ol.layer.Vector({
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
				]
			})
		);
	}, [])

	return <>
		<div id="map" class="w-100 h-100"></div>

		<div class="ol-popup" ref={popupContainerRef}>
			<div dangerouslySetInnerHTML={{
				__html: popupContent
			}}></div>
		</div>
	</>
}
