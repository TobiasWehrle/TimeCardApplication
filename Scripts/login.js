$(document).ready(function() {

    $('#usernameTextbox').kendoTextBox({
        placeholder: replaceResource("{{Username}}"),
        label: {
            content: replaceResource("{{Username}}"),
            floating: true
        }
    });
    $("#passwordTextbox").kendoTextBox({
        placeholder: replaceResource("{{Password}}"),
        label: {
            content: replaceResource("{{Password}}"),
            floating: true
        }
    });

    $("#loginButton").kendoButton({
        click: function(e) {
            let username = $('#usernameTextbox').data('kendoTextBox').value();
            let password = $('#passwordTextbox').data('kendoTextBox').value();
            $.ajax({
                url: "http://localhost:8080/api/employee/validateLogin",
                contentType: "application/json",
                data: JSON.stringify({ username: username, password: password }),
                type: "POST",
            }).done(function(response) {
                sessionStorage.setItem("jwt", response);
                location.replace(`http://localhost:8080/Home/${replaceResource("{{ActiveLanguage}}")}`);
            }).fail(function() {
                location.replace(`http://localhost:8080/Login/${replaceResource("{{ActiveLanguage}}")}`);
            })
        }
    });

    $('#menu').kendoMenu({
        select: function(e) {

            var itemText = $(e.item).children(".k-link").text().trim();

            if (itemText === replaceResource("{{English}}")) {
                location.replace("http://localhost:8080/Login/en");
            } else if (itemText === replaceResource("{{German}}")) {
                location.replace("http://localhost:8080/Login/de");
            } else if (itemText === replaceResource("{{Help}}")) {
                location.replace("https://ips-apps.ip-systeme.de/timecard/pcterminal");
            }
        }
    }).data("kendoMenu").append([{
            text: replaceResource("{{Language}}"),
            encoded: false,
            items: [{ text: replaceResource("{{English}}") }, { text: replaceResource("{{German}}") }]
        },
        {
            text: replaceResource("{{Help}}"),
            encoded: false,
            cssClass: "menu-Right"
        }
    ]);
});

function replaceResource(data_string) {
    for (var key of Object.keys(resource)) {
        let pattern = new RegExp("{{" + key + "}}", "g");
        data_string = data_string.replace(pattern, resource[key]);
    }
    return data_string;
}