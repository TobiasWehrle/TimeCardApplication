$(document).ready(function() {
    createComeGoButton();
    refreshTime()
    createTimesOfToday();
    createApplyForLeave();
    createMenu();
    setInterval(refreshTime, 1000);
});

function refreshTime() {
    document.getElementById("ClockTableDiv").innerHTML = `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;
}

function createComeGoButton() {
    $('#ComeGoTableDiv').kendoButton({
        click: function(e) {
            let button = $("#ComeGoTableDiv").data("kendoButton").element[0];
            let state = button.innerText === "Come" || button.innerText === "Kommen" ? "Come" : "Go";
            $.ajax({
                url: "http://localhost:8080/api/times/writeTimes",
                contentType: "application/json",
                headers: {
                    'X-Auth-Token': sessionStorage.getItem("jwt")
                },
                data: JSON.stringify({ state: state }),
                type: "POST",
            }).done(function(response) {
                createTimesOfToday();
                if (button.innerText === replaceResource("{{Come}}")) {
                    button.innerText = replaceResource("{{Go}}");
                } else {
                    button.innerText = replaceResource("{{Come}}");
                }
            }).fail(function() {

            })
        }
    }).data("kendoButton").element[0].innerText = replaceResource("{{Come}}");

    const decoded = jwtDecode(sessionStorage.getItem("jwt"));
    $.ajax({
        url: `http://localhost:8080/api/times/getLast/${decoded.payload.username}`,
        contentType: "application/json",
        headers: {
            'X-Auth-Token': sessionStorage.getItem("jwt")
        },
        async: false,
        type: "GET",
    }).done(function(response) {
        if (response.state === "Come" || response.state === "Kommen") {
            $("#ComeGoTableDiv").data("kendoButton").element[0].innerText = replaceResource("{{Go}}")
        } else {
            $("#ComeGoTableDiv").data("kendoButton").element[0].innerText = replaceResource("{{Come}}")
        }
    }).fail(function() {

    })

}

function createApplyForLeave() {
    $('#ApplyForLeaveTableDiv').kendoButton({
        click: function(e) {

        }
    });
}

function createTimesOfToday() {
    let timeEntrys = getDailyTimes();
    let entrys = [];
    for (let timeEntry of timeEntrys) {
        let date = new Date(timeEntry.dateTime);
        let time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
        let state = timeEntry.state === "Come" || timeEntry.state === "Kommen" ? replaceResource("{{Come}}") : replaceResource("{{Go}}");
        entrys.push({ Time: time, State: state });
    }

    $("#TimesOfToday").kendoGrid({
        height: 480,
        scrollable: true,
        rowTemplate: kendo.template($("#rowTemplate").html()),
        dataSource: {
            data: entrys,
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
}

function getDailyTimes() {
    try {
        let result;
        const decoded = jwtDecode(sessionStorage.getItem("jwt"));
        $.ajax({
            url: `http://localhost:8080/api/times/${decoded.payload.username.toString()}`,
            headers: {
                'X-Auth-Token': sessionStorage.getItem("jwt")
            },
            type: "GET",
            async: false
        }).done(function(response) {
            result = response;
        }).fail(function() {
            location.replace(`http://localhost:8080/Home/${replaceResource("{{ActiveLanguage}}")}`);
        });
        return result;
    } catch (err) {
        return err.message;
    }
}

function replaceResource(data_string) {
    for (let key of Object.keys(resource)) {
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

function createMenu() {
    let menuItems = getMenuItems();
    $('#menu').kendoMenu({
        select: function(e) {

            let itemText = $(e.item).children(".k-link").text().trim();

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