const fs = require("fs");
const volume = "demovolume/";
const asyncTimeout = 20000;
global.EXTERNAL_CONFIG_FILE = volume + "config.demo.yml";

const worker = require("./index");
const pubSub = worker.pubSub;

var mySubscriber = function(type, message){
        message = JSON.parse(JSON.stringify(message));
        console.log(message.origin, message.message)
};

pubSub.subscribe("hijack", mySubscriber)
pubSub.subscribe("newprefix", mySubscriber)
pubSub.subscribe("misconfiguration", mySubscriber)
pubSub.subscribe("path", mySubscriber)
pubSub.subscribe("rpki", mySubscriber)
pubSub.subscribe("visibility", mySubscriber)
