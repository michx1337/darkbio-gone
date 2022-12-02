# modules
from flask import Blueprint, render_template, session, redirect
from constants import accounts

# constants
_app = Blueprint('edit', __name__)


# routes
@_app.route("/edit", methods=["GET", "POST"])
def edit():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    return render_template("public/edit.html",
                           session=session,
                           account=account)
