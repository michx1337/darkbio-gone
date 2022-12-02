# modules
from flask import Blueprint, render_template, session

# constants
_app = Blueprint('home', __name__)


# routes
@_app.get("/")
async def public_home():
    return render_template("public/home.html", session=session)
