// resolvers.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load Proto files for Formula 1 and MotoGP
const formula1ProtoPath = 'formula1.proto';
const motoGPProtoPath = 'motogp.proto';

const formula1ProtoDefinition = protoLoader.loadSync(formula1ProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const motoGPProtoDefinition = protoLoader.loadSync(motoGPProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const formula1Proto = grpc.loadPackageDefinition(formula1ProtoDefinition).formula1;
const motoGPProto = grpc.loadPackageDefinition(motoGPProtoDefinition).motogp;

// Define resolvers for GraphQL queries
const resolvers = {
    Query: {
        formula1Driver: (_, { id }) => {
            // Make gRPC call to Formula 1 microservice
            const client = new formula1Proto.Formula1Service('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getDriver({ id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.driver);
                    }
                });
            });
        },
        formula1Drivers: () => {
            // Make gRPC call to Formula 1 microservice
            const client = new formula1Proto.Formula1Service('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchDrivers({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.drivers);
                    }
                });
            });
        },
        motoGPRider: (_, { id }) => {
            // Make gRPC call to MotoGP microservice
            const client = new motoGPProto.MotoGPService('localhost:50053',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.getRider({ id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.rider);
                    }
                });
            });
        },
        motoGPRiders: () => {
            // Make gRPC call to MotoGP microservice
            const client = new motoGPProto.MotoGPService('localhost:50053',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.searchRiders({}, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.riders);
                    }
                });
            });
        },
    },
    Mutation: {
        addFormula1Driver: (_, { name, team }) => {
            // Make gRPC call to Formula 1 microservice for adding a driver
            const client = new formula1Proto.Formula1Service('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.addDriver({ name: name, team: team }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.driver);
                    }
                });
            });
        },
        updateFormula1Driver: (_, { id, name, team }) => {
            // Make gRPC call to Formula 1 microservice for updating a driver
            const client = new formula1Proto.Formula1Service('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.updateDriver({ id: id, name: name, team: team }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.driver);
                    }
                });
            });
        },
        deleteFormula1Driver: (_, { id }) => {
            // Make gRPC call to Formula 1 microservice for deleting a driver
            const client = new formula1Proto.Formula1Service('localhost:50052',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.deleteDriver({ id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(`Driver with ID ${id} deleted successfully`);
                    }
                });
            });
        },
        addMotoGPRider: (_, { name, team }) => {
            // Make gRPC call to MotoGP microservice
            const client = new motoGPProto.MotoGPService('localhost:50053',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.addRider({ name: name, team: team }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.rider);
                    }
                });
            });
        },
        updateMotoGPRider: (_, { id, name, team }) => {
            // Make gRPC call to MotoGP microservice for updating a rider
            const client = new motoGPProto.MotoGPService('localhost:50053',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.updateRider({ id: id, name: name, team: team }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(response.rider);
                    }
                });
            });
        },
        deleteMotoGPRider: (_, { id }) => {
            // Make gRPC call to MotoGP microservice for deleting a rider
            const client = new motoGPProto.MotoGPService('localhost:50053',
                grpc.credentials.createInsecure());
            return new Promise((resolve, reject) => {
                client.deleteRider({ id: id }, (err, response) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(`Rider with ID ${id} deleted successfully`);
                    }
                });
            });
        },
    }
};

module.exports = resolvers;
