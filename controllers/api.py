# Here go your api methods.


def get_memos():
    logger.info("HELP")
    # db.checklist.truncate()

    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    memos = []
    has_more = False

    logger.info("inside")

    # If user is logged in, return memos belonging to him as well as public ones
    if auth.user is not None:
        rows = db((db.checklist.user_email == auth.user.email) | 
                        (db.checklist.is_public == 'True')).select(db.checklist.ALL, limitby=(start_idx, end_idx + 1))
    # Otherwise, return public memos only
    else:
        rows = db(db.checklist.is_public == 'True').select(db.checklist.ALL, limitby=(start_idx, end_idx + 1))

    logger.info(rows)


    # Append only the first ten memos to the list
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                driver_name = r.driver_name,
                memo = r.memo,
                user_email = r.user_email,
                is_public = r.is_public
            )
            memos.append(t)
        else:
            has_more = True
    logger.info("inside3")

    # Determine if the user is logged in or not
    logged_in = auth.user is not None

    logger.info(logged_in)

    return response.json(dict(
        memos=memos,
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


# Add new memos to the checklist
@auth.requires_signature()
def add_memo():
    t_id = db.checklist.insert(
        driver_name = request.vars.name,
        memo = request.vars.memo,
        category = request.vars.category,
    )
    t = db.checklist(t_id)
    return response.json(dict(name=t))


@auth.requires_signature()
def del_memo():
    # "Deletes a memo from the table"
    db(db.checklist.id == request.vars.memo_id).delete()
    return "ok"


def edit_memo():
    # If memo id is not null
    if request.vars.id is not None:
        # Grab first memo in db that has matching user id and user email
        q = ((db.checklist.user_email == auth.user.email) &
             (db.checklist.id == request.vars.id))
        row = db(q).select().first()

        # Update the record of the memo being edited inside the database
        row.update_record(
            title = request.vars.title_content,
            memo = request.vars.memo_content,
        )
    return dict()


# users and pictures


@auth.requires_signature()
def add_image():
    image_id = db.user_images.insert(
        image_url=request.vars.image_url,
        user_id=request.vars.user_id
    )
    return response.json(dict(user_images=dict(
        id=image_id,
        image_url=request.vars.image_url,
        user_id=request.vars.user_id
    )))


@auth.requires_signature(hash_vars=False)
def get_user_images():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    user_images = []

    user_id = request.vars.user_id if request.vars.user_id is not None else auth.user.id
    image_url = db(db.user_images.created_by == user_id).select(db.user_images.ALL, orderby=~db.user_images.created_on)

    for i, r in enumerate(image_url):
        if i < end_idx - start_idx:
            img = dict(
                created_on=r.created_on,
                created_by=r.created_by,
                image_url=r.image_url,
            )
            user_images.append(img)
    return response.json(dict(
        user_images=user_images,
    ))


@auth.requires_signature()
def get_users():
    users = []
    for r in db(db.auth_user.id > 0).select():
        user = dict(
            first_name=r.first_name,
            last_name=r.last_name,
            email=r.email,
            user_id=r.id,
        )
        users.append(user)
    return response.json(dict(
        users=users,
    ))