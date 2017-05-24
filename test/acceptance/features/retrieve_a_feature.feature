Feature: Retrieve a feature
	As a api client
	I want to be able to retrieve a concrete feature

	Scenario: Retrieve a concrete feature successfully
		When I request creation of new feature with following data
			| name  | blueprint | context       | goal                         |
			| brain | Nexus-6   | as a director | I want to create a replicant |
		And I request creation of new feature with following data
			| name | blueprint | context       | goal                         |
			| leg  | Nexus-6   | as a director | I want to create a replicant |
		And I request creation of new feature with following data
			| name | blueprint | context       | goal                         |
			| hand | Nexus-6   | as a director | I want to create a replicant |
		When I request the feature "brain"
		Then the response status code is 200
		And the response body has a "name" field with a "brain" value
		And the response body has a "context" field with a "as a director" value


