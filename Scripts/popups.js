const { VacationRequests } = require("../models/vacationRequests");

function createHolidayPopup() {
    var popupHtml =
        '<div class="k-editor-dialog k-popup-edit-form k-edit-form-container" style="width:auto;">' +
        '<table>' +
        '<tr>' +
        '<label style="left: 2%; position: relative;" for="applicant">' + replaceResource("{{applicant}}") + ':</label>' +
        '<input style="left: 5%;" id="applicant" />' +
        '<input style="left: 20%;" placeholder="' + replaceResource("{{from}}") + '" id="from" />' +
        '</tr>' +
        '</br>' +
        '<tr>' +
        '<label style="left: 2%; position: relative;" for="approver">' + replaceResource("{{approver}}") + ':</label>' +
        '<input style="left: 5%;" id="approver" />' +
        '<input style="left: 20%;" placeholder="' + replaceResource("{{to}}") + '" id="to" />' +
        '</tr>' +
        '</table>' +
        '<div class="k-edit-buttons k-state-default">' +
        '<button class="k-dialog-send k-button k-primary">' + replaceResource("{{Send}}") + '</button>' +
        '<button class="k-dialog-close k-button">' + replaceResource("{{Cancel}}") + '</button>' +
        '</div>' +
        '</div>';

    var popupWindow = $(popupHtml).appendTo(document.body)
        .kendoWindow({
            modal: true,
            width: 700,
            resizable: false,
            title: replaceResource("{{ApplyForLeave}}"),
            visible: false,
            deactivate: function(e) { e.sender.destroy(); }
        }).data("kendoWindow")
        .center().open();

    popupWindow.element.find(".k-dialog-send").click(function() {
        var approver = $("#approver").data("kendoDropDownList").value();
        let applicant = $('#applicant').data('kendoTextBox').value();
        let to = $('#to').data('kendoDatePicker').value();
        let from = $('#from').data('kendoDatePicker').value();

        if (isEmpty(approver) || isEmpty(applicant) || isEmpty(to) || isEmpty(from)) {
            return alert("Fehler beim stellen eines Urlaubantrags");
        }

        $.ajax({
            url: "http://localhost:8080/api/vacation/writeVacationRequest",
            headers: {
                'X-Auth-Token': sessionStorage.getItem("jwt")
            },
            contentType: "application/json",
            data: JSON.stringify({ approver: approver, applicant: applicant, startOfVacation: from, endOfVacation: to }),
            type: "POST",
            async: false
        }).done(function(response) {
            popupWindow.close();
        }).fail(function() {
            return alert("Fehler beim stellen eines Urlaubantrags");
        });
    });

    popupWindow.element.find(".k-dialog-close").click(function() {
        popupWindow.close();
    });

    $("#from").kendoDatePicker();
    var datepickerFrom = $("#from").data("kendoDatePicker");
    datepickerFrom.readonly(true);
    $("#from").click(function() {
        datepickerFrom.open();
    });

    $("#to").kendoDatePicker();
    var datepickerTo = $("#to").data("kendoDatePicker");
    datepickerTo.readonly(true);
    $("#to").click(function() {
        datepickerTo.open();
    });

    $('#applicant').kendoTextBox({
        value: jwtDecode(sessionStorage.getItem("jwt")).payload.username,
        readonly: true,
    });

    let admins = [];
    $.ajax({
        url: "http://localhost:8080/api/employee/getAdmins",
        headers: {
            'X-Auth-Token': sessionStorage.getItem("jwt")
        },
        contentType: "application/json",
        type: "GET",
        async: false
    }).done(function(response) {
        response.forEach(x => admins.push(x.username));
    }).fail(function() {
        return alert("Fehler beim holen der Admins");
    });

    $("#approver").kendoDropDownList({
        dataSource: admins
    });

    var dropdownlist = $("#approver").data("kendoDropDownList");
    dropdownlist.text("");
}

function createUserInformationPopup() {
    let user;
    $.ajax({
        url: "http://localhost:8080/api/employee/getEmployee",
        headers: {
            'X-Auth-Token': sessionStorage.getItem("jwt")
        },
        contentType: "application/json",
        type: "GET",
        async: false
    }).done(function(response) {
        user = response;
    }).fail(function() {
        return alert("Fehler beim holen des angemeldeten Users");
    });

    var role = user.isAdmin ? replaceResource("{{Admin}}") : replaceResource("{{Employee}}");

    var popupHtml =
        '<div class="k-editor-dialog k-popup-edit-form k-edit-form-container" style="width:auto;">' +
        '<table>' +
        '<tr>' +
        '<p style="left: 2%; position: relative; width: 600px;">' + replaceResource("{{NameAndAbbreviation}}") + user.name + ', ' + user.abbreviation + '</p>' +
        '</tr>' +
        '<tr>' +
        '<p style="left: 2%; position: relative; width: 600px;">' + replaceResource("{{Role}}") + role + ', ' + replaceResource("{{Employeenumber}}") + user.employeeNumber + '</p>' +
        '</tr>' +
        '<tr>' +
        '<p style="left: 2%; position: relative; width: 600px;">' + replaceResource("{{Department}}") + user.department + ', ' + replaceResource("{{eMail}}") + user.eMail + '</p>' +
        '</tr>' +
        '<tr>' +
        '<p style="left: 2%; position: relative; width: 600px;">' + replaceResource("{{Phonenumber}}") + user.phoneNumber + '</p>' +
        '</tr>' +
        '</table>' +
        '</div>';

    $(popupHtml).appendTo(document.body)
        .kendoWindow({
            modal: true,
            width: 700,
            resizable: false,
            title: replaceResource("{{UserInformation}}"),
            visible: false,
            deactivate: function(e) { e.sender.destroy(); }
        }).data("kendoWindow")
        .center().open();
}

function createChangePasswortPopup() {
    var popupHtml =
        '<div class="k-editor-dialog k-popup-edit-form k-edit-form-container" style="width:auto; margin-left: 35%;">' +
        '<input style="position: relative; width: 200px;" id="username" />' +
        '</br>' +
        '<input style="position: relative; width: 200px;" id="oldPassword" />' +
        '</br>' +
        '<div style="position: relative; heigth: 50px;" id="placeholder" />' +
        '</br>' +
        '<input style=" position: relative; width: 200px;" placeholder="' + replaceResource("{{newPassword}}") + '" id="newPassword" />' +
        '</br>' +
        '<input style="position: relative; width: 200px;" placeholder="' + replaceResource("{{repeatNewPassword}}") + '" id="againNewPassword" />' +
        '</br>' +
        '<div style="position: relative; heigth: 50px;" id="placeholder" />' +
        '</br>' +
        '<button style="height:50px; position: relative; width: 195px;" id="newPasswordButton">' + replaceResource("{{ChangePassword}}") + '</button>'
    '</div>';

    $(popupHtml).appendTo(document.body)
        .kendoWindow({
            modal: true,
            width: 700,
            resizable: false,
            title: replaceResource("{{ChangePassword}}"),
            visible: false,
            deactivate: function(e) { e.sender.destroy(); }
        }).data("kendoWindow")
        .center().open();

    const decoded = jwtDecode(sessionStorage.getItem("jwt"));

    $('#username').kendoTextBox({
        value: decoded.payload.username,
        readonly: true,
    });

    $('#oldPassword').kendoTextBox({
        value: decoded.payload.password,
        readonly: true,
    });

    $('#newPassword').kendoTextBox();
    $('#againNewPassword').kendoTextBox();
    $('#newPasswordButton').kendoButton({
        click: function(e) {
            const username = $('#username').data('kendoTextBox').value();
            const oldPassword = $('#oldPassword').data('kendoTextBox').value();
            const newPassword = $('#newPassword').data('kendoTextBox').value();
            const againNewPassword = $('#againNewPassword').data('kendoTextBox').value();

            if (isEmpty(newPassword) || isEmpty(againNewPassword)) {
                return alert("Fehler, eins der Passwörter ist leer");
            }

            if (newPassword !== againNewPassword) {
                return alert("Fehler, die Passwörter stimmen nicht überein")
            }

            if (oldPassword == newPassword) {
                return alert("Fehler, das alte Passwort stimmt mit dem neuen überein");
            }

            $.ajax({
                url: "http://localhost:8080/api/employee/changePassword",
                headers: {
                    'X-Auth-Token': sessionStorage.getItem("jwt")
                },
                contentType: "application/json",
                data: JSON.stringify({ username: username, password: newPassword }),
                type: "PUT",
            }).done(function(response) {
                sessionStorage.setItem("jwt", response);
                location.replace(`http://localhost:8080/Home/${replaceResource("{{ActiveLanguage}}")}`);
            }).fail(function() {
                alert("Fehler beim ändern des Passwortes!");
            })
        }
    });
}

function createManageVacationPopup() {
    let allEmployees = [];
    $.ajax({
        url: "http://localhost:8080/api/employee/getEmployees",
        headers: {
            'X-Auth-Token': sessionStorage.getItem("jwt")
        },
        type: "GET",
    }).done(function(response) {
        let i = 1;
        response.forEach(employee => {
            allEmployees.push({ text: employee.username, value: i, color: "#f58ac0" });
            i++;
        })
    }).fail(function() {
        alert("Fehler beim holen der Mitarbeiter!");
    });

    let allVacationRequests = [];
    $.ajax({
        url: "http://localhost:8080/api/employee/getEmployees",
        headers: {
            'X-Auth-Token': sessionStorage.getItem("jwt")
        },
        type: "GET",
    }).done(function(response) {
        response.forEach(vacationRequest => {
            allVacationRequests.push({ applicant: vacationRequest.applicant, createDate: vacationRequest.createDate });
        })
    }).fail(function() {
        alert("Fehler beim holen der Mitarbeiter!");
    });

    var popupHtml =
        '<div class="k-editor-dialog k-popup-edit-form k-edit-form-container" style="width:auto;">' +
        '<div style="margin-left: 4%;" id="grid" />' +
        '<div style="margin-left: 4%;" id="scheduler" />' +
        '</div>';

    $(popupHtml).appendTo(document.body)
        .kendoWindow({
            modal: true,
            width: 1500,
            height: 900,
            resizable: false,
            title: replaceResource("{{ManageVacation}}"),
            visible: false,
            deactivate: function(e) { e.sender.destroy(); }
        }).data("kendoWindow")
        .center().open();

    $("#grid").kendoGrid({
        height: 639,
        scrollable: true,
        dataBound: toggleScrollbar("grid"),
        rowTemplate: kendo.template($("#rowTemplateVacation").html()),
        dataSource: {
            data: entrys,
            schema: {
                model: {
                    fields: {
                        applicant: {
                            type: "string"
                        },
                        createDate: {
                            type: "string"
                        }
                    },
                }
            },
        },
    });

    $("#scheduler").kendoScheduler({
        date: new Date(Date.now()),
        startTime: new Date(Date.now()),
        height: 639,
        width: 1200,
        views: ["month"],
        eventTemplate: $("#event-template").html(),
        editable: {
            template: $("#customEditorTemplate").html(),
        },
        save: saveNewVacation(),
        dataSource: [],
    });
}