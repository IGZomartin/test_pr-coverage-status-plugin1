Feature: Unique names
	As an api client
	I must not be able to create or edit two features with the same name inside the same blueprints

	Scenario Outline: Create similar feature name on same blueprint must work
			When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          |
			| feature 1 | blueprint 1 | original context | original goal |
		And I request creation of new feature with following data
			| name   | blueprint   | context         | goal         |
			| <NAME> | blueprint 1 | feature context | feature goal |
		Then the response status code is 201
		Examples:
			| NAME      |
			| feature 2 |
			| feat      |
			| re 1      |
		  | tur       |

	Scenario Outline: Create same feature name on same blueprint must fail
			When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          |
			| feature 1 | blueprint 1 | original context | original goal |
		And I request creation of new feature with following data
			| name   | blueprint   | context         | goal         |
			| <NAME> | blueprint 1 | feature context | feature goal |
		Then the response status code is 409
		And the response body has a "err" field with a "invalid_feature" value
		And the response body has a "des" field with a "feature with same name already exists" value
		Examples:
			| NAME      |
			| feature 1 |
			| Feature 1 |
			| featurE 1 |
		  | feaTurE 1 |

	Scenario Outline: Edit similar feature name on same blueprint must work
		When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          |
			| feature 1 | blueprint 1 | original context | original goal |
		And I request creation of new feature with following data
			| name      | blueprint   | context         | goal         |
			| feature 2 | blueprint 1 | feature context | feature goal |
		And I request to edit the feature "feature 2" to the new data
			| name   | context        | goal        |
			| <NAME> | edited context | edited goal |
		Then the response status code is 200
		Examples:
			| NAME      |
			| feature 2 |
			| feat      |
			| re 1      |
		  | tur       |

	Scenario Outline: Edit same feature name on same blueprint must fail
		When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          |
			| feature 1 | blueprint 1 | original context | original goal |
		And I request creation of new feature with following data
			| name      | blueprint   | context         | goal         |
			| feature 2 | blueprint 1 | feature context | feature goal |
		And I request to edit the feature "feature 2" to the new data
			| name   | context        | goal        |
			| <NAME> | edited context | edited goal |
		Then the response status code is 409
		And the response body has a "err" field with a "invalid_feature" value
		And the response body has a "des" field with a "feature with same name already exists" value
		Examples:
			| NAME      |
			| feature 1 |
			| Feature 1 |
			| featurE 1 |
		  | feaTurE 1 |

	Scenario: Create same name on different blueprints are ok
		When I request creation of new feature with following data
			| name      | blueprint   | context         | goal         |
			| feature 1 | blueprint 1 | feature context | feature goal |
		And I request creation of new feature with following data
			| name      | blueprint   | context         | goal         |
			| feature 1 | blueprint 2 | feature context | feature goal |
		Then the response status code is 201

	Scenario: Update same name on different blueprints are ok
		When I request creation of new feature with following data
			| name      | blueprint   | context         | goal         |
			| feature 1 | blueprint 1 | feature context | feature goal |
		And I request creation of new feature with following data
			| name      | blueprint   | context         | goal         |
			| feature 2 | blueprint 2 | feature context | feature goal |
		And I request to edit the feature "feature 2" to the new data
			| name      | context        | goal        |
			| feature 1 | edited context | edited goal |
		Then the response status code is 200

	Scenario: Same feature is ok (edit)
		When I request creation of new feature with following data
			| name      | blueprint   | context         | goal         |
			| feature 1 | blueprint 1 | feature context | feature goal |
		And I request to edit the feature "feature 1" to the new data
			| name      | context        | goal        |
			| feature 1 | edited context | edited goal |
		Then the response status code is 200
