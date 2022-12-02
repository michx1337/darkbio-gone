# modules
from flask import Blueprint, session, jsonify, request, current_app, escape
from constants import accounts, pages
from math import ceil
import time
import json
import re
import boto3
import uuid
import os
import unicodedata

btsession = boto3.session.Session()
client = btsession.client(
    's3',
    region_name='sfo3',
    endpoint_url='https://sfo3.digitaloceanspaces.com',
    aws_access_key_id='DO00FJKEWE8V2ZMXX6T8',
    aws_secret_access_key='StsaHocXCMZNVH9jTcZdz1YuUXTRTWfqlKKlDEEIRo4')

# constants
_app = Blueprint('profile_api', __name__)
username_regex = re.compile("[a-z0-9\_\-]{2,20}$")


# routes
def allowed_image(filename):

    if not "." in filename:
        return False

    ext = filename.rsplit(".", 1)[1]

    if ext.upper() in current_app.config["ALLOWED_IMAGE_EXTENSIONS"]:
        return True

    return False


@_app.post("/api/user/update-profile/images")
def user_images():
    if "session_id" not in session:
        return jsonify({"message": "User does not exist"}), 403
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return jsonify({"message": "User does not exist"}), 403

    background = request.files.get("background") or None
    avatar = request.files.get("avatar") or None
    username = escape(request.form["username"].lower())

    if username not in account["pages"]:
        return jsonify({"message": "Page not yours"}), 403

    page_data = pages.find_one({"_id": username})
    original_avatar = page_data["profile"]["avatar"].replace(
        "https://cdn.dark.bio/", "")
    bg_type = page_data["profile"]["background_type"]
    original_background = page_data["profile"]["background"].replace(
        "https://cdn.dark.bio/", "")
    profile = page_data["profile"]

    if request.method == "POST":
        bg_name = f"{uuid.uuid4()}.{background.filename.split('.')[-1]}" if background else original_background
        av_name = f"{uuid.uuid4()}.{avatar.filename.split('.')[-1]}" if avatar else original_background

        print(background)
        print(request.form)
        if background:

            if background.filename == "":
                return jsonify({"message": "Images must have a name."}), 403

            if not allowed_image(background.filename) and background:
                return jsonify({"message": "Image type not allowed."}), 403

            if original_background != "" and "discord" not in original_background and bg_type == "image":
                client.delete_objects(
                    Bucket="darkbio",
                    Delete={'Objects': [{
                        'Key': f'{original_background}'
                    }]})

            background.save(
                os.path.join(current_app.config["IMAGE_UPLOADS"], bg_name))

            client.upload_file(
                f'./static/upload_cache/{bg_name}',
                'darkbio',
                f"img/background/{bg_name}",
                ExtraArgs={
                    'ACL': 'public-read',
                    'ContentType':
                    f'image/{background.filename.split(".")[-1]}'
                })

            os.remove(
                os.path.join(current_app.config["IMAGE_UPLOADS"], bg_name))

            profile["background_type"] = "image"
            profile[
                "background"] = f"https://cdn.dark.bio/img/background/{bg_name}"

        elif request.form["background"] != 'null':
            if original_background != "" and "discord" not in original_background and bg_type == "image":
                client.delete_objects(
                    Bucket="darkbio",
                    Delete={'Objects': [{
                        'Key': f'{original_background}'
                    }]})
            profile["background_type"] = "color"
            profile["background"] = request.form["background"].split()[0][:9]

        if avatar:
            if avatar.filename == "":
                return jsonify({"message": "Images must have a name."}), 403

            if not allowed_image(avatar.filename) and avatar:
                return jsonify({"message": "Image type not allowed."}), 403

            if original_avatar and "discord" not in original_avatar:
                client.delete_objects(
                    Bucket="darkbio",
                    Delete={'Objects': [{
                        'Key': f'{original_avatar}'
                    }]})

            avatar.save(
                os.path.join(current_app.config["IMAGE_UPLOADS"], av_name))

            client.upload_file(f'./static/upload_cache/{av_name}',
                               'darkbio',
                               f"img/avatar/{av_name}",
                               ExtraArgs={
                                   'ACL':
                                   'public-read',
                                   'ContentType':
                                   f'image/{avatar.filename.split(".")[-1]}'
                               })

            os.remove(
                os.path.join(current_app.config["IMAGE_UPLOADS"], av_name))

            profile["avatar"] = f"https://cdn.dark.bio/img/avatar/{av_name}"

        last_update_ms = ceil(time.time() * 1000)

        pages.update_one(
            {"_id": username},
            {"$set": {
                "profile": profile,
                "last_update_ms": last_update_ms
            }})

        return "Success"

    return jsonify({
        "avatar": original_avatar,
        "background": original_background,
        "background_type": bg_type
    })


@_app.post("/api/user/update-profile/display")
def user_display():
    if "session_id" not in session:
        return jsonify({"message": "Not logged in."}), 403
    account = accounts.find_one({"current_session_id": session["session_id"]})
    if not account:
        return jsonify({"message": "Not logged in."}), 403

    data = json.loads(request.form["data"])
    username = data["username"].lower()

    if username not in account["pages"]:
        return jsonify({"message": "Page not yours."}), 403

    page_data = pages.find_one({"_id": username})

    if request.method == "POST":
        last_update_ms = ceil(time.time() * 1000)

        profile = page_data["profile"]

        username = data["username"]
        name_color = data["name_color"].split()[0][:9]
        activity_color = data["activity_color"].split()[0][:9]
        bio_color = data["bio_color"].split()[0][:9]
        container_color = data["container_color"].split(
        )[0][:9] if data["container_color"] != None else None
        if data.get("secondary_name_color"):
            name_color = [
                data["name_color"].split()[0][:9],
                data["secondary_name_color"].split()[0][:9]
            ]
        if data.get("secondary_activity_color"):
            activity_color = [
                data["activity_color"].split()[0][:9],
                data["secondary_activity_color"].split()[0][:9]
            ]
        if data.get("secondary_bio_color"):
            bio_color = [
                data["bio_color"].split()[0][:9],
                data["secondary_bio_color"].split()[0][:9]
            ]

        display_name = data["display_name"]
        activity = data["activity"]
        bio = data["bio"]
        font = data["font"]
        if not font in [
                "poppins", "montserrat", "chillax", "cute", "creepster",
                "ropa", "garamond", "trebuchet", "sora", "comic-sans"
        ]:
            font = "poppins"
        links = data["links"]

        profile["colors"] = {
            "name": name_color,
            "activity": activity_color,
            "bio": bio_color,
            "container": container_color
        }
        profile["display_name"] = display_name
        profile["activity"] = activity
        profile["font"] = font
        profile["bio"] = bio

        if len(bio) > 250:
            return jsonify({"message":
                            "Bio must not exceed 250 characters."}), 403

        if len(activity) > 40:
            return jsonify(
                {"message": "Activity must not exceed 40 characters."}), 403

        if len(display_name) > 40:
            return jsonify(
                {"message":
                 "Display name must not exceed 40 characters."}), 403

        ZALGO_CHAR_CATEGORIES = ['Mn', 'Me']

        if len(links) > 50:
            return jsonify({"message": "Too many links"}), 403

        for link in links:
            link['name'] = ''.join([
                c for c in unicodedata.normalize('NFD', link['name'])
                if unicodedata.category(c) not in ZALGO_CHAR_CATEGORIES
            ])
            link['url'] = ''.join([
                c for c in unicodedata.normalize('NFD', link['url'])
                if unicodedata.category(c) not in ZALGO_CHAR_CATEGORIES
            ])
            link["color"] = link["color"].split()[0][:9]
            link["accent"] = link["accent"].split()[0][:9]
            if len(link['name']) > 100:
                return jsonify(
                    {"message": "Links must not exceed 100 characters."}), 403

        pages.update_one({"_id": username}, {
            "$set": {
                "profile": profile,
                "links": links,
                "last_update_ms": last_update_ms
            }
        })

        return "Success"

    return jsonify(page_data["profile"])
