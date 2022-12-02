# modules
from flask import Blueprint, render_template, session, redirect

# constants
_app = Blueprint('logout', __name__)


# routes
@_app.get("/logout")
async def public_login():
    session.clear()
    return redirect("/")
