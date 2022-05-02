import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { PortfolioComposition } from "./portfolioComposition.js";
import { Etf } from "./Etf.js";
// id PK
// name: string
// risk profile: string
// etf: json
// rentability: int
// composition: json
// carbon stamp: int

export const Portfolio = sequelize.define(
  "portfolios",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    risk_profile: {
      type: DataTypes.STRING,
    },
  // etf: {
  //   type: DataTypes.JSON,
  // },
    rentability: {
      type: DataTypes.FLOAT,
    },
    composition: {
      type: DataTypes.JSON,
    },
    carbon_footprint: {
      type: DataTypes.FLOAT,
    },
  },
  {
    timestamps: false,
  }
);
Portfolio.belongsToMany(Etf, { through: PortfolioComposition });
Etf.belongsToMany(Portfolio, { through: PortfolioComposition });