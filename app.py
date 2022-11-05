from flask import Flask, render_template

app = Flask(__name__)



@app.route("/")
def index():
    return render_template("index.html")

@app.route("/concerns")
def concerns():
    return render_template("concerns.html")
    # item: items)

app.config['TEMPLATES_AUTO_RELOAD'] = True

if __name__ == "__main__":
    app.run(debug=True)


