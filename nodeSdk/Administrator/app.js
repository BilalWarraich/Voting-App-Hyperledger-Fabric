'use strict';

//get libraries
const express = require('express');
var queue = require('express-queue');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');

//create express web-app
const app = express();
const invoke = require('./invokeNetwork');
const query = require('./queryNetwork');
var _time = "T00:00:00Z";

//declare port
var port = process.env.PORT || 8000;
if (process.env.VCAP_APPLICATION) {
  port = process.env.PORT;
}

app.use(bodyParser.json({
   limit: '50mb', 
   extended: true

}));

app.use(bodyParser.urlencoded({
  limit: '50mb', 
  extended: true
 }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
  });

//Using queue middleware
app.use(queue({ activeLimit: 30, queuedLimit: -1 }));

//run app on port
app.listen(port, function () {
  console.log('app running on port: %d', port);
});

//-------------------------------------------------------------
//----------------------  POST API'S    -----------------------
//-------------------------------------------------------------


app.post('/api/addCandidate', async function (req, res) {

  var request = {
    chaincodeId: 'election',
    fcn: 'addCandidate',
    args: [

      req.body.candidateID,
      req.body.candidateName,
      req.body.contact,
      req.body.address,
      req.body.image,
      req.body.votes,
      req.body.status
    ]
  };
console.log(req.body);
  let response = await invoke.invokeCreate(request);
  if (response) {
    if(response.status == 200)
    res.status(response.status).send({ message: "The Candidate with ID: "+req.body.candidateID+ " is stored in the blockchain with " +response.message  });
    else
    res.status(response.status).send({ message: response.message});
  }
});

app.post('/api/updateCandidate', async function (req, res) {

  var request = {
    chaincodeId: 'election',
    fcn: 'updateCandidate',
    args: [

      req.body.candidateID,
      req.body.votes

    ]
  };
console.log(req.body);
  let response = await invoke.invokeCreate(request);
  if (response) {
    if(response.status == 200)
    res.status(response.status).send({ message: "The Candidiate with ID: "+req.body.candidateID+ " is stored in the blockchain with " +response.message  });
    else
    res.status(response.status).send({ message: response.message});
  }
});

app.post('/api/updateCandidateStatus', async function (req, res) {

  var request = {
    chaincodeId: 'election',
    fcn: 'updateCandidateStatus',
    args: [

      req.body.candidateID,
      req.body.status

    ]
  };
console.log(req.body);
  let response = await invoke.invokeCreate(request);
  if (response) {
    if(response.status == 200)
    res.status(response.status).send({ message: "The Candidiate with ID: "+req.body.candidateID+ " is stored in the blockchain with " +response.message  });
    else
    res.status(response.status).send({ message: response.message});
  }
});



app.post('/api/update', async function (req, res) {

  var request = {
    chaincodeId: 'election',
    fcn: 'update',
    args: [

      req.body.candidateID,
      req.body.candidateName,
      req.body.contact,
      req.body.address,
      req.body.image        
    ]
  };
console.log(req.body);
  let response = await invoke.invokeCreate(request);
  if (response) {
    if(response.status == 200)
    res.status(response.status).send({ message: "The Candidate with ID: "+req.body.candidateID+ " is stored in the blockchain with " +response.message  });
    else
    res.status(response.status).send({ message: response.message});
  }
});

app.post('/api/updateVoterStatus', async function (req, res) {

  var request = {
    chaincodeId: 'election',
    fcn: 'updateVoterStatus',
    args: [

      req.body.voterID,
      req.body.status

    ]
  };
console.log(req.body);
  let response = await invoke.invokeCreate(request);
  if (response) {
    if(response.status == 200)
    res.status(response.status).send({ message: "The voter with ID: "+req.body.voterID+ " is stored in the blockchain with " +response.message  });
    else
    res.status(response.status).send({ message: response.message});
  }
});

//-------------------------------------------------------------
//----------------------  GET API'S  --------------------------
//-------------------------------------------------------------


app.get('/api/queryCandidateByStatus', async function (req, res) {

  const request = {
    chaincodeId: 'election',
    fcn: 'queryCandidateByStatus',
    args: [
      req.query.status
    ]
  };
  console.log(req.query);
  let response = await query.invokeQuery(request)
  if (response) {
    if(response.status == 200)
      res.status(response.status).send(JSON.parse(response.message));
    else
      res.status(response.status).send({ message: response.message });
  }
});

app.get('/api/getCandidateByID', async function (req, res) {

  const request = {
    chaincodeId: 'election',
    fcn: 'getCandidateByID',
    args: [
      req.query.candidateID
    ]
  };
  let response = await query.invokeQuery(request)
  if (response) {
    if(response.status == 200)
      res.status(response.status).send(JSON.parse(response.message));
    else
      res.status(response.status).send({ message: response.message });
  }
});

app.get('/api/queryCandidates', async function (req, res) {

  const request = {
    chaincodeId: 'election',
    fcn: 'queryCandidates',
    args: []
  };
  let response = await query.invokeQuery(request)
  if (response) {
    if(response.status == 200)
    res.status(response.status).send({ message: JSON.parse(response.message) });
    else
    res.status(response.status).send({ message: response.message });
  }
});

app.post('/api/delete', async function (req, res) {

  var request = {
    chaincodeId: 'election',
    fcn: 'delete',
    args: [

      req.body.candidateID
           
    ]
  };
console.log(req.query);
  let response = await invoke.invokeCreate(request);
  if (response) {
    if(response.status == 200)
    res.status(response.status).send({ message: "The Candidate with ID: "+req.body.candidateID+ " is deleted in the blockchain with " +response.message  });
    else
    res.status(response.status).send({ message: response.message});
  }
});


app.get('/api/queryVoterByStatus', async function (req, res) {

  const request = {
    chaincodeId: 'election',
    fcn: 'queryVoterByStatus',
    args: [
      req.query.status
    ]
  };
  let response = await query.invokeQuery(request)
  if (response) {
    if(response.status == 200)
      res.status(response.status).send(JSON.parse(response.message));
    else
      res.status(response.status).send({ message: response.message });
  }
});

