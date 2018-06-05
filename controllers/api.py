# Here go your api methods.

def get_listings():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    listings = []
    has_more = False

    # If user is logged in, return listings belonging to him as well as public ones
    if auth.user is not None:
        rows = db(db.checklist.category == request.vars.category).select(db.checklist.ALL, orderby=~db.checklist.created_on, limitby=(start_idx, end_idx + 1))
    # Otherwise, return public listings only
    else:
        rows = db(db.checklist.category == request.vars.category).select(db.checklist.ALL, orderby=~db.checklist.created_on, limitby=(start_idx, end_idx + 1))

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
            )
            listings.append(t)
        else:
            has_more = True

    # Determine if the user is logged in or not
    logged_in = auth.user is not None

    return response.json(dict(
        listings=listings,
        logged_in=logged_in,
        has_more=has_more
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
    t_id = db.checklist.insert(
        driver_name = request.vars.driver_name,
        post = request.vars.post,
        category = request.vars.category,
    )
    t = db.checklist(t_id)
    return response.json(dict(title=t))


@auth.requires_signature()
def del_listing():
    # "Deletes a memo from the table"
    db(db.checklist.id == request.vars.listing_id).delete()
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
        )
    return dict()