var data;

var baseUrl = 'https://api.spotify.com/v1/search?type=track&query=';

var spotifyApp = angular.module("spotifyApp", ['spotify']);

spotifyApp.config(function (SpotifyProvider) {
  SpotifyProvider.setClientId('3c3ac8bf947448cda2e3a000f9f756b7');
  SpotifyProvider.setRedirectUri('http://localhost:8080/callback');
  SpotifyProvider.setScope('user-read-private playlist-read-private user-library-read');
  // // If you already have an auth token
  // SpotifyProvider.setAuthToken('BQCa1C32O8PG6yB-bvBEG2VrhVqEL1KNhU3k0Zd1y3qIIPU2pBMGqh5jDS8kQ4ICaF6BvcNTDMUsRqSiXx7C5sIuFLNw3kdHfd4aemYGU6w084RXFRyT62mDS1bTgPL370mjZ9TCJPYzzp6EDNfC5ertmKTbM5UVSMN36ZYtvMakqWowU9c');
});

spotifyApp.controller('spotifyCtrl', function(Spotify, $scope, $http) {

    $scope.audioObject = {}

    // $scope.getSongs = function() {
    // 	$http.get(baseUrl + $scope.searchTrack).success(function(response){
    // 		data = $scope.tracks = response.tracks.items;
    //     	$scope.track = data[0];

    // 	})
    // }

    var accessToken = "BQBM39LFWLfeXuxoByc8g4LXqz2_BMQnWHfbyF6MYUNrYM_fu1wo7W7avTTUrP8saZddY8DbRLIARfYEhlm9Kv4KlG56sZqvefQl_Qj2p9vCG61MCGpiYnUAlMJiunY2GA40aSCaeRDjapqWXeEPQfwhPfMs60zZ8Y-sia9OFMakXoETp0Y";

    var featured = "https://api.spotify.com/v1/browse/featured-playlists";
    var playlistID = "";
    var ownerID = "";
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
		.success(function(response) {
	    		$scope.playlistName = "(From the playlist " + response.playlists.items[0].name + ")";
	    		getTracks(response.playlists.items[0].id, response.playlists.items[0].owner.id);
		});
		
   	}

   	var getTracks = function(playlistID, ownerID) {
		var trackURL = "https://api.spotify.com/v1/users/" + ownerID + "/playlists/" + playlistID + "/tracks";
		$http({
			method: 'GET',
			url: trackURL,
			headers: {
				'Authorization': 'Bearer '+ accessToken
		}}).success(function(response) {
			console.log(response);
			$scope.track = response.items[0].track;
			songName = respnose.items[0].track.name;
			artist = response.items[0].artists.name;
			album = response.items[0].album.name;
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
			alert("you are now logged in");
		}, function() {
			console.log(data);
			console.log("didn\'t log in");
		});
		$("#username").val("");
		$("#password").val("");
		$("#inbtn").css("display", "none");
		$("#outbtn").css("display", "inline");
	};

	$scope.logOut = function() {
		Spotify.login();
		$("#inbtn").css("display", "inline");
		$("#outbtn").css("display", "none");
	}



	// Spotify.getNewReleases().then(function (data) {
	// 	console.log(data);
	// })

	// // if logged in
	// Spotify.getUserPlaylists('user_id').then(function (data) {
	// 	console.log(data);
	// });

	// Spotify.getPlaylistTracks('user_id', 'playlist_id').then(function (data) {
	// 	console.log(data);
	// })

	// Spotify.getCurrentUser().then(function (data) {
	//   console.log(data);
	// });
})

