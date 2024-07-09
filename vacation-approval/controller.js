const widgetsView = angular.module('widgets', ['ideUI', 'ideView']);


widgetsView.config(["messageHubProvider", function (messageHubProvider) {
    messageHubProvider.eventIdPrefix = 'template';
}]);

// Initialize controller
widgetsView.controller('WidgetsViewController', ['$scope', 'messageHub', function ($scope, messageHub) {

    $scope.btnText = "Badge button";
    $scope.btnType = "positive";
    $scope.btnState = "";
    $scope.btnToggled = true;

    $scope.splitButtonAction = "Action";
    $scope.segmentedModel = "middle";
    $scope.fdCheckboxModel = true;
    $scope.fdRadioModel = false;
    $scope.tristate = false;
    $scope.menusShown = false;
    $scope.fdListItem = { checkboxModel: true };
    $scope.objectStatusIndicator = 8;
    $scope.stepInputValue = 4;
    $scope.selectSelectedValue = 2;

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.totalItems = 100;
    $scope.tableWithPaginationItems = [];
    for (let i = 0; i < $scope.totalItems; i++) {
        $scope.tableWithPaginationItems.push({
            product: `Item ${i + 1}`,
            price: '$' + (Math.random() * 100).toFixed(2),
            amount: Math.floor(Math.random() * 1000)
        });
    }

    $scope.tabs = [...Array(10).keys()].map(i => ({ label: `Tab label ${i + 1}`, id: `tab_${i + 1}` }));
    $scope.isMoreTabsButtonVisible = (tabs) => tabs.some(x => x.isHidden);

    $scope.selectedTab = 'ti1pan';

    $scope.lastInputValue = "";

    function isText(keycode) {
        if (keycode >= 48 && keycode <= 90 || keycode >= 96 && keycode <= 111 || keycode >= 186 && keycode <= 222 || [8, 46, 173].includes(keycode)) return true;
        return false;
    }

    $scope.onTabClose = function (tabId) {
        console.log(tabId);
    };

    $scope.onTabClick = function () {
        console.log('tab click');
    };

    $scope.switchTab = function (tabId) {
        $scope.selectedTab = tabId;
    };

    $scope.onComboInputChange = function (event) {
        if (isText(event.which)) {
            if (event.originalEvent.target.value === "") {
                $scope.dynamicItems = [
                    { value: 1, text: 'Default value 1' },
                    { value: 2, text: 'Default value 2' },
                    { value: 3, text: 'Default value 3' },
                    { value: 4, text: 'Default value 4' },
                    { value: 5, text: 'Default value 5' },
                ];
            } else if ($scope.lastInputValue !== event.originalEvent.target.value) {
                // Back-end stuff
                $scope.dynamicItems.length = 0;
                for (let i = 0; i < event.originalEvent.target.value.length; i++) {
                    $scope.dynamicItems.push({ value: i, text: `Dynamic value ${event.originalEvent.target.value} ${i + 1}` });
                }
            }
            $scope.lastInputValue = event.originalEvent.target.value;
        }
    };

    $scope.dynamicItems = [
        { value: 1, text: 'Default value 1' },
        { value: 2, text: 'Default value 2' },
        { value: 3, text: 'Default value 3' },
        { value: 4, text: 'Default value 4' },
        { value: 5, text: 'Default value 5' }
    ];

    $scope.comboboxItems = [
        { value: 1, text: 'Apple' },
        { value: 2, text: 'Pineapple' },
        { value: 3, text: 'Banana' },
        { value: 4, text: 'Kiwi' },
        { value: 5, text: 'Strawberry' }
    ];

    $scope.comboboxItems2 = [
        { value: 1, text: 'Product 1', secondaryText: '1000 EUR' },
        { value: 2, text: 'Product 2', secondaryText: '750 EUR' },
        { value: 3, text: 'Product 3', secondaryText: '780 EUR' },
        { value: 4, text: 'Product 4', secondaryText: '40 EUR' }
    ];

    $scope.multiComboboxItems = [
        { value: 1, text: 'Apple' },
        { value: 2, text: 'Pineapple' },
        { value: 3, text: 'Banana' },
        { value: 4, text: 'Kiwi' },
        { value: 5, text: 'Strawberry' }
    ];
    $scope.multiComboboxSelectedItems = [1];

    $scope.splitItemClick = function (selected) {
        $scope.splitButtonAction = selected;
    };

    $scope.splitButtonClick = function () {
        messageHub.showAlertInfo(
            "Split button clicked",
            'You have clicked on the main action button.'
        );
    };

    $scope.popoverItemClick = function () {
        messageHub.showAlertInfo(
            "Popover item selected",
            'You have selected a popover item.'
        );
    }

    $scope.segmentedClick = function (item) {
        $scope.segmentedModel = item;
    };

    $scope.contextMenuContent = function (element) {
        return {
            callbackTopic: "template.widgets.contextmenu",
            items: [
                {
                    id: "new",
                    label: "New",
                    icon: "sap-icon--create",
                    items: [
                        {
                            id: "file",
                            label: "File",
                            icon: "sap-icon--document"
                        },
                        {
                            id: "folder",
                            label: "Folder",
                            icon: "sap-icon--folder-blank",
                            items: [
                                {
                                    id: "file1",
                                    label: "File",
                                    icon: "sap-icon--document"
                                },
                                {
                                    id: "folder1",
                                    label: "Folder",
                                    icon: "sap-icon--folder-blank"
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "copy",
                    label: "Copy",
                    shortcut: "Ctrl+C",
                    divider: true,
                    icon: "sap-icon--copy"
                },
                {
                    id: "paste",
                    label: "Paste",
                    shortcut: "Ctrl+V",
                    icon: "sap-icon--paste"
                },
                {
                    id: "other",
                    label: "Other",
                    divider: true,
                    icon: "sap-icon--question-mark"
                }
            ]
        }
    };

    $scope.toggle = function () {
        $scope.btnToggled = !$scope.btnToggled;
    };

    $scope.steps = [
        { id: 1, name: "Choose a number", topicId: "template.widgets.screeen.one" },
        { id: 2, name: "Enter random numbers", topicId: "template.widgets.screeen.two" },
        { id: 3, name: "Select magic box", topicId: "template.widgets.screeen.three" },
        { id: 4, name: "Finish widgets", topicId: "template.widgets.screeen.four" },
    ];
    $scope.currentStep = $scope.steps[0];

    messageHub.onDidReceiveMessage(
        "widgets.contextmenu",
        function (msg) {
            messageHub.showAlertInfo(
                "Context menu item selected",
                `You have selected a menu item with the following id - ${msg.data}`
            );
        }
    );

    $scope.setStep = function (topicId) {
        for (let i = 0; i < $scope.steps.length; i++) {
            if ($scope.steps[i].topicId === topicId) {
                $scope.currentStep = $scope.steps[i];
                break;
            }
        };
    };

    $scope.isStepActive = function (stepId) {
        if (stepId == $scope.currentStep.id)
            return "active";
        else if (stepId < $scope.currentStep.id)
            return "done";
        else
            return "inactive";
    };

    $scope.wizard = {
        currentStep: 1,
        completedSteps: 0,
        stepsCount: 4
    };

    $scope.revert = function (completedStepsCount) {
        $scope.wizard.completedSteps = completedStepsCount;
    };

    $scope.gotoNextStep = function () {
        if ($scope.wizard.currentStep > $scope.wizard.completedSteps) {
            $scope.wizard.completedSteps = $scope.wizard.currentStep;
        }

        if ($scope.wizard.currentStep <= $scope.wizard.stepsCount) {
            $scope.gotoStep($scope.wizard.currentStep + 1);
        }
    };

    $scope.gotoPreviousStep = function () {
        if ($scope.wizard.currentStep > 1) {
            $scope.gotoStep($scope.wizard.currentStep - 1);
        }
    };

    $scope.gotoStep = function (step) {
        $scope.wizard.currentStep = step;
    };

    $scope.getIndicatorGlyph = function (step) {
        return step <= $scope.wizard.completedSteps ? 'sap-icon--accept' : undefined;
    };

    $scope.isLastStep = function () {
        return $scope.wizard.currentStep === $scope.wizard.stepsCount;
    };

    $scope.allStepsCompleted = function () {
        return $scope.wizard.completedSteps >= $scope.wizard.stepsCount;
    };

    $scope.filesToUpload = [
        { fileName: 'file1', extension: 'txt', selected: false },
        { fileName: 'file2', extension: 'txt', selected: false },
        { fileName: 'file3', extension: 'txt', selected: false }
    ];

    $scope.removeFileToUpload = function (file) {
        let index = $scope.filesToUpload.indexOf(file);
        if (index >= 0)
            $scope.filesToUpload.splice(index, 1);
    };

    $scope.select = {
        s1: 1,
        s2: 2,
        s3: 3,
        s4: 4,
        s5: 2,
        onS1Change: function () {
            console.log($scope.select.s1);
        }
    };

    $scope.combobox = {
        selectedModelValue: null,
        selectedModelValues: [],
        onCBChange: function () {
            console.log($scope.combobox.selectedModelValue);
        },
        onMCBChange: function () {
            console.log($scope.combobox.selectedModelValues);
        }
    };

    $scope.vacation = {
        id: 1,
        startDate: 2,
        endDate: 3,
        reason: "Hello"
    }

    $scope.approveVacation = function (id) {
        const options = {
            "DateStart": 1720396800000,
            "DateEnd": 1720569600000,
            "Person": 1,
            "Name": "!Work4"
        }

        fetch('/services/ts/vacation-tool/gen/edm/api/Vacations/VacationsService.ts', {
            method: 'POST',
            body: JSON.stringify(options),
        }).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return JSON.stringify(response);
        })

        console.log("Called func" + id);

    }
    $scope.discardVacation = function (id) {
        console.log("Called func 2");
        return id == 1;
    }
}]);
