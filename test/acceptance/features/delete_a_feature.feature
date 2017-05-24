Feature: Delete a feature
	As a api client
	I want to be able to delete a feature

	Scenario: Delete a concrete feature successfully
		When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          |
			| feature 1 | blueprint 1 | original context | original goal |
		And I request to delete the feature "feature 1"
		Then the response status code is 204

	Scenario: Feature is actually removed
		When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          |
			| feature 1 | blueprint 1 | original context | original goal |
		And I request to delete the feature "feature 1"
		And I request the feature "feature 1"
		Then the response status code is 404


