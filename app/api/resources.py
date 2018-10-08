from flask import Blueprint
from flask_restful import Api, Resource, url_for, reqparse, abort
from app.models import Attractions
from app.main import db, ma
from app.api.status import HTTP_404_NOT_FOUND, HTTP_200_OK
from sqlalchemy import func
from shapely import wkb
from shapely.geometry import Point, mapping
from marshmallow import post_dump, pre_dump

api_bp = Blueprint('api', __name__)
api = Api(api_bp)


class POISchema(ma.Schema):
    class Meta:
        fields = ("id", "osm_id", "osm_type", "name", "description", "attraction_type", "lat_long")

    lat_long = ma.Method('get_lat_long')

    def get_lat_long(self, obj):
        point_wkb = wkb.loads(bytes(obj.centroid.data))
        lat_long = mapping(Point(point_wkb.y, point_wkb.x))
        return lat_long


    @post_dump(pass_many=False)
    def wrap(self, data):
        return { 
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
        }

class POIListSchema(ma.Schema):
    class Meta:
        fields = ("total", "pages", "page", "items")

    @pre_dump(pass_many=False)
    def serialize_poi(self, data):
        self.results = []
        self.total = data.total
        self.pages = data.pages
        self.page = data.page
        for poi in data.items:
            serialized_poi = POISchema().dump(poi).data
            self.results.append(serialized_poi)

    @post_dump(pass_many=False)
    def wrap(self, data):
        print(data)
        return {
            "total_results": self.total,
            "total_pages": self.pages,
            "current_page": self.page,
            "results" : {
                "type": "FeatureCollection",
                "features": [poi for poi in self.results]
            }
        }
    
def get_POI_or_404(id):
    poi = Attractions.query.filter_by(id=id).first()

    if poi is None:
        abort(HTTP_404_NOT_FOUND, message="POI id:{} doesn't exist".format(id))
    else:
        return poi

class POIList(Resource):
    def get(self, attraction, page, per_page):
        query = Attractions.query \
            .filter(Attractions.attraction_type == attraction) \
            .paginate(page=page, per_page=per_page)
        result = POIListSchema().dump(query).data

        return result, HTTP_200_OK

class POIItem(Resource):
    def get(self, id):
        poi = get_POI_or_404(id)
        result = POISchema().dump(poi).data

        return result, HTTP_200_OK


