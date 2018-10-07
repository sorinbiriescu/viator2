from app.main import db
from flask_user import UserMixin
# import geojson
from geoalchemy2 import Geography, Geometry, WKTElement
# from geojson import Feature, FeatureCollection, Point
# from jsonschema import validate
from sqlalchemy import Column

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    active = db.Column('is_active', db.Boolean(), nullable=False, server_default='1')
    
    # User authentication information. The collation='NOCASE' is required
    # # to search case insensitively when USER_IFIND_MODE is 'nocase_collation'.
    username = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False, server_default='')
    email_confirmed_at = db.Column(db.DateTime())
    
    # User information
    first_name = db.Column(db.String(100), nullable=False, server_default='')
    last_name = db.Column(db.String(100), nullable=False, server_default='')

# to be changed to POI once I reimport the data
class Attractions(db.Model):

    __bind_key__ = None
    __tablename__ = 'attractions'
    
    id = db.Column(db.Integer, primary_key=True)
    osm_id = db.Column(db.BigInteger)
    osm_type = db.Column(db.Text)
    name = db.Column(db.Text)
    description = db.Column(db.Text)
    attraction_type = db.Column(db.Text)
    centroid = db.Column(Geometry('POINT'))