import os
from app.main import create_app
from app.models import Attractions
from sqlalchemy import func, desc, asc, cast

app = create_app()

user_lat = 45.7780621
user_long = 4.8035681

with app.app_context():
    query = Attractions.query \
        .with_entities(
            Attractions.attraction_type,
            Attractions.centroid,
            func.ST_GeogFromWKB(
                Attractions.centroid
            ),
            func.St_MakePoint(
                        user_lat,
                        user_long
            ),
            func.ST_Distance (
                func.ST_GeogFromWKB(
                    Attractions.centroid
                ),
                func.St_MakePoint(
                        user_lat,
                        user_long
                )
            ),
            func.ST_AsText(
                Attractions.centroid
            )

        ) \
        .first()

            # func.ST_GeogFromText(
            #     func.ST_SetSRID(
            #         func.St_MakePoint(
            #             user_lat,
            #             user_long
            #         ), 4326
            #     )
            # )


    print(query)
    print(query.keys)