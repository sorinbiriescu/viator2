class User_Admin_Schema(ma.ModelSchema):
	class Meta:
		model = User_Admin

	location_info = ma.Nested('Location_Info_Schema', many=False, exclude=('account_owner', 'location.accounts'))


class Location_Info_Schema(ma.ModelSchema):
	class Meta:
		model = Location_Info

	location      = ma.Nested('Location_Schema', many=False, exclude=('info',))
	account_owner = ma.Nested('User_Admin_Schema', many=False, exclude=('location_info',))


class Location_Schema(ma.ModelSchema):
	class Meta:
		model = Location

	info      = ma.Nested('Location_Info_Schema', many=False, exclude=('location',))
	accounts  = ma.Nested('Account_Schema', many=True, exclude=('location',))