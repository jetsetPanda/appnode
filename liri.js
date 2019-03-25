require("dotenv").config();
var fs = require("fs");
var keys = require("./keys.js");
var axios = require('axios');
var request = require('request');
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

var usrCmd = process.argv[2];
var searchTerm = process.argv.slice(3).join(" ");
var fancyline = "_______________________________________________________________\n";
// func w/ switch statement based on usrCmd (user input) and passes searchTerm as function parameter
function runProgram() {

  switch (usrCmd) {
    case 'concert-this':
      searchBIT(searchTerm);                   
      break;                          
    case 'spotify-this-song':
      searchSpotify(searchTerm);
      break;
    case 'movie-this':
      searchOMDB(searchTerm);
      break;
    case 'do-what-it-says':
      randomFunc();
      break;
    default:
    console.log(fancyline);                            
    console.log("LIRI >>> ERROR: Invalid command.\n\nLIRI >>> Available commands include:\n'concert-this', 'spotify-this-song', 'movie-this', and 'do-what-it-says'");
    break;
  }
};

//this function will concurrently/conveniently console.log and write to log.txt the string output.. hoozah!
function writeCL(stringData) {
	console.log(stringData);
	fs.appendFile('log.txt', stringData + '\n', function(err) {
	    if (err) throw err;	
	});
}
//Bands in Town API search
function searchBIT(searchTerm){

var bandName = searchTerm;
var queryURL = "https://rest.bandsintown.com/artists/"+bandName+"/events?app_id=codingbootcamp";

axios.get(queryURL).then(function(response) {

    writeCL(`LIRI >>> Here are events related to "${searchTerm}":`); 
    var bandObject = response.data;
    // below: iterate thru results from dataResponse obj
    for (var x=0; x < bandObject.length; x++) {
        // bandObject[x].datetime is in yyyy-mm-dd"T"HH:MM:SS format
        // so "manually" convert to MM/DD/YYYY below:
        var objDate = bandObject[x].datetime;
        var eventMonth = objDate.substring(5,7);
        var eventDay = objDate.substring(8,10);
        var eventYear = objDate.substring(0,4);
        // combine above to var eventDate to display as desired:
        var eventDate = `${eventMonth}/${eventDay}/${eventYear}`;
        //using my fancy handy writeCL func to log and fs write the results:
        writeCL(fancyline);
        // writeCL(`Event Name: ${bandObject[x].description}`); //testing a lil ES6 ;)
        writeCL("Event Venue: " + bandObject[x].venue.name);
        writeCL("Venue Location: " + bandObject[x].venue.city +", "+ bandObject[x].venue.country);
        writeCL("Event Date: " + eventDate);
        writeCL("Event URL: " + bandObject[x].url);

    }
    console.log("\n" + fancyline);
    console.log("LIRI >>> There are no additional results, thanks for using my services. You may enter a new search query.");

});

}
function searchSpotify(searchTerm) {
  // search: function({ type: 'artist OR album OR track', query: 'My search query', limit: 20 }, callback);

  var songName;
  if (searchTerm === "") {
    songName = "Ace of Base The Sign";
  } else {
    songName = searchTerm;
  }

  spotify.search({ type: 'track', query: songName}, function(error, data) {

    if (error) {
      writeCL('LIRI >>> an error occured: ' + error);
      return;
    } else {
      console.log(fancyline);
      writeCL(`LIRI >>> Here are Spotify results related to song query "${searchTerm}":`);
      writeCL(fancyline);
      writeCL("Artist: " + data.tracks.items[0].artists[0].name);
      writeCL("Song Title: " + data.tracks.items[0].name);
      writeCL("Album: " + data.tracks.items[0].album.name);
      writeCL("Spotify Preview Link: " + data.tracks.items[3].preview_url);
      writeCL(fancyline);  
    }
    console.log("LIRI >>> There are no additional results, thanks for using my services. You may enter a new search query.");
  });
};

function searchOMDB(searchTerm) {


  var movieName;
  if (searchTerm === "") {
    movieName = "Mr. Nobody";
  } else {
    movieName = searchTerm;
  };

  var queryURL = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

  axios.get(queryURL).then(function(response) {

    writeCL(`\n${fancyline}\nLIRI >>> Here are OMDB results related to "${searchTerm}":`);
    var movieObject = response.data;
    writeCL(fancyline);
    writeCL("Title: " + movieObject.Title);
    writeCL("Release Year: " + movieObject.Year);
    writeCL("IMDB Rating: " + movieObject.imdbRating);
    writeCL("Rotten Tomatoes Rating: " + movieObject.Ratings[1].Value); 
    writeCL("Country: " + movieObject.Country);
    writeCL("Language: " + movieObject.Language);
    writeCL("Plot: " + movieObject.Plot);
    writeCL("Actors: " + movieObject.Actors);
    console.log("\n" + fancyline);
    console.log("LIRI >>> There are no additional results, thanks for using my services. You may enter a new search query.");      
  });

};

function randomFunc() {
fs.readFile('random.txt', "utf8", function(error, data){

    if (error) {
        return writeCL('LIRI >>> an error occured: ' + error);
      }

    var cmdStr = data.split(",");
    
    if (cmdStr[0] === "spotify-this-song") 
    {
      var songcheck = cmdStr[1].trim().slice(1, -1);
      searchSpotify(songcheck);
    } 
    else if (cmdStr[0] === "concert-this") 
    { 
      if (cmdStr[1].charAt(1) === "'")
      {
      	var strLength = cmdStr[1].length - 1;
      	var concertStr = cmdStr[1].substring(2,strLength);
      	console.log(concertStr);
      	searchBIT(concertStr);
      }
      else
      {
	      var bandName = cmdStr[1].trim();
	      console.log(bandName);
	      searchBIT(bandName);
	  }
  	  
    } 
    else if(cmdStr[0] === "movie-this") 
    {
      var movie_name = cmdStr[1].trim().slice(1, -1);
      searchOMDB(movie_name);
    } 
    
    });

};

runProgram();