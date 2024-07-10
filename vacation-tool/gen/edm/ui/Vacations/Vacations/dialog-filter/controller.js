angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'vacation-tool.Vacations.Vacations';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DateStartFrom) {
				params.entity.DateStartFrom = new Date(params.entity.DateStartFrom);
			}
			if (params?.entity?.DateStartTo) {
				params.entity.DateStartTo = new Date(params.entity.DateStartTo);
			}
			if (params?.entity?.DateEndFrom) {
				params.entity.DateEndFrom = new Date(params.entity.DateEndFrom);
			}
			if (params?.entity?.DateEndTo) {
				params.entity.DateEndTo = new Date(params.entity.DateEndTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsPerson = params.optionsPerson;
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.DateStartFrom) {
				filter.$filter.greaterThanOrEqual.DateStart = entity.DateStartFrom;
			}
			if (entity.DateStartTo) {
				filter.$filter.lessThanOrEqual.DateStart = entity.DateStartTo;
			}
			if (entity.DateEndFrom) {
				filter.$filter.greaterThanOrEqual.DateEnd = entity.DateEndFrom;
			}
			if (entity.DateEndTo) {
				filter.$filter.lessThanOrEqual.DateEnd = entity.DateEndTo;
			}
			if (entity.Person !== undefined) {
				filter.$filter.equals.Person = entity.Person;
			}
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.Approved) {
				filter.$filter.contains.Approved = entity.Approved;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Vacations-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);