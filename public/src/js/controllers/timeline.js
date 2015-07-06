angular.module('meanExampleApp').controller('TimelineCtrl', 
  function (currentUserFactory, userProfileFactory, $stateParams, $scope, Restangular, tweetsFactory) {

    //todo:
    //handle no followers
    //handle no tweets from existing user
    //improve error handling

    if(currentUserFactory.isAuth) {
      $scope.loggedInUser = currentUserFactory.username;
    }

    var apiRoute = {
      tweets   : 'api/tweets/',
      profiles : 'api/profiles/'
    }

    function getTweets() {

      userProfileFactory.user(currentUserFactory.username).getList().then(function (currentUser) {

        //get user's following usernames, push to array
        var userFollowing = [];

        angular.forEach(currentUser[0].following, function (user) {
          userFollowing.push(user.username);
        });

        //push current username so they appear in timeline too 
        //it doesn't matter if this user hasn't tweeted yet.
        userFollowing.push(currentUserFactory.username);

        //create object for restangular
        var currentUserFollowing = {
          userFollowing
        };

        //query the api - get only these users's tweets
        tweetsFactory.timeline(currentUserFollowing).then(function (tweets) {
          console.info('got timeline tweets')
          $scope.tweets = tweets;

          //for each tweet, check to see if any of the username fields (in favourites array)
          //equal $scope.loggedInUser.
          //if a match is found in one tweet,
          //add an extra field to the tweet: alreadyFavourited
          angular.forEach(tweets, function (tweet) {

            angular.forEach(tweet.favourites, function (favourites) {

              if(favourites.username === $scope.loggedInUser) {
                tweet.alreadyFavourited = true;
                tweet.usersFavId = favourites._id;
              }

            });

          });

        });

      });

    };

    getTweets();

    $scope.postTweet = function(tweet){
      if(currentUserFactory.isAuth) {
        var newTweet = {
          username: currentUserFactory.username,
          copy: tweet.copy,
          image:{
            url:((tweet.image) ? tweet.image.url : '')
          }
        };

        tweetsFactory.tweets.post(newTweet).then(function(){
          console.info('posted a tweet', newTweet);
          $scope.tweet = '';
          getTweets();
        });
      }
      else {
        console.error('unable to post tweet - user is not authenticated');
      }
    };

    $scope.favouriteTweet = function(tweetId) {
      if(currentUserFactory.isAuth) {

        var urls = {
          usernameTweetFavs  : apiRoute.tweets + tweetId + '/favourites',
          tweetIdProfileFavs : apiRoute.profiles + currentUserFactory.username + '/tweets/favourites/' + tweetId
        }

        var newFavourite = {
          username: $scope.loggedInUser
        }

        //PUT the newFavourite username into the tweet's favourite array
        Restangular.all(urls.usernameTweetFavs).customPUT(newFavourite).then(function () {
          console.log('posted new favourite to: ' + urls.usernameTweetFavs);
        });

        //PUT tweet id in loggedInUser's profile favourites object
        Restangular.all(urls.tweetIdProfileFavs).customPUT(newFavourite).then(function () {
          console.log('posted new favourite tweet id to: ' + 'api/profiles/' + $scope.loggedInUser + '/tweets/favourites/' + tweetId);
        });

      }
    };

    $scope.unFavouriteTweet = function(tweetId, favouriteId) {
      if(currentUserFactory.isAuth) {

        var urls = {
          usernameTweetFavId : apiRoute.tweets + tweetId + '/favourites/' + favouriteId,
          tweetIdProfileFav  : apiRoute.profiles + currentUserFactory.username + '/tweets/favourites/' + tweetId
        }

        //REMOVE the username's fav ID from the tweet's favourite array
        Restangular.all(urls.usernameTweetFavId).remove().then(function () {
          console.log('removed user from favourites: ' + urls.usernameTweetFavId);
        });

        //REMOVE the tweet ID from the user's profile favourites array
        Restangular.all(urls.tweetIdProfileFav).remove().then(function () {
          console.log('removed tweet from the users profile favourites: ' + 'api/profiles/' + $scope.loggedInUser + '/tweets/favourites/' + tweetId);
        });

      }
    };



});