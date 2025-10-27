class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        if (this.text.startsWith("Just completed") || this.text.startsWith("Just posted")) {
            return "completed_event";
        } else if (this.text.startsWith("Watch my")) {
            return "live_event";
        } else if (this.text.startsWith("Achieved")) {
            return "achievement";
        } else {
            return "miscellaneous";
        }
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        if (this.text.includes(" - ")) {
            return true; 
        } else {
            return false;
        }
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        return this.text.substring(this.text.lastIndexOf(" - "), this.text.indexOf("https"));
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        const match = this.text.match(/(\d+(\.\d+)?)\s*(mi|km)\s+?([a-zA-Z ]+)(?:-|a|my|the|with\s+)/);
        if (!match) return "unknown";
        return match[4].trim(); // activity type
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: parse the distance from the text of the tweet
        const match = this.text.match(/(\d+(\.\d+)?)\s*(mi|km)\s+?([a-zA-Z ]+)(?:-|a|my|the|with\s+)/);
        if (!match) return 0;
        let distNum = Number(match[1]);
        if (match[3].toLowerCase() === "km") distNum /= 1.609;
        return distNum;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}