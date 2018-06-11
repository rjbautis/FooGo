# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user is not None else None


db.define_table('checklist',
                Field('user_email', default=get_user_email()),
                Field('food_location', default="Santa Cruz, CA"),
                Field('driver_name', 'text'),
                Field('latitude', 'double', readable=False),
                Field('longitude', 'double', readable=False),
                Field('post'),
                Field('fee', 'double', label="delivery fee"),
                Field('profile_picture_url'),
                Field('venmo_QR_url'),
                Field('category'),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('is_public', 'boolean', default=False),
                Field('created_on', 'datetime', default=request.now))

db.checklist.user_email.writable = False
db.checklist.user_email.readable = False
db.checklist.updated_on.writable = db.checklist.updated_on.readable = False
db.checklist.id.writable = db.checklist.id.readable = False

# Hides the check box 'is_public' for the user when creating a memo
db.checklist.is_public.readable = db.checklist.is_public.writable = False


db.define_table('comments',
                Field('parent_listing_id'),
                Field('commenter_name', 'text'),
                Field('written_comment', 'text'),
                Field('user_email', default=get_user_email()),
                Field('profile_picture_url'),
                Field('created_on', 'datetime', default=request.now),
                Field('showQR', 'boolean', default=False),
                Field('venmo_QR_url')),
                Field('location'),
                Field('phone')

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
User= db.auth_user
me = auth.user_id