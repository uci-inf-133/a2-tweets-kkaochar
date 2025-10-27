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

	let distByDayActivity = [];
	let actDist = {};
	const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	for (const tweet of tweet_array) {
		const activType = tweet.activityType;
		if (activType === firstMost || activType === secondMost || activType === thirdMost) {
			actDist[activType] = (actDist[activType] || 0) + tweet.distance;
			distByDayActivity.push({
				day: weekday[tweet.time.getDay()],
				activity: activType,
				distance: tweet.distance
			});
		}
	}

	const sortedDis = Object.entries(actDist).sort((a, b) => b[1] - a[1]);
	const longestActivityType = sortedDis[0][0];
	const shortestActivityType = sortedDis[2][0];
	
	let longestActivityDayType = {};
	for (const tweet of tweet_array) {
		const activType = tweet.activityType;
		if (activType === longestActivityType) {
			const dayNum = tweet.time.getDay();
			if (dayNum == 0 || dayNum == 6)
				longestActivityDayType["weekends"] = (longestActivityDayType["weekends"] || 0) + 1;
			else 
				longestActivityDayType["weekdays"] = (longestActivityDayType["weekdays"] || 0) + 1;
		}
	}
	longestActivityDayType["weekends"] /= 2;
	longestActivityDayType["weekdays"] /= 5;
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
		"mark": "bar",
		"encoding": {
			"x": {"field": "activity", "type": "nominal"},
    		"y": {"field": "count", "type": "quantitative"}
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the three most-tweeted activities by the day of the week.",
	  "data": {
		"values": distByDayActivity
		},
		//TODO: Add mark and encoding
		"mark": { "type": "circle", "filled": false, "strokeWidth": 2 },
		"encoding": {
			"x": { "field": "day", "type": "nominal", "sort": ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] },
    		"y": { "field": "distance", "type": "quantitative", "aggregate": "sum" },
    		"color": { "field": "activity", "type": "nominal", "sort": [firstMost, secondMost, thirdMost]}
		}
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	distance_vis_agg_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the three most-tweeted activities by the day of the week.",
	  "data": {
		"values": distByDayActivity
		},
		//TODO: Add mark and encoding
		"mark": { "type": "circle", "filled": false, "strokeWidth": 2 },
		"encoding": {
			"x": { "field": "day", "type": "nominal", "sort": ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"] },
    		"y": { "field": "distance", "type": "quantitative", "aggregate": "mean" },
    		"color": { "field": "activity", "type": "nominal", "sort": [firstMost, secondMost, thirdMost]}
		}
	};
	vegaEmbed('#distanceVisAggregated', distance_vis_agg_spec, {actions:false});
	
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	document.getElementById("numberActivities").innerText = Object.keys(activityCounts).length;
	document.getElementById("firstMost").innerText = firstMost;
	document.getElementById("secondMost").innerText = secondMost;
	document.getElementById("thirdMost").innerText = thirdMost;
	document.getElementById("longestActivityType").innerText = longestActivityType;
	document.getElementById("shortestActivityType").innerText = shortestActivityType;
	document.getElementById("weekdayOrWeekendLonger").innerText = weekdayOrWeekendLonger;

	const aggregateButton = document.getElementById("aggregate");
	const sumVis = document.getElementById("distanceVis");
	const meanVis = document.getElementById("distanceVisAggregated");
	meanVis.style.display = "none";
	sumVis.style.display = "block";
	aggregateButton.textContent = "Show means";

	aggregateButton.addEventListener("click", function () {
		if (sumVis.style.display !== "none") {
			sumVis.style.display = "none";
			meanVis.style.display = "block";
			aggregateButton.textContent = "Show all activities";
		} else {
			meanVis.style.display = "none";
			sumVis.style.display = "block";
			aggregateButton.textContent = "Show means";
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});