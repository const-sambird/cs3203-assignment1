var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(bodyParser.json());

// this works it just doesn't update if the file is written to on disk
// given all of our operations should be in memory though i reckon this is fine
const tweetinfo = require('./favs.json');
const { restart } = require('nodemon');

let lastSearchedId;

//Get functions
//Shows user info
app.get('/tweets', function(req, res) {
    // get id, screen name, and name
    // we'll loop through all the tweets, find unique user IDs, and push them into an array
    // then check them against ones we've already found, and if it's a new user we'll add their information
    const foundUserIds = [];
    const users = [];

    for (let tweet of tweetinfo) {
        // our created tweets won't have user ids, so we can skip those
        if (!tweet.user) continue;
        // if we've already handled this user, don't bother adding a duplicate entry
        if (foundUserIds.includes(tweet.user.id)) continue;
        // record the fact we've found the user, so we don't duplicate them (see above)
        foundUserIds.push(tweet.user.id);
        // push the requested info into an array
        users.push({
            id: tweet.user.id,
            name: tweet.user.name,
            screen_name: tweet.user.screen_name
        });
    }

    // return that array so we don't expose more data than is necessary
    return res.status(200).send(users);
});

//Shows tweet info
app.get('/tweetinfo', function(req, res) {
    // the tweet info we need to send is id, text, created_at
    // we'll do a similar thing to loop through each tweet and push the relevant data to an array
    // but this time we don't need to check for duplicates
    const tweets = [];

    for (let tweet of tweetinfo) {
        tweets.push({
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at
        });
    }

    return res.status(200).send(tweets);
});

//Shows searched tweets
app.get('/searchinfo', function(req, res){
    // see if we've searched for a tweet before. if we haven't, return
    if (!lastSearchedId) return res.sendStatus(200);

    const tweet = tweetinfo.filter(t => t.id === lastSearchedId)[0];

    return res.status(200).send(tweet);
});

//Post functions
//Posts created tweets
app.post('/tweetinfo', function(req, res) {
    // first let's check all of the parameters have actually been passed
    if (!req.body.id || !req.body.text)
        return res.status(400).send('Bad request: tweets need an id and text');
    
    // next we'll check to see if the id is a duplicate of an existing tweet (if it is, we should reject)
    // just filter the array by id and see if anything comes up
    if (tweetinfo.filter(tweet => tweet.id === req.body.id).length > 0)
        return res.status(400).send('Bad request: that id is already in use');
    
    // alright cool so
    // body parameters: text and id
    // need to make a created_at ourselves
    // and then just push that onto the tweetinfo array
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[now.getUTCDay()];
    const month = months[now.getUTCMonth()];
    const created_at = `${day} ${month} ${now.getUTCDate()} ${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()} +0000 ${now.getUTCFullYear()}`;

    tweetinfo.push({
        id: req.body.id,
        text: req.body.text,
        created_at: created_at
    });

    return res.sendStatus(200);
});

//Posts searched tweets
app.post('/searchinfo', function(req, res) {
    if (!req.body.id) return res.status(400).send('Bad request: need an id to search for a tweet');
    // filter the array by the given id
    // either the array has zero elements (no tweets with the given id exist) or one element (we've found the tweet)
    const foundTweets = tweetinfo.filter(tweet => tweet.id === req.body.id);
    
    if (foundTweets.length === 0) return res.sendStatus(200); // no tweets found
    lastSearchedId = req.body.id;
    return res.status(200).send(foundTweets[0]); // tweet found
});

//Update
app.put('/tweets/:nm', function(req, res) {
    // we just loop through every tweet, and if we find one by that name
    // we'll update their screen name
    const name = req.params.nm;
    const newScreenName = req.body.screen_name;

    for (let tweet of tweetinfo) {
        if (!tweet.user) continue; // this is a user created tweet, there's no user info attached
        if (tweet.user.name === name)
            tweet.user.screen_name = newScreenName;
    }

    return res.sendStatus(200);
});

//Delete 
app.delete('/tweetinfo/:tweetid', function(req, res) {
    const toDelete = req.params.tweetid;
    if (lastSearchedId === toDelete) lastSearchedId = null;
    // find where the tweet is
    const idx = tweetinfo.findIndex(tweet => tweet.id === toDelete)
    // and remove it from the array
    tweetinfo.splice(idx, 1);
    
    return res.sendStatus(200);
});


app.listen(PORT, function() {
    console.log('Server listening on ' + PORT);
});