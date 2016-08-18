import $ = require("jquery");


class MyJson<T> {

    constructor(public endpoint = "https://api.myjson.com/bins", public id = "4acgf", public json = <T>{}) {

    }

    get(id = this.id) {
        return $.ajax({
            url: `${this.endpoint}/${id}`,
            type: 'GET'
        }).then(json => this.json = json);
    }

    put(id = this.id, json = this.json) {
        return $.ajax({
            url: `${this.endpoint}/${id}`,
            type: 'PUT',
            data: JSON.stringify(json),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json'
        }).then(json => this.json = json);
    }

    post(json = this.json) {
        let data = JSON.stringify(json);
        $.ajax({
            url: `${this.endpoint}`,
            type: 'POST',
            data: data,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json'
        }).then((url: string) => {
            this.json = json;
            this.id = url.substr(1 + this.endpoint.length);
        });
    }

}

export function run() {
    let myjson = new MyJson<{
        one: number;
        two: string;
    }>();
    myjson.get().then(() => {
        myjson.json.one = (myjson.json.one || 0) + 1;
        myjson.json.two = myjson.json.one.toString(16);
        myjson.put().then(json => {
            console.log("put", json);
        });
    });
}