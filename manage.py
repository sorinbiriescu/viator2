from app.main import db, create_app

def create_db():
    app = create_app()

    with app.app_context():
        db.create_all()

def drop_db():
    app = create_app()

    with app.app_context():
        db.drop_all()

if __name__ == "__main__":
    drop_db()
    create_db()