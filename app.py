from flask import Flask, render_template, redirect

app = Flask(__name__)

app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route("/")
def index():
    return render_template("index.html")

<<<<<<< HEAD
@app.route("/concerns")
def concerns():
    return render_template("concerns.html")
    # item: items)

app.config['TEMPLATES_AUTO_RELOAD'] = True
=======
@app.route("/routing")
def route():
    return redirect("/")
>>>>>>> b679dabd692245a8cd829bd998a84338d47bdcd5

if __name__ == "__main__":
    app.run(debug=True)


