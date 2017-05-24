'use strict';

module.exports = {
	FEATURE_ALREADY_EXIST: {
		err: 'invalid_feature',
		des: 'feature with same name already exists'
	},
	FEATURE_REQUIRE_NAME:{
		err: 'invalid_feature',
		des: 'feature must have a name'
	},
	FEATURE_REQUIRE_BLUEPRINT:{
		err: 'invalid_feature',
		des: 'feature must have a blueprint'
	},
	FEATURE_DOES_NOT_EXIST:{
		err: 'invalid_feature',
		des: 'feature does not exist'
	},
	FEATURE_INVALID_NAME_CHARACTERS:{
		err: 'invalid_feature',
		des: 'invalid character on name'
	}
	,
	FEATURE_INVALID_TAGS:{
		err: 'invalid_feature',
		des: 'invalid tag param'
	},
	FEATURE_INVALID_TAG_CHARACTERS:{
		err: 'invalid_feature',
		des: 'invalid character on tag'
	}
};
