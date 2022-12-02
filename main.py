# modules
import os

os.system("pip install flask[async]")

import json
import time
import logging
import requests
import threading

from flask import Flask, request, session
from flask_cors import CORS
from importlib import import_module
from gevent.pywsgi import WSGIServer
from constants import pages, accounts
from datetime import datetime
from bson import json_util

# constants
app = Flask(__name__)
cors = CORS(app)
app.config["CORS_HEADERS"] = "application/json"
app.config["SECRET_KEY"] = "!!THEDARKESTOFBIOS123123123123123123!!"
app.config["IMAGE_UPLOADS"] = "./static/upload_cache"
app.config["ALLOWED_IMAGE_EXTENSIONS"] = ["PNG", "JPG", "JPEG", "GIF"]
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024
routes = ["admin", "api", "errors", "public"]

# clear console
os.system("clear")


def backup():
    while True:
        try:
            print('BACKUP', 'We are backing up data...', '')

            page = [
                json.loads(json_util.dumps(page)) for page in pages.find({})
            ]

            account = [
                json.loads(json_util.dumps(account))
                for account in accounts.find({})
            ]

            print('BACKUP', 'Data has been gathered!', '')

            with open(f"./backups/accounts/{time.time()}.json", "w") as f:
                json.dump(account, f, indent=4)
                f.close()

            with open(f"./backups/pages/{time.time()}.json", "w") as f:
                json.dump(page, f, indent=4)
                f.close()

            embed_data = {
                "content":
                None,
                "embeds": [{
                    "description": "A new backup has been made.",
                    "color": 1,
                    "timestamp": str(datetime.utcnow())
                }],
                "attachments": []
            }

            d = requests.post(
                "https://discord.com/api/webhooks/1038574358492364821/3FStzw_WruP7DPJGV_9dtv2QOPPrJs-mKW6UJRWu78sEduD5wllNWytygERJpdfR4JFX",
                json=embed_data)

            time.sleep(60 * 60)
        except Exception as e:
            print(e)
            pass


# load routes
for route in routes:
    for file in os.listdir(f"./routes/{route}"):
        if file.endswith(".py"):
            try:
                app.register_blueprint(
                    import_module(f'..{file[:-3]}',
                                  f'routes.{route}.subpkg')._app)
                print(f"Loaded routes.{route}.{file[:-3]}")
            except Exception as e:
                print(f"Error loading routes.{route}.{file[:-3]}\n{e}")

# Start backups
t = threading.Thread(target=backup)
t.daemon = True
t.start()

# print(
#   f"Request logged:\n{request.headers['X-Forwarded-For']} {request.method} | {request.path}\n{request.form}\n{request.headers}"
# )

embed_data = {
    "content":
    None,
    "embeds": [{
        "description": "Dark.bio is serving requests again.",
        "color": 1,
        "timestamp": str(datetime.utcnow())
    }],
    "attachments": []
}
requests.post(
    "https://discord.com/api/webhooks/1038577722185760799/8XEj-yO5kEGD5GF-cKKIWAV4iouJEPjCZlcBR87OoWT0ENTfB0t-ymF2ogtVGqzgrRhj",
    json=embed_data)

# load app
http_server = WSGIServer(('0.0.0.0', 80), app)
http_server.serve_forever()
