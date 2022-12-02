# modules
from flask import Blueprint, render_template

# constants
_app = Blueprint('page', __name__)
from constants import pages


# routes
@_app.get("/<username>")
async def public_page(username):
    username = username.lower()
    page = pages.find_one({"_id": username})
    if not page:
        return render_template("errors/404.html", username=username), 404
    page["profile"]["links"] = page["links"]
    page["profile"]["badges"] = page["status"]["badges"]

    page["profile"]["colors"]["name_gradient"] = False
    page["profile"]["colors"]["bio_gradient"] = False
    page["profile"]["colors"]["activity_gradient"] = False

    if type(page["profile"]["colors"]["name"]) == list:
        nc = page["profile"]["colors"]["name"]
        page["profile"]["colors"]["name_gradient"] = True
        page["profile"]["colors"]["name"] = nc[0]
        page["profile"]["colors"]["name2"] = nc[1]

    if type(page["profile"]["colors"]["activity"]) == list:
        nc = page["profile"]["colors"]["activity"]
        page["profile"]["colors"]["activity_gradient"] = True
        page["profile"]["colors"]["activity"] = nc[0]
        page["profile"]["colors"]["activity2"] = nc[1]

    if type(page["profile"]["colors"]["bio"]) == list:
        nc = page["profile"]["colors"]["bio"]
        page["profile"]["colors"]["bio_gradient"] = True
        page["profile"]["colors"]["bio"] = nc[0]
        page["profile"]["colors"]["bio2"] = nc[1]
    return render_template("public/page.html", page=page)
