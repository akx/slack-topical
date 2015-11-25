/* eslint-disable quotes */
import {expect} from "chai";
import Promise from "bluebird";
import jz from "./jz";
import http from "http";

describe("jz", () => {
    const server = Promise.promisifyAll(http.createServer((req, res) => {
        if(req.url.indexOf("error") > -1) {
            res.statusCode = 500;
        }
        if(req.url.indexOf("badJson") > -1) {
            res.end('{"42": 4');
            return;
        }
        res.end('{"42": 42}');
    }));

    before(() => {
        return server.listenAsync(0, "127.0.0.1");
    });

    after(() => {
        server.close();
    });

    it("should be able to request things", () => {
        const {port} = server.address();
        return jz("http://127.0.0.1:" + port + "/").then((body) => {
            expect(body).to.deep.equal({"42": 42});
        });
    });

    it("should be able to deal with server errors", () => {
        const {port} = server.address();
        return jz("http://127.0.0.1:" + port + "/errors").then(null, () => {
            return "ok";
        });
    });

    it("should be able to deal with bad json", () => {
        const {port} = server.address();
        return jz("http://127.0.0.1:" + port + "/badJson").then(null, () => {
            return "ok";
        });
    });
});
