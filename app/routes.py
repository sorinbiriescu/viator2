
# Definition of the routes. Put them into their own file. See also
# Flask Blueprints: http://flask.pocoo.org/docs/latest/blueprints

from flask import Blueprint
from logzero import logger

main = Blueprint("main", __name__)

@main.route("/")
def hello_world():
    logger.info("/")
    return "Hello World"