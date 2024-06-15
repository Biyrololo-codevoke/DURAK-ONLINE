import os

from flask import Flask
from flask_cors import CORS

from resources import init_app as api_init_app
from .models import init_app as db_init_app
from .docs import init_app as docs_init_app


app = Flask(__name__)
CORS(app)

# configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["PROPAGATE_EXCEPTIONS"] = True

# configure jwt manager key
app.config["JWT_SECRET_KEY"] = (
    "OIDU#H-298ghd-7G@#DF^))GV31286f)D^#FV^2f06f6b-!%R@R^@!1263"
)

# initialization app to db
db_init_app(app)

# initialization app to api
api_init_app(app)

# initialization app to docs
docs_init_app(app)

if not os.path.exists("images"):
    os.mkdir("images")

if __name__ == "__main__":
    app.run(port=5050, host="0.0.0.0")