//set up sparql
var spar = require('dbpedia-sparql-client').default;

var prompt = require('prompt-sync')();
var AssistantV1 = require('watson-developer-cloud/assistant/v1');

// Set up Assistant service wrapper.
var service = new AssistantV1({ //my IBM credentials
  url: 'https://gateway.watsonplatform.net/assistant/api',
  username: '9e27e9e6-ed38-4f80-a87a-6143649b38f5',
  password: 'zeZ57ozFJLUE',
  version: '2018-09-20'
});

var workspace_id = '9f9d1612-6096-4b97-a350-27dd7833d6b0'; // my workspace ID

service.message({
  workspace_id: workspace_id
  }, processResponse);

// Process the service response.
function processResponse(err, response) {
  if (err) {
    console.error(err); // catch error
    return;
  }

  var endConversation = false;

  // Check for client actions requested by the dialog. Assumes at most a single action

  if (response.actions) {
    if (response.actions[0].type === 'client') {
      if (response.actions[0].name === 'display_time') {
        console.log('The current time is ' + new Date().toLocaleTimeString() + '.');
      } else if (response.actions[0].name === 'end_conversation') {
        console.log(response.output.generic[0].text);
        endConversation = true;
      }
    }
   } else {
    // Display the output from dialog, if any, checks which query to run depending on the output on the dialogue
    //using UNION to query for presidents, politiicians or billionaires
    if (response.output.generic.length != 0) {
    	if (response.output.generic[0].text == "[birth]") {
    		var query = `PREFIX dbp: <http://dbpedia.org/resource/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX yago: <http://dbpedia.org/class/yago/>
        SELECT ?birth where {{ ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:President110467179.
        ?person dbo:birthDate ?birth.
        FILTER regex(?name, "` + response.context.name + `", "i" ) .}
        UNION { ?person a foaf:Person . ?person foaf:name ?name.
        ?person rdf:type yago:Politician110450303. ?person dbo:birthDate ?birth.
        FILTER regex(?name, "` + response.context.name + `", "i" ) .}
        UNION { ?person a foaf:Person . ?person foaf:name ?name.
        ?person rdf:type yago:Billionaire110529684. ?person dbo:birthDate ?birth.
        FILTER regex(?name, "` + response.context.name + `", "i" ) .}}  `;
				spar.client()
				.query(query)
				.asJson()
				.then(function(r) {
					if (r.results.bindings.length != 0) {
						console.log(response.context.name + "'s birth date is " + r.results.bindings[0].birth.value + ".");
					} else {
						console.log("Sorry! I can't find the Birth date of " + response.context.name + " in the data source. Please ask me something else!?");

					}

				}) .catch(function(e) {
					console.log(e)
				});

	} else if (response.output.generic[0].text == "[country]") {
			var query = `PREFIX dbp: <http://dbpedia.org/resource/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX yago: <http://dbpedia.org/class/yago/>
      SELECT ?place where {{ ?person a foaf:Person . ?person foaf:name ?name.
      ?person rdf:type yago:President110467179. ?person dbo:birthPlace ?country.
      ?country foaf:name  ?place. FILTER regex(?name, "` + response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Politician110450303.
      ?person dbo:birthPlace ?country. ?country foaf:name ?place.
      FILTER regex(?name, "` + response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Billionaire110529684.
      ?person dbo:birthPlace ?country. ?country foaf:name  ?place.
      FILTER regex(?name, "` + response.context.name + `", "i" ) .}} `;
				spar.client()
				.query(query)
				.asJson()
				.then(function(r) {
					if (r.results.bindings.length != 0) {
						console.log(response.context.name + " is from " + r.results.bindings[0].place.value + ".");
					} else {
						console.log("Sorry can't find the Birth place of " + response.context.name + " in the data source. Please ask me something else!");

					}
				}) .catch(function(e) {
					console.log(e)
				});

	} else if (response.output.generic[0].text == "[description]") {
		var query = `PREFIX dbp: <http://dbpedia.org/resource/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX yago: <http://dbpedia.org/class/yago/>
      SELECT ?description where {{ ?person a foaf:Person . ?person foaf:name ?name.
       ?person rdf:type yago:President110467179. ?person dct:description ?description.
       FILTER regex(?name, "` + response.context.name + `", "i" ) .}
       UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Politician110450303.
       ?person dct:description ?description.
       FILTER regex(?name, "` + response.context.name + `", "i" ) .}
       UNION { ?person a foaf:Person . ?person foaf:name ?name.
      ?person rdf:type yago:Billionaire110529684. ?person dct:description ?description.
      FILTER regex(?name, "` + response.context.name + `", "i" ) .}} `;
				spar.client()
				.query(query)
				.asJson()
				.then(function(r) {
					if (r.results.bindings.length != 0) {
						console.log(response.context.name + " is a " + r.results.bindings[0].description.value + ".");
					} else {
						console.log("Sorry can't find the Description of " + response.context.name + " in the data source. Please ask me something else!");

					}

				}) .catch(function(e) {
					console.log(e)
				});

	} else if (response.output.generic[0].text == "[spouse]") {
		var query = `PREFIX dbp: <http://dbpedia.org/resource/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX yago: <http://dbpedia.org/class/yago/>
    SELECT ?spouse where {{ ?person a foaf:Person . ?person foaf:name ?name.
      ?person rdf:type yago:President110467179. ?person dbo:spouse ?spousedetails.
      ?spousedetails foaf:name ?spouse. FILTER regex(?name, "` + response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Politician110450303.
      ?person dbo:spouse ?spousedetails. ?spousedetails foaf:name ?spouse.
      FILTER regex(?name, "` + response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Billionaire110529684.
      ?person dbo:spouse ?spousedetails. ?spousedetails foaf:name ?spouse.
      FILTER regex(?name, "` + response.context.name + `", "i" ) .}} `;
				spar.client()
				.query(query)
				.asJson()
				.then(function(r) {
          if (r.results.bindings.length != 0) {
            console.log(response.context.name + " is married to " + r.results.bindings[0].spouse.value + ".");
          } else {
            console.log("Sorry can't find the marital status of " + response.context.name + " in the data source. Please ask me something else!");

          }

				}) .catch(function(e) {
					console.log(e)
				});

	} else if (response.output.generic[0].text == "[party]") {
		var query = `PREFIX dbp: <http://dbpedia.org/resource/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX yago: <http://dbpedia.org/class/yago/>
    SELECT ?party where {{ ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:President110467179.
      ?person dbo:party ?partydetails. ?partydetails foaf:name ?party. FILTER regex(?name, "` + response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Politician110450303.
      ?person dbo:party ?partydetails. ?partydetails foaf:name ?party. FILTER regex(?name, "` + response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Billionaire110529684.
      ?person dbo:party ?partydetails. ?partydetails foaf:name ?party. FILTER regex(?name, "`+ response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:President110467179.
      ?person dbp:party ?party. FILTER regex(?name, "`+ response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Billionaire110529684.
      ?person dbp:party ?party. FILTER regex(?name, "`+ response.context.name + `", "i" ) .}
      UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Politician110450303.
      ?person dbp:party ?party. FILTER regex(?name, "`+ response.context.name + `", "i" ) .}} `;
				spar.client()
				.query(query)
        .asJson()
				.then(function(r) {
					if (r.results.bindings.length != 0) {
            console.log(response.context.name + " is a part of the " + r.results.bindings[0].party.value + ".");
					} else {
						console.log("Sorry can't find the party details of " + response.context.name + " in the data source. Please ask me something else!");

					}

				}) .catch(function(e) {
					console.log(e)
				});

	} else if (response.output.generic[0].text == "[networth]") {
    var query = `PREFIX dbp: <http://dbpedia.org/resource/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX yago: <http://dbpedia.org/class/yago/>
    SELECT ?networth where {{ ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:President110467179.
    ?person dbo:networth ?networth.
    FILTER regex(?name, "` + response.context.name + `", "i" ) .}
    UNION { ?person a foaf:Person . ?person foaf:name ?name.
    ?person rdf:type yago:Politician110450303. ?person dbo:networth ?networth.
    FILTER regex(?name, "` + response.context.name + `", "i" ) .}
    UNION { ?person a foaf:Person . ?person foaf:name ?name.
    ?person rdf:type yago:Billionaire110529684. ?person dbo:networth ?networth.
    FILTER regex(?name, "` + response.context.name + `", "i" ) .}}  `;
    spar.client()
    .query(query)
    .asJson()
    .then(function(r) {
      if (r.results.bindings.length != 0) {
        console.log(response.context.name + "'s Net Worth is " + r.results.bindings[0].networth.value + ".");
      } else {
        console.log("Sorry! I can't find the Net Worth of " + response.context.name + " in the data source. Please ask me something else!?");

      }

    }) .catch(function(e) {
      console.log(e)
    });

} else if (response.output.generic[0].text == "[education]") {
    var query = `PREFIX dbp: <http://dbpedia.org/resource/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX yago: <http://dbpedia.org/class/yago/>
    SELECT ?education where {{ ?person a foaf:Person . ?person foaf:name ?name.
    ?person rdf:type yago:President110467179. ?person dbo:almaMater ?edu.
    ?edu foaf:name  ?education. FILTER regex(?name, "` + response.context.name + `", "i" ) .}
    UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Politician110450303.
    ?person dbo:almaMater ?edu. ?edu foaf:name ?education.
    FILTER regex(?name, "` + response.context.name + `", "i" ) .}
    UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Billionaire110529684.
    ?person dbo:almaMater ?edu. ?edu foaf:name  ?education.
    FILTER regex(?name, "` + response.context.name + `", "i" ) .}} `;
      spar.client()
      .query(query)
      .asJson()
      .then(function(r) {
        if (r.results.bindings.length != 0) {
          console.log(response.context.name + " graduated from " + r.results.bindings[0].education.value + ".");
        } else {
          console.log("Sorry! I can't find the graduation details of " + response.context.name + " in the data source. Please ask me something else!");

        }

      }) .catch(function(e) {
        console.log(e)
      });

} else if (response.output.generic[0].text == "[child]") {
  var query = `PREFIX dbp: <http://dbpedia.org/resource/> PREFIX foaf: <http://xmlns.com/foaf/0.1/> PREFIX yago: <http://dbpedia.org/class/yago/>
  SELECT ?child where {{ ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:President110467179.
    ?person dbo:child ?children. ?children foaf:name ?child. FILTER regex(?name, "` + response.context.name + `", "i" ) .}
    UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Politician110450303.
    ?person dbo:child ?children. ?children foaf:name ?child. FILTER regex(?name, "` + response.context.name + `", "i" ) .}
    UNION { ?person a foaf:Person . ?person foaf:name ?name. ?person rdf:type yago:Billionaire110529684.
    ?person dbo:child ?children. ?children foaf:name ?child. FILTER regex(?name, "`+ response.context.name + `", "i" ) .}} `;
      spar.client()
      .query(query)
      .asJson()
      .then(function(r) {
        if (r.results.bindings.length != 0) {
          if (r.results.bindings.length > 1){
            var i;
            console.log(response.context.name + "'s children are: ");
              for (i = 0; i < r.results.bindings.length; i++) {
                console.log(r.results.bindings[i].child.value);
                }
              } else {
                console.log(response.context.name + "'s child's name is " + r.results.bindings[0].child.value + ".");
        }
        } else {
          console.log("Sorry can't the name of " + response.context.name + "'s children in the data source. Please ask her something else!");

        }

      }) .catch(function(e) {
        console.log(e)
      });

} else {
    	// This prints the message we get back from SPARQL */
			console.log(response.output.generic[0].text);
    }
  }

  // If we're not done, prompt for the next round of input.
  if (!endConversation) {
    var newMessageFromUser = prompt('>> ');
    service.message({
      workspace_id: workspace_id,
      input: { text: newMessageFromUser },
      // Send back the context to maintain state.
      context : response.context,
    }, processResponse)
  }
}
}
