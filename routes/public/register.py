# modules
from flask import Blueprint, render_template, session, redirect

# constants
_app = Blueprint('register', __name__)


# routes
@_app.get("/register")
async def public_login():
    if 'session_id' in session:
        return redirect("/edit")
    return render_template("public/register.html")
