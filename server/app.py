import os

from flask import Flask
from flask_cors import CORS

from .resources import init_app as api_init_app
from .models import init_app as db_init_app
from .docs import init_app as docs_init_app


app = Flask(__name__)
CORS(app)

# configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI") or "sqlite:///base.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["PROPAGATE_EXCEPTIONS"] = True

# configure jwt manager key
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = None

# initialization app to db
db_init_app(app)

# initialization app to api
api_init_app(app)

# initialization app to docs
docs_init_app(app)

if __name__ == "__main__":
    app.run(port=5000)
