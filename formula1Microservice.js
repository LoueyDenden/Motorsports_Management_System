const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');

const formula1ProtoPath = 'formula1.proto';
const formula1ProtoDefinition = protoLoader.loadSync(formula1ProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
});
const producer = kafka.producer();
const formula1Proto = grpc.loadPackageDefinition(formula1ProtoDefinition).formula1;

const url = 'mongodb://localhost:27017/formula1DB';

mongoose.connect(url)
    .then(() => {
        console.log('Connected to database!');
    }).catch((err) => {
        console.log(err);
    });

const Formula1Driver = require('./models/formula1Model');

const formula1Service = {
    getDriver: async (call, callback) => {
        await producer.connect();
        try {
            const driverId = call.request.id;
            const driver = await Formula1Driver.findOne({ _id: driverId }).exec();
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: 'Searched for driver ID: ' + driverId.toString() }],
            });
            if (!driver) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Driver not found' });
                return;
            }
            callback(null, { driver });
        } catch (error) {
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: `Error occurred while fetching driver: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching driver' });
        }
    },
    searchDrivers: async (call, callback) => {
        try {
            const drivers = await Formula1Driver.find({}).exec();
            await producer.connect();
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: 'Searched for Drivers' }],
            });
            callback(null, { drivers });
        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: `Error occurred while fetching Drivers: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching Drivers' });
        }
    },
    addDriver: async (call, callback) => {
        const { name, team } = call.request;
        const newDriver = new Formula1Driver({ name, team });
        try {
            await producer.connect();
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: JSON.stringify(newDriver) }],
            });
            await producer.disconnect();
            const savedDriver = await newDriver.save();
            callback(null, { driver: savedDriver });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding driver' });
        }
    },
    deleteDriver: async (call, callback) => {
        const driverId = call.request.id;
        await producer.connect();
        try {
            const deletedDriver = await Formula1Driver.findOneAndDelete({ _id: driverId }).exec();
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: 'Deleted for driver ID: ' + driverId.toString() }],
            });
            if (!deletedDriver) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Driver not found' });
                return;
            }
            callback(null, {});
        } catch (error) {
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: `Error occurred while deleting driver: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while deleting driver' });
        }
    },
    updateDriver: async (call, callback) => {
        const { id, name, team } = call.request;
        await producer.connect();
        try {
            const updatedDriver = await Formula1Driver.findOneAndUpdate(
                { _id: id }, 
                { $set: { name, team } }, 
                { new: true }
            ).exec();
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: 'Updated driver ID: ' + id.toString() }],
            });
            if (!updatedDriver) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Driver not found' });
                return;
            }
            callback(null, { driver: updatedDriver });
        } catch (error) {
            await producer.send({
                topic: 'formula1-topic',
                messages: [{ value: `Error occurred while updating driver: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while updating driver' });
        }
    }
};

const server = new grpc.Server();
server.addService(formula1Proto.Formula1Service.service, formula1Service);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
            return;
        }
        console.log(`Server is running on port ${port}`);
        server.start();
    });
console.log(`Formula 1 microservice is running on port ${port}`);
