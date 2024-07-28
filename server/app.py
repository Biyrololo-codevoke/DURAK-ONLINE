import os
import datetime

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
app.config['SQLALCHEMY_POOL_RECYCLE'] = 300  # Таймаут в секундах
app.config['SQLALCHEMY_POOL_SIZE'] = 100
app.config['SQLALCHEMY_MAX_OVERFLOW'] = 0


# configure jwt manager key
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=30)

# initialization app to db
db_init_app(app)

# initialization app to api
api_init_app(app)

# initialization app to docs
docs_init_app(app)

if __name__ == "__main__":
    app.run(port=5000)
