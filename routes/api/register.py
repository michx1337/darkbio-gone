# modules
from flask import Blueprint, session, jsonify, request, escape
from constants import accounts, pages
from app_functions import HashPassword, random_strings
from math import ceil
import time
import requests
from email_validator import validate_email, EmailNotValidError
import re
import json

# constants
_app = Blueprint('register_api', __name__)
username_regex = re.compile("[a-z0-9\_\-]{2,20}$")


# routes
@_app.post("/register")
async def api_login():
    email = escape(request.form['email'].lower())
    username = escape(request.form['username'].lower())
    password = escape(request.form['password'])
    password2 = escape(request.form['password2'])
    if request.form.get("captcha") == None:
        return jsonify({
            "message":
            "Invalid captcha, please wait a couple seconds to retry"
        }), 403
    
    captcha = escape(request.form['captcha'])
    ip = escape(request.headers["Cf-Connecting-Ip"])

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

    try:
        validation = validate_email(email, check_deliverability=True)
        email = validation.email
    except EmailNotValidError:
        return jsonify({"message": "Invalid email"}), 403

    if not username_regex.match(username):
        return jsonify({
            "message":
            "Username must 2-20 characters long and only uses a-z, 0-9, dashes, and underscores."
        }), 403

    if password != password2:
        return jsonify({"message": "Passwords do not match"}), 403

    email_check = accounts.find_one({"email": email})
    if email_check:
        return jsonify({"message": "Email is already taken"}), 403

    user = pages.find_one({"_id": username})
    if user:
        return jsonify({"message": "Username is already taken"}), 403

    with open("./blocked_names.json", "r") as f:
        blocked_names = json.load(f)

        if username in blocked_names:
            return jsonify({"message": "Username is already taken"}), 403

    session_id = f"{random_strings(12)}-{random_strings(10)}-{random_strings(15)}"
    user_id = f"{random_strings(10)}{ceil(time.time())}"

    account_data = {
        "uuid": user_id,
        "created_ms": ceil(time.time() * 1000),
        "current_session_id": session_id,
        "email": email,
        "password": HashPassword(password).decode("utf-8"),
        "affiliate_code": "",
        "affiliate_used": "",
        "pages": [username],
        "pages_allowed": 2,
        "account": {
            "logins": {
                session_id: {
                    "ip": ip,
                    "last_used": ceil(time.time() * 1000)
                }
            },
            "administrator": False,
            "mfa_enabled": False
        }
    }

    page_data = {
        "_id": username,
        "owner": user_id,
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
        accounts.insert_one(account_data)
    except Exception as e:
        print(e)
        return jsonify({"message": "There was an unexpected error"}), 403

    session["session_id"] = session_id
    return "success", 200
