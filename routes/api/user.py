# modules
from flask import Blueprint, session, jsonify, request, escape
from constants import accounts, pages
from math import ceil
import time
import re
import bleach

# constants
_app = Blueprint('user_api', __name__)
username_regex = re.compile("[a-z0-9\_\-]{2,20}$")


# routes
@_app.post('/api/user/create-page')
def create_page():
    if "session_id" not in session:
        return jsonify({"message": "Not logged in."}), 403

    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return jsonify({"message": "Not logged in."}), 403

    username = request.form["username"].lower()

    if not username_regex.match(
            username) and not account["account"]["administrator"]:
        return jsonify({
            "message":
            "Username must 2-20 characters long and only uses a-z, 0-9, dashes and underscores."
        }), 403

    if len(account["pages"]) >= account["pages_allowed"]:
        return jsonify(
            {"message": "You already have the max amount of pages."}), 403

    user = pages.find_one({"_id": username})
    if user:
        return jsonify({"message": "Username already taken."}), 403

    page_data = {
        "_id": username,
        "owner": account["uuid"],
        "last_update_ms": ceil(time.time() * 1000),
        "profile": {
            "avatar": "",
            "background": "",
            "background_type": "",
            "display_name": username,
            "activity": "",
            "bio": "Welcome to your new dark.bio profile!",
            "font": "poppins",
            "colors": {
                "name": "#FFFFFF",
                "activity": "#FFFFFF",
                "bio": "#FFFFFF",
                "container": "#000000"
            }
        },
        "links": [],
        "status": {
            "badges": [],
            "plan": "free",
            "plan_until_ms": 0
        }
    }

    try:
        pages.insert_one(page_data)
        accounts.update_one({"_id": account["_id"]},
                            {"$push": {
                                "pages": username
                            }})
    except:
        return jsonify({"message": "There was an unexpected error."}), 403

    return jsonify({"message": "Created page."})


@_app.get("/api/user/profile-all/check/<username>")
def check_profile_all(username):
    if "session_id" not in session:
        return jsonify({"message": "Not logged in."}), 403
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return jsonify({"message": "Not logged in."}), 403

    if username not in account["pages"]:
        return jsonify({"message": "Page not yours."}), 403

    page = pages.find_one({"_id": username})
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

    return jsonify(page["profile"])


@_app.get("/api/user/account/check")
def check_account():
    if "session_id" not in session:
        return jsonify({"message": "Not logged in."}), 403
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return jsonify({"message": "Not logged in."}), 403

    return jsonify({"email": account["email"]})


@_app.post("/api/user/change-username")
def change_username():
    if "session_id" not in session:
        return "err", 403
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return "err", 403

    print(request.form)

    username = escape(request.form["username"])
    new_username = escape(request.form["newusername"]).lower()

    if username not in account["pages"]:
        return jsonify({"message": "Page not yours."}), 403

    user = pages.find_one({"_id": new_username})
    if user:
        return jsonify({"message": "Username already taken."}), 403

    if not username_regex.match(
            new_username) and not account["account"]["administrator"]:
        return jsonify({
            "message":
            "Username must 2-20 characters long and only uses a-z, 0-9, dashes and underscores."
        }), 403

    current_pos = account["pages"].index(username)

    try:
        new_page = pages.find_one({"_id": username})
        new_page["_id"] = new_username
        pages.insert_one(new_page)
        pages.delete_one({"_id": username})
        accounts.update_one({"_id": account["_id"]},
                            {"$pull": {
                                "pages": username
                            }})
        accounts.update_one({"_id": account["_id"]}, {
            "$push": {
                "pages": {
                    "$each": [new_username],
                    "$position": current_pos
                },
            }
        })
    except:
        return jsonify({"message": "Change username failed."}), 403

    return jsonify({"message": "success"}), 200


@_app.post("/api/user/delete-page")
def delete_page():
    if "session_id" not in session:
        return "err", 403
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return "err", 403

    username = escape(request.form["username"].lower())

    if username not in account["pages"]:
        return jsonify({"message": "Page not yours."}), 403

    if len(account["pages"]) == 1:
        return jsonify({"message": "You must have atleast 1 page."}), 403

    try:
        pages.delete_one({"_id": username})
        accounts.update_one({"_id": account["_id"]},
                            {"$pull": {
                                "pages": username
                            }})
    except:
        return jsonify({"message": "Delete page failed."}), 403

    return jsonify({"message": "success"}), 200


@_app.get("/api/public/<username>")
def public_api(username):
    page = pages.find_one({"_id": username})

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

    return jsonify(page["profile"])