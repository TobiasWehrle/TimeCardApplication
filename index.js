const fs = require('fs');
const http = require('http');
const url = require('url');
const glob = require('glob');
const express = require('express');
const path = require('path');
const app = express();
let language_dict = {};

glob.sync('./language/*.json').forEach(function(file) {
    let dash = file.split("/");
    if (dash.length == 3) {
        let dot = dash[2].split(".");
        if (dot.length == 2) {
            let lang = dot[0];
            fs.readFile(file, function(err, data) {
                language_dict[lang] = JSON.parse(data.toString());
            });
        }
    }
});

require('./startup/routes')(app);
require('./startup/db')();

app.use(express.static('./Scripts'));
app.use(express.static('./Styles'));
app.get("/Home/:lang", function(request, response) {
    var lang = request.params.lang;
    if (lang === "de" || lang === "en") {
        replaceResources(request, response, "home", lang);
    } else {
        response.status(404).send('Not found');
        return response.end();
    }
});



app.get("/Login/:lang", function(request, response) {
    var lang = request.params.lang;
    if (lang === "de" || lang === "en") {
        replaceResources(request, response, "login", lang);
    } else {
        response.status(404).send('Not found');
        return response.end();
    }
});

http.createServer(app).listen(8080);

function replaceResources(req, res, page, lang) {
    fs.readFile(`Pages/${page}.html`, function(err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        let data_string = data.toString();
        for (var key of Object.keys(language_dict[lang])) {
            let pattern = new RegExp("{{" + key + "}}", "g");
            data_string = data_string.replace(pattern, language_dict[lang][key]);
        }
        let scriptPattern = new RegExp("##{}##", "g");
        data_string = data_string.replace(scriptPattern, JSON.stringify(language_dict[lang]));
        res.write(data_string);
        return res.end();
    });
}