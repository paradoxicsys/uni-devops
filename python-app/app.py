from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello():
    return "<h1>Hello World from Python!</h1><p>Served by Flask in a python:3.12-slim container.</p>"


if __name__ == "__main__":
    # 0.0.0.0 so the app is reachable from outside the container
    app.run(host="0.0.0.0", port=5000)
