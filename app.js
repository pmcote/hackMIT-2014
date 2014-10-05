var express = require('express'), 		
		http = require('http'),
    routes = require('./routes')
    events = require('events');

var app = express();
var eventEmitter = new events.EventEmitter();

app.configure(function(){
	app.set('port', process.env.PORT || 3000)
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'))
	//mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/[]');
});

app.get('/', function (req, res) {
	res.render('myo_ws', {title: 'Hacker School Project'})

	var WebSocket = require('ws');
	var ws = new WebSocket('ws://127.0.0.1:7204/myo/1');

	var myoID;

	ws.on('message', function(message) {
		json = JSON.parse(message);
			var w_not;

	    if (json[0] != "event")
	    	return console.log(message);

	    var data = json[1];

	    if (data.type == "connected") {
	    	myoID = data.myo;
	    }


	    // if (data.type == "orientation") {
	    // 	console.log(data.orientation.w);
	    // 	//save orientation on trigger, use relative change in w
	    // }

	    if (data.type != "orientation") {
	    	if (data.pose) {
	    		pose = data.pose;
	    		console.log(data); //pass to fft filters
	        if (pose) {
		        var pose_map = {"rest":"0", "fist":"1", "thumb_to_pinky":"2", "fingers_spread":"3", "wave_out":"4", "wave_in":"5"};
		        console.log('this is the JSON', pose_map[pose]);
		      }
	    	}
	    }

	});

	function requestVibrate() {
	    var data = ["command", {
	        "command": "vibrate",
	        "myo": myoID,
	        "type": "short"
	    }]
	    console.log("Sending vibrate", JSON.stringify(data));
	    ws.send(JSON.stringify(data) + "\n");
	}

	function requestSignal() {
		var data = ["command", {
			"command": "request_rssi",
			"myo": myoID
		}]
	    console.log("Sending request_rssi", JSON.stringify(data));
	    ws.send(JSON.stringify(data) + "\n");
	}

	setInterval(requestVibrate, 3000);
	setInterval(requestSignal, 3000);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
