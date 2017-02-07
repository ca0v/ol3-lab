import $ = require("jquery");


export class MyJson<T> {

    constructor(public json: T, public id = "4acgf", public endpoint = "https://api.myjson.com/bins") {

    }

    get() {
        return $.ajax({
            url: `${this.endpoint}/${this.id}`,
            type: 'GET'
        }).then(json => this.json = json);
    }

    put() {
        return $.ajax({
            url: `${this.endpoint}/${this.id}`,
            type: 'PUT',
            data: JSON.stringify(this.json),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json'
        }).then(json => this.json = json);
    }

    post() {
        return $.ajax({
            url: `${this.endpoint}`,
            type: 'POST',
            data: JSON.stringify(this.json),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json'
        }).then(data => {
            debugger;
            this.id = data.uri.substr(1 + this.endpoint.length);
        });
    }

}
