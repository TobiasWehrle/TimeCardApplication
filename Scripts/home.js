$(document).ready(function() {
    //Temporär beginn ------------
    var products = [{
        Time: "10:11 Uhr",
        State: replaceResource("{{Come}}")
    }, {
        Time: "10:12 Uhr",
        State: replaceResource("{{Go}}")
    }, {
        Time: "10:13 Uhr",
        State: replaceResource("{{Come}}")
    }, {
        Time: "10:14 Uhr",
        State: replaceResource("{{Go}}")
    }, {
        Time: "10:15 Uhr",
        State: replaceResource("{{Come}}")
    }];
    //Temporär ende ------------------
    $("#LogOfToday").kendoGrid({
        height: 480,
        scrollable: true,
        rowTemplate: kendo.template($("#rowTemplate").html()),
        dataSource: {
            data: products,
            schema: {
                model: {
                    fields: {
                        StatePicture: {},
                        Time: {
                            type: "string"
                        },
                        State: {
                            type: "string"
                        }
                    },
                }
            },
        },
    });

    $('#ApplyForLeaveTableDiv').kendoButton({
        click: function(e) {

        }
    });
    $('#ComeGoTableDiv').kendoButton({
        click: function(e) {
            let button = $("#ComeGoTableDiv").data("kendoButton").element[0];
            $.ajax({
                url: "http://localhost:8080/api/times/writeTimes",
                contentType: "application/json",
                headers: {
                    'X-Auth-Token': sessionStorage.getItem("jwt")
                },
                data: JSON.stringify({ state: button.innerText }),
                type: "POST",
            }).done(function(response) {
                getDailyTimes();
                if (button.innerText === replaceResource("{{Come}}")) {
                    button.innerText = replaceResource("{{Go}}");
                } else {
                    button.innerText = replaceResource("{{Come}}");
                }
            }).fail(function() {

            })
        }
    });

    let menuItems = getMenuItems();
    $('#menu').kendoMenu({
        select: function(e) {

            var itemText = $(e.item).children(".k-link").text().trim();

            if (itemText === replaceResource("{{English}}")) {
                location.replace(`http://localhost:8080/Home/en`);
            } else if (itemText === replaceResource("{{German}}")) {
                location.replace(`http://localhost:8080/Home/de`);
            } else if (itemText === replaceResource("{{Logout}}")) {
                location.replace(`http://localhost:8080/Login/${replaceResource("{{ActiveLanguage}}")}`);
            } else if (itemText === replaceResource("{{Help}}")) {
                location.replace("https://ips-apps.ip-systeme.de/timecard/pcterminal");
            }
        }
    }).data("kendoMenu").append(menuItems);
});

function getDailyTimes() {
    try {
        let result;
        const decoded = jwtDecode(sessionStorage.getItem("jwt"));
        console.log(decoded.payload.username);
        $.ajax({
            url: `http://localhost:8080/api/times/${decoded.payload.username.toString()}`,
            headers: {
                'X-Auth-Token': sessionStorage.getItem("jwt")
            },
            type: "GET",
            async: false
        }).done(function(response) {
            result = response;
            let dailyTimes = response;
            console.log(dailyTimes);
        }).fail(function() {
            location.replace(`http://localhost:8080/Home/${replaceResource("{{ActiveLanguage}}")}`);
        });
        return result;
    } catch (err) {
        return err.message;
    }
}

function replaceResource(data_string) {
    for (var key of Object.keys(resource)) {
        let pattern = new RegExp("{{" + key + "}}", "g");
        data_string = data_string.replace(pattern, resource[key]);
    }
    return data_string;
}

function jwtDecode(t) {
    let token = {};
    token.raw = t;
    token.header = JSON.parse(window.atob(t.split('.')[0]));
    token.payload = JSON.parse(window.atob(t.split('.')[1]));
    return (token)
}

function getMenuItems() {
    let menuItem;
    $.ajax({
        url: "http://localhost:8080/api/employee/getEmployee",
        headers: {
            'X-Auth-Token': sessionStorage.getItem("jwt")
        },
        contentType: "application/json",
        type: "GET",
        async: false
    }).done(function(response) {
        menuItem = getMenu(response.isAdmin);
    }).fail(function() {
        location.replace(`http://localhost:8080/Login/${replaceResource("{{ActiveLanguage}}")}`);
    });
    return menuItem;
}

function getMenu(isAdmin) {
    if (isAdmin) {
        return [{
                text: replaceResource("{{Employee}}"),
                encoded: false,
                items: [{ text: replaceResource("{{ChangePassword}}") },
                    { text: replaceResource("{{UserInformation}}") },
                    { text: replaceResource("{{ManageVacation}}") },
                    { text: replaceResource("{{ManageEmployeesAndDepartments}}") }
                ]
            },
            {
                text: replaceResource("{{Overview}}"),
                encoded: false,
                items: [{ text: replaceResource("{{CompleteOverview}}") }, { text: replaceResource("{{MonthlyOverview}}") }, { text: replaceResource("{{VacationOverview}}") }]
            },
            {
                text: replaceResource("{{Language}}"),
                encoded: false,
                items: [{ text: replaceResource("{{English}}") }, { text: replaceResource("{{German}}") }]
            },
            {
                text: replaceResource("{{Logout}}"),
                encoded: false,
                cssClass: "menu-Right"
            },
            {
                text: replaceResource("{{Help}}"),
                encoded: false,
                cssClass: "menu-Right"
            }
        ];
    } else {
        return [{
                text: replaceResource("{{Employee}}"),
                encoded: false,
                items: [{ text: replaceResource("{{ChangePassword}}") }, { text: replaceResource("{{UserInformation}}") }]
            },
            {
                text: replaceResource("{{Overview}}"),
                encoded: false,
                items: [{ text: replaceResource("{{CompleteOverview}}") }, { text: replaceResource("{{MonthlyOverview}}") }, { text: replaceResource("{{VacationOverview}}") }]
            },
            {
                text: replaceResource("{{Language}}"),
                encoded: false,
                items: [{ text: replaceResource("{{English}}") }, { text: replaceResource("{{German}}") }]
            },
            {
                text: replaceResource("{{Logout}}"),
                encoded: false,
                cssClass: "menu-Right"
            },
            {
                text: replaceResource("{{Help}}"),
                encoded: false,
                cssClass: "menu-Right"
            }
        ];
    }
}