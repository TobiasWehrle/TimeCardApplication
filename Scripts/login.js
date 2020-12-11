$(document).ready(function() {

    $('#usernameTextbox').kendoTextBox({
        placeholder: replaceResource("{{Username}}"),
    });
    $("#passwordTextbox").kendoTextBox({
        placeholder: replaceResource("{{Password}}"),
    });

    $("#loginButton").kendoButton({
        click: function(e) {
            let username = $('#usernameTextbox').val();
            let password = $('#passwordTextbox').val();

            if (isEmpty(username)) {
                alert(replaceResource("{{usernameOrPasswordEmpty}}"));
                $('#usernameTextbox').focus();
                return;
            }

            if (isEmpty(password)) {
                alert(replaceResource("{{usernameOrPasswordEmpty}}"));
                $('#passwordTextbox').focus();
                return;
            }

            $.ajax({
                url: "http://localhost:8080/api/login/validateLogin",
                contentType: "application/json",
                data: JSON.stringify({ username: username, password: password }),
                type: "POST",
            }).done(function(response) {
                sessionStorage.setItem("jwt", response);
                location.replace(`http://localhost:8080/Home/${replaceResource("{{ActiveLanguage}}")}`);
            }).fail(function() {
                alert("Fehler beim Login!");
                location.replace(`http://localhost:8080/Login/${replaceResource("{{ActiveLanguage}}")}`);
            })
        }
    });

    document.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("loginButton").click();
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
            } else {
                return;
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