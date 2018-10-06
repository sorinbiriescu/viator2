from app.main import db, create_app

def create_db():
    app = create_app()

    with app.app_context():
        db.create_all()

if __name__ == "__main__":
    create_db()