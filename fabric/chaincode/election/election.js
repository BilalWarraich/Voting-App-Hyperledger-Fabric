'use strict';
const shim = require('fabric-shim');
const util = require('util');
const printj = require('printj');

let Chaincode = class {
  async Init(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    console.info('=========== Instantiated Chaincode ===========');
    return shim.success();
  }

  async Invoke(stub) {
    console.info('Transaction ID: ' + stub.getTxID());
    console.info(util.format('Args: %j', stub.getArgs()));

    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.log('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params, this);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }
  async addVoter(stub, args, thisClass) {
    if (args.length != 4) {
      throw new Error('Incorrect number of arguments. Expecting 4');
    }
    
    console.info('--- start registeration ---')
    if (args[0].length <= 0) {
      throw new Error('1st argument must be a non-empty string');
    }
    if (args[1].length <= 0) {
      throw new Error('2nd argument must be a non-empty string');
    }
    if (args[2].length <= 0) {
      throw new Error('3rd argument must be a non-empty string');
    }
    if (args[3].length <= 0) {
      throw new Error('4th argument must be a non-empty string');
    }

    let voterID = args[0];
    let username = args[1];
    let password = args[2];
    let status = args[3];
  

    // ==== Check if voter already exists ====
    let voterState = await stub.getState(voterID);
    if (voterState.toString()) {
      throw new Error('This voter already exists: ' + voterID);
    }

    // ==== Create voter object and marshal to JSON ====
    let voter = {};
    voter.docType = 'voter';
    voter.voterID = voterID;
    voter.username = username;
    voter.password = password;
    voter.status = status;


    
    await stub.putState(voterID, Buffer.from(JSON.stringify(voter)));
   
    console.info('- end Register certificate');
  }

  async addCandidate(stub, args, thisClass) {
    if (args.length != 7) {
      throw new Error('Incorrect number of arguments. Expecting 7');
    }
    
    console.info('--- start registeration ---')
    if (args[0].length <= 0) {
      throw new Error('1st argument must be a non-empty string');
    }
    if (args[1].length <= 0) {
      throw new Error('2nd argument must be a non-empty string');
    }
    if (args[2].length <= 0) {
      throw new Error('3rd argument must be a non-empty string');
    }
    if (args[3].length <= 0) {
      throw new Error('4th argument must be a non-empty string');
    }
    if (args[4].length <= 0) {
        throw new Error('5th argument must be a non-empty string');
    }
    if (args[5].length <= 0) {
        throw new Error('6th argument must be a non-empty string');
    }
    if (args[6].length <= 0) {
      throw new Error('7th argument must be a non-empty string');
  }


    let candidateID = args[0];
    let candidateName = args[1];
    let contact = args[2];
    let address = args[3];
    let image = args[4];
    let votes = args[5];
    let status = args[6];
  

    

    // ==== Check if candidate already exists ====
    let candidateState = await stub.getState(candidateID);
    if (candidateState.toString()) {
      throw new Error('This candidate already exists: ' + candidateID);
    }

    // ==== Create candidate object and marshal to JSON ====
    let candidate = {};
    candidate.docType = 'candidate';
    candidate.candidateID = candidateID;
    candidate.candidateName = candidateName;
    candidate.contact = contact;
    candidate.address = address;
    candidate.image = image;    
    candidate.votes = votes;
    candidate.status = status;
    

    
    await stub.putState(candidateID, Buffer.from(JSON.stringify(candidate)));
   
    console.info('- end Register candidate');
  }

  async getCandidateByID(stub, args, thisClass) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting ID of the certificate to query');
    }

    let candidateID = args[0];
    if (!candidateID) {
      throw new Error(' candidateID must not be empty');
    }
    let candidateAsbytes = await stub.getState(candidateID); //get the candidate from chaincode state
    if (!candidateAsbytes.toString()) {
      let jsonResp = {};
      jsonResp.Error = 'certificate does not exist: ' + candidateID;
      throw new Error(JSON.stringify(jsonResp));
    }
    console.info('=======================================');
    console.log(candidateAsbytes.toString());
    console.info('=======================================');
    
    return candidateAsbytes;
    
  }
  
  async queryCandidateByStatus(stub, args, thisClass) {
    //   0
    // 'queryString'
    if (args.length < 1) {
      throw new Error('Incorrect number of arguments. Expecting queryString');
    }

    let status= args[0];
    let queryString = printj.sprintf("{\"selector\":{\"docType\":\"candidate\",\"status\":\"%s\"}}", status);
    if (!queryString) {
      throw new Error('queryString must not be empty');
    }
    let method = thisClass['getQueryResultForQueryString'];
    let queryResults = await method(stub, queryString, thisClass);

    return queryResults;
  }

  async queryCandidates(stub,args, thisClass) {

    let queryString = printj.sprintf("{\"selector\":{\"docType\":\"candidate\"}}");
    if (!queryString) {
      throw new Error('queryString must not be empty');
    }
    let method = thisClass['getQueryResultForQueryString'];
    let queryResults = await method(stub, queryString, thisClass);

    return queryResults;

  }

  async queryVoter(stub, args, thisClass) {
    //   0
    // 'queryString'
    if (args.length < 2) {
      throw new Error('Incorrect number of arguments. Expecting queryString');
    }

    let username= args[0];
    let password= args[1];

    let queryString = printj.sprintf("{\"selector\":{\"docType\":\"voter\",\"username\":\"%s\",\"password\":\"%s\"}}", username, password);
    if (!queryString) {
      throw new Error('queryString must not be empty');
    }
    let method = thisClass['getQueryResultForQueryString'];
    let queryResults = await method(stub, queryString, thisClass);

    return queryResults;
  }

  async queryVoterByStatus(stub, args, thisClass) {
    //   0
    // 'queryString'
    if (args.length < 1) {
      throw new Error('Incorrect number of arguments. Expecting queryString');
    }

    let status= args[0];
    let queryString = printj.sprintf("{\"selector\":{\"docType\":\"voter\",\"status\":\"%s\"}}", status);
    if (!queryString) {
      throw new Error('queryString must not be empty');
    }
    let method = thisClass['getQueryResultForQueryString'];
    let queryResults = await method(stub, queryString, thisClass);

    return queryResults;
  }

  async updateCandidate(stub, args, thisClass) {
    //   0       1
    // 'name', 'bob'
    if (args.length < 2) {
      throw new Error('Incorrect number of arguments. Expecting marblename and owner')
    }

    let candidateID = args[0];
    let newVotes = args[1];
    console.info('- start transferMarble ', candidateID, newVotes);

    let candidateAsBytes = await stub.getState(candidateID);
    if (!candidateAsBytes || !candidateAsBytes.toString()) {
      throw new Error('candidate does not exist');
    }
    let candidateToTransfer = {};
    try {
      candidateToTransfer = JSON.parse(candidateAsBytes.toString()); //unmarshal
    } catch (err) {
      let jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + candidateID;
      throw new Error(jsonResp);
    }
    console.info(candidateToTransfer);
    candidateToTransfer.votes = newVotes; //change the owner

    let candidateJSONasBytes = Buffer.from(JSON.stringify(candidateToTransfer));
    await stub.putState(candidateID, candidateJSONasBytes); //rewrite the marble

    console.info('- end update (success)');
  }

  async updateCandidateStatus(stub, args, thisClass) {
    //   0       1
    // 'name', 'bob'
    if (args.length < 2) {
      throw new Error('Incorrect number of arguments. Expecting marblename and owner')
    }

    let candidateID = args[0];
    let newStatus = args[1];
    console.info('- start transferMarble ', candidateID, newStatus);

    let candidateAsBytes = await stub.getState(candidateID);
    if (!candidateAsBytes || !candidateAsBytes.toString()) {
      throw new Error('candidate does not exist');
    }
    let candidateToTransfer = {};
    try {
      candidateToTransfer = JSON.parse(candidateAsBytes.toString()); //unmarshal
    } catch (err) {
      let jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + candidateID;
      throw new Error(jsonResp);
    }
    console.info(candidateToTransfer);
    candidateToTransfer.status = newStatus; //change the status

    let candidateJSONasBytes = Buffer.from(JSON.stringify(candidateToTransfer));
    await stub.putState(candidateID, candidateJSONasBytes); //rewrite the status

    console.info('- end update (success)');
  }

  async update(stub, args, thisClass) {
    //   0       1
    // 'name', 'bob'
    if (args.length < 5) {
      throw new Error('Incorrect number of arguments. Expecting 6')
    }


    let candidateID = args[0];
    let newCandidateName = args[1];
    let newContact = args[2];
    let newAddress = args[3];
    let newImage = args[4];
    console.info('- start transferMarble ', candidateID,newCandidateName,newContact,newAddress,newImage);

    let candidateAsBytes = await stub.getState(candidateID);
    if (!candidateAsBytes || !candidateAsBytes.toString()) {
      throw new Error('candidate does not exist');
    }
    let candidateToTransfer = {};
    try {
      candidateToTransfer = JSON.parse(candidateAsBytes.toString()); //unmarshal
    } catch (err) {
      let jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + candidateID;
      throw new Error(jsonResp);
    }
    console.info(candidateToTransfer);
    candidateToTransfer.candidateName = newCandidateName; 
    candidateToTransfer.contact = newContact; 
    candidateToTransfer.address = newAddress; 
    candidateToTransfer.image = newImage; 

    let candidateJSONasBytes = Buffer.from(JSON.stringify(candidateToTransfer));
    await stub.putState(candidateID, candidateJSONasBytes); //rewrite the marble

    console.info('- end update (success)');
  }

  async delete(stub, args, thisClass) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting name of the marble to delete');
    }
    let candidateID = args[0];
    if (!candidateID) {
      throw new Error(' must not be empty');
    }
    // to maintain the color~name index, we need to read the marble first and get its color
    let valAsbytes = await stub.getState(candidateID); //get the marble from chaincode state
    let jsonResp = {};
    if (!valAsbytes) {
      jsonResp.error = 'candidate does not exist: ' + candidateID;
      throw new Error(jsonResp);
    }
    let marbleJSON = {};
    try {
      marbleJSON = JSON.parse(valAsbytes.toString());
    } catch (err) {
      jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + candidateID;
      throw new Error(jsonResp);
    }

    await stub.deleteState(candidateID); //remove the marble from chaincode state

  }

  async updateVoterStatus(stub, args, thisClass) {
    //   0       1
    // 'name', 'bob'
    if (args.length < 2) {
      throw new Error('Incorrect number of arguments. Expecting marblename and owner')
    }

    let voterID = args[0];
    let newStatus = args[1];
    console.info('- start Update ', voterID, newStatus);

    let voterAsBytes = await stub.getState(voterID);
    if (!voterAsBytes || !voterAsBytes.toString()) {
      throw new Error('voter does not exist');
    }
    let voterToTransfer = {};
    try {
      voterToTransfer = JSON.parse(voterAsBytes.toString()); //unmarshal
    } catch (err) {
      let jsonResp = {};
      jsonResp.error = 'Failed to decode JSON of: ' + voterID;
      throw new Error(jsonResp);
    }
    console.info(voterToTransfer);
    voterToTransfer.status = newStatus; //change the status

    let voterJSONasBytes = Buffer.from(JSON.stringify(voterToTransfer));
    await stub.putState(voterID, voterJSONasBytes); //rewrite the status

    console.info('- end update (success)');
  }

  async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete.toString();
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return allResults;
      }
    }
  }

  async getQueryResultForQueryString(stub, queryString, thisClass) {

    console.info('- getQueryResultForQueryString queryString:\n' + queryString)
    let resultsIterator = await stub.getQueryResult(queryString);
    let method = thisClass['getAllResults'];

    let results = await method(resultsIterator, false);

    return Buffer.from(JSON.stringify(results));
  }
};



shim.start(new Chaincode());
