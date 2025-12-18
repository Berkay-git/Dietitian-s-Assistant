from flask import Flask
from flask_cors import CORS
from db_config import db
from flask_migrate import Migrate
import os

# dietisyen için için yeni blueprint yazıcaz 

def create_app():
    app = Flask(__name__)
    CORS(app)  

    from routes.dietitian_routes import dietitian_bp
    app.register_blueprint(dietitian_bp, url_prefix='/api/dietitian')

    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-fallback-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:1234@localhost/dietitian_assistant'  # MySQL buraya kendi database şifrnizi yazıcaksınız şu 1234 olan kısıma
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    migrate = Migrate(app, db)

    # Register blueprints buraya gelicek BP ler

    return app

if __name__ == '__main__':
    app = create_app()
    print(app.url_map)
    app.run(host='0.0.0.0', port=5000,debug=True)
