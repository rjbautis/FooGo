# food.py controller for views/food

import json


def breakfast():
    posts = db(db.checklist.category == "breakfast").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()

def burgers():
    posts = db(db.checklist.category == "burgers").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def desserts():
    posts = db(db.checklist.category == "desserts").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def healthy():
    posts = db(db.checklist.category == "healthy").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def korean():
    posts = db(db.checklist.category == "korean").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def pasta():
    posts = db(db.checklist.category == "pasta").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def pizza():
    posts = db(db.checklist.category == "pizza").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def sandwiches():
    posts = db(db.checklist.category == "sandwiches").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def sushi():
    posts = db(db.checklist.category == "sushi").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()


def burger():
    posts = db(db.checklist.category == "burger").select(
        orderby=~db.checklist.updated_on,
        limitby=(0, 5)
    )

    return locals()

