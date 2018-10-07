"""
Used to create the app factory.
It has only one function defined **create_app** used to initialize a Flask instance with parameters.
"""


from flask import Flask, jsonify
from flask_cors import CORS
from logzero import logger
from flask_sqlalchemy import SQLAlchemy
from flask_user import UserManager
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
ma = Marshmallow()

def create_app(config_filename="development.cfg"):
    '''This is the main factory to create Flask app instances.
    
    Args:
        config_filename (str): The name of the configuration file to be used to instantiate the Flask app. The
            default is **development.cfg** which will run with **DEBUG = True** and on a development DB


    Returns:
        An app instance.
    '''

    # doc--main.py app config
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_pyfile(config_filename)
    # enddoc--main.py app config
    db.init_app(app)

    from app.models import User
    user_manager = UserManager(app, db, User)
    # Setup cors headers to allow all domains
    # https://flask-cors.readthedocs.io/en/latest/
    CORS(app)
    ma.init_app(app)

    # doc--main.py late blueprint import
    from app.routes import index
    app.register_blueprint(index)
    # enddoc--main.py late blueprint import

    from app.api.resources import api_bp
    app.register_blueprint(api_bp)

    from app.api.resources import api,POIList, POIItem
    api.add_resource(POIList, '/poi','/poi/', endpoint="poi_list")
    api.add_resource(POIItem, '/poi/<int:id>', endpoint="poi")

    return app


