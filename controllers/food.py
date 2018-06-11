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
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def healthy():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def korean():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def pasta():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def pizza():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def sandwiches():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def sushi():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def burger():
    posts = db().select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()

