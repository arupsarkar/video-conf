require("dotenv").config();
const path = require("path");
const express = require("express");
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
// var webpack = require("webpack");
const faker = require("faker");

const app = express();

console.log(new Date(), ' Environment : ' + process.env.NODE_ENV);
app.use(express.static(path.join(__dirname, "dist")));

// Endpoint to generate access token
app.get('/token', function(request, response) {
    var identity = faker.name.findName();
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    var token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );
    // Assign the generated identity to the token
    token.identity = identity;
    const grant = new VideoGrant();
    // Grant token access to the Video API features
    token.addGrant(grant);
    // Serialize the token to a JWT string and include it in a JSON response
    response.send({
        identity: identity,
        token: token.toJwt()
    });
 });

const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Express server listening on *:" + port);
});