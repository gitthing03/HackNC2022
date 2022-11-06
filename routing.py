import collections
import dataclasses
import math
import pickle
import requests
import uuid

@dataclasses.dataclass
class RouterBuilding:
	name: str
	center: tuple[float, float] = None
	center_id: int = None

	def set_center(self, nodes):
		total = [0, 0]

		for latitude, longitude in nodes:
			total[0] += latitude
			total[1] += longitude

		self.center = (total[0] / len(nodes), total[1] / len(nodes))
		self.center_id = int(uuid.uuid4())

class Router:
	OSM_URL = "https://lz4.overpass-api.de/api/interpreter"

	area_name = "University of North Carolina"

	connectivity_threshold = 1.2

	def _compute_building_highway_connectivity(self, building_nodes, highway_nodes):
		for building_id, building in self.buildings.items():
			max_distance = max(
				self._point_distance(self.nodes[node_id], building.center) for node_id in building_nodes[building_id]
			)

			for node_id in highway_nodes:
				node = self.nodes[node_id]

				threshold = self.__class__.connectivity_threshold * max_distance

				if self._point_distance(building.center, node) < threshold:
					self.node_conn[building.center_id].append(node)
					self.node_conn[node].append(building.center_id)

	def _point_distance(self, p1, p2):
		return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

	def populate_cache(self):
		self.nodes = {}
		self.node_conn = collections.defaultdict(list)

		self.buildings = {}

		building_nodes = {}

		highway_nodes = []

		json = requests.get(self.__class__.OSM_URL, data=f"""
[out:json];

area[name="{self.__class__.area_name}"] -> .search_area;

(
	way(area.search_area)[highway=footway];
	way(area.search_area)[building=yes];
);

(._; >;);

out;""").json()

		for element in json["elements"]:
			if element["type"] == "node":
				self.nodes[element["id"]] = (element["lat"], element["lon"])
			elif element["tags"].get("highway") == "footway":
				nodes = element["nodes"]

				for i in range(len(nodes)):
					if i < len(nodes) - 1:
						self.node_conn[nodes[i]] = nodes[i + 1]

					if i > 0:
						self.node_conn[nodes[i]] = nodes[i - 1]

				highway_nodes.extend(nodes)
			elif element["tags"].get("building") == "yes":
				name = element["tags"].get("name")

				if name is not None:
					self.buildings[element["id"]] = RouterBuilding(name)

					building_nodes[element["id"]] = element["nodes"]
			else:
				print(f"Element not recognized: {element}")
				exit(1)

		for building_id, node_ids in building_nodes.items():
			building = self.buildings[building_id]
			building.set_center(list(map(self.nodes.__getitem__, node_ids)))

			self.nodes[building.center_id] = self.buildings[building_id].center

		self._compute_building_highway_connectivity(building_nodes, highway_nodes)