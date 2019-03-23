require("dotenv").config();
let axios = require("axios");
let moment = require("moment");
moment().format();
let fs = require("fs");
let Spotify = require("node-spotify-api");
let keys = require("./keys.js");
let spotify = new Spotify(keys.spotify);
let eventDate, displayData;

//-----------------------------INPUT FROM THE CONSOLE----------------------------
let command = process.argv[2];
let titleArr = [];
let title = "";
let titleForOutput = "";

for (let i = 3; i < process.argv.length; i++) {
  titleArr.push(process.argv[i]);
}

title = titleArr.join("+");
titleForOutput = titleArr.join(" ");

//----------------------------------CONCERT-THIS----------------------------------------
let concertThis = artist => {
  console.log("Looking up " + titleForOutput + " event");
  let concertURL =
    "https://rest.bandsintown.com/artists/" +
    artist +
    "/events?app_id=" +
    keys.bands.key;
  axios
    .get(concertURL)
    .then(response => {
      response.data.forEach(event => {
        eventDate = moment(event.datetime, "YYYY-MM-DDTh:mm:ss").format(
          "MM/DD/YYYY"
        );
        displayData =
          "\n----------------------\nName of the event: " +
          event.venue.name +
          "\nLocation: " +
          event.venue.city +
          ", " +
          event.venue.country +
          "\nDate: " +
          eventDate;
        console.log(displayData);

        fs.appendFile("log.txt", displayData, function(err) {
          if (err) throw err;
        });
      });
    })
    .catch(function() {
      console.log("Promise Rejected");
    });
};

//----------------------------------SPOTIFY-THIS-SONG----------------------------------------
let spotifyThisSong = song => {
  console.log("Looking up your " + titleForOutput + " song....");
  spotify.search({ type: "track", query: song }, function(err, data) {
    if (err) {
      return console.log("Error occurred: " + err);
    }
    let songData = data.tracks.items[0];
    displayData =
      "\n------------------------\nArtist: " +
      songData.artists[0].name +
      "\nSong name: " +
      songData.name +
      "\nLink: " +
      songData.external_urls.spotify +
      "\nAlbum: " +
      songData.album.name;
    console.log(displayData);
    fs.appendFile("log.txt", displayData, function(err) {
      if (err) throw err;
    });
  });
};

//----------------------------------MOVIE-THIS----------------------------------------
let movieThis = title => {
  console.log("Looking up the movie " + titleForOutput);
  let queryUrl =
    "http://www.omdbapi.com/?t=" +
    title +
    "&y=&plot=short&apikey=" +
    keys.omdb.key;

  axios.get(queryUrl).then(response => {
    displayData =
      "\n------------------------\n" +
      response.data.Title +
      "\nRelease year: " +
      response.data.Year +
      "\nIMDM rating: " +
      response.data.imdbRating +
      "\n" +
      response.data.Ratings[1].Source +
      " rating: " +
      response.data.Ratings[1].Value +
      "\nMovies was produces in " +
      response.data.Country +
      "\nOriginal Language of the Movie: " +
      response.data.Language +
      "\nPlot of the movie: " +
      response.data.Plot +
      "\nActors: " +
      response.data.Actors;
    console.log(displayData);
    fs.appendFile("log.txt", displayData, function(err) {
      if (err) throw err;
    });
  });
};

//----------------------------------DO-WHAT-IT-SYAS----------------------------------------
let doWhatItSays = () => {
  console.log("Doing what it says ");
  fs.readFile("./random.txt", "utf8", (error, data) => {
    if (error) {
      return console.log("Error in reading file!\n", error);
    }
    let splitData = data.split(",");
    console.log(splitData);
    let randomCommand = generateEventRandom(splitData.length - 1);

    let commandName = splitData[randomCommand];
    title = splitData[randomCommand + 1];
    console.log("Command", commandName, "Title " + title);
    executeLiri(commandName);
  });
};

//----------------------------------CHECK THE COMMAND AND LAUNCH THE PROGRAM----------------------------------------
let executeLiri = command => {
  switch (command) {
    case "concert-this":
      concertThis(title);
      break;
    case "spotify-this-song":
      spotifyThisSong(title);
      break;
    case "movie-this":
      movieThis(title);
      break;
    case "do-what-it-says":
      doWhatItSays(title);
      break;
    default:
      console.log(" Oops.. Looks like you entered something wrong!");
  }
};

executeLiri(command);

//------------------GENERATE EVENT NUMBER FOR READING COMMAND FROM RANDOM.TXT FILE--------------------------
let generateEventRandom = number => {
  return Math.floor((Math.random() * number) / 2) * 2;
};

//----------------------------------READ & WRITE TO THE FILE----------------------------------------

fs.readFile("./log.txt", "utf8", (err, data) => {
  if (err) {
    return console.log("Error in reading file!\n", err);
  }
});
