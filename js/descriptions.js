function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	tweet_array = runkeeper_tweets
    .map(tweet => new Tweet(tweet.text, tweet.created_at))
    .filter(tweet => tweet.written);
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	const textFilter = document.getElementById("textFilter");
    const tableBody = document.getElementById("tweetTable");
    textFilter.addEventListener("input", function () {
		let searchCount = 0, searchText = textFilter.value;
        tableBody.innerHTML = "";
		for (const tweet of tweet_array) {
			const written = tweet.writtenText;
            if (written.includes(searchText) && searchText.length > 0) {
                searchCount++;
				const rowHTML = tweet.getHTMLTableRow(searchCount);
				tableBody.innerHTML += rowHTML;
            }
		}
        document.getElementById("searchCount").innerText = searchCount;
        document.getElementById("searchText").innerText = searchText;
    });
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});