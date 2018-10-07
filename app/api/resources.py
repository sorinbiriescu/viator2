from flask import Blueprint
from flask_restful import Api, Resource, url_for, reqparse, abort
from app.models import Attractions
from app.main import db, ma
from app.api.status import HTTP_404_NOT_FOUND, HTTP_200_OK
from sqlalchemy import func
from shapely import wkb
from shapely.geometry import Point, mapping
from marshmallow import post_dump

api_bp = Blueprint('api', __name__)
api = Api(api_bp)


class POISchema(ma.Schema):
    class Meta:
        fields = ("id", "osm_id", "osm_type", "name", "description", "attraction_type", "lat_long")

    lat_long = ma.Method('get_lat_long')

    def get_lat_long(self, obj):
        point_wkb = wkb.loads(bytes(obj.centroid.data))
        lat_long = mapping(Point(point_wkb.x, point_wkb.y))
        return lat_long


    @post_dump(pass_many=False)
    def wrap(self, data):
        return {
            "type": "FeatureCollection",
            "features": [{    
                "type": "Feature",
                "properties": {
                    "id" : data["id"],
                    "osm_id": data["osm_id"],
                    "osm_type": data["osm_type"],
                    "name": data["name"],
                    "description": data["description"],
                    "attraction_type": data["attraction_type"]
                },
                "geometry": data["lat_long"]
            }]
        }

    
def get_POI_or_404(id):
    poi = Attractions.query \
            .filter_by(id=id) \
            .first()

    if poi is None:
        abort(HTTP_404_NOT_FOUND, message="POI id:{} doesn't exist".format(id))
    else:
        return poi

class POIList(Resource):
    # @marshal_with(results)
    def get(self):
        query = Attractions.query.limit(20).all()
 
        poi_list = {
            "total_results": 5,
            "total_pages": 5,
            "current_page": 5,
            "features" : [poi for poi in query]
        }
        
        print(poi_list)
        return poi_list, HTTP_200_OK

class POIItem(Resource):
    # @marshal_with(result_item)
    def get(self, id):
        poi = get_POI_or_404(id)
        result = POISchema().dump(poi).data
        print(result)
        return result, HTTP_200_OK


