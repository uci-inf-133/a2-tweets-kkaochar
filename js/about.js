function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	const options = {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
	};

	tweet_array.sort((a, b) => a.time - b.time);

	document.getElementById("firstDate").innerText = tweet_array[0].time.toLocaleDateString("en-US", options);
	document.getElementById("lastDate").innerText = tweet_array[tweet_array.length - 1].time.toLocaleDateString("en-US", options);

	const countBySource = (type) => tweet_array.reduce((total, t) => t.source === type ? total + 1 : total, 0);
	const pctBySource = (num) => math.format(num/tweet_array.length * 100, {notation: 'fixed', precision: 2}) + "%";
	const completedCount = countBySource("completed_event");
	const liveCount = countBySource("live_event");
	const achievementCount = countBySource("achievement");
	const miscCount = countBySource("miscellaneous");

	document.querySelector('.completedEvents').innerText = completedCount;
	document.querySelector('.completedEventsPct').innerText = pctBySource(completedCount);
	document.querySelector('.liveEvents').innerText = liveCount;
	document.querySelector('.liveEventsPct').innerText = pctBySource(liveCount);
	document.querySelector('.achievements').innerText = achievementCount;
	document.querySelector('.achievementsPct').innerText = pctBySource(achievementCount);
	document.querySelector('.miscellaneous').innerText = miscCount;
	document.querySelector('.miscellaneousPct').innerText = pctBySource(miscCount);

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});