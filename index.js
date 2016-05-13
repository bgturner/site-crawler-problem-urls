var Crawler = require('simplecrawler');
var colors = require('colors');

var foundProblemUrls = [];

var domainToScan = 'http://example.com';

// What should be flagged as a problem url
var problemUrlsRegex = new RegExp("dev\.example");

// Add a matched 'problem' url to an array of problem urls
var logProblemUrl = function(url, page){
	foundProblemUrls.push({
		url: url,
		page: page,
	});
}

// Instantiate a crawler object
var crawler = Crawler.crawl(domainToScan);

// Crawler Options
crawler.interval = 500;

// We can configure things in case we are worried about triping security firewalls

// crawler.interval = 10000; // separate requests by 10 secs
// crawler.maxConcurrency = 1; // only allow one request at a time

// Debugging
// crawler.maxDepth = 1; // Only follow one depth of links

// Add a fetch condition and log any urls that match our problem regex
var problemUrlConditionId = crawler.addFetchCondition(function(parsedUrl, queueItem){

	if (parsedUrl.host.match(problemUrlsRegex)) {
		var problemUrl = parsedUrl.protocol + '://' + parsedUrl.host + parsedUrl.path;
		console.log('\nProblem url: ' + colors.red.bold(problemUrl));
		console.log('Found on: ', colors.white(queueItem.url) + '\n');
		logProblemUrl(problemUrl, queueItem.url);
	}

	return true;

});

// Url patterns to ignore. We can probably be sure there aren't urls in images
var ignoreAssets = crawler.addFetchCondition(function(parsedUrl, queueItem){
	return !parsedUrl.path.match(/\.png|\.jpg|\.xml|\/feed\/$|wp-json\/oembed/i);
});

// Log which url we are just parsed
crawler.on('fetchcomplete', function(queueItem, responseBuffer, response){
	console.log('Scanning Url: ', colors.white(queueItem.url));
});

// Summarize what we found
crawler.on('complete', function(){

	console.log(colors.white.bold('Site Scanning complete.\n'));

	if(foundProblemUrls.length === 0) {
		console.log(colors.green.bold('No Problem Urls found!'));
	} else {
		console.log(colors.red.bold('Problem Urls Found:'));
		for (var i = 0; i < foundProblemUrls.length; i++) {
			console.log('Url: ' + colors.red(foundProblemUrls[i].url) + '\nOn Page: ' + foundProblemUrls[i].page);
		}
	}

});

crawler.start();

