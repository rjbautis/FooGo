# food.py controller for views/food

import json


def breakfast():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()

def burgers():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def desserts():
    return dict(message=T('Welcome to web2py!'))


def healthy():
    return dict(message=T('Welcome to web2py!'))


def korean():
    return dict(message=T('Welcome to web2py!'))


def pasta():
    return dict(message=T('Welcome to web2py!'))


def pizza():
    return dict(message=T('Welcome to web2py!'))


def sandwiches():
    return dict(message=T('Welcome to web2py!'))


def sushi():
    return dict(message=T('Welcome to web2py!'))


def burger():
    return dict(message=T('Welcome to web2py!'))

