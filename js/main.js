var data;
var user;

var spotifyApp = angular.module("spotifyApp", ['spotify']);

spotifyApp.config(function (SpotifyProvider) {
  SpotifyProvider.setClientId('3c3ac8bf947448cda2e3a000f9f756b7');
  SpotifyProvider.setRedirectUri('http://students.washington.edu/shl7/info343/spotify-challenge/callback.html');
  SpotifyProvider.setScope('user-read-private playlist-read-private user-library-read');
  // If you already have an auth token
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
	
	// if logged in
   	$scope.userPlaylist = function() {
	
		Spotify.getUserPlaylists(user.id).then(function (data) {
			var random = randomNumber(data.items.length);
			console.log("first random: " + random);
    		$scope.playlistName = "(From the playlist " + data.items[random].name + ")";
    		getTracks(data.items[random].id, data.items[random].owner.id);
		});
   	}


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

	$scope.login = function() {
		Spotify.login().then(function(data){
			console.log(data);
			console.log("you are now logged in");
		}, function() {
			console.log(data);
			console.log("didn\'t log in");
		});
		$("#inbtn").css("display", "none");
	};

	// Spotify.getNewReleases().then(function (data) {
	// 	console.log(data);
	// })



	// Spotify.getPlaylistTracks('user_id', 'playlist_id').then(function (data) {
	// 	console.log(data);
	// })

});

var randomNumber = function(max) {
	return Math.floor((Math.random() * parseInt(max)));
}