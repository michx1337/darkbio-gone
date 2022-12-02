# modules
from flask import Blueprint, render_template, session, redirect

# constants
_app = Blueprint('login', __name__)


# routes
@_app.get("/login")
async def public_login():
    if 'session_id' in session:
        return redirect("/edit")
    return render_template("public/login.html")
