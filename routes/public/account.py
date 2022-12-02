# modules
from flask import Blueprint, render_template, session

# constants
_app = Blueprint('account', __name__)


# routes
@_app.get("/account")
async def public_home():
    return render_template("public/account.html", session=session)
