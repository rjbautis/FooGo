# Here go your api methods.

def get_listings():
    logger.info("HELP")
    # db.checklist.truncate()

    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    listings = []
    has_more = False

    logger.info("inside")

    # If user is logged in, return listings belonging to him as well as public ones
    if auth.user is not None:
        rows = db((db.checklist.user_email == auth.user.email) | 
                        (db.checklist.is_public == 'True')).select(db.checklist.ALL, limitby=(start_idx, end_idx + 1))
    # Otherwise, return public listings only
    else:
        rows = db(db.checklist.is_public == 'True').select(db.checklist.ALL, limitby=(start_idx, end_idx + 1))

    logger.info(rows)


    # Append only the first ten listings to the list
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                driver_name = r.driver_name,
                listing = r.listing,
                user_email = r.user_email,
                food_location = r.food_location,
                longitude = r.longitude,
                latitude = r.latitude,
                category = r.category,
                is_public = r.is_public
            )
            listings.append(t)
        else:
            has_more = True
    logger.info("inside3")

    # Determine if the user is logged in or not
    logged_in = auth.user is not None

    logger.info(logged_in)

    return response.json(dict(
        listings=listings,
        logged_in=logged_in,
        has_more=has_more
    ))


@auth.requires_login()
def toggle_public():
    if request.vars.listing_id is not None:
        q = ((db.checklist.user_email == auth.user.email) &
             (db.checklist.id == request.vars.listing_id))
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
    #(Plongitude,Platitude) = geocode(request.vars.food_location + ', United States')
    t_id = db.checklist.insert(
        driver_name = request.vars.name,
        listing = request.vars.listing,
        category = request.vars.category,
        latitude = -122.030796,
        longitude = 36.974117,
    )
    t = db.checklist(t_id)
    return response.json(dict(name=t))


@auth.requires_signature()
def del_listing():
    # "Deletes a listing from the table"
    db(db.checklist.id == request.vars.listing_id).delete()
    return "ok"


def edit_listing():
    # If listing id is not null
    if request.vars.id is not None:
        # Grab first listing in db that has matching user id and user email
        q = ((db.checklist.user_email == auth.user.email) &
             (db.checklist.id == request.vars.id))
        row = db(q).select().first()

        # Update the record of the listing being edited inside the database
        row.update_record(
            title = request.vars.title_content,
            listing = request.vars.listing_content,
        )
    return dict()