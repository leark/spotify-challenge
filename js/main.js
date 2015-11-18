var data;
var user;

var spotifyApp = angular.module("spotifyApp", ['spotify', 'firebase']);

spotifyApp.config(function (SpotifyProvider) {
  SpotifyProvider.setClientId('3c3ac8bf947448cda2e3a000f9f756b7');
  SpotifyProvider.setRedirectUri('http://localhost:8080/callback.html');
  SpotifyProvider.setScope('user-read-private playlist-read-private user-library-read');
  SpotifyProvider.setAuthToken(localStorage.getItem("spotify-token"));
});

spotifyApp.controller('spotifyCtrl', function (Spotify, $scope, $http, $firebaseAuth, $firebaseArray, $firebaseObject) {

	// check if someone is logged in
	Spotify.getCurrentUser().then(function (data) {
	  console.log(data);
	  user = data;
	  $("header").append($("<p>").text("Welcome, " + data.id + "!"));
	}, function () {
		console.log("not logged in");
		$("#inbtn").css("display", "inline");
	});

  var ref = new Firebase("https://twitter-demo-youta.firebaseio.com/");

  $scope.users = $firebaseObject(users);
  $scope.authObj = $firebaseAuth(ref);

  $scope.audioObject = {}

  var accessToken = localStorage.getItem("spotify-token");
  var featured = "https://api.spotify.com/v1/browse/featured-playlists";

  // grab featured playlist
  $scope.featuredPlaylist = function() {
		$http({
			method: 'GET',
			url: featured,
			headers: {
				'Authorization': 'Bearer ' + accessToken
		}})
		.success(function (response) {
			var random = randomNumber(response.playlists.items.length);
			console.log("first random: " + random);
    		$scope.playlistName = "(From the playlist " + response.playlists.items[random].name + ")";
    		getTracks(response.playlists.items[random].id, response.playlists.items[random].owner.id);
		});
 	}

  // if logged in, can access user's playlist
  $scope.userPlaylist = function() {
    Spotify.getUserPlaylists(user.id).then(function (data) {
      var random = randomNumber(data.items.length);
      console.log("first random: " + random);
        $scope.playlistName = "(From the playlist " + data.items[random].name + ")";
        getTracks(data.items[random].id, data.items[random].owner.id);
    });
  }

 	// get track info from playlistID and ownerID and put them in the page
 	var getTracks = function(playlistID, ownerID) {
		var trackURL = "https://api.spotify.com/v1/users/" + ownerID + "/playlists/" + playlistID + "/tracks";
		$http({
			method: 'GET',
			url: trackURL,
			headers: {
				'Authorization': 'Bearer '+ accessToken
		}}).success(function (response) {
			var random = randomNumber(response.items.length);
			console.log("second random: " + random);
			console.log(response.items[random]);

			var datum = $scope.track = response.items[random].track;
      var songName = datum.name;
      var artist = datum.artists[0].name;
      var album  = datum.album.name;

      var answers = [songName, artist, album];

      createTracks(datum.artists[0].id, datum.album.id, answers);
		});
 	}

  var createTracks = function(artistID, albumID, answers) {
    Spotify.getAlbumTracks(albumID).then(function (data) {
      // console.log("Album tracks")
      // console.log(data);
      var titles = createQuestions(3, data.items, answers[0]);;
      var options = [];
      $.each(titles, function(i, element) {
        options.push({title: element.name, titleTrue: element.true});
      })
      createArtistis(artistID, answers, options);       
    });
  }

  var createArtistis = function(artistID, answers, options) {
    Spotify.getRelatedArtists(artistID).then(function (data) {
      // console.log("Related Artists")
      // console.log(data);
      var artists = createQuestions(3, data.artists, answers[1]);;
      $.each(artists, function(i, element) {
        options[i].artist = element.name;
        options[i].artistTrue = element.true;
      })
      createAlbums(artistID, answers, options);
    });
  }

  var createAlbums = function(artistID, answers, options) {
    Spotify.getArtistAlbums(artistID).then(function (data) {
      // console.log("Albums from Artist");
      // console.log(data);
      $scope.albums = ""; 
      var albums = createQuestions(3, data.items, answers[2]);
      $.each(albums, function(i, element) {
        options[i].album = element.name;
        options[i].albumTrue = element.true;
      })
      $scope.options = options;
      console.log(options);
    });
  }

  var gotTitle = false;
  var gotArtist = false;
  var gotAlbum = false;

  // title, artist, album
  var gotAns = [false, false, false];
  var numWrong = [0, 0, 0];

 	// checks if user got name of the song correct
 	$scope.chckAns = function(truth, name, type) {
    if (type === "title" && !gotTitle) {
      $scope.clickedT = name;
    } else if (type === "artist" && !gotArtist) {
      $scope.clickedA = name;
    } else if (!gotAlbum) {
      $scope.clickedAl = name;
    }
    if (truth) {
      alert("you are correct");
      if (type === "title") {
        gotTitle = true;
      } else if (type === "artist") {
        gotArtist = true;
      } else {
        gotAlbum = true;
      }
    } else {
      if (type === "title") {
        numWrong[0]++;
      } else if (type === "artist") {
        numWrong[1]++;
      } else {
        numWrong[2]++;
      }
    }
 	}

  $scope.setActive = function(option) {
    return $scope.selected === option;
  }

 	// manages playing the song
  $scope.play = function(song) {
    if($scope.currentSong == song) {
      $scope.audioObject.pause()
      $scope.currentSong = false
      return
    }
    else {
      if($scope.audioObject.pause != undefined) $scope.audioObject.pause()
      $scope.audioObject = new Audio(song);
      $scope.audioObject.play()  
      $scope.currentSong = song
    }
  }

    // logs user in
	$scope.login = function() {
		Spotify.login().then(function(data){
			console.log(data);
			console.log("you are now logged in");
			location.reload();
		}, function() {
			console.log(data);
			console.log("didn\'t log in");
			location.reload();
		});
	};
});

// generates random number between 0 and max - 1
var randomNumber = function(max) {
	return Math.floor((Math.random() * parseInt(max)));
}

var createQuestions = function(numQs, data, answer) {
  var randoms = [];
  for (var i = 0; i < 3; i++) {
    var rand = randomNumber(data.length);
    var randName = data[rand].name;
    while ($.inArray(rand, randoms) != -1 || randName === answer || checkName(data, randoms, randName)) {
      rand = randomNumber(data.length);
      randName = data[rand].name;
    }
    randoms.push(rand);
  }
  var answerNum = randomNumber(numQs - 1);
  console.log("random numbers: " + randoms + " answer: " + answerNum);
  console.log("answer: " + answer);

  var questions = [];
  $.each(randoms, function(i, element) {
    questions.push({name: data[element].name, true: false});
    if (i == answerNum) {
      questions.push({name: answer, true: true});            
    }
  })
  return questions;
}

var checkName = function(data, randoms, name) {
  for (var i = 0; i < randoms.length; i++) {
    if (data[randoms[i]].name === name) {
      return true;
    }
  }
  return false;
}