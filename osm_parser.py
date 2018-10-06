import osmium as o
import sys
import shapely.wkb as wkblib
import os

from geoalchemy2.shape import from_shape
from geoalchemy2 import Geography, Geometry, WKTElement
from geoalchemy2.shape import from_shape
# from geojson import Feature, FeatureCollection, Point
from sqlalchemy import Column, and_, cast, func, or_, subquery

from app.models import Attractions
from app.main import db, create_app

wkbfab = o.geom.WKBFactory()


class TourismListHandler(o.SimpleHandler):

    def submit_location(amenity, id, tags, lon, lat, osm_type):

        osm_id = id
        name = tags.get('name','')

        attraction_type = tags.get('tourism','')
        
        centroid = "POINT(%s %s)" % (lat, lon)

        new_entry = Attractions(
            osm_id=osm_id,
            osm_type=osm_type,
            name=name,
            attraction_type=attraction_type,
            centroid=centroid
            )

        
        db.session.add(new_entry)
        db.session.commit()
        print ("Added:",new_entry)
        print("%i %s %s %s %f %f" % (id, osm_type, name, attraction_type,lon, lat))



    # def node(self, n):
    #     if 'tourism' in n.tags:
    #         self.submit_location(n.id, n.tags, n.location.lon, n.location.lat, 'node')
    #     else:
    #         pass

    # def way(self, w):
    #     if 'tourism' in w.tags:
    #         wkb = wkbfab.create_multipolygon(w)
    #         poly = wkblib.loads(wkb, hex=True)
    #         centroid = poly.representative_point()
    #         self.submit_location(w.id, w.tags, centroid.x, centroid.y, 'way')
    #     else:
    #         pass

    def area(self, a):
        if 'tourism' in a.tags:
            wkb = wkbfab.create_multipolygon(a)
            poly = wkblib.loads(wkb, hex=True)
            centroid = poly.representative_point()
            self.submit_location(a.id, a.tags, centroid.x, centroid.y,'area')
        else:
            pass

class AmenityListHandler(o.SimpleHandler):
    amenity_list = ['toilets', 'drinking_water']

    def submit_location(amenity, id, tags, lon, lat, osm_type):

        osm_id = id
        name = tags.get('name','')
        amenity_list = ['toilets', 'drinking_water']
        print(tags)
        # if 'tourism' in tags:
        #     attraction_type = tags.get('tourism')
        if 'amenity' in tags and tags.get('amenity') in amenity_list:
            attraction_type = tags.get('amenity','')
        else:
            attraction_type = ""
            print("error in tourism and amenity tags")
        
        centroid = "POINT(%s %s)" % (lat, lon)

        new_entry = Attractions(
            osm_id=osm_id,
            osm_type = osm_type,
            name=name,
            attraction_type=attraction_type,
            centroid=centroid
            )

        db.session.add(new_entry)
        db.session.commit()
        print ("Added:",new_entry)

        print("%i %s %s %s %f %f" % (id, osm_type, name, attraction_type,lon, lat))


    def node(self, n):
        
        if 'amenity' in n.tags and n.tags.get('amenity') in self.amenity_list:
            self.submit_location(n.id, n.tags, n.location.lon, n.location.lat, 'node')
        else:
            pass

    def way(self, w):
        if 'amenity' in w.tags and w.tags.get('amenity') in self.amenity_list:
            wkb = wkbfab.create_multipolygon(w)
            poly = wkblib.loads(wkb, hex=True)
            centroid = poly.representative_point()
            self.submit_location(w.id, w.tags, centroid.x, centroid.y, 'way')
        else:
            pass

    def area(self, a):
        if 'amenity' in a.tags and a.tags.get('amenity') in self.amenity_list:
            wkb = wkbfab.create_multipolygon(a)
            poly = wkblib.loads(wkb, hex=True)
            centroid = poly.representative_point()
            self.submit_location(a.id, a.tags, centroid.x, centroid.y,'area')
        else:
            pass



class CitiesRegionsHandler(o.SimpleHandler):

    def submit_location(amenity, id, tags, lon, lat,wkb):
        if tags['admin_level'] == '6' or tags['admin_level'] == '7' or tags['admin_level'] == '8':

            osm_id = id
            name = tags['name']
            admin_level = tags['admin_level']
            
            if admin_level == '4':
                admin_type = 'Region'
            elif admin_level == '6':
                admin_type = 'Department'
            elif admin_level == '7' or admin_level =='8':
                admin_type = 'City'
            else:
                print('Unknown value in admin_level tag')
            
            centroid = "POINT(%s %s)" % (lat, lon)

            new_entry = Locations(
                osm_id=osm_id,
                name=name,
                admin_type=admin_type,
                admin_level=admin_level,
                centroid=centroid,
                geometry=func.ST_FlipCoordinates(wkb)
                )

            db.session.add(new_entry)
            db.session.commit()
            print ("Added:",new_entry)

            # print("%i %s %f %f %-15s %s" % (id, name, lon, lat, admin_type, admin_level))


    def area(self, a):
        if 'admin_level' in a.tags:
            wkb = wkbfab.create_multipolygon(a)
            # wkblatlng = from_shape(wkb, srid=4326)
            poly = wkblib.loads(wkb, hex=True)
            centroid = poly.representative_point()
            self.submit_location(a.id, a.tags, centroid.x, centroid.y,wkb)


if __name__ == "__main__":
    pbf_file = os.path.join("C:\\","Users","Sorin","Documents","Projects","OSM DB","france.osm.pbf")
    print(pbf_file)

    app = create_app()

    with app.app_context():

    # CitiesRegionsHandler().apply_file(pbf_file)
    #TourismListHandler().apply_file(pbf_file)
        AmenityListHandler().apply_file(pbf_file)