/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
		this.ready = false;
		this.exiting = false;
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		document.addEventListener('exit', this.onExit);
    },
    // deviceready Event Handler

    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		log('Received deviceready Event');
		document.addEventListener('backbutton', app.onBackButton, false);
		app.ready = true;
		initialize();			
	},
	onBackButton: function() {
		log('Received backbutton Event');
		if(app.exiting){
			log('Exiting!');
			if(isPhoneGap){
				navigator.app.exitApp();
			}
		}else{
			app.exiting = true;
			popup('exitmessage');
			setTimeout(app.onBackButtonTimeout, 3000);
		};
	},
	onBackButtonTimeout: function() {
		log('onBackButtonTimeout');
		app.exiting = false;
	}, 
	onExit: function() {
		log('Received exit Event');
		if(isPhoneGap){
			window.plugins.insomnia.allowSleepAgain();
		}
	}		
};

function show(id) {
	var e = document.getElementById(id)
	e.style.display = 'inline';
}

function hide(id) {
	var e = document.getElementById(id)
	e.style.display = 'none';
}

function popup(id) {
	var e = document.getElementById(id)
	e.classList.remove('popup');
	e.style.display = 'block';
	void e.offsetWidth;
	e.classList.add('popup');
}

function fadein(id) {
	var e = document.getElementById(id)
	e.classList.remove('fadeout');
	e.style.display = 'block';
	void e.offsetWidth;
	e.classList.add('fadein');
}

function fadeout(id) {
	var e = document.getElementById(id)
	e.classList.remove('fadein');
	void e.offsetWidth;
	e.classList.add('fadeout');
}



class Timer {
  // class methods
  constructor(seconds, showAsCountDown) {
	  this.isRunning = false;
	  this.startDate = null;
	  this.durationSeconds = seconds;
	  this.endDate = null;
	  this.showAsCountDown = showAsCountDown;
  }
  
  secondsToHHMMSS(seconds){
	return new Date(seconds * 1000).toISOString().substr(11, 8);
  }

  
  start(){
	  this.startDate = new Date();
	  this.endDate = new Date();
	  this.endDate.setSeconds(this.startDate.getSeconds() + this.durationSeconds);
	  this.isRunning = true;
  }
  
  stop(){
	  this.isRunning = false;
  }
  
  toggleCountDown(){
	  this.showAsCountDown = !this.showAsCountDown;
  }
   
  updateDuration(seconds){
	  var delta = seconds - this.durationSeconds;
	  this.durationSeconds = seconds;
	  if (this.isRunning){
		  this.endDate.setSeconds(this.endDate.getSeconds() + delta);		  
	  }
  }
  
  getElapsedSeconds(){
	  if (this.isRunning) {
		var now = new Date();
		return Math.floor((now - this.startDate)/1000);
	  } else {
		return 0;
	  }
  }
  
  getElapsedSecondsStr(){
	  return this.secondsToHHMMSS(this.getElapsedSeconds());
  }
  
  getRemainingSeconds() {
	  if (this.isRunning) { 
		var now = new Date();
		return Math.floor((this.endDate - now)/1000);  
	  } else {
		return this.durationSeconds;
	  }
  }
	  
  getRemainingSecondsStr(){
	  var remainingSeconds = this.getRemainingSeconds()
	  if (remainingSeconds >=0) {
		return this.secondsToHHMMSS(this.getRemainingSeconds());
	  } else {
		return '-'+this.secondsToHHMMSS(-this.getRemainingSeconds());
	  }
  }
  
  getDisplayStr(){
	  if (this.showAsCountDown) {
		  return this.getRemainingSecondsStr()
	  } else {
		  return this.getElapsedSecondsStr()
	  }
  }
  
  
  getColor(){
	  var percent = 100*this.getElapsedSeconds()/this.durationSeconds;
	  if (percent >= 100) {
		  return 'red';
	  } else if (percent >=90) {
		  return 'darkorange';
	  } else {
		  return 'green';
	  }
    
  }
}

class TimerWidget{
	  constructor(name, timerID, defaultSeconds) {
		this.name = name;
		this.headerID = timerID + 'Text';	
		this.timerID = timerID + 'Timer';		
		this.startStopID = timerID + 'StartStop';
		this.upDownID = timerID + 'UpDown';
		this.secondsKey = this.timerID + '.seconds';
		this.showAsCountDownKey = this.timerID + '.showAsCountDown';
		this.timer = new Timer(storage.getInt(this.secondsKey, defaultSeconds),
							   storage.getBoolean(this.showAsCountDownKey, false));
		this.setHeader();
		this.setUpDownImage()
		this.stop();
  }
  
  setHeader(){
	  document.getElementById(this.headerID).innerHTML = this.name+' Timer ('+(this.timer.durationSeconds/60).toString()+' mins)';
  }
  
  setUpDownImage(){
	  var upDownImage = document.getElementById(this.upDownID);
	  if(this.timer.showAsCountDown){
		upDownImage.src = 'img/down-icon.png';
	  } else {
		upDownImage.src = 'img/up-icon.png';
	  }
  }
  
  updateTimer(){
	document.getElementById(this.timerID).innerHTML = this.timer.getDisplayStr();	
	document.getElementById(this.timerID).style.color = this.timer.getColor();	  
  }
  
  start(){
	  this.timer.start();
	  document.getElementById(this.startStopID).src = 'img/Stop-icon.png';
	  this.updateTimer();
  }
  
  stop(){
	  this.timer.stop();
	  document.getElementById(this.startStopID).src = 'img/Start-icon.png';
	  this.updateTimer();
  }
  
  toggleStartStop(){
	  if(this.timer.isRunning){
		  this.stop();
	  } else {
		  this.start();
	  }
  }  
    
  updateDuration(){
	var minutes = parseInt(window.prompt("Enter "+self.name+" minutes:"));
	if(!isNaN(minutes)) {
		var seconds = minutes*60;
		storage.setNumber(this.secondsKey, seconds) 
		this.timer.updateDuration(seconds);
		this.setHeader();
		this.updateTimer();	
	}	
  }
  
  toggleCountDown(){
	this.timer.toggleCountDown();
	this.setUpDownImage();
	storage.setBoolean(this.showAsCountDownKey, this.timer.showAsCountDown);
	this.updateTimer();
  }
}

class Storage{
	constructor() {
		this.storage = window.localStorage;
	}
	
	getString(key, defaultValue) {
		var value = this.storage.getItem(key);
		if (value) {
			return(value);
		}
		return(defaultValue);
	}
	
	getInt(key, defaultValue) {
		var value = parseInt(this.getString(key, ''), 10);
		if (isNaN(value)) {
			return(defaultValue);
		}
		return(value)
	}
	
	getFloat(key, defaultValue) {
		var value = parseFloat(this.getString(key, ''));
		if (isNaN(value)) {
			return(defaultValue);
		}
		return(value)
	}
	
	getBoolean(key, defaultValue) {
		return (this.getString(key, defaultValue) === 'true');
	}	
	
	setString(key, value) {
		this.storage.setItem(key, value);
	}
	
	setNumber(key, value) {
		this.storage.setItem(key, value.toString());
	}
	
	setBoolean(key, value) {
		this.storage.setItem(key, value.toString());
	}
	
	removeItem(key) {
		this.storage.removeItem(key);
	}
}


function onTick(){
	var d = new Date();
	document.getElementById("now").innerHTML = d.toLocaleTimeString('en-GB');	
	lessonTimer.updateTimer();
	intervalTimer.updateTimer();
}

function log(s){
	prefix = '';
	if (typeof device !== 'undefined'){
		prefix = device.platform + ':';
	}
	console.log(prefix + s);
}

function handleSounds(target, other){
	
	if(isPhoneGap){
		target.getCurrentPosition(function(p){}, function(p){});
		other.getCurrentPosition(function(p){}, function(p){});
		if(other._position != 0) {
			other.stop();
		}
		var position = target._position;
	} else {
		other.load();
		var position = target.currentTime;
	}
	log('Media Position: ' + position);
	if(position==0){
		target.play();
	} else {
		if(isPhoneGap){
			target.stop()
		} else {
			target.load();
		}
	}	
}

function playStart(){
	handleSounds(ding, dingDingDing);
}


function playEnd(){
	handleSounds(dingDingDing, ding);
}	

function mediaFound(e){
}

function mediaNotFound(e){
	log('Media Error: ' + JSON.stringify(e));
}

function getURL(s) {
	root = window.location.pathname;
	return(root.substring(0, root.lastIndexOf('/')+1) + s)
}

// Initialize function
function initialize(){
	log('window.location.pathname: ' + window.location.pathname);
	if (typeof device !== 'undefined'){
		log('device.platform: ' + device.platform);
	}
	log('isPhoneGap: ' + isPhoneGap);
	storage = new Storage();
	lessonTimer = new TimerWidget('Lesson', 'lesson', 3600);
	intervalTimer = new TimerWidget('Interval', 'interval', 600);
	if (isPhoneGap) {
		window.plugins.insomnia.keepAwake();
		ding = new Media(getURL('audio/Ding.m4a'), mediaFound, mediaNotFound);
		dingDingDing = new Media(getURL('audio/Ding ding ding.m4a'), mediaFound, mediaNotFound);
	} else {
		ding = new Audio('audio/Ding.m4a');
		dingDingDing = new Audio('audio/Ding ding ding.m4a');	
	}
	// Do first tick...
	onTick()
	// We're now ready
	fadeout('initialising');
	fadein('deviceready');
	var message = '<h1>Welcome to the Mindfulness Teaching Timer App...</h1>';
	message += '<ul style="text-align:left;">';
	message += '<li>Check your device is on <b>Silent/Do Not Disturb</b>!</li>';
	if (isPhoneGap) {
		message += '<li>While in the foreground, this App will keep your screen on.</li>';
	} else {
		message += '<li>Also set your screen timeout...</li>';
	}
	message += '<li>You can toggle timers between Up/Down and change their lengths while they are running.</li>';
	message += '</ul>';
	document.getElementById('messageBoxMessage').innerHTML = message;
	fadein('messageBox');
	// then set to regular tick...
	setInterval(onTick, storage.getInt('updateSeconds', 1)*1000);
}

// Globals
var storage = null;
var lessonTimer = null;
var intervalTimer = null;
var ding = null;
var dingDingDing = null;




