# modules
from flask import Blueprint, render_template, session

# constants
_app = Blueprint('priacy', __name__)


# routes
@_app.get("/privacy")
async def public_privacy():
    return render_template("public/privacy.html", session=session)
