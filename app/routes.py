
# Definition of the routes. Put them into their own file. See also
# Flask Blueprints: http://flask.pocoo.org/docs/latest/blueprints

from flask import Blueprint, render_template_string
from logzero import logger
from flask_user import login_required

index = Blueprint("index", __name__)

@index.route("/")
def hello_world():
    logger.info("/")
    return "Hello World"

@index.route("/home")
def home_page():
        # String-based templates
        return render_template_string("""
            {% extends "flask_user_layout.html" %}
            {% block content %}
                <h2>Home page</h2>
                <p><a href={{ url_for('user.register') }}>Register</a></p>
                <p><a href={{ url_for('user.login') }}>Sign in</a></p>
                <p><a href={{ url_for('index.home_page') }}>Home page</a> (accessible to anyone)</p>
                <p><a href={{ url_for('index.member_page') }}>Member page</a> (login required)</p>
                <p><a href={{ url_for('user.logout') }}>Sign out</a></p>
            {% endblock %}
            """)

@index.route('/members')
@login_required    # User must be authenticated
def member_page():
    # String-based templates
    return render_template_string("""
        {% extends "flask_user_layout.html" %}
        {% block content %}
            <h2>Members page</h2>
            <p><a href={{ url_for('user.register') }}>Register</a></p>
            <p><a href={{ url_for('user.login') }}>Sign in</a></p>
            <p><a href={{ url_for('index.home_page') }}>Home page</a> (accessible to anyone)</p>
            <p><a href={{ url_for('index.member_page') }}>Member page</a> (login required)</p>
            <p><a href={{ url_for('user.logout') }}>Sign out</a></p>
        {% endblock %}
        """)