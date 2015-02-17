---
layout: post
title: "How to create a connected mini weather station using a Raspberry pi and/or an Arduino board"
---

The goal to this tutorial is to create [a simple weather station](http://weather.aissam.me) to check temperature and humidity: We will look at how to get the data from a sensor, send it to the cloud, and then retrieve it to display it on a web page, I'll assume you know how to [SSH](FIXME) into a your Raspberry Pi, and the [basics](FIXME!) of working with an Arduino.

<br>

![Arduino + Raspberry Pi](/images/arduinopluspi.jpg)
<br>


> Pretty much everything you need!

Here is what you'll need:

* An Arduino board (an Arduino UNO would be enough)
* A Raspberry Pi.
* DHT11 sensor
* 10K resistor
* Some jumper wires
* Breadboard
* Time


### The Sparkfun API
After getting our data from the sensor we'll need to store it somewhere in the Internet, that's where the [Sparkfun API](https://data.sparkfun.com) comes into place, it allows us to store data in what they call "data streams", something like [this](https://data.sparkfun.com/streams/xROLbJzAlMcjwlN5dolp): each stream contains different fields (in our case: temperature and humidity), you push data to a stream using a private key (so that you're the only one who can send data) to retrieve later in different formats like json, csv, sql, so go ahead and create you data stream, and note the public and private keys as we will need them later.

### Using The Raspberry Pi
Using only the Raspberry Pi is pretty straightforward, we'll use Node.js with a [package](https://github.com/momenso/node-dht-sensor) that's already created for the purpose of interacting with our sensor.

```sh
# Installing Node.js
$ wget http://node-arm.herokuapp.com/node_latest_armhf.deb
$ sudo dpkg -i node_latest_armhf.deb

# Creating a directory for our project
$ mkdir weather
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

Next thing you need to is to connect the raspberry pi, here is a schema:
![](/images/pi-dht11.png)




