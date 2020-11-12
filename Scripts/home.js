$(document).ready(function() {
    createComeGoButton();
    createTimesOfToday();
    createApplyForLeave();
    createMenu();
    setFlexitimeAndLeaveCredit();
    refreshClock();
    setCompleteTimeToday();
    setInterval(function() {
        refreshClock();
        setCompleteTimeToday();
    }, 30000);
});

function refreshClock() {
    document.getElementById("ClockTableDiv").innerHTML = `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;
}

function createComeGoButton() {
    $('#ComeGoButton').kendoButton({
        click: function(e) {
            let button = $("#ComeGoButton").data("kendoButton").element[0];
            let state = button.innerText === "Come" || button.innerText === "Kommen" ? "Come" : "Go";
            refreshClock();
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
                setCompleteTimeToday();
                if (button.innerText === replaceResource("{{Come}}")) {
                    button.innerText = replaceResource("{{Go}}");
                } else {
                    button.innerText = replaceResource("{{Come}}");
                }
            }).fail(function() {
                alert("Fehler beim schreiben der Zeiten in die Datenbank!");
            })
        }
    }).data("kendoButton").element[0].innerText = replaceResource("{{Come}}");

    const decoded = jwtDecode(sessionStorage.getItem("jwt"));
    $.ajax({
        url: `http://localhost:8080/api/times/getLastTime/${decoded.payload.username}`,
        contentType: "application/json",
        headers: {
            'X-Auth-Token': sessionStorage.getItem("jwt")
        },
        async: false,
        type: "GET",
    }).done(function(response) {
        if (response.state === "Come" || response.state === "Kommen") {
            $("#ComeGoButton").data("kendoButton").element[0].innerText = replaceResource("{{Go}}")
        } else {
            $("#ComeGoButton").data("kendoButton").element[0].innerText = replaceResource("{{Come}}")
        }
    }).fail(function() {
        alert("Fehler beim setzen des Textes des Knopfes!");
    })

}

function setFlexitimeAndLeaveCredit() {
    $.ajax({
        url: "http://localhost:8080/api/employee/getEmployee",
        headers: {
            'X-Auth-Token': sessionStorage.getItem("jwt")
        },
        contentType: "application/json",
        type: "GET",
        async: false
    }).done(function(response) {
        document.getElementById("FlexitimeCreditValueTableDiv").innerText = response.flexiTimeCredit.toString().padStart(2, "0") + " " + replaceResource("{{Hours}}");
        document.getElementById("LeaveCreditValueTableDiv").innerText = response.leaveCredit.toString().padStart(2, "0") + " " + replaceResource("{{Days}}");;
    }).fail(function() {
        alert("Fehler beim Holen des Mitarbeiters!");
    });
}

function setCompleteTimeToday() {
    let times = getDailyTimes();
    let zero = 0;
    if (times.length === 0 || times[0].state === "Go") {
        document.getElementById("CompleteTimeTodayValueTableDiv").innerHTML = zero.toString().padStart(2, "0") + ":" + zero.toString().padStart(2, "0") + " " + replaceResource("{{Hours}}");
        return;
    }

    let resultMinutes = 0;
    let counterCome = 0;
    let counterGo = 0;
    let lastComeMinutes = 0;

    for (let time of times) {

        if (counterCome > 1 || counterGo > 1) {
            document.getElementById("CompleteTimeTodayValueTableDiv").innerHTML = zero.toString().padStart(2, "0") + ":" + zero.toString().padStart(2, "0") + " " + replaceResource("{{Hours}}");
            return;
        }

        if (times[times.length - 1] === time && time.state === "Come") {
            document.getElementById("CompleteTimeTodayValueTableDiv").innerHTML = timeConvert(resultMinutes);
            return;
        }

        if (time.state === "Come") {
            counterCome++;
            counterGo = 0;

            let dateCome = new Date(time.dateTime);
            lastComeMinutes = dateCome.getHours() * 60 + dateCome.getMinutes();
        }

        if (time.state === "Go") {
            counterGo++;
            counterCome = 0;

            let dateGo = new Date(time.dateTime);
            let lastGoMinutes = dateGo.getHours() * 60 + dateGo.getMinutes();
            resultMinutes += lastGoMinutes - lastComeMinutes;
        }
    }
    document.getElementById("CompleteTimeTodayValueTableDiv").innerHTML = timeConvert(resultMinutes);
}

function timeConvert(number) {
    var hours = (number / 60);
    var resultHours = Math.floor(hours);
    var minutes = (hours - resultHours) * 60;
    var resultMinutes = Math.round(minutes);
    return resultHours.toString().padStart(2, "0") + ":" + resultMinutes.toString().padStart(2, "0") + " " + replaceResource("{{Hours}}");
}

function createApplyForLeave() {
    $('#ApplyForLeaveTableDiv').kendoButton({
        click: function(e) {
            createHolidayPopup();
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
        dataBound: toggleScrollbar,
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

function toggleScrollbar() {
    var gridHeight = $("#TimesOfToday").outerHeight();
    var gridHeaderHeight = $("#TimesOfToday table:eq(0)").outerHeight();
    var gridBodyHeight = $("#TimesOfToday table:eq(1)").outerHeight();
    if (gridHeight < gridHeaderHeight + gridBodyHeight) { // show the scrollbar
        $("#TimesOfToday .k-grid-header").css('padding', '');
        $("#TimesOfToday .k-grid-header").css('padding-right', '17px');
        $("#TimesOfToday .k-grid-content").css('overflow-y', 'auto');
    } else { // hide the scrollbar
        $("#TimesOfToday .k-grid-header").css('padding', '0 !important');
        $("#TimesOfToday .k-grid-content").css('overflow-y', 'auto');
    }
}


function getDailyTimes() {
    try {
        let result = new Array;
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
        });
        return result;
    } catch (err) {
        alert("Fehler beim Holen der täglichen Zeiten!");
    }
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
        alert("Fehler beim Holen des Mitarbeiters!");
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
            } else if (itemText === replaceResource("{{UserInformation}}")) {
                createUserInformationPopup();
            } else if (itemText === replaceResource("{{ChangePassword}}")) {
                createChangePasswortPopup();
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