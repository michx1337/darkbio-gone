# modules
from flask import Blueprint, session, jsonify, request, escape
from constants import accounts
from app_functions import CheckPassword, random_strings
from math import ceil
import time
import requests

# constants
_app = Blueprint('login_api', __name__)


# routes
@_app.post("/login")
async def api_login():
    email = escape(request.form['email'].lower())
    password = escape(request.form['password'])
    if request.form.get("captcha") == None:
        return jsonify({
            "message":
            "Invalid captcha, please wait a couple seconds to retry"
        }), 403
        
    captcha = escape(request.form['captcha'])
    ip_address = escape(request.headers["Cf-Connecting-Ip"])

    data = {
        "secret": "0x4AAAAAAAAtdPZqaMV1uyqqVyvrvH08QMw",
        "response": captcha
    }

    data = requests.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data=data).json()
    if not data["success"]:
        return jsonify({
            "message":
            "Invalid captcha, please wait a couple seconds to retry"
        }), 403

    info = accounts.find_one({"email": email})
    if not info:
        return jsonify({"message": "User does not exist"}), 403

    check = CheckPassword(password, info['password'])
    if not check:
        return jsonify({"message": "Invalid password"}), 403

    new_session = f"{random_strings(12)}-{random_strings(10)}-{random_strings(15)}"

    info['account']['logins'] = {
        new_session: {
            "ip": ip_address,
            "last_used": ceil(time.time() * 1000)
        }
    }

    accounts.update_one({"_id": info["_id"]}, {
        "$set": {
            "account": info["account"],
            "current_session_id": new_session
        }
    })

    session['session_id'] = new_session
    return jsonify({"message": "Successfully logged in"})
