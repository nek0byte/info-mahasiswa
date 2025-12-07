from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import blueprints
from routes.mahasiswa_routes import mahasiswa_bp

app = Flask(__name__)

# Configure CORS properly
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Register blueprints
app.register_blueprint(mahasiswa_bp, url_prefix='/api/mahasiswa')

@app.route('/')
def home():
    return jsonify({
        "message": "Student Information System API",
        "version": "1.0.0",
        "endpoints": {
            "all_students": "/api/mahasiswa/",
            "paginated": "/api/mahasiswa/paginated",
            "student_detail": "/api/mahasiswa/{nim}",
            "years": "/api/mahasiswa/tahun"
        }
    })

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "student-info-system"
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "status": "error",
        "message": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "status": "error",
        "message": "Internal server error"
    }), 500

if __name__ == '__main__':
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"Starting Student Information System API...")
    print(f"Server running on http://{host}:{port}")
    print(f"API Documentation: http://{host}:{port}/")
    print(f"Health check: http://{host}:{port}/health")
    
    app.run(host=host, port=port, debug=debug)
