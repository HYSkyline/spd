# -*- coding:utf-8 -*-

import os

f = open('config.config', 'r')
content = f.readlines()
f.close()

init_config = {}
for each in content:
    config_key, config_value = each.split(',')
    init_config[config_key] = config_value[:-1]


class Config:
    SECRET_KEY = os.environ.get('SECREC_KEY') or init_config['SECRET_KEY']
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    FLASK_ADMIN = os.environ.get('FLASK_ADMIN')

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or init_config['SQLALCHEMY_DATABASE_URI_dev']


config = {
    'development': DevelopmentConfig,
    'default': DevelopmentConfig
}


if __name__ == '__main__':
    print 'config check.'
    print config
    print 'config checkout.'
