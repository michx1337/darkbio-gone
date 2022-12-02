# modules
from flask import Blueprint, render_template

# constants
_app = Blueprint('404', __name__)


# routes
@_app.errorhandler(404)
async def errors_404_handler():
    return render_template("errors/404.html")
