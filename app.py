from flask import Flask, render_template, redirect

app = Flask(__name__)

app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/routing")
def route():
    return redirect("/")

if __name__ == "__main__":
    app.run(debug=True)


