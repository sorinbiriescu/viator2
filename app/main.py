#!/usr/bin/env python3
"""
Documentation

See also https://www.python-boilerplate.com/flask
"""


from flask import Flask, jsonify
from flask_cors import CORS
from logzero import logger


def create_app(config_filename="development.cfg"):
    '''
    This is the main factory to create Flask app instances
    '''
    app = Flask(__name__, instance_relative_config=True)

    # See http://flask.pocoo.org/docs/latest/config/
    app.config.from_pyfile(config_filename)

    # Setup cors headers to allow all domains
    # https://flask-cors.readthedocs.io/en/latest/
    CORS(app)

    from app.routes import main
    app.register_blueprint(main)


    return app


