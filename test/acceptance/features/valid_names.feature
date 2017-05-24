Feature: Special characters on names
	As an api client
	I want to be able to have special characters on feature names

	Scenario Outline: valid names on creation
		When I request creation of new feature with following data
			| name   | blueprint   | context          | goal          |
			| <NAME> | blueprint 1 | original context | original goal |
		Then the response status code is 201

		Examples:
			| NAME      |
			| }{][         |
			| !@#$%^&*)(   |
			| ][         |
			| AaAa 1    |
			| asdf-sadf |
			| asdf_sadf |
			| !@#$%^&*)(   |
			| blah \"adf\" |
			| >            |
			| <            |
			| {}[];':\"    |
			| }{][         |

	Scenario Outline: valid names on edit
		When I request creation of new feature with following data
			| name      | blueprint   | context          | goal          |
			| feature 1 | blueprint 1 | original context | original goal |
		And I request to edit the feature "feature 1" to the new data
			| name   | context        | goal        |
			| <NAME> | edited context | edited goal |
		Then the response status code is 200

		Examples:
			| NAME      |
			| AaAa 1    |
			| asdf-sadf |
			| asdf_sadf |
			| !@#$%^&*)(   |
			| blah \"adf\" |
			| >            |
			| <            |
			| {}[];':\"    |
			| }{][         |


