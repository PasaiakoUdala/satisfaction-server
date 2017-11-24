const Sequelize = require('sequelize'),
  epilogue = require('epilogue'),
  http = require('http');

require('dotenv').config()

// Define your models with Sequelize
// This is equivalent to defining Doctrine entities
let database = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

database.authenticate().then(() => {
  console.log('Connection has been established successfully.');
})
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

let Satisfaction = database.define('Satisfaction', {
  kokapena: Sequelize.STRING,
  saila: Sequelize.STRING,
  galderaeus: Sequelize.STRING,
  galderaes: Sequelize.STRING,
  emaitza: Sequelize.INTEGER
});

// Initialize server
let server, app;
if (process.env.USE_RESTIFY) {
  const restify = require('restify');

  app = server = restify.createServer();
  app.use(restify.queryParser());
  app.use(restify.bodyParser());

} else {
  const express = require('express'),
    bodyParser = require('body-parser');

  app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  server = http.createServer(app);
}

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


// Plug Epilogue into Express
epilogue.initialize({
  app: app,
  sequelize: database
});

// Configure a REST resource endpoint with Epilogue
let satisfactionResource = epilogue.resource({
  model: Satisfaction,
  endpoints: ['/satisfaction', '/satisfaction/:id']
});

database
  .sync({force: false})
  .then(function () {
    app.listen(3000, function () {
      var host = app.address;
      console.log('Zerbitzaria entzuten http://localhost:3000');
    });
  });
