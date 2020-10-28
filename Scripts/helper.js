function replaceResource(data_string) {
    for (var key of Object.keys(resource)) {
        let pattern = new RegExp("{{" + key + "}}", "g");
        data_string = data_string.replace(pattern, resource[key]);
    }
    return data_string;
}

function isEmpty(value) {
    return (value == null || value.length === 0);
}

function jwtDecode(t) {
    let token = {};
    token.raw = t;
    token.header = JSON.parse(window.atob(t.split('.')[0]));
    token.payload = JSON.parse(window.atob(t.split('.')[1]));
    return (token)
}