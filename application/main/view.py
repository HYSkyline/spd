# -*- coding:utf-8 -*-

from flask import render_template, session, redirect, url_for, current_app, request, jsonify, make_response
from .. import db, geo_engine
# from ..models import User
from ..models import GeomReference
from . import main
from ..geoconfig import init_config
from .form import NameForm
from flask_login import login_required
from sqlalchemy.orm import sessionmaker
from geoalchemy2.functions import *
import shapely.wkb as wkb
import shapely.wkt as wkt
import simplejson as json
import psycopg2


@main.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')
