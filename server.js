var express = require('express');
var app = express();
var {PORT, DATABASE_URL} = require('./config');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var hospitalizationsRouter = require('./routes/hospitalizations');
var questionsRouter = require('./routes/questions');

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());

app.get('/dashboard', function(req, res) {
	return res.sendFile('dashboard.html', {root: './public'});
});

app.use('/hospitalizations', hospitalizationsRouter);
app.use('/questions', questionsRouter);

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}


if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};