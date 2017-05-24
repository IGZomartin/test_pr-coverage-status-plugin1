Feature: Find features
	As a api client
	I want to be able to find features

	Scenario: Find all features of a project
		When I request creation of new feature with following data
			| name  | blueprint | context       | goal                         |
			| brain | Nexus-6   | as a director | I want to create a replicant |
		And I request creation of new feature with following data
			| name | blueprint | context       | goal                         |
			| leg  | Nexus-6   | as a director | I want to create a replicant |
		And I request creation of new feature with following data
			| name | blueprint | context       | goal                         |
			| hand | Nexus-6   | as a director | I want to create a replicant |
		When I request to find all features of blueprint "Nexus-6"
		Then the response status code is 200
		And the response body has a "items" field with a list of 3 items
		And the response body item 0 has a "name" field with "brain" value
		And the response body item 1 has a "name" field with "leg" value
		And the response body item 2 has a "name" field with "hand" value

	Scenario: No blueprints
		When I request to find all features of blueprint "Nexus-6"
		Then the response status code is 200
		And the response body has a "items" field with a list of 0 items
