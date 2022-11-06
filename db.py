import dataclasses
import datetime
import psycopg2
import time

@dataclasses.dataclass
class DatabaseComment:
	body: str
	name: str
	timestamp: datetime.datetime

	def serialize(self):
		return {
			"body": self.body,
			"name": self.name,
			"timestamp": time.mktime(self.timestamp.timetuple())
		}

class Database:
	def __init__(self):
		self.conn = psycopg2.connect("dbname=hacknc2022")
		self.conn.autocommit = True
		self.cur = self.conn.cursor()

		self.cur.execute("""
CREATE TABLE IF NOT EXISTS complaints (
	id SERIAL PRIMARY KEY,
	latitude DOUBLE PRECISION NOT NULL,
	longitude DOUBLE PRECISION NOT NULL,
	description TEXT NOT NULL,
	name TEXT,
	image BYTEA,
	image_type TEXT,
	resolved BOOLEAN DEFAULT FALSE NOT NULL,
	timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
	CHECK ((image IS NULL) = (image_type IS NULL))
);""")

		self.cur.execute("""
CREATE TABLE IF NOT EXISTS comments (
	id SERIAL PRIMARY KEY,
	complaint_id INTEGER REFERENCES complaints NOT NULL,
	body TEXT NOT NULL,
	name TEXT,
	timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);""")

	def __exit__(self):
		self.cur.close()
		self.conn.close()

	def all_complaints(self):
		self.cur.execute("SELECT id FROM complaints;")

		return [DatabaseComplaint(self, row[0]) for row in self.cur.fetchall()]

	def complaint(self, id_):
		self.cur.execute("SELECT FROM complaints WHERE id = %s;", (id_,))

		if self.cur.rowcount == 1:
			return DatabaseComplaint(self, id_)

	def create_complaint(self,
		latitude,
		longitude,
		description,
		poster_name=None,
		image=None,
		image_type=None
	):
		self.cur.execute("""
INSERT INTO complaints (latitude, longitude, description, name, image, image_type, timestamp)
	VALUES (%s, %s, %s, %s, %s, %s, NOW())
	RETURNING id;
""", (latitude, longitude, description, poster_name, image, None if image is None else image_type))

		return DatabaseComplaint(self, self.cur.fetchone()[0])

class DatabaseComplaint:
	def __init__(self, db, id_):
		self.db = db

		self.id = id_

	def add_comment(self, body, name=None):
		self.db.cur.execute(
			"INSERT INTO comments (complaint_id, body, name, timestamp) VALUES(%s, %s, %s, NOW());",

			(self.id, body, name)
		)

	def all_comments(self):
		self.db.cur.execute("SELECT body, name, timestamp FROM comments WHERE complaint_id = %s;", (self.id,))

		return [DatabaseComment(*row) for row in self.db.cur.fetchall()]

	@property
	def image(self):
		self.db.cur.execute("SELECT image, image_type FROM complaints WHERE id = %s;", (self.id,))

		image, image_type = self.db.cur.fetchone()

		return None if image is None else (bytes(image), image_type)

	@image.setter
	def set_image(self, image_image_type):
		self.db.cur.execute(
			"UPDATE complaints SET image = %s, image_type = %s WHERE id = %s;",

			(*image_image_type, self.id)
		)

	def serialize(self):
		self.db.cur.execute("""
SELECT latitude, longitude, description, name, resolved, EXTRACT(epoch FROM timestamp)
	FROM complaints
	WHERE id = %s;""",

			(self.id,)
		)

		row = self.db.cur.fetchone()

		return {
			"id": self.id,
			"latitude": row[0],
			"longitude": row[1],
			"description": row[2],
			"name": row[3],
			"resolved": row[4],
			"timestamp": row[5]
		}

	def set_resolved(self, resolved):
		self.db.cur.execute(
			"UPDATE complaints SET resolved = %s WHERE id = %s;",

			(resolved, self.id)
		)
