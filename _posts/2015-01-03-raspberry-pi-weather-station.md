---
layout: post
title: "How to create a connected mini weather station using a Raspberry Pi"
---

The goal to this tutorial is to create [a simple weather station](http://weather.aissam.me) to check temperature and humidity: we will look at how to get the data from a sensor, send it to the cloud, and then retrieve it to display it on a web page.
<br>

![Arduino + Raspberry Pi](/images/pi.png)
<br>


> Pretty much everything you need!

Here is what you'll need:

* A Raspberry Pi.
* DHT11 sensor
* 10K resistor
* Some jumper wires
* Breadboard
* Time


### The Sparkfun API
After getting our data from the sensor we'll need to store it somewhere in the Internet, that's where the [Sparkfun API](https://data.sparkfun.com) comes into place, it allows us to store data in what they call "data streams", something like [this](https://data.sparkfun.com/streams/xROLbJzAlMcjwlN5dolp): each stream contains different fields (in our case: temperature and humidity), you push data to a stream using a private key (so that you're the only one who can send data) to retrieve later in different formats like json, csv, sql. So go ahead and create you data stream, and note the public and private keys as we will need them later.

### Using The Raspberry Pi
Using only the Raspberry Pi is pretty straightforward, we'll use NodeJS with a [package](https://github.com/momenso/node-dht-sensor) that's already created for the purpose of interacting with our sensor.

```sh
# Installing NodeJS
$ wget http://node-arm.herokuapp.com/node_latest_armhf.deb
$ sudo dpkg -i node_latest_armhf.deb

# Creating a directory for our project
$ mkdir weather
$ cd weather
# Creating and empty js file (the one we will fill up to get data form our sensor)
$ touch server.js
```

The [node-dht-sensor](https://github.com/momenso/node-dht-sensor) package we're going to be using needs the [BCM 2835](http://www.airspayce.com/mikem/bcm2835/) library to be installed to work properly:

```sh
# Getting the latest version of the library,
# you might want to change the link to the latest version from the website
$ wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.38.tar.gz

# Unpacking the file
$ tar zxvf bcm2835-1.38.tar.gz

# Compiling and installing
$ cd bcm2835-1.38
$ ./configure
$ make
$ sudo make check
$ sudo make install

# Cleaning after installation
$ cd ..
$ rm -rf bcm2835-1.38
$ rm bcm2835-1.38.tar.gz
```

Next thing you need to is to connect the sensor to the Raspberry Pi, here is a schema:

![](/images/pi-dht11.png)

I ended up not using the resistor for the sake of simplicity (so that I wouldn't use a breadoboard), I connected the sensor directly to the Pi, turns out there wasn't a noticeable difference between using the resistor and not using it [^1].

![](/images/pi2.jpg)

We then create the NodeJS program, we need to install two packages to make it work, [node-dht-sensor](https://github.com/momenso/node-dht-sensor) which will get data from DHT11, and the [request](https://www.npmjs.com/package/request) package to simplify doing GET requests:

```sh
$ npm install node-dht-sensor request
```

Here is how the NodeJS program works, we begin by creating the a sensor object, it has two methods: one that initialize it, and a second one to read values from it, the first one is pretty straightforward: we use the node-dht-sensor initialize function and we give it as arguments the type of the sensor (11 for DHT11) and the pin number it it is connected to (check the Raspberry Pi schema, you'll see the sensor connected to pin 4), the second one reads data from the sensor, parses the temperature and humidity, if they are different from our last readout, we update lastTemp and lastHumidity with the new values -- I use those variables so that I won't send duplicate data -- then we send the information to Sparkfun using the request package, if everything is fine (no error and status code is [200](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.2.1)) then we're good, otherwise display an error message.
This read function then calls itself every 2 seconds.

```js
var sensorLib = require('node-dht-sensor');
var request = require('request');

var privateKey = "Put here you sparkfun private key";
var publicKey = "Put here you sparkfun public key"
var url = 'https://data.sparkfun.com/input/' + publicKey + '?private_key=' + privateKey;
var lastTemp, lastHumidity;

var sensor = {
    initialize: function () {
        return sensorLib.initialize(11, 4);
    },
    read: function () {
        var readout = sensorLib.read();

        // toFixed specifies how many decimals after the point
        var temp = readout.temperature.toFixed(0);
        var humidity = readout.humidity.toFixed(0);

        if (temp != lastTemp || humidity != lastHumidity) {
          lastTemp = temp;
          lastHumidity = humidity;

          request(url + '&humidity=' + humidity + '&temp=' + temp, function(err, res, body) {
            if (!err && res.statusCode == 200)
                console.log('Data sent successfully! (' + temp + '°C, ' + humidity + '%)');
            else
                console.log('Error while sending data!');
          });
        }

        setTimeout(function () {
            sensor.read();
        }, 2000);
    }
};

if (sensor.initialize()) {
    sensor.read();
} else {
    console.warn('Failed to initialize sensor');
}
```

Start it by running:

```sh
$ sudo node server.js
```

We need the sudo because of the [BCM 2835 library](https://github.com/momenso/node-dht-sensor#usage).

If you tried this code you might have noticed that the program stops immediately after quitting the SSH session, to have this program runs indefinitely it has to be on the background as a [daemon](http://en.wikipedia.org/wiki/Daemon_(computing)), there is a command line NodeJS app that does just that, it's called [pm2](https://github.com/Unitech/pm2), to install it:

```sh
sudo npm install -g pm2
```

to launch our program using it:

```sh
sudo pm2 start server.js
```

and to stop it:

```sh
sudo pm2 stop server.js
```

Next thing we need to do is to create a web page to display this data we are sending, I aimed for a static page, so that I can hosted easily with this project on GitHub using [GitHub Pages](https://pages.github.com/).

I won't go over the HTML/CSS part as it is straightforward, what's really interesting is the JavaScript part: we want a web page that constantly updates itself after new changes in the temperature and/or humidity.

We begin by storing references to the temperature and humidity paragraphs that we're gonna fill with data retrieved from Sparkfun. I went with the native way of getting a json file: by using XMLHttpRequest instance, the unload method is triggered after every request made, the url we send contains the latest 250 entries (I wish there was an url for only the last one but unfortunately there isn't), if everything is fine (status code is 200) we parse the json file and we get the last entry and then update the page, the method onerror is triggered if something goes wrong, it is not needed but might be helpful for debugging.

The function update just opens an HTTP connection and sends it, and we do that every 10 seconds.

```js
var tempTag = document.querySelector('#temperature');
var humidityTag = document.querySelector('#humidity');

var publicKey = 'Put here you sparkfun public key';
var url = 'https://data.sparkfun.com/output/' + publiKey +'.json?page=1';

var request = new XMLHttpRequest();

request.onload = function() {
  if (request.status == 200) {
    response = JSON.parse(request.responseText);

    var temp = response[0].temp;
    var humidity = response[0].humidity;

    tempTag.innerHTML = 'TEMPERATURE: ' + temp + ' °C';
    humidityTag.innerHTML = 'HUMIDITY: ' + humidity + ' %';
  }
};

function update() {
  // Getting the data from SparkFun API
  request.open('GET', url, true);
  request.send();
}

update();
setInterval(update, 10000);
```


You can check the code for this project at [GitHub](https://github.com/Edmeral/weather/tree/alternative), and you'll find the web page code [here](https://github.com/Edmeral/weather/tree/gh-pages).

You might notice that the `master` branch for this repository contains a different code, that is because at first I didn't know about the node-dht-sensor module so I ended up using an Arduino connected to a Raspberry Pi (I might write an article in the future about how the two work together).

[^1]: In this case, the resistor plays the role of a "Pull up resistor", you can learn more about it [here](http://forum.arduino.cc/index.php?topic=165562.0).
