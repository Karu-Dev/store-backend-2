import chai from "chai";
import chaiHttp from "chai-http";
import { start, stop } from "../src/server";
import { fetchConfig, updateConfig } from "./utils";

chai.use(chaiHttp);
chai.should();

describe("Config", () => {
  const defaultConfig = {
    servers: [
      {
        name: "alpha",
        errorFrequency: 0
      }
    ]
  };

  before(() => start());

  beforeEach(() => {
    updateConfig(defaultConfig).then(res => {
      res.should.have.status(200);
      res.body.should.deep.equal(defaultConfig);
    });
  });

  after(() => stop());

  describe("/config", () => {
    it("should get default config", done => {
      fetchConfig()
        .then(res => {
          res.should.have.status(200);
          res.body.should.deep.equal(defaultConfig);
          done();
        })
        .catch(done);
    });

    it("should be able to update config", done => {
      const config = {
        servers: [
          {
            name: "alpha",
            errorFrequency: 9
          },
          {
            name: "beta",
            errorFrequency: 0
          }
        ]
      };

      updateConfig(config)
        .then(res => {
          res.should.have.status(200);
          res.body.should.deep.equal(config);

          fetchConfig().then(res => {
            res.should.have.status(200);
            res.body.should.deep.equal(config);
            done();
          });
        })
        .catch(done);
    });

    const invalidConfigs = [
      null,
      "",
      {},
      { servers: [] },
      { servers: [{ name: "", errorFrequency: 0 }] },
      { servers: [{ name: null, errorFrequency: 0 }] },
      { servers: [{ name: "alpha", errorFrequency: null }] },
      { servers: [{ name: "alpha", errorFrequency: "xyz" }] },
      { servers: [{ name: "alpha", errorFrequency: -1 }] },
      { servers: [{ name: "alpha", errorFrequency: 11 }] },
      { servers: [{ errorFrequency: 0 }] },
      { servers: [{ name: "alpha" }] }
    ];

    invalidConfigs.forEach(config => {
      it("should forbid to add invalid config", done => {
        updateConfig(config)
          .then(res => {
            res.should.have.status(400);

            return fetchConfig().then(res => {
              res.should.have.status(200);
              res.body.should.deep.equal(defaultConfig);
              done();
            });
          })
          .catch(done);
      });
    });
  });
});
