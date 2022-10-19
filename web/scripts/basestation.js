// ROS Instance Object
var ros;

// ROS Subscriber
var pico_sub;

// ROS Publisher
var command_pub;

// Text box reference
var pico_log;

function setup() {
    pico_log = $("#pico_log");

    ros = new ROSLIB.Ros();
    var rosbridge_status = $("#rosbridge_status");
    ros.on('connection', function () {
        console.log('Connected to websocket server.');
        rosbridge_status.val("Connected");
    });

    ros.on('error', function (error) {
        console.log('Error connection to websocket server: ' + error);
        rosbridge_status.val("Error");
    });

    ros.on('close', function () {
        console.log('Connection to websocket server closed.');
        rosbridge_status.val("Closed");
    });

    pico_sub = new ROSLIB.Topic({
        ros: ros,
        name: '/pico/output',
        messageType: 'std_msgs/String'
    });
    pico_sub.subscribe(update_log);

    command_pub = new ROSLIB.Topic({
        ros: ros,
        name: '/pico/command',
        messageType: 'std_msgs/String'
    });

    $("#rosbridge_connect").click(connect_rosbridge);

    // Command Publishing
    $("#btn_led_on").click(() => {
        var command = new ROSLIB.Message({
            data:"led_on"
        });
        command_pub.publish(command);
    });

    $("#btn_led_off").click(() => {
        var command = new ROSLIB.Message({
            data:"led_off"
        });
        command_pub.publish(command);
    });

    $("#btn_ping").click(() => {
        var command = new ROSLIB.Message({
            data:"ping"
        });
        command_pub.publish(command);
    });
    
    $("#btn_time").click(() => {
        var command = new ROSLIB.Message({
            data:"time"
        });
        command_pub.publish(command);
    });
}


//----------------------------------------------------------------------------------------------------------------------------
// Controls
//----------------------------------------------------------------------------------------------------------------------------

let gamepadIndex;
window.addEventListener('gamepadconnected', (event) => {
	gamepadIndex = event.gamepad.index;
});

setInterval(() => {
	if(gamepadIndex !== undefined) {
		// a gamepad is connected and has an index
		const myGamepad = navigator.getGamepads()[gamepadIndex];
		
		myGamepad.buttons.map(e => e.pressed).forEach((isPressed, buttonIndex) => {
			if(isPressed) {
        console.log(buttonIndex);
        switch (buttonIndex)
        {
          case 6:
            console.log("Left Wheels Forward");
            var command = new ROSLIB.Message({
              data:"left-forward"
            });
            command_pub.publish(command);
            break;
          case 7:
            console.log("Right Wheels Forward");
            var command = new ROSLIB.Message({
              data:"right-forward"
            });
            command_pub.publish(command);
            break;
          case 4:
            console.log("Left Wheels Reverse");
            var command = new ROSLIB.Message({
              data:"left-reverse"
            });
            command_pub.publish(command);
            break;
          case 5:
            console.log("Right Wheels Reverse");
            var command = new ROSLIB.Message({
              data:"right-reverse"
            });
            command_pub.publish(command);
            break;
          case 0:
            console.log("Follow Instructions");
            var command = new ROSLIB.Message({
              data:"follow-instructions"
            });
            command_pub.publish(command);
            break;
          case 12:
            console.log("Arm Up");
            var command = new ROSLIB.Message({
              data:"arm-up"
            });
            command_pub.publish(command);
            break;
          case 13:
            console.log("Arm Down");
            var command = new ROSLIB.Message({
              data:"arm-down"
            });
            command_pub.publish(command);
            break;
          default:
            break;
        }
			}
		})
	}
}, 1)


function update_log(message) {
    var log = message.data;
    var time = new Date().toTimeString().split(' ')[0];
    pico_log.text('[' + time + '] ' + log + pico_log.text());
}

function connect_rosbridge() {
    var address = "ws://" + $("#rosbridge_address").val();

    ros.connect(address);
}

window.onload = setup;
