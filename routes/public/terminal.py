# modules
from flask import Blueprint, render_template, session, redirect
from constants import accounts

# constants
_app = Blueprint('terminal', __name__)


# routes
@_app.get("/terminal")
def terminal():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    return render_template("public/terminal.html",
                           session=session,
                           account=account,
                           user=account['pages'][0])
