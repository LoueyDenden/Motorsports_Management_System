<div style="display: flex; justify-content: space-between;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Ferrari%27s_Charles_Leclerc_battles_for_the_podium_with_Mercedes%27_Lewis_Hamilton_at_the_2022_British_Grand_Prix_at_Silverstone._%2852196620083%29.jpg/1280px-Ferrari%27s_Charles_Leclerc_battles_for_the_podium_with_Mercedes%27_Lewis_Hamilton_at_the_2022_British_Grand_Prix_at_Silverstone._%2852196620083%29.jpg" alt="Lewis Hamilton" width="400" height="250">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Marc_Marquez.jpeg/1280px-Marc_Marquez.jpeg" alt="Marc Marquez" width="400" height="250">
</div>

# Motorsports Management System

The Motorsports Management System is a robust solution designed to facilitate the management of motorsports entities: Formula 1 and MotoGP. This system is comprised of two microservices, each dedicated to a specific motorsport: the Formula 1 Microservice, responsible for managing Drivers' information, and the MotoGP Microservice, dedicated to managing Riders' data. Both microservices are written in JavaScript and utilize MongoDB databases for efficient data storage and retrieval.

## Technologies Used
<p align="left">
  <a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> </a> 
  <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original-wordmark.svg" alt="mongodb" width="40" height="40"/> </a> 
  <a href="https://graphql.org" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/graphql/graphql-icon.svg" alt="graphql" width="40" height="40"/> </a>
  <a href="https://kafka.apache.org/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/apache_kafka/apache_kafka-icon.svg" alt="kafka" width="40" height="40"/> </a> 
</p>

![Diagram](Diagram1.drawio.svg)

## Key Features

1. **Formula 1 Microservice:**
   - Manages CRUD operations for Formula 1 Drivers.
   - Utilizes JavaScript for backend logic.
   - Interacts with a MongoDB database for persistent data storage.
   - Communicates with the API Gateway via gRPC protocol.
   - Supports REST and GraphQL endpoints for client interaction.

2. **MotoGP Microservice:**
   - Handles CRUD operations for MotoGP Riders.
   - Implemented in JavaScript for backend functionalities.
   - Utilizes MongoDB as the underlying database system.
   - Communicates with the API Gateway using gRPC communication.
   - Provides REST and GraphQL interfaces for client communication.

3. **gRPC Communication:**
   - Both microservices communicate with the API Gateway using gRPC protocol, ensuring efficient and high-performance inter-service communication.

4. **Client Interaction:**
   - Clients can interact with the system using REST or GraphQL requests, providing flexibility and ease of integration.

5. **Kafka Integration:**
   - Kafka is employed to manage logs generated by the microservices.
   - Each microservice acts as a producer, publishing logs to dedicated Kafka topics: Formula 1 and MotoGP.
   - The API Gateway serves as the consumer, processing and managing the log data efficiently.

The Motorsports Management System provides a scalable, efficient, and flexible solution for managing motorsports entities, offering seamless communication between microservices, diverse client interaction options, and robust log management capabilities through Kafka integration.


## Installation

Follow these steps to set up and run the Motorsports Management System on your local machine:

### 1. Install Node.js and npm

Make sure you have Node.js and npm installed on your system. You can download and install them from [here](https://nodejs.org/).

### 2. Install Node Modules

Navigate to the root directory and run the following command to install the required Node modules:

```bash
npm install
```

### 3. Install Kafka
Download and install Kafka from the [official website](https://kafka.apache.org/downloads). Follow the installation instructions provided.

### 4. Start Kafka Zookeeper and Server
Navigate to the Kafka directory and start Zookeeper and Kafka server by running the following commands:
```bash
bin/zookeeper-server-start.sh config/zookeeper.properties
```
```bash
bin/kafka-server-start.sh config/server.properties
```

### 5. Start MongoDB
Ensure MongoDB is installed and running on your system. You can download and install MongoDB from [here](https://www.mongodb.com/try/download/community).
Start MongoDB and connect.

### 6. Start Microservices
In separate terminal windows, navigate to the root directory of each microservice and start them by running:
```bash
node formula1Microservice.js
```
```bash
node motogpMicroservice.js
```
```bash
node apiGateway.js
```

### 7. Testing
Postman
You can test the REST endpoints using [Postman](https://www.postman.com/). Import the provided Postman collection and test the endpoints for CRUD operations on Drivers and Riders.

Apollo Server
For testing GraphQL endpoints, you can use Apollo Server. Navigate to the GraphQL endpoint (http://localhost:PORT) in your browser or use a tool like GraphiQL to explore and test GraphQL queries and mutations.

### Formula 1 Endpoints

- **GET** `/f1`: Get all drivers.
- **GET** `/f1/:id`: Get driver by ID.
- **POST** `/f1/add`: Add new driver.
- **PUT** `/f1/:id`: Update driver.
- **DELETE** `/f1/:id`: Delete driver.

### MotoGP Endpoints

- **GET** `/motogp`: Get all riders.
- **GET** `/motogp/:id`: Get rider by ID.
- **POST** `/motogp/add`: Add new rider.
- **PUT** `/motogp/:id`: Update rider.
- **DELETE** `/motogp/:id`: Delete rider.


## Contribution
This project was developed and maintained by Louey Denden.
