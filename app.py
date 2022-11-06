import flask, os, werkzeug.routing, pickle, db, routing


class ComplaintConverter(werkzeug.routing.BaseConverter):
    def to_python(self, value):
        try:
            id_ = int(value)
        except ValueError:
            raise werkzeug.routing.ValidationError

        complaint = get_db().complaint(id_)

        if complaint is None:
            raise werkzeug.routing.ValidationError

        return complaint

app = flask.Flask(__name__)
app.url_map.converters["complaint"] = ComplaintConverter

@app.teardown_request
def close_db(_):
    if "db" in flask.g:
        flask.g.db.__exit__()

def get_db():
    if "db" not in flask.g:
        flask.g.db = db.Database()

    return flask.g.db

def get_router():
    if "router" not in flask.g:
        cache_dir = os.environ.get("XDG_CACHE_HOME", os.path.join(os.environ["HOME"], ".cache"))

        router_path = os.path.join(cache_dir, "mobility_router.pkl")

        try:
            with open(router_path) as file:
                flask.g.router = pickle.load(file)
        except FileNotFoundError:
            flask.g.router = routing.Router()
            flask.g.router.populate_cache()

            with open(router_path, "w") as file:
                pickle.dump(flask.g.router, file)

    return flask.g.router

@app.route("/")
def index():
    return flask.render_template("index.html")

@app.route("/map")
def map():
    return flask.render_template("map.html")

@app.route("/complaint/<complaint:complaint>/comments")
def complaint_comments(complaint):
    return flask.jsonify([comment.serialize() for comment in complaint.all_comments()])

@app.post("/complaint/<complaint:complaint>/comments")
def add_complaint_comment(complaint):
    try:
        complaint.add_comment(
            flask.request.data["body"],
            name=flask.request.data.get("name")
        )
    except KeyError:
        return "Please specify a body and, optionally, the name of the poster.", 400

    return ""

@app.route("/complaint/<complaint:complaint>/image")
def complaint_image(complaint):
    image = complaint.image()

    return ("The given complaint has no attached image.", 404) if image is None else image

@app.put("/complaint/<complaint:complaint>/resolve")
def resolve_complaint(complaint):
    complaint.set_resolved(True)

    return ""

@app.route("/complaints")
def complaints():
    return flask.jsonify([complaint.serialize() for complaint in get_db().all_complaints()])

@app.post("/complaints")
def create_complaint():
    try:
        get_db().create_complaint(
            flask.request.form["location"],
            flask.request.form["description"],
            poster_name=flask.request.form.get("name", None),
            image=flask.request.form.get("image"),
            image_type=flask.request.content_type
        )
    except KeyError:
        return "Please specify a building ID, description, and, optionally, the name of the poster", 400

    return ""

@app.route("/building_location")
def building_location():
    if "q" not in flask.request.args:
        return 'Please specify a search term using the "q" query parameter.', 400

    for building in get_router().buildings.values():
        if flask.request.args["q"] in building.name:
            return str(building.center_id)

    return "No building matches the specified search term.", 404

@app.route("/directions")
def directions():
    return flask.render_template("directions.html")
