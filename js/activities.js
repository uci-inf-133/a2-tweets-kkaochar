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
	const weekdayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	
	// gather data from the tweets, type name, distance, day
	const activityData = tweet_array
        .filter(tweet => tweet.activityType !== "unknown")
        .map(tweet => ({
            day: weekdayNames[tweet.time.getDay()],
            activity: tweet.activityType,
            distance: tweet.distance
        }));
	
	// calculate stats of count and mean for each activity type
	const activityStats = {};
    for (const d of activityData) {
        if (!activityStats[d.activity]) activityStats[d.activity] = { count: 0, total_dist: 0 };
        activityStats[d.activity].count++;
        activityStats[d.activity].total_dist += d.distance;
    }
	const statsArray = Object.entries(activityStats).map(([activity, { count, total_dist }]) => ({
        activity, count, mean: total_dist/count
    }));

	// rank activities
	const topThreeActivities = statsArray.sort((a, b) => b.count - a.count).slice(0, 3);
	const firstMost = topThreeActivities[0].activity;
	const secondMost = topThreeActivities[1].activity;
	const thirdMost = topThreeActivities[2].activity;

	// filter out top three
	const distByDayActivity = activityData.filter(d => [firstMost, secondMost, thirdMost].includes(d.activity));

	// find longest and shortest activity
	const minMaxDistance = topThreeActivities.sort((a, b) => b.mean - a.mean).slice(0, 3);
	const longestActivityType = minMaxDistance[0].activity;
	const shortestActivityType = minMaxDistance[2].activity;

	// graph of each activity count
	activity_vis_spec = {
	  	"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  	"description": "A graph of the number of Tweets containing each type of activity.",
	  	"data": { "values": activityData },
	  	"mark": "bar",
	  	"encoding": {
			"x": {"field": "activity", "type": "nominal"},
    		"y": {"field": "activity", "type": "quantitative", "aggregate": "count"}
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	
	// Version before extra credit

	// distance_vis_spec = {
	//   	"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	// 	"description": "A graph of the distances of the three most-tweeted activities by the day of the week.",
	//  	"data": { "values": distByDayActivity },
	// 	"mark": { "type": "circle", "filled": false, "strokeWidth": 2 },
	// 	"encoding": {
	// 		"x": { "field": "day", "type": "nominal", "sort": weekdayNames },
    // 		"y": { "field": "distance", "type": "quantitative"},
    // 		"color": { "field": "activity", "type": "nominal"}
	// 	}
	// };
	// vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});

	// distance_vis_agg_spec = {
	//   	"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	//   	"description": "A graph of the mean distances of the three most-tweeted activities by the day of the week.",
	//   	"data": { "values": distByDayActivity },
	// 	"mark": { "type": "circle", "filled": false, "strokeWidth": 2 },
	// 	"encoding": {
	// 		"x": { "field": "day", "type": "nominal", "sort": weekdayNames},
    // 		"y": { "field": "distance", "type": "quantitative", "aggregate": "mean" },
    // 		"color": { "field": "activity", "type": "nominal"}
	// 	}
	// };
	// vegaEmbed('#distanceVisAggregated', distance_vis_agg_spec, {actions:false});

	// const aggregateButton = document.getElementById("aggregate");
	// const total_distVis = document.getElementById("distanceVis");
	// const meanVis = document.getElementById("distanceVisAggregated");
	// meanVis.style.display = "none";
	// total_distVis.style.display = "block";
	// aggregateButton.textContent = "Show means";

	// aggregateButton.addEventListener("click", function () {
	// 	if (total_distVis.style.display !== "none") {
	// 		total_distVis.style.display = "none";
	// 		meanVis.style.display = "block";
	// 		aggregateButton.textContent = "Show all activities";
	// 	} else {
	// 		meanVis.style.display = "none";
	// 		total_distVis.style.display = "block";
	// 		aggregateButton.textContent = "Show means";
	// 	}
	// });

	// Extra credit version of graph and button

	// Have to pre calculate aggregated info
	const aggregatedData = {};
    distByDayActivity.forEach(d => {
        const key = `${d.activity}-${d.day}`;
        if (!aggregatedData[key]) aggregatedData[key] = { day: d.day, activity: d.activity, total: 0, count: 0 };
        aggregatedData[key].total += d.distance;
        aggregatedData[key].count++;
    });
    
	const meanDistances = Object.values(aggregatedData).map(d => ({
        day: d.day, activity: d.activity, distance: d.total / d.count
    }));

    const distanceSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Distances of top three activities by day of week",
        "data": { "values": distByDayActivity },
        "mark": { "type": "circle", "filled": false, "strokeWidth": 2 },
        "encoding": {
            "x": { "field": "day", "type": "nominal", "sort": weekdayNames, "axis": { "title": "time (day)", "grid": true } },
            "y": { "field": "distance", "type": "quantitative", "axis": { "grid": true } },
            "color": { "field": "activity", "type": "nominal" }
        }
    };

	// update with change
    vegaEmbed('#distanceVis', distanceSpec, { actions: false }).then(result => {
        const view = result.view;
        const aggregateButton = document.getElementById("aggregate");
        let showingMean = false;

        aggregateButton.addEventListener("click", () => {
            showingMean = !showingMean;
            const newData = showingMean ? meanDistances : distByDayActivity;
            view.change('source_0', vega.changeset().remove(() => true).insert(newData)).run();
            aggregateButton.textContent = showingMean ? "Show all activities" : "Show mean";
        });
    });

	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	document.getElementById("numberActivities").innerText = Object.keys(activityStats).length;
	document.getElementById("firstMost").innerText = firstMost;
	document.getElementById("secondMost").innerText = secondMost;
	document.getElementById("thirdMost").innerText = thirdMost;
	document.getElementById("longestActivityType").innerText = longestActivityType;
	document.getElementById("shortestActivityType").innerText = shortestActivityType;
	document.getElementById("weekdayOrWeekendLonger").innerText = "weekends";

}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});