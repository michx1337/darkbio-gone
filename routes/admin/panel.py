# modules
from flask import Blueprint, session, jsonify, request, current_app, redirect, render_template
from constants import accounts, pages
import math
import json

# constants
_app = Blueprint('panel', __name__)


def divide_chunks(l, n):
    for i in range(0, len(l), n):
        yield l[i:i + n]


# routes
@_app.route("/-/admin")
async def admin_panel():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    if not account["account"]["administrator"]:
        return render_template("errors/404.html")
    return render_template("admin/panel.html")


@_app.route("/-/admin/logs")
async def admin_panel_logs():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    if not account["account"]["administrator"]:
        return render_template("errors/404.html")
    return render_template("admin/logs.html")


@_app.post("/api/admin/search-users")
async def find_users():
    try:
        if "session_id" not in session:
            return redirect("/login")
        account = accounts.find_one(
            {"current_session_id": session["session_id"]})
        if not account:
            return redirect("/logout")
        if not account["account"]["administrator"]:
            return render_template("errors/404.html")

        try:
            username = request.form["username"]
            page = int(request.form.get("page", 0))
            limit = int(request.form.get("limit", 10))
        except Exception as e:
            return jsonify({"success": False, "users": [], "message": str(e)})

        try:
            users = pages.find({"_id": {"$regex": username}})
            documents = []
            for doc in users:
                owner = accounts.find_one({"uuid": doc["owner"]})
                owner["_id"] = owner["uuid"]
                doc["owner_data"] = owner
                documents.append(doc)
            if len(documents) == 0:
                return jsonify({
                    "success": True,
                    "users": [],
                    "message": "No pages found"
                })
            result = list(divide_chunks(documents, limit))
            page = abs(page) % len(result)
            return jsonify({
                "success":
                True,
                "users":
                result[page],
                "message":
                f"Showing page {page + 1} of {len(result)}"
            })
        except Exception as e:
            return jsonify({"success": False, "users": [], "message": str(e)})
    except Exception as e:
        return jsonify({"success": False, "users": [], "message": str(e)})


@_app.post("/api/admin/delete-page")
async def delete_page():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    if not account["account"]["administrator"]:
        return render_template("errors/404.html")

    current_username = request.form["username"]
    cur_page = pages.find_one({"_id": current_username})
    pages.delete_one({"_id": current_username})
    accounts.update_one({"uuid": cur_page["owner"]},
                        {"$pull": {
                            "pages": current_username
                        }})

    return jsonify({"success": True, "message": "Page deleted"})


@_app.post("/api/admin/change-username")
async def change_username():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    if not account["account"]["administrator"]:
        return render_template("errors/404.html")

    username = request.form["username"]
    new_username = request.form["new_username"]

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
        return jsonify({"success": True, "message": "Username changed"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@_app.post("/api/admin/add-badge")
async def add_badge():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    if not account["account"]["administrator"]:
        return render_template("errors/404.html")

    current_username = request.form["username"]
    badge = json.loads(request.form["badge"])

    try:
        pages.update_one({"_id": current_username},
                         {"$push": {
                             "status.badges": badge
                         }})
        return jsonify({"success": True, "message": "Added badge"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@_app.post("/api/admin/update-plan")
async def update_plan():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    if not account["account"]["administrator"]:
        return render_template("errors/404.html")

    current_username = request.form["username"]
    plan = request.form["plan"]
    user_data = pages.find_one({"_id": current_username})

    try:
        accounts.update_one({"uuid": user_data["owner"]},
                            {"$set": {
                                "account.plan": plan
                            }})
        return jsonify({"success": False, "message": "Gave plan"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@_app.post("/api/admin/delete-account")
async def delete_account():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    if not account["account"]["administrator"]:
        return render_template("errors/404.html")

    current_username = request.form["username"]

    try:
        user_data = pages.find_one({"_id": current_username})
        pages.delete_many({"owner": user_data["owner"]})
        accounts.delete_one({"uuid": user_data["owner"]})
        return jsonify({"success": True, "message": "Deleted account"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@_app.post("/api/admin/update-pages")
async def update_pages():
    if "session_id" not in session:
        return redirect("/login")
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return redirect("/logout")
    if not account["account"]["administrator"]:
        return render_template("errors/404.html")

    try:
        current_username = request.form["username"]
        pages = int(request.form["pages"])
        user_data = pages.find_one({"_id": current_username})

        account = accounts.update_one({"uuid": user_data["owner"]},
                                      {"$set": {
                                          "pages_allowed": pages
                                      }})
        return jsonify({"success": True, "message": "Added pages"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})
