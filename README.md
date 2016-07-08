# cloudwatch-winston-wrapper

Simple Node module that allows put Metric Data of the Log Events in CloudWatch AWS through Winston's logger (this is possible by overloading the logger methods of Winston). 
The Log Events from Winston's logger, put by default two metrics in the namespace indicated to the constructor:
 * instance (instance id from machine AWS), level, Metric Name (always is LogEvent)
 * level, Metric Name (always is LogEvent)

Furthermore, you can configure the level from your logger in CloudWatch. For that, there are the following constants: ERROR, WARN, INFO, DEBUG. By default, level is INFO.
  Level Logger is ordering by {ERROR, WARN, INFO, DEBUG}. Level ERROR is the most restrictive (only logger.error put metric Data). 
You can configure Winston's level logger as it describe in Doc's Winston.

You must obtain an instance of cloudwatch-winston-wrapper. For that, it's necessary  to specify a JSON with the following fields:
  * namespace : String that specifies the namespace of CloudWatch's Metric.
Optionally, you can specify the following fields:
  * region : region from AWS
  * levelCloudWatch : Constant from CloudWatchWinston (CloudWatchWinston.DEBUG, CloudWatchWinston.ERROR...) that specifies the level of CloudWatch's logger. By default is INFO.
  * levelCloudWinston : String ('error', 'warn', 'debug'...) that specifies the level of Winston's logger.
  * dimensions : Array of JSON Array for adding extra dimensions in each metric data in CloudWatch. Each dimension has included the corresponding level. Each array of array contains JSON with the following fields:
    ** Name : String that represents the name of the dimension
	** Value : String that represents the value of the dimension
	** Type : (Optionally) String that represents the type of the dimension to generate. 
	   This can be the constant allowed AUTO (you can access to this constant through the module), and it represents that the Value must be generate internally. 
	   At present, only the instance ID can be generate automatically, and for that, you must specify in the Value the class constant INSTANCE.  
  * (other parameters necessary  from instance AWS as private key (to see AWS's doc)).

Methods extra to Winston's methods:
  * loadLogger : 
      @argument options : JSON
      Set the options parameter to the logger. The field options.levelCloudWatch is the level 
      of CloudWatch's logger and options.levelWinston is the level of Winston's logger


## Usage
```javascript
var CloudWatchWinstonWrapper = require('cloudwatch-winston-wrapper');

// First param constructor: namespace from the metrics
// Second param constructor: JSON with the configuration of CloudWatch AWS (region, keys...)
// In this example, we put extra dimensions in each metric data. It will generate four dimensions for each point set in CloudWatch. That dimensions will be: 
// * level, MetricName // By default
// * level, instance, MetricName // By default
// * level, instance, process // Extra
// * level, PID // Extra

var logger = new CloudWatchWinstonWrapper({namespace: "NameSpaceDevelopment", region: "eu-west-1", levelCloudWatch: CloudWatchWinstonWrapper.DEBUG, levelWinston: 'info', 
dimensions: [[{Name: "instance", Value: CloudWatchWinstonWrapper.INSTANCE, Type: CloudWatchWinstonWrapper.AUTO}, {Name: "process", Value: "processName"}], [{Name: "PID", Value: "1024"}]] });

logger.remove(logger.transports.Console);
logger.add(logger.transports.File, { filename: __dirname + "/fileLogs.log", json: false });

logger.info("This is a logger that it put two metric of level INFO in CloudWatch, and it write this in the file 'fileLogs.log' ");

```

## Installing

Via [npm](http://github.com/isaacs/npm):

```bash
npm install cloudwatch-winston-wrapper
```

Via git:

```bash
git clone https://github.com/touchvie/cloudwatch-winston-wrapper.git
```