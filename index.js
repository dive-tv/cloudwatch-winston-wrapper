/*	Author : Natalia Angulo Herrera
	Date : 07/04/2016
	License : MIT
*/

// Constructor
function Logger(config){    
    // AWS-SDK
    if (config !== undefined) {
        this.cloudwatch = new AWS.CloudWatch(config);
        
        if (config.namespace !== undefined) {
            this.namespace = config.namespace;
            
            this.levelPrio = config.levelCloudWatch || constants.INFOPRIO;
            
            if (constants.LEVELSWINSTON.indexOf(config.levelWinston) != -1)
                winston.level = config.levelWinston;
            
            try {
                var res = request('GET', constants.URLINSTANCEID, {timeout : 3000});
                this.instanceID = res.getBody();
            } catch (ex) {
                origError(this, "Error getting InstanceID.");
                this.instanceID = 'Generic-ID';
            }
            
            this.dimensions = [];
            
            // Parse extra dimensions
            if (config.dimensions !== undefined) {
                // Parse the specified dimensions
                for (var i = 0; i < config.dimensions.length; i++) {
                    var dimension = [];
                    for (var j = 0; j < config.dimensions[i].length; j++) {
                        var elem = config.dimensions[i][j];
                        if (elem !== undefined) {
                            var name = elem.Name;
                            var value = elem.Value;
                            var type = elem.Type;
                            
                            if (name !== undefined && value != undefined) {
                                if (type === undefined || type !== constants.AUTO)
                                    dimension.push({ Name : name, Value : value});
                                else {
                                    switch (value) {
                                        case constants.INSTANCE:
                                            dimension.push({ Name : name, Value : this.instanceID.toString()});
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                            
                        }
                    }
                    if (dimension !== [])
                        this.dimensions.push(dimension);
                }
            }
            
            this.putMetricData = function (level) {
                if (this.instanceID !== undefined) {
                    var JSONlevel = { Name : constants.LEVEL, Value : level};
                    var dimensionsDefault = [
                        [JSONlevel],
                        [JSONlevel, { Name : constants.INSTANCE, Value : this.instanceID.toString()}]
                    ];
                    
                    // Param Metric Data for CloudWatch
                    var paramsMetricData = {
                        MetricData: [], /* required */
                        Namespace: this.namespace /* required */
                    };

                    for (var i = 0; i < dimensionsDefault.length; i++) {
                        var dataDefault = {
                            MetricName: constants.LOGEVENT, /* required */
                            Timestamp: new Date().toISOString(),
                            Dimensions: dimensionsDefault[i],
                            Unit: "Count",
                            Value: 1.0
                        };
                        paramsMetricData.MetricData.push(dataDefault);
                    }
                    
                    for (var i = 0; i < this.dimensions.length; i++) {
                        var dimension = this.dimensions[i];
                        dimension.unshift(JSONlevel); // Push first place the dimension level by default
                        var data = {
                            MetricName: constants.LOGEVENT, /* required */
                            Timestamp: new Date().toISOString(),
                            Dimensions: dimension,
                            Unit: "Count",
                            Value: 1.0
                        };
                        paramsMetricData.MetricData.push(data);
                    }
                    
                    this.cloudwatch.putMetricData(paramsMetricData, function(err, data) {
                        if (err) {
                            origError.call(this, err);
                        }
                    });
                } else {
                    throw new Error("Instance ID is undefined. It was imposible to get instanceID");
                }
            };
        } else {
            throw new Error("Namespace not specified");
        }
    } else {
        throw new Error("Configuration not specified");
    }
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

module.exports.INSTANCE = constants.INSTANCE;
module.exports.AUTO = constants.AUTO;

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
