const https = require('https');

// foursquare client id and client secret
const client_id = "LUNBZYSD3AVWIGBERDUT1L45PTIPZAR5UH0PGJQ1RWMPD1JO";
const client_secret = "WEKHGDGPT2IGH2E4A2NTS2OK1RF005OTN3HQKJE5G4HCVWTG";
const version = "20201201";


// gets top 10 restaurants with the specific food type in vancouver
function getRestaurants(foodType){
    const url = `https://api.foursquare.com/v2/venues/explore?near=Vancouver,BC&query=${foodType}&client_id=${client_id}&client_secret=${client_secret}&v=${version}`;
    const promise = new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(JSON.parse(data).response.groups[0].items.slice(0,10).map(item => item.venue.name));
            });

        }).on("error", (err) => {
            reject(err);
        });
    })

    return promise;
}

// Helper function used to create the proper response back to Lex
function close(message) {
    return {
        dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled',
            message,
        },
    }
}
exports.handler = (event, context, callback) => {
    console.log(event);

    let { food: foodType } = event.currentIntent.slots;
    
    getRestaurants(foodType).then((restaurants) => {
        let msg = 'Here are 10 restaurants I recommend:';
        for(var i=0; i<restaurants.length; i++)
            msg += `\n${restaurants[i]}`;
        
        msg += '\n\nWould you like to make a reservation?'
        
        callback(null, close({
            contentType: "PlainText",
            content: msg
        }))
    })
}

