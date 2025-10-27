function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	let activityCounts = {};
	for (const tweet of tweet_array) {
		const activType = tweet.activityType;
		if (activType !== "unknown") {
			activityCounts[activType] = (activityCounts[activType] || 0) + 1;
		}
	}

	const sortedActivities = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);
	const firstMost = sortedActivities[0][0];
	const secondMost = sortedActivities[1][0];
	const thirdMost = sortedActivities[2][0];

	let actDist = {};
	for (const tweet of tweet_array) {
		const activType = tweet.activityType;
		if (activType === firstMost || activType === secondMost || activType === thirdMost) {
			actDist[activType] = (actDist[activType] || 0) + tweet.distance;
		}
	}
	const sortedDis = Object.entries(actDist).sort((a, b) => b[1] - a[1]);
	const longestActivityType = sortedDis[0][0];
	const shortestActivityType = sortedDis[2][0];

	let longestActivityDayType = {};
	for (const tweet of tweet_array) {
		const activType = tweet.activityType;
		if (activType === longestActivityType) {
			const dayOfWeek = tweet.time.getDay();
			if (dayOfWeek == 0 || dayOfWeek == 6)
				longestActivityDayType["weekends"] = (longestActivityDayType["weekends"] || 0) + 1;
			else 
				longestActivityDayType["weekdays"] = (longestActivityDayType["weekdays"] || 0) + 1;
		}
	}
	const sortedDayType = Object.entries(longestActivityDayType).sort((a, b) => b[1] - a[1]);
	const weekdayOrWeekendLonger = sortedDayType[0][0];

	
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    // "values": tweet_array
		"values": Object.entries(activityCounts).map(([activity, count]) => ({activity, count}))
		},
		//TODO: Add mark and encoding
		"mark": "bar", // Specifies a bar mark
		"encoding": {
			"x": {"field": "activity", "type": "nominal"},
    		"y": {"field": "count", "type": "quantitative"}
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	document.getElementById("numberActivities").innerText = Object.keys(activityCounts).length;
	document.getElementById("firstMost").innerText = firstMost;
	document.getElementById("secondMost").innerText = secondMost;
	document.getElementById("thirdMost").innerText = thirdMost;
	document.getElementById("longestActivityType").innerText = longestActivityType;
	document.getElementById("shortestActivityType").innerText = shortestActivityType;
	document.getElementById("weekdayOrWeekendLonger").innerText = weekdayOrWeekendLonger;
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});