var data;
var user;

var spotifyApp = angular.module("spotifyApp", ['spotify']);

spotifyApp.config(function (SpotifyProvider) {
  SpotifyProvider.setClientId('3c3ac8bf947448cda2e3a000f9f756b7');
  SpotifyProvider.setRedirectUri('http://students.washington.edu/shl7/info343/spotify-challenge/callback.html');
  SpotifyProvider.setScope('user-read-private playlist-read-private user-library-read');
  SpotifyProvider.setAuthToken(localStorage.getItem("spotify-token"));
});

spotifyApp.controller('spotifyCtrl', function (Spotify, $scope, $http) {

	// check if someone is logged in
	Spotify.getCurrentUser().then(function (data) {
	  console.log(data);
	  user = data;
	  $("header").append($("<p>").text("Welcome, " + data.id + "!"));
	}, function () {
		console.log("not logged in");
		$("#inbtn").css("display", "inline");
	});

    $scope.audioObject = {}

    var accessToken = localStorage.getItem("spotify-token");

    var featured = "https://api.spotify.com/v1/browse/featured-playlists";
    var songName = "";
    var artist = "";
    var album = "";

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
			$scope.track = response.items[random].track;
			songName = $scope.song = response.items[random].track.name;
			artist = $scope.artist = response.items[random].track.artists[0].name;
			album = $scope.album = response.items[random].track.album.name;
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

   	// checks if user got name of the song correct
   	$scope.songCheck = function() {
   		if (songName.toLowerCase() == $scope.songGuess.toLowerCase()) {
   			$("#titleAns").append($("<i class='fa fa-check correct'>"));
   		} else {
   			$("#titleAns").append($("<i class='fa fa-times error'>"));
   		}
   	}

   	// checks if user got name of the artist correct
   	$scope.artistCheck = function() {
   		if (artist.toLowerCase() == $scope.artistGuess.toLowerCase()) {
   			$("#artistAns").append($("<i class='fa fa-check correct'>"));
   		} else {
   			$("#artistAns").append($("<i class='fa fa-times error'>"));
   		}
   	}

   	// checks if user got name of the album correct
   	$scope.albumCheck = function() {
   		if (album.toLowerCase() == $scope.albumGuess.toLowerCase()) {
   			$("#albumAns").append($("<i class='fa fa-check correct'>"));
   		} else {
   			$("#albumAns").append($("<i class='fa fa-times error'>"));
   		}
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
		// $("#inbtn").css("display", "none");
	};
});

// generates random number between 0 and max - 1
var randomNumber = function(max) {
	return Math.floor((Math.random() * parseInt(max)));
}