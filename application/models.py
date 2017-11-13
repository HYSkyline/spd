# -*- coding:utf-8 -*-

from sqlalchemy.ext.declarative import declarative_base
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import db, login_manager
from geoalchemy2 import Geography

GeoBase = declarative_base()


class GeomReference(db.Model):
    """通过对应表查询各个shp文件"""
    __tablename__ = 'geomref'
    fid = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.Text)
    geomname = db.Column(db.Text)
    uploader = db.Column(db.String(32))
    uploadtime = db.Column(db.Numeric)
    datatype = db.Column(db.Text)
    datatime = db.Column(db.Numeric)
    dataspatialrange = db.Column(db.Text)


# class GeoPoint(GeoBase):
#     """点类地理数据"""
#     __tablename__ = 'geo_point'
#     ptid = db.Column(db.Integer, primary_key=True)
#     projectname = db.Column(db.Text)
#     quizee = db.Column(db.String(32))
#     geopt = db.Column(Geography(geometry_type='POINT', srid=4326))
#
#
# class GeoPolyline(GeoBase):
#     """线类地理数据"""
#     __tablename__ = 'geo_polyline'
#     plid = db.Column(db.Integer, primary_key=True)
#     projectname = db.Column(db.Text)
#     quizee = db.Column(db.String(32))
#     geopl = db.Column(Geography(geometry_type='LINESTRING', srid=4326))
#
#
# class GeoPolygon(GeoBase):
#     """面类地理数据"""
#     __tablename__ = 'geo_polygon'
#     pgid = db.Column(db.Integer, primary_key=True)
#     projectname = db.Column(db.Text)
#     quizee = db.Column(db.String(32))
#     geopg = db.Column(Geography(geometry_type='POLYGON', srid=4326))
#
#
# class GeoMultipolygon(GeoBase):
#     """复杂面类地理数据"""
#     __tablename__ = 'geo_multipolygon'
#     mpgid = db.Column(db.Integer, primary_key=True)
#     projectname = db.Column(db.Text)
#     quizee = db.Column(db.String(32))
#     geompg = db.Column(Geography(geometry_type='MULITPOLYGON', srid=4326))


# class User(UserMixin, db.Model):
#     __tablename__ = 'userlist'
#     uid = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(32), unique=True)
#     password = db.Column(db.String(16))
#     password_hash = db.Column(db.String(128))
#
#     def __repr__(self):
#         return '<User %r>' % self.username
#
#     @property
#     def password(self):
#         raise AttributeError('You should not PASS!')
#
#     @password.setter
#     def password(self, password):
#         self.password_hash = generate_password_hash(password)
#
#     def verify_password(self, password):
#         return check_password_hash(self.password_hash, password)
#
#     def get_id(self):
#         try:
#             return unicode(self.uid)
#         except AttributeError:
#             raise NotImplementedError('No id attribute - override get_id()')
#
#
# @login_manager.user_loader
# def load_user(user_id):
#     return User.query.get(int(user_id))
