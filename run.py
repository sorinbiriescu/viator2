import os
from app.main import create_app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app = create_app(config_filename="development.cfg")
    app.run(host="0.0.0.0", port=port)