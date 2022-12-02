# modules
from flask import Blueprint, render_template, session

# constants
_app = Blueprint('terms', __name__)


# routes
@_app.get("/terms")
async def public_home():
    return render_template("public/terms.html", session=session)
