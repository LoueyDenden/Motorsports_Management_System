const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');

const motogpProtoPath = 'motogp.proto';
const motogpProtoDefinition = protoLoader.loadSync(motogpProtoPath, {
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
const motogpProto = grpc.loadPackageDefinition(motogpProtoDefinition).motogp;

const url = 'mongodb://localhost:27017/motogpDB';

mongoose.connect(url)
    .then(() => {
        console.log('Connected to database!');
    }).catch((err) => {
        console.log(err);
    });

const MotoGPRider = require('./models/motogpModel');

const motogpService = {
    getRider: async (call, callback) => {
        await producer.connect();
        try {
            const riderId = call.request.id;
            const rider = await MotoGPRider.findOne({ _id: riderId }).exec();
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: 'Searched for rider ID: ' + riderId.toString() }],
            });
            if (!rider) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Rider not found' });
                return;
            }
            callback(null, { rider });
        } catch (error) {
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: `Error occurred while fetching rider: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching rider' });
        }
    },
    searchRiders: async (call, callback) => {
        try {
            const riders = await MotoGPRider.find({}).exec();
            await producer.connect();
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: 'Searched for Riders' }],
            });
            callback(null, { riders });
        } catch (error) {
            await producer.connect();
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: `Error occurred while fetching Riders: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while fetching Riders' });
        }
    },
    addRider: async (call, callback) => {
        const { name, team } = call.request;
        const newRider = new MotoGPRider({ name, team });
        try {
            await producer.connect();
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: JSON.stringify(newRider) }],
            });
            await producer.disconnect();
            const savedRider = await newRider.save();
            callback(null, { rider: savedRider });
        } catch (error) {
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while adding rider' });
        }
    },
    deleteRider: async (call, callback) => {
        await producer.connect();
        const riderId = call.request.id;
        try {
            const deletedRider = await MotoGPRider.findOneAndDelete({ _id: riderId }).exec();
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: 'Deleted for rider ID: ' + riderId.toString() }],
            });
            if (!deletedRider) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Rider not found' });
                return;
            }
            callback(null, {});
        } catch (error) {
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: `Error occurred while deleting rider: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while deleting rider' });
        }
    },

    updateRider: async (call, callback) => {
        await producer.connect();
        const { id, name, team } = call.request;
        try {
            const updatedRider = await MotoGPRider.findOneAndUpdate(
                { _id: id }, 
                { $set: { name, team } }, 
                { new: true }
            ).exec();
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: 'Updated Rider ID: ' + id.toString() }],
            });
            if (!updatedRider) {
                callback({ code: grpc.status.NOT_FOUND, message: 'Rider not found' });
                return;
            }
            callback(null, { rider: updatedRider });
        } catch (error) {
            await producer.send({
                topic: 'motogp-topic',
                messages: [{ value: `Error occurred while updating rider: ${error}` }],
            });
            callback({ code: grpc.status.INTERNAL, message: 'Error occurred while updating rider' });
        }
    }
};

const server = new grpc.Server();
server.addService(motogpProto.MotoGPService.service, motogpService);
const port = 50053;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(),
    (err, port) => {
        if (err) {
            console.error('Failed to bind server:', err);
            return;
        }
        console.log(`Server is running on port ${port}`);
        server.start();
    });
console.log(`MotoGP microservice is running on port ${port}`);
