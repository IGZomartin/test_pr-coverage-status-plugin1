Feature: Update a feature
	As a api client
	I want to be able to update a concrete feature

	Scenario: Update a concrete feature successfully
		When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          | tags |
			| feature 1 | blueprint 1 | original context | original goal | tag1 |
		And I request to edit the feature "feature 1" to the new data
			| name           | context        | goal        | testsResult | tags      |
			| edited feature | edited context | edited goal | passed      | tag1,tag2 |
		Then the response status code is 200

	Scenario: Updated feature has actually modified their fields
		When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          | tags |
			| feature 1 | blueprint 1 | original context | original goal | tag1 |
		And I request to edit the feature "feature 1" to the new data
			| name           | context        | goal        | testsResult | tags      |
			| edited feature | edited context | edited goal | passed      | tag1,tag2 |
		When I request the feature "edited feature"
		Then the response status code is 200
		And the response body has a "name" field with a "edited feature" value
		And the response body has a "context" field with a "edited context" value
		And the response body has a "goal" field with a "edited goal" value
		And the response body has a "testsResult" field with a "passed" value
		And the response body has a "tags" field with a list of 2 items

	Scenario: Update invalid feature
		And I request to edit the feature "invalid" to the new data
			| name           | context        | goal        |
			| edited feature | edited context | edited goal |
		Then the response status code is 404
		And the response body has a "err" field with a "invalid_feature" value
		And the response body has a "des" field with a "feature does not exist" value
