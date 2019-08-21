import chai from "chai";
import chaiHttp from "chai-http";
import fs from "fs";
import { start, stop } from "../src/server";
import {
  calculateItemPrice,
  fetchItemQuantity,
  fetchItems,
  fetchSingleItem,
  updateConfig
} from "./utils";

chai.use(chaiHttp);
chai.should();

const config = {
  servers: [
    {
      name: "alpha",
      errorFrequency: 0
    }
  ]
};

describe("Store", () => {
  before(() => {
    start().then(() => {
      updateConfig(config).then(res => {
        res.should.have.status(200);
        res.body.should.deep.equal(config);
      });
    });
  });

  after(() => stop());

  describe("fetch items", () => {
    it("should get default page size with no parameters", done => {
      const items = JSON.parse(
        fs.readFileSync(__dirname + "/example-default-page.json", "utf8")
      );

      const expectedResult = {
        page: 0,
        totalPages: 40,
        totalItems: 1000,
        items
      };

      fetchItems()
        .then(res => {
          res.should.have.status(200);
          res.body.should.deep.equal(expectedResult);
          done();
        })
        .catch(done);
    });

    it("should be able to specify page & size", done => {
      const items = JSON.parse(
        fs.readFileSync(__dirname + "/example-three-items.json", "utf8")
      );

      const expectedResult = {
        page: 2,
        totalPages: 334,
        totalItems: 1000,
        items
      };

      fetchItems({ queryParams: { page: 2, size: 3 } })
        .then(res => {
          res.should.have.status(200);
          res.body.should.deep.equal(expectedResult);
          done();
        })
        .catch(done);
    });

    it("should return empty page if out of range", done => {
      const expectedResult = {
        page: 1000,
        totalPages: 40,
        totalItems: 1000,
        items: []
      };

      fetchItems({ queryParams: { page: 1000 } })
        .then(res => {
          res.should.have.status(200);
          res.body.should.deep.equal(expectedResult);
          done();
        })
        .catch(done);
    });
  });

  describe("fetch single item", () => {
    it("should get 404 if item is missing", done => {
      fetchSingleItem({ id: 9999 })
        .then(res => {
          res.should.have.status(404);
          done();
        })
        .catch(done);
    });

    it("should get item by id", done => {
      const item = JSON.parse(
        fs.readFileSync(__dirname + "/example-get-item-by-id.json", "utf8")
      );

      fetchSingleItem({ id: 113 })
        .then(res => {
          res.should.have.status(200);
          res.body.should.deep.equal(item);
          done();
        })
        .catch(done);
    });
  });

  describe("fetch item quantity", () => {
    it("should get 404 if item is missing", done => {
      fetchItemQuantity({ id: 9999 })
        .then(res => {
          res.should.have.status(404);
          done();
        })
        .catch(done);
    });

    it("should get item quantity", done => {
      fetchItemQuantity({ id: 113 })
        .then(res => {
          res.should.have.status(200);
          res.body.should.be.equal(90);
          done();
        })
        .catch(done);
    });
  });

  describe("calculate item price", () => {
    it("should get 404 if item is missing", done => {
      calculateItemPrice({ id: 9999, body: { quantity: 1 } })
        .then(res => {
          res.should.have.status(404);
          done();
        })
        .catch(done);
    });

    it("should get 400 if quantity is not specified", done => {
      calculateItemPrice({ id: 9999 })
        .then(res => {
          res.should.have.status(400);
          done();
        })
        .catch(done);
    });

    it("should get item price on standard item with quantity 1", done => {
      calculateItemPrice({ id: 113, body: { quantity: 1 } })
        .then(res => {
          res.should.have.status(200);
          res.text.should.be.equal("152.01 EUR");
          res.should.have.header("Content-Type", "text/html; charset=utf-8");
          done();
        })
        .catch(done);
    });

    it("should get item quantity on standard item with quantity 5", done => {
      calculateItemPrice({ id: 113, body: { quantity: 5 } })
        .then(res => {
          res.should.have.status(200);
          res.text.should.be.equal("760.05 EUR");
          res.should.have.header("Content-Type", "text/html; charset=utf-8");
          done();
        })
        .catch(done);
    });

    it("should get 400 when asking for quantity which could not be delivered", done => {
      calculateItemPrice({ id: 113, body: { quantity: 91 } })
        .then(res => {
          res.should.have.status(400);
          done();
        })
        .catch(done);
    });

    it("should get item price on discounted item with quantity 1", done => {
      calculateItemPrice({ id: 47, body: { quantity: 1 } })
        .then(res => {
          res.should.have.status(200);
          res.text.should.be.equal("154.11 EUR");
          res.should.have.header("Content-Type", "text/html; charset=utf-8");
          done();
        })
        .catch(done);
    });

    it("should get item price on discounted item with quantity 5", done => {
      calculateItemPrice({ id: 47, body: { quantity: 5 } })
        .then(res => {
          res.should.have.status(200);
          res.text.should.be.equal("616.44 EUR");
          res.should.have.header("Content-Type", "text/html; charset=utf-8");
          done();
        })
        .catch(done);
    });
  });
});
