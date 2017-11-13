# -*- coding:utf-8 -*-

from flask import render_template, session, redirect, url_for, current_app, request, jsonify, make_response
from .. import db, geo_engine
# from ..models import User
from ..models import GeomReference
from . import api
from ..geoconfig import init_config
from sqlalchemy.orm import sessionmaker
from geoalchemy2.functions import *
import shapely.wkb as wkb
import shapely.wkt as wkt
import simplejson as json
import psycopg2


conn = psycopg2.connect(
    database=init_config['database'],
    user=init_config['user'],
    password=init_config['password'],
    host=init_config['host'],
    port=init_config['port']
)
cur = conn.cursor()


@api.route('/api/geocatalog/', methods=['GET'])
def geocatalog():
    # 读取传入的参数（需要二级目录的方向）
    catalog_name = request.args.get('catalog')
    # 取回列表内符合筛选的数据对象
    geom_ref = GeomReference.query.all()
    catalog_list = []
    if catalog_name == 'Type':
        for each in geom_ref:
            catalog_list.append(each.datatype)
    elif catalog_name == 'Range':
        for each in geom_ref:
            catalog_list.append(each.dataspatialrange)
    catalog_list = {}.fromkeys(catalog_list).keys()
    # 传回前端
    response = make_response(json.dumps({
        'status': '200',
        'catalog': catalog_list
    }))
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET'
    response.headers['Access-Control-Allow-Headers'] = 'x-requested-with,content-type'
    return response


@api.route('/api/geodataList/', methods=['GET'])
def geodataList():
    geom_list = []
    # 读取传入的参数（矢量表的选择条件）
    filter_type = request.args.get('type')
    filter_range = request.args.get('range')
    if filter_type + filter_range != '':
    	data_filter = ''
        data_filter += database_filter_prepare(filter_type, 'datatype')
        data_filter += database_filter_prepare(filter_range, 'dataspatialrange')
        data_filter = data_filter[:-4]
        # 取回列表内符合筛选的地理数据
        sql_cmd = "select filename, geomname from geomref where " + data_filter
        cur.execute(sql_cmd)
        rows = cur.fetchall()
        for row in rows:
            geom_list.append([row[0], row[1]])
    # 传回前端
    response = make_response(json.dumps({
        'status': '200',
        'geomlist': sorted(geom_list)
    }))
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET'
    response.headers['Access-Control-Allow-Headers'] = 'x-requested-with,content-type'
    return response


def database_filter_prepare(arg, f):
    database_query = ''
    if arg:
        database_query = f + "='" + arg + "' and "
    return database_query


@api.route('/api/geomview/', methods=['GET'])
def geoview():
    geom_reference = request.args.get('geomref')
    # 准备生成各条数据(矢量要素的各个部分)的变量词典列表
    geom_geojson = {}
    geom_geojson['type'] = 'FeatureCollection'
    geom_geopart = []
    sql_cmd = "select *, ST_AsGeoJSON(shape) as geom from " + geom_reference
    cur.execute(sql_cmd)
    rows = cur.fetchall()
    # 返回数据表的各列抬头
    geomheading = [desc[0] for desc in cur.description]
    # 按照索引生成部件词典，对列名抬头和列中数据进行组合
    for row_i in range(len(rows)):
        geom_rec = {}
        geom_rec['type'] = 'Feature'
        geom_rec['id'] = str(row_i + 1)
        geom_rec['properties'] = {}
        for i in range(len(geomheading)):
            if geomheading[i] != 'shape':
                if geomheading[i] != 'geom':
                    geom_rec['properties'][geomheading[i]] = rows[row_i][i]
                else:
                    geom_rec['geometry'] = json.loads(rows[row_i][i])
        if geom_rec['geometry']['type'] == 'Polygon':
            geom_rec['geometry']['coordinates'][0].append(geom_rec['geometry']['coordinates'][0][0])
        geom_geopart.append(geom_rec)
    geom_geojson['features'] = geom_geopart
    # 传入前端
    response = make_response(json.dumps({
        'status': '200',
        'geomcount': len(rows),
        'geom': json.dumps(geom_geojson)
    }))
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET'
    response.headers['Access-Control-Allow-Headers'] = 'x-requested-with,content-type'
    return response