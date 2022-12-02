# modules
from flask import Blueprint, render_template, session, redirect

# constants
_app = Blueprint('discord', __name__)


# routes
@_app.get("/discord")
async def public_discord():
    return redirect("https://discord.gg/bio")
