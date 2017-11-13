# -*- coding:utf-8 -*-

import os

f = open('application/geoconfig.config', 'r')
content = f.readlines()
f.close()

init_config = {}
for each in content:
    config_key, config_value = each.split(',')
    init_config[config_key] = config_value[:-1]
