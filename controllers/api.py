# Here go your api methods.
import json
from gluon.tools import geocode


def get_listings():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    listings = []

    # Debugging tool
    # db.checklist.truncate()
    # db.comments.truncate()

    logger.info(db().select(db.comments.ALL))

    # If user is logged in, return listings belonging to him as well as public ones
    if auth.user is not None:
        rows = db(db.checklist.category == request.vars.category).select(db.checklist.ALL, orderby=~db.checklist.created_on, limitby=(start_idx, end_idx + 1))
    # Otherwise, return public listings only
    else:
        rows = db(db.checklist.category == request.vars.category).select(db.checklist.ALL, orderby=~db.checklist.created_on, limitby=(start_idx, end_idx + 1))

    logger.info(rows)

    # Append only the first ten listings to the list
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                user_email = r.user_email,
                is_public = r.is_public,
                created_on=r.created_on,
                driver_name = r.driver_name,
                post = r.post,
                food_location=r.food_location,
                longitude=r.longitude,
                latitude=r.latitude,
                fee=r.fee,
                profile_picture_url = r.profile_picture_url,
                venmo_QR_url = r.venmo_QR_url,
            )
            listings.append(t)

    # Determine if the user is logged in or not
    logged_in = auth.user is not None

    return response.json(dict(
        listings=listings,
        logged_in=logged_in,
    ))


@auth.requires_login()
def toggle_public():
    if request.vars.memo_id is not None:
        q = ((db.checklist.user_email == auth.user.email) &
             (db.checklist.id == request.vars.memo_id))
        row = db(q).select().first()

        # If the query's is_public field is True, then toggle it to False
        # Otherwise, toggle it to True
        if row.is_public is True:
            row.update_record(is_public='False')
        else:
            row.update_record(is_public='True')
    logger.info(row)
    return "ok"


# Add new listings to the checklist
@auth.requires_signature()
def add_listing():
    (plongitude, platitude) = geocode(request.vars.food_location + ', United States')
    logger.info(platitude)
    logger.info(plongitude)
    # if user is logged in, insert their profile picture into the listing. Otherwise, don't
    if auth.user is not None:
        t_id = db.checklist.insert(
            driver_name = request.vars.driver_name,
            post = request.vars.post,
            category = request.vars.category,
            profile_picture_url = auth.user.profile_picture,
            venmo_QR_url = auth.user.VenmoQR,
            food_location=request.vars.food_location,
            fee=request.vars.fee,
            longitude = plongitude,
            latitude = platitude,
        )
    else:
        t_id = db.checklist.insert(
            driver_name = request.vars.driver_name,
            post = request.vars.post,
            category = request.vars.category,
            food_location=request.vars.food_location,
        )
    t = db.checklist(t_id)
    return response.json(dict(title=t))


@auth.requires_signature()
def del_listing():
    # "Deletes a memo from the table"
    db(db.checklist.id == request.vars.listing_id).delete()

    # deletes all comments associated with the listing
    db(db.comments.parent_listing_id == request.vars.listing_id).delete()

    return "ok"


def edit_listing():
    # If memo id is not null
    if request.vars.id is not None:
        # Grab first memo in db that has matching user id and user email
        q = ((db.checklist.user_email == auth.user.email) &
             (db.checklist.id == request.vars.id))
        row = db(q).select().first()

        # Update the record of the memo being edited inside the database
        row.update_record(
            driver_name = request.vars.driver_name_content,
            post = request.vars.post_content,
            fee = request.vars.fee_content,
        )
    return dict()


def get_listing_comments():
    comments = []
    rows = db(db.comments.parent_listing_id == request.vars.parent_listing_id).select(db.comments.ALL, orderby=~db.comments.created_on)

    logger.info("inside get_listing_comments")

    for i, r in enumerate(rows):

        c = dict(
            id = r.id,
            parent_listing_id = r.parent_listing_id,
            commenter_name = r.commenter_name,
            written_comment = r.written_comment,
            created_on = r.created_on,
            user_email = r.user_email,
            comment_phone=r.comment_phone,
            venmo_QR_url= r.venmo_QR_url,
            comment_location = r.comment_location,
            profile_picture_url = r.profile_picture_url

        )
        comments.append(c)

    return response.json(dict(
        comments=comments
    ))


def add_comment():


    c_id = db.comments.insert(
        parent_listing_id = request.vars.parent_listing_id,
        commenter_name = request.vars.commenter_name,
        written_comment = request.vars.written_comment,
        venmo_QR_url=auth.user.VenmoQR,
        comment_location=request.vars.comment_location,
        comment_phone=request.vars.comment_phone,
        profile_picture_url=auth.user.profile_picture
    )
    c = db.comments(c_id)
    logger.info(c)
    return response.json(dict(comments=c))


def del_comment():
    db(db.comments.id == request.vars.comment_id).delete()

    return "ok"


@auth.requires_signature()
def toggle_QR():
    logger.info(request.vars.comment_id)
    if request.vars.comment_id is not None:
        q = (db.comments.id == request.vars.comment_id)
        row = db(q).select().first()

        logger.info("row is ")
        logger.info(row)

        # If the query's is_public field is True, then toggle it to False
        # Otherwise, toggle it to True
        if row.showQR is True:
            row.update_record(showQR='False')
        else:
            row.update_record(showQR='True')
        logger.info(row)
    return response.json(dict(row=row))

    # q = db.comments(request.vars.comment_id)
    # logger.info(request.vars.comment_id)
    # t.update_record(showQR=not t.showQR)
    # loggerx

# Profile Picture

@auth.requires_signature()
def add_profile_picture_url():
    profile_picture_id = db.checklist.insert(
        profile_picture_url=request.vars.profile_picture_url
    )
    logger.info(db().select(db.checklist.ALL))
    return response.json(dict(checklist=dict(
        #id=profile_picture_id,
        profile_picture_url=request.vars.profile_picture_url

    )))



