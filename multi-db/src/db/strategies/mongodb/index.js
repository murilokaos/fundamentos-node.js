const mongoose = require("mongoose");

const ICrud = require("../interfaces/crud");

class MongoDB extends ICrud {
  constructor() {
    super();
    this._driver = null;
    this._heros = null;
    this.connect();
  }
  async isConnected() {
    try {
      if (mongoose.connection.readyState === 1) {
        return true;
      }

      throw mongoose.connection.readyState;
    } catch (error) {
      console.error(`fail! connection that's on ${error} state`);
    }
  }
  connect() {
    this._driver = mongoose.connect(
      "mongodb://murilo:123@localhost:27017/heros",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    this.defineModel();
  }
  defineModel() {
    const schema = new mongoose.Schema({
      name: "string",
      power: "string",
      birthDate: "string"
    });
    this._heros = mongoose.model("Hero", schema);
  }
  async show(query) {
    const show = await this._heros
      .findOne(query, { name: 1, power: 1, _id: 0 })
      .lean();
    return show;
  }

  async store(item) {
    const store = (await this._heros.create(item)).toObject();
    delete store._id;
    delete store.__v;
    return store;
  }

  index(query) {
    return this._heros.find(query, { name: 1, power: 1 }).lean();
  }

  async update(id, item) {
    const update = await this._heros
      .updateOne({ _id: id }, { $set: item }, {})
      .lean();
    return update;
  }

  delete(id) {
    const typeOfDelete = id ? "one" : "many";
    if (typeOfDelete === "one") {
      const deleted = this._heros.deleteOne(id);
      return !!deleted;
    } else {
      const deleted = this._heros.deleteMany({});
      return !!deleted.ok;
    }
  }
}

module.exports = MongoDB;
