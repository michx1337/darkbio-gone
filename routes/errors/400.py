# modules
from flask import Blueprint, render_template
import werkzeug

# constants
_app = Blueprint('400', __name__)


# routes
@_app.errorhandler(werkzeug.exceptions.BadRequest)
async def errors_400_handler():
    return redirect("/edit")


_app.register_error_handler(400, errors_400_handler)