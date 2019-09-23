import chai from "chai";
import { app } from "../src/server";

const onEnd = (resolve, reject) => (err, res) => {
  if (err) {
    reject(err);
  } else {
    resolve(res);
  }
};

const updateConfig = config => {
  return new Promise((resolve, reject) => {
    chai
      .request(app)
      .post("/config")
      .send(config)
      .end(onEnd(resolve, reject));
  });
};

const fetchConfig = () => {
  return new Promise((resolve, reject) => {
    chai
      .request(app)
      .get("/config")
      .end(onEnd(resolve, reject));
  });
};

const fetchItems = ({ serverName = "alpha", queryParams } = {}) => {
  return new Promise((resolve, reject) => {
    chai
      .request(app)
      .get(`/${serverName}/items`)
      .query(queryParams)
      .end(onEnd(resolve, reject));
  });
};

const fetchSingleItem = ({ serverName = "alpha", id }) => {
  return new Promise((resolve, reject) => {
    chai
      .request(app)
      .get(`/${serverName}/items/${id}`)
      .end(onEnd(resolve, reject));
  });
};

const fetchItemQuantity = ({ serverName = "alpha", id }) => {
  return new Promise((resolve, reject) => {
    chai
      .request(app)
      .get(`/${serverName}/items/${id}/quantity`)
      .end(onEnd(resolve, reject));
  });
};

const calculateItemPrice = ({ serverName = "alpha", id, body }) => {
  return new Promise((resolve, reject) => {
    chai
      .request(app)
      .post(`/${serverName}/items/${id}/calculate-price`)
      .send(body)
      .end(onEnd(resolve, reject));
  });
};

export {
  updateConfig,
  fetchConfig,
  fetchItems,
  fetchSingleItem,
  fetchItemQuantity,
  calculateItemPrice
};
