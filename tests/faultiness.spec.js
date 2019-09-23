import chai from "chai";
import chaiHttp from "chai-http";
import { start, stop } from "../src/server";
import _ from "lodash";
import { fetchItems, updateConfig } from "./utils";

chai.use(chaiHttp);
chai.should();

describe("Faultiness", () => {
  before(() => start());

  after(() => stop());

  it("should fail on each request", done => {
    const config = {
      servers: [
        {
          name: "alpha",
          errorFrequency: 10
        }
      ]
    };

    updateConfig(config)
      .then(res => {
        res.should.have.status(200);

        const requests = _.range(10).map(() =>
          fetchItems().then(res => res.should.have.status(500))
        );

        return Promise.all(requests).then(() => done());
      })
      .catch(done);
  });

  it("should fail on three requests out of ten", done => {
    const config = {
      servers: [
        {
          name: "alpha",
          errorFrequency: 3
        }
      ]
    };

    updateConfig(config)
      .then(res => {
        res.should.have.status(200);

        let successful = 0;
        let failed = 0;

        const requests = _.range(10).map(() =>
          fetchItems().then(res => {
            if (res.status === 200) {
              successful++;
            }
            if (res.status === 500) {
              failed++;
            }
          })
        );

        return Promise.all(requests).then(() => {
          successful.should.be.equal(7);
          failed.should.be.equal(3);
          done();
        });
      })
      .catch(done);
  });

  it("should fail on requests when unknown server specified", done => {
    const config = {
      servers: [
        {
          name: "alpha",
          errorFrequency: 0
        }
      ]
    };

    updateConfig(config)
      .then(res => {
        res.should.have.status(200);

        return fetchItems({ serverName: "beta" }).then(res => {
          res.should.have.status(500);
          done();
        });
      })
      .catch(done);
  });

  it("each server must have their own config", done => {
    const config = {
      servers: [
        {
          name: "alpha",
          errorFrequency: 0
        },
        {
          name: "beta",
          errorFrequency: 10
        }
      ]
    };

    updateConfig(config)
      .then(res => {
        res.should.have.status(200);

        const alpha = _.range(10).map(() =>
          fetchItems().then(res => res.should.have.status(200))
        );
        const beta = _.range(10).map(() =>
          fetchItems({ serverName: "beta" }).then(res =>
            res.should.have.status(500)
          )
        );

        return Promise.all([...alpha, ...beta]).then(() => done());
      })
      .catch(done);
  });
});
