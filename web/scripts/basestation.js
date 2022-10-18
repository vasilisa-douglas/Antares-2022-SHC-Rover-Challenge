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

//look at controller.js------------------------------------------------------------------------------------------------------

// MODIFY TO FIT GAMEPAD    
window.addEventListener('keypress', (event)=> {
    var name = event.key;
    console.log(name);
}, false)

//----------------------------------------------------------------------------------------------------------------------------




//window.addEventListener('gamepadconnected', (event) => {
//    console.log('A gamepad was connected:', event.gamepad);
//  
//});

//window.addEventListener("gamepaddisconnected", (event) => {
//  console.log("Waiting for gamepad.", event.gamepad);
//});

const haveEvents = 'ongamepadconnected' in window;
const controllers = {};

function connecthandler(e) {
  addgamepad(e.gamepad);
  console.log("Game Pad connected");    //log
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;

  const d = document.createElement("div");
  d.setAttribute("id", `controller${gamepad.index}`);
  console.log(gamepad.index);       //log

  const t = document.createElement("h1");
  t.textContent = `gamepad: ${gamepad.id}`;
  d.appendChild(t);

  const b = document.createElement("div");
  b.className = "buttons";
  gamepad.buttons.forEach((button, i) => {
    const e = document.createElement("span");
    e.className = "button";
    e.textContent = i;
    b.appendChild(e);
  });

  d.appendChild(b);

  const a = document.createElement("div");
  a.className = "axes";

  gamepad.axes.forEach((axis, i) => {
    const p = document.createElement("progress");
    p.className = "axis";
    p.setAttribute("max", "2");
    p.setAttribute("value", "1");
    p.textContent = i;
    a.appendChild(p);
  });

  d.appendChild(a);

  // See https://github.com/luser/gamepadtest/blob/master/index.html
  const start = document.getElementById("start");
  if (start) {
    start.style.display = "none";
  }

  document.body.appendChild(d);
  requestAnimationFrame(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  const d = document.getElementById(`controller${gamepad.index}`);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
  console.log("Gamepad disconnected.");     // log
}

function updateStatus() {
  if (!haveEvents) {
    scangamepads();
  }

  controllers.forEach((controller, i) => {
    const d = document.getElementById(`controller${i}`);
    const buttons = d.getElementsByClassName("button");

    controller.buttons.forEach((button, i) => {
      const b = buttons[i];
      let pressed = button === 1.0;
      let val = button;
      console.log(button);

      if (typeof button === "object") {
        pressed = val.pressed;
        val = val.value;
      }

      const pct = `${Math.round(val * 100)}%`;
      b.style.backgroundSize = `${pct} ${pct}`;
      b.className = pressed ? "button pressed" : "button";
    });

    const axes = d.getElementsByClassName("axis");
    controller.axes.forEach((axis, i) => {
      const a = axes[i];
      a.textContent = `${i}: ${controller.axis.toFixed(4)}`;
      a.setAttribute("value", controller.axis + 1);
    });
  });

  requestAnimationFrame(updateStatus);
}

function scangamepads() {
  const gamepads = navigator.getGamepads();
  for (const gamepad of gamepads) {
    if (gamepad) { // Can be null if disconnected during the session
      if (gamepad.index in controllers) {
        controllers[gamepad.index] = gamepad;
      } else {
        addgamepad(gamepad);
      }
    }
  }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
 setInterval(scangamepads, 500);
}


// WHEEL
// Right Trigger
// Left Trigger
// Right Bumper
// Left Bumper

// ARM
// up arrow button
// down arrow button

// AUTO
// letter button

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
