Feature: Create new Feature
	As a api client
	I want to be able to create new features

	Scenario: Create new feature
		When I request creation of new feature with following data
			| name        | blueprint | context       | goal                         |
			| brain:name! | Nexus-6   | as a director | I want to create a replicant |
		Then the response status code is 201
		And the response body has a "id" field

	Scenario: Created feature has correct information
		When I request creation of new feature with following data
			| name  | blueprint | context       | goal                         |
			| brain | Nexus-6   | as a director | I want to create a replicant |
		And I request to find all features of blueprint "Nexus-6"
		Then the response status code is 200
		And the response body has a "items" field with a list of 1 items
		And the response body item 0 has a "id" field
		And the response body item 0 has a "name" field with "brain" value

	Scenario: Features cannot have same title
		When I request creation of new feature with following data
			| name  | blueprint | context       | goal                         |
			| brain | Nexus-6   | as a director | I want to create a replicant |
		And I request creation of new feature with following data
			| name  | blueprint | context       | goal                         |
			| brain | Nexus-6   | as a director | I want to create a replicant |
		Then the response status code is 409
		And the response body has a "err" field with a "invalid_feature" value
		And the response body has a "des" field with a "feature with same name already exists" value
