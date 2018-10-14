from flask import Blueprint
from flask_restful import Api, Resource, url_for, reqparse, abort
from app.models import Attractions
from app.main import db, ma
from app.api.status import HTTP_404_NOT_FOUND, HTTP_200_OK
from sqlalchemy import func, desc, asc, cast
from geoalchemy2 import Geography
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

    items = ma.Nested(POISchema, many=True)

    @post_dump(pass_many=False)
    def wrap(self, data):
        return {
            "total_results": data["total"],
            "total_pages": data["pages"],
            "current_page": data["page"],
            "results" : {
                "type": "FeatureCollection",
                "features": data["items"]
            }
        }
    

class POIList(Resource):
    def post(self):

        parser = reqparse.RequestParser()
        parser.add_argument('amenity', type=str, required = True, help='Rate to charge for this resource', location="json")
        parser.add_argument('page', type=int, required = True, help='Rate to charge for this resource', location="json")
        parser.add_argument('per_page', type=int, required = True, help='Rate to charge for this resource', location="json")
        parser.add_argument('user_coords_lat', type=float, required = True, help='Rate to charge for this resource', location="json")
        parser.add_argument('user_coords_long', type=float, required = True, help='Rate to charge for this resource', location="json")
        args = parser.parse_args()
        
        query = Attractions.query \
            .filter(Attractions.attraction_type == args["amenity"]) \
            .order_by(
                func.ST_Distance(
                    Attractions.centroid
                    ,
                    func.St_MakePoint(
                        args["user_coords_lat"],
                        args["user_coords_long"]
                    )
                )
            ) \
            .paginate(page=args["page"], per_page=args["per_page"])

        result = POIListSchema().dump(query).data

        return result, HTTP_200_OK


class POIItem(Resource):

    def get(self, id):
        poi = Attractions.query.filter_by(id=id).first()

        if poi is None:
            abort(HTTP_404_NOT_FOUND, message="POI id:{} doesn't exist".format(id))
        else:
            result = POISchema().dump(poi).data
            return result, HTTP_200_OK
        


