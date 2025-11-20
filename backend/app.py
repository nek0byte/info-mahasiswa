from flask import Flask
from flask_cors import CORS
from routes.mahasiswa_routes import mahasiswa_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(mahasiswa_bp, url_prefix='/api/mahasiswa')

@app.route('/')
def home():
    return "hello world!"

if __name__ == '__main__':
    app.run(debug=True)
