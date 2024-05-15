const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Kafka } = require('kafkajs');

// Load proto files for Formula 1 and MotoGP
const f1ProtoPath = 'formula1.proto';
const motogpProtoPath = 'motogp.proto';
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

// Create a new Express application
const app = express();
const f1ProtoDefinition = protoLoader.loadSync(f1ProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const motogpProtoDefinition = protoLoader.loadSync(motogpProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
app.use(bodyParser.json());
const f1Proto = grpc.loadPackageDefinition(f1ProtoDefinition).formula1;
const motogpProto = grpc.loadPackageDefinition(motogpProtoDefinition).motogp;

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'] 
});

const consumer = kafka.consumer({ groupId: 'api-gateway-consumer' });

consumer.subscribe({ topic: 'formula1-topic' });
consumer.subscribe({ topic: 'motogp-topic' });

(async () => {
    await consumer.connect();
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value.toString()}, from topic: ${topic}`);
        },
    });
})();

// Create ApolloServer instance with imported schema and resolvers
const server = new ApolloServer({ typeDefs, resolvers });

// Apply ApolloServer middleware to Express application
server.start().then(() => {
    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server),
    );
});

app.get('/f1', (req, res) => {
    const client = new f1Proto.Formula1Service('localhost:50052',
        grpc.credentials.createInsecure());
    client.searchDrivers({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.drivers);
        }
    });
});

app.get('/f1/:id', (req, res) => {
    const client = new f1Proto.Formula1Service('localhost:50052',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getDriver({ id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.driver);
        }
    });
});

app.post('/f1/add', (req, res) => {
    const client = new f1Proto.Formula1Service('localhost:50052',
        grpc.credentials.createInsecure());
    const data = req.body;
    const driverName = data.name;
    const teamName = data.team;
    client.addDriver({ name: driverName, team: teamName }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.driver);
        }
    });
});

app.delete('/f1/:id', (req, res) => {
    const client = new f1Proto.Formula1Service('localhost:50052', grpc.credentials.createInsecure());
    const id = req.params.id;
    client.deleteDriver({ id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(204); // No content on successful deletion
        }
    });
});

// New route for updating a driver
app.put('/f1/:id', (req, res) => {
    const client = new f1Proto.Formula1Service('localhost:50052', grpc.credentials.createInsecure());
    const id = req.params.id;
    const { name, team } = req.body;
    client.updateDriver({ id: id, name: name, team: team }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.driver);
        }
    });
});

app.get('/motogp', (req, res) => {
    const client = new motogpProto.MotoGPService('localhost:50053',
        grpc.credentials.createInsecure());
    client.searchRiders({}, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.riders);
        }
    });
});

app.get('/motogp/:id', (req, res) => {
    const client = new motogpProto.MotoGPService('localhost:50053',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.getRider({ id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.rider);
        }
    });
});

app.post('/motogp/add', (req, res) => {
    const client = new motogpProto.MotoGPService('localhost:50053',
        grpc.credentials.createInsecure());
    const data = req.body;
    const riderName = data.name;
    const teamName = data.team;
    client.addRider({ name: riderName, team: teamName }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.rider);
        }
    });
});

app.put('/motogp/:id', (req, res) => {
    const client = new motogpProto.MotoGPService('localhost:50053',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    const data = req.body;
    const riderName = data.name;
    const teamName = data.team;
    client.updateRider({ id: id, name: riderName, team: teamName }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(response.rider);
        }
    });
});

app.delete('/motogp/:id', (req, res) => {
    const client = new motogpProto.MotoGPService('localhost:50053',
        grpc.credentials.createInsecure());
    const id = req.params.id;
    client.deleteRider({ id: id }, (err, response) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(`Rider with ID ${id} deleted successfully`);
        }
    });
});

// Start Express application
const port = 3000;
app.listen(port, () => {
    console.log(`API Gateway is running on port ${port}`);
});
