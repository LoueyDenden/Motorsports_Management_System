//const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type Formula1 {
    id: String!
    name: String!
    team: String!
  }

  type MotoGP {
    id: String!
    name: String!
    team: String!
  }

  type Query {
    formula1Driver(id: String!): Formula1
    formula1Drivers: [Formula1]
    motoGPRider(id: String!): MotoGP
    motoGPRiders: [MotoGP]
  }

  type Mutation {
    addFormula1Driver(name: String!, team: String!): Formula1
    addMotoGPRider(name: String!, team: String!): MotoGP
    updateFormula1Driver(id: String!, name: String!, team: String!): Formula1
    deleteFormula1Driver(id: String!): String
    updateMotoGPRider(id: String!, name: String!, team: String!): MotoGP
    deleteMotoGPRider(id: String!): String
  }

`;

module.exports = typeDefs;
