const Joi = require("joi");
const BaseRoute = require("../base/baseRoute");

class HeroRoutes extends BaseRoute {
  constructor(db) {
    super();
    this.db = db;
  }

  list() {
    return {
      path: "/heroes",
      method: "GET",
      config: {
        validate: {
          failAction: (request, headers, erro) => {
            throw erro;
          },
          query: {
            limit: Joi.number().integer().default(10),
            skip: Joi.number().integer().default(0),
            name: Joi.string().min(3).max(100),
            power: Joi.string().min(3).max(25),
          },
        },
      },
      handler: (request, headers) => {
        try {
          const { name, power, skip, limit } = request.query;
          const filter = {};
          name &&
            Object.assign(filter, {
              name: { $regex: `.*${name}*.`, $options: "gi" },
            });
          power &&
            Object.assign(filter, {
              power: { $regex: `.*${power}*.`, $options: "gi" },
            });

          return this.db.index(filter, skip, limit);
        } catch (error) {
          console.log("deu ruim mano", error.message);
          return headers.response(error).code(500);
        }
      },
    };
  }

  create() {
    return {
      path: "/hero",
      method: "POST",
      handler: (request, headers) => {
        const data = request.payload;

        return this.db.store(data);
      },
    };
  }
}

module.exports = HeroRoutes;