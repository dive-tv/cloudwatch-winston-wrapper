// Constructor
function Logger(config){    
    // AWS-SDK
    if (config !== undefined) {
        this.cloudwatch = new AWS.CloudWatch(config);
        
        // Param Metric Data for CloudWatch
        this.paramsMetricData = {
            MetricData: [ /* required */
                {
                    MetricName: constants.LOGEVENT, /* required */
                    Timestamp: new Date().toISOString(),
                    Unit: "Count",
                    Value: 1.0
                },
                {
                    MetricName: constants.LOGEVENT, /* required */
                    Timestamp: new Date().toISOString(),
                    Unit: "Count",
                    Value: 1.0
                }
                
            ],
            Namespace: 'STRING_VALUE' /* required */
        };
        
        if (config.namespace !== undefined) {
            this.paramsMetricData.Namespace = config.namespace;
            
            this.levelPrio = config.levelCloudWatch || constants.INFOPRIO;
            
            if (constants.LEVELSWINSTON.indexOf(config.levelWinston) != -1)
                winston.level = config.levelWinston;
            
            try {
                var res = request('GET', constants.URLINSTANCEID, {timeout : 3000});
                this.instanceID = res.getBody();
            } catch (ex) {
                winston.error("Error getting InstanceID.");
                this.instanceID = 'Generic-ID';
            }
            
            this.putMetricData = function (level) {
                if (this.instanceID !== undefined) {
                    var dimensions = [
                        [{ Name : constants.LEVEL, Value : level}],
                        [{ Name : constants.LEVEL, Value : level}, 
                            { Name : constants.INSTANCE, Value : this.instanceID.toString()}]
                    ];

                    for (var i = 0; i < dimensions.length; i++) {
                        this.paramsMetricData.MetricData[i].Dimensions = dimensions[i];
                    }
                    this.cloudwatch.putMetricData(this.paramsMetricData, function(err, data) {
                        if (err) {
                            origError.call(this, err);
                        }
                    });
                } else
                    throw new Error("Instance ID is undefined. It was imposible get instanceID");
            };
        } else
            throw new Error("Namespace not specified");
    } else
        throw new Error("Configuration not specified");
}


// Requires
var winston = require("winston");
var AWS = require('aws-sdk');
var request = require('sync-request');
var constants = require('./constants');

// Ptr to original winston methods
var origDebug = winston.debug;
var origInfo = winston.info;
var origWarn = winston.warn;
var origError = winston.error;

// Exports constructor Logger
module.exports = Logger;
// Exports winston's method
Logger.prototype = winston;


// Public Constants
module.exports.ERROR = constants.ERRORPRIO;
module.exports.WARN = constants.WARNPRIO;
module.exports.INFO = constants.INFOPRIO;
module.exports.DEBUG = constants.DEBUGPRIO;

// Overloaded methods
Logger.prototype.debug = function(msg) {
    if (constants.DEBUGPRIO <= this.levelPrio)
        this.putMetricData(constants.DEBUG);
    origDebug.call(this, msg);
}

Logger.prototype.info = function(msg) {
    if (constants.INFOPRIO <= this.levelPrio)
        this.putMetricData(constants.INFO);
    origInfo.call(this, msg);
}

Logger.prototype.warn = function(msg) {
    if (constants.WARNPRIO <= this.levelPrio)
        this.putMetricData(constants.WARN);
    origWarn.call(this, msg);
}

Logger.prototype.error = function(msg) {
    if (constants.ERRORPRIO <= this.levelPrio)
        this.putMetricData(constants.ERROR);
    origError.call(this, msg);
}

/* Configuration methods */
Logger.prototype.loadLogger = function (options) {
    if (options !== undefined) {
        this.levelPrio = options.levelCloudWatch || this.levelPrio;
        if (constants.LEVELSWINSTON.indexOf(options.levelWinston) != -1)
            winston.level = options.levelWinston;
    }
};
