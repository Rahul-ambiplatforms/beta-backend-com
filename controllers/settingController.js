const mqtt = require('mqtt');
const commonConfig = require('./script/commonConfig');
const appSettings = require('./script/appsettings');
const { VUtil_decodeGetConfigMsg, VUtil_encodeMsgHeader, VUtil_decodeMsgHeader, VUtil_getStreamId, VUtil_encodeMsg } = require('./script/vutil');

const brokerUrl = 'tcp://pro.ambicam.com:1883'; // Replace with your MQTT broker's URL
// let topic = generateRandomTopic(); // MQTT topic
let gmyId = null;
let JsonString = null;
let device = null
// MQTT client options
// const mqttOptions = {
//   clientId: topic, // Unique client ID
// };

  function generateRandomTopic() {
    const topicPrefix = 'webPc-';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += Math.floor(Math.random() * 10).toString();
    }
    return topicPrefix + randomPart;
  }
  function processGetConfigMsg(payload, offset, len) {
    // Assuming VUtil_decodeGetConfigMsg function is available
    let appSettings = VUtil_decodeGetConfigMsg(payload, offset, len);
    strwifi = appSettings.nwInfo.networktype;
    // appSettings 
    // invokeMessage(appSettings);
  
    return appSettings;
  
  }

  class MqttPayload {ss
    constructor(buffer) {
      this.TrimmedBuffer = buffer
      this._offset = 0
      this._payload = buffer
    }
  }
  
  class MQTTMessage {
    constructor(srcId, dstId, msgType, msgLen, msg) {
      this.srcId = srcId || 844;
      this.dstId = dstId || 0;
      this.msgType = msgType || 6;
      this.msgLen = msgLen || 0;
      this.msg = msg || [];
    }
  }




async function getsetting(req, res) {
    try {
        const deviceId = req.body.deviceId;
        device = deviceId
        if (!deviceId) {
          return res.status(400).json({ error: 'Message is required' });
        }
        topic = generateRandomTopic();
        const mqttOptions = {
          clientId: topic,
        };
         // Create a new MQTT client for each API call
          const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

          // MQTT client connection event handler
          mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');

          // Subscribe to the MQTT topic
          mqttClient.subscribe('vmukti/VCam1_1/rx/' + topic, (err) => {
            if (!err) {
              console.log(`Subscribed to ${'vmukti/VCam1_1/rx/' + topic}`);
            }
          });
        });


        gmyId = VUtil_getStreamId(topic);
        let request = "<uuid name=" + deviceId + " >"
        let requestLen = request.length + 1;
        const ArrayBuffer = [requestLen + 16]
        let msg = new MQTTMessage();
        msg.dstId = 0;
        msg.msg = null;
        msg.msgLen = requestLen;
        msg.msgType = commonConfig.MSG_TYPE_GET_CONFIG;
        msg.srcId = gmyId;
      
        let offset = VUtil_encodeMsgHeader(ArrayBuffer, msg);
    
      
        for (let i = 0; i < request.length; i++) {
          ArrayBuffer[offset++] = request.charCodeAt(i);
        }
        // console.log('ArrayBuffer:', ArrayBuffer);
        ArrayBuffer[offset++] = 0;
      
        let payload = new MqttPayload(ArrayBuffer);
        payload = Buffer.from(payload.TrimmedBuffer);
      
        // Publish the message to the MQTT topic
        mqttClient.publish('vmukti/VCam1_1/tx/' + topic, payload, (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to publish message' });
          }
      
        });
        mqttClient.on('message', (mqttTopic, message) => {
          let buffer = Buffer.from(message);
          let Mqttmessage = VUtil_decodeMsgHeader(buffer);
          let appSettings = processGetConfigMsg(buffer, 16, Mqttmessage.msgLen)
          JsonString = appSettings
          res.status(200).json({ 'appSettings': appSettings });
          mqttClient.end();
        });
      

          // Handle MQTT client errors
        mqttClient.on('error', (error) => {
          console.error('MQTT client error:', error);
        });
        
        // Gracefully close the MQTT client on process exit
        process.on('SIGINT', () => {
          mqttClient.end();
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
          console.error('Uncaught exception:', err);
          mqttClient.end();
        });
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
          console.error('Unhandled Rejection at:', promise, 'reason:', reason);
          mqttClient.end();
        });

    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).json({ error: 'Proxy Error: Unable to fetch the requested resource.' });
    }
  }




async function setsetting(req, res) {
    try {
        const cfg = req.body.appSettings;

        if (!cfg) {
          return res.status(400).json({ error: 'Message is required' });
        }
      
        topic = generateRandomTopic();
        const mqttOptions = {
          clientId: topic,
        };        
        const mqttClient = mqtt.connect(brokerUrl, mqttOptions);
        mqttClient.on('connect', () => {
          console.log('Connected to MQTT broker');
      
          // Subscribe to the MQTT topic
          mqttClient.subscribe('vmukti/VCam1_1/rx/' + topic, (err) => {
            if (!err) {
              console.log(`Subscribed to ${'vmukti/VCam1_1/rx/' + topic}`);
            }
          });
        });

        // MQTT client connection event handler
        mqttClient.on('connect', () => {
          console.log('Connected to MQTT broker For Set');

          if (JsonString !== null && deviceId === JsonString.uuid) {
            console.log("matched")
            topic = generateRandomTopic();
            gmyId = VUtil_getStreamId(topic);
            // appSettings.timeCfg.timeZone = timeZone;
            let cfg = appSettings;
            cfg.uuid = JsonString.uuid;
            cfg.grUuid = JsonString.grUuid;
            cfg.streamCfg.enabled = JsonString.streamCfg.enabled;
            cfg.streamCfg.enableAudio = JsonString.streamCfg.enableAudio;
            cfg.streamCfg.publishUrl = JsonString.streamCfg.publishUrl;
            cfg.streamCfg.mqttUrl = JsonString.streamCfg.mqttUrl;
            cfg.streamCfg.enableTelnet = JsonString.streamCfg.enableTelnet;
            cfg.streamCfg.telnetUrl = JsonString.streamCfg.telnetUrl;
            cfg.streamCfg.isHd = JsonString.streamCfg.isHd;
            cfg.streamCfg.fwUpdtTo = JsonString.streamCfg.fwUpdtTo;
        
            cfg.timeCfg.time = JsonString.timeCfg.time;
            cfg.timeCfg.timeZone = JsonString.timeCfg.timeZone;
            cfg.timeCfg.tz = JsonString.timeCfg.tz;
            cfg.timeCfg.dstmode = JsonString.timeCfg.dstmode;
            cfg.timeCfg.autoupdate = JsonString.timeCfg.autoupdate;
            cfg.timeCfg.autoupdatetzonvif = JsonString.timeCfg.autoupdatetzonvif;
            cfg.timeCfg.ntpserver = JsonString.timeCfg.ntpserver;
            cfg.timeCfg.ntpinterval = JsonString.timeCfg.ntpinterval;
            cfg.timeCfg.ntpenable = JsonString.timeCfg.ntpenable;
        
            cfg.emailCfg.emailserver = JsonString.emailCfg.emailserver;
            cfg.emailCfg.emailport = JsonString.emailCfg.emailport;
            cfg.emailCfg.ssl = JsonString.emailCfg.ssl;
            cfg.emailCfg.logintype = JsonString.emailCfg.logintype;
            cfg.emailCfg.emailusername = JsonString.emailCfg.emailusername;
            cfg.emailCfg.emailpassword = JsonString.emailCfg.emailpassword;
            cfg.emailCfg.from = JsonString.emailCfg.from;
            cfg.emailCfg.to = JsonString.emailCfg.to;
            cfg.emailCfg.subject = JsonString.emailCfg.subject;
            cfg.emailCfg.text = JsonString.emailCfg.text;
            cfg.emailCfg.attatchment = JsonString.emailCfg.attatchment;
        
            cfg.videoCh011.bps = JsonString.videoCh011.bps;
            cfg.videoCh011.fps = JsonString.videoCh011.fps;
            cfg.videoCh011.gop = JsonString.videoCh011.gop;
            cfg.videoCh011.brmode = JsonString.videoCh011.brmode;
            cfg.videoCh011.piclevel = JsonString.videoCh011.piclevel;
            cfg.videoCh011.fixqplevel = JsonString.videoCh011.fixqplevel;
            cfg.videoCh011.width = JsonString.videoCh011.width;
            cfg.videoCh011.height = JsonString.videoCh011.height;
            cfg.videoCh011.bmainstream = JsonString.videoCh011.bmainstream;
            cfg.videoCh011.bfield = JsonString.videoCh011.bfield;
        
            cfg.videoCh012.bps = JsonString.videoCh012.bps;
            cfg.videoCh012.fps = JsonString.videoCh012.fps;
            cfg.videoCh012.gop = JsonString.videoCh012.gop;
            cfg.videoCh012.brmode = JsonString.videoCh012.brmode;
            cfg.videoCh012.piclevel = JsonString.videoCh012.piclevel;
            cfg.videoCh012.fixqplevel = JsonString.videoCh012.fixqplevel;
            cfg.videoCh012.width = JsonString.videoCh012.width;
            cfg.videoCh012.height = JsonString.videoCh012.height;
            cfg.videoCh012.bmainstream = JsonString.videoCh012.bmainstream;
            cfg.videoCh012.bfield = JsonString.videoCh012.bfield;
        
            cfg.videoCh013.bps = JsonString.videoCh013.bps;
            cfg.videoCh013.fps = JsonString.videoCh013.fps;
            cfg.videoCh013.gop = JsonString.videoCh013.gop;
            cfg.videoCh013.brmode = JsonString.videoCh013.brmode;
            cfg.videoCh013.piclevel = JsonString.videoCh013.piclevel;
            cfg.videoCh013.fixqplevel = JsonString.videoCh013.fixqplevel;
            cfg.videoCh013.width = JsonString.videoCh013.width;
            cfg.videoCh013.height = JsonString.videoCh013.height;
            cfg.videoCh013.bmainstream = JsonString.videoCh013.bmainstream;
            cfg.videoCh013.bfield = JsonString.videoCh013.bfield;
        
            cfg.displayCfg.hue = JsonString.displayCfg.hue;
            cfg.displayCfg.brightness = JsonString.displayCfg.brightness;
            cfg.displayCfg.saturation = JsonString.displayCfg.saturation;
            cfg.displayCfg.contrast = JsonString.displayCfg.contrast;
            cfg.displayCfg.ircutmode = JsonString.displayCfg.ircutmode;
        
            cfg.osdCfg.rgncnt = JsonString.osdCfg.rgncnt;
            cfg.osdCfg.fontsize = JsonString.osdCfg.fontsize;
            cfg.osdCfg.x_0 = JsonString.osdCfg.x_0;
            cfg.osdCfg.y_0 = JsonString.osdCfg.y_0;
            cfg.osdCfg.w_0 = JsonString.osdCfg.w_0;
            cfg.osdCfg.h_0 = JsonString.osdCfg.h_0;
            cfg.osdCfg.cont_0 = JsonString.osdCfg.cont_0;
            cfg.osdCfg.show_0 = JsonString.osdCfg.show_0;
            cfg.osdCfg.x_1 = JsonString.osdCfg.x_1;
            cfg.osdCfg.y_1 = JsonString.osdCfg.y_1;
            cfg.osdCfg.w_1 = JsonString.osdCfg.w_1;
            cfg.osdCfg.h_1 = JsonString.osdCfg.h_1;
        
            cfg.rectime = JsonString.rectime;
        
            cfg.recordCh011.startTimerRec = JsonString.recordCh011.startTimerRec;
            cfg.recordCh011.startManualRec = JsonString.recordCh011.startManualRec;
            cfg.recordCh011.singlefiletime = JsonString.recordCh011.singlefiletime;
            cfg.recordCh011.enable = JsonString.recordCh011.enable;
            cfg.recordCh011.filepath = JsonString.recordCh011.filepath;
        
            cfg.recordCh012.startTimerRec = JsonString.recordCh012.startTimerRec;
            cfg.recordCh012.startManualRec = JsonString.recordCh012.startManualRec;
            cfg.recordCh012.singlefiletime = JsonString.recordCh012.singlefiletime;
            cfg.recordCh012.enable = JsonString.recordCh012.enable;
            cfg.recordCh012.filepath = JsonString.recordCh012.filepath;
        
            cfg.recordSch.etm = JsonString.recordSch.etm;
            cfg.recordSch.enWorkday = JsonString.recordSch.enWorkday;
            cfg.recordSch.enWeekend = JsonString.recordSch.enWeekend;
            cfg.recordSch.enSun = JsonString.recordSch.enSun;
            cfg.recordSch.enMon = JsonString.recordSch.enMon;
            cfg.recordSch.enTue = JsonString.recordSch.enTue;
            cfg.recordSch.enWed = JsonString.recordSch.enWed;
            cfg.recordSch.enThu = JsonString.recordSch.enThu;
            cfg.recordSch.enFri = JsonString.recordSch.enFri;
            cfg.recordSch.enSat = JsonString.recordSch.enSat;
            cfg.recordSch.workday = JsonString.recordSch.workday;
            cfg.recordSch.weekend = JsonString.recordSch.weekend;
            cfg.recordSch.sun = JsonString.recordSch.sun;
            cfg.recordSch.mon = JsonString.recordSch.mon;
            cfg.recordSch.tue = JsonString.recordSch.tue;
            cfg.recordSch.wed = JsonString.recordSch.wed;
            cfg.recordSch.thu = JsonString.recordSch.thu;
            cfg.recordSch.fri = JsonString.recordSch.fri;
            cfg.recordSch.sat = JsonString.recordSch.sat;
        
            cfg.imageCfg.devno = JsonString.imageCfg.devno;
            cfg.imageCfg.chn = JsonString.imageCfg.chn;
            cfg.imageCfg.flip = JsonString.imageCfg.flip;
            cfg.imageCfg.mirror = JsonString.imageCfg.mirror;
            cfg.imageCfg.wdr = JsonString.imageCfg.wdr;
        
            cfg.PtzCfg.leftPos = JsonString.PtzCfg.leftPos;
            cfg.PtzCfg.rightPos = JsonString.PtzCfg.rightPos;
            cfg.PtzCfg.upPos = JsonString.PtzCfg.upPos;
            cfg.PtzCfg.downPos = JsonString.PtzCfg.downPos;
            cfg.PtzCfg.farPos = JsonString.PtzCfg.farPos;
            cfg.PtzCfg.nearPos = JsonString.PtzCfg.nearPos;
            cfg.PtzCfg.currPanPos = JsonString.PtzCfg.currPanPos;
            cfg.PtzCfg.currTiltPos = JsonString.PtzCfg.currTiltPos;
            cfg.PtzCfg.currZoomPos = JsonString.PtzCfg.currZoomPos;
        
            cfg.mdCfg.md_email_switch = JsonString.mdCfg.md_email_switch;
            cfg.mdCfg.md_snap_switch = JsonString.mdCfg.md_snap_switch;
            cfg.mdCfg.md_emailsnap_switch = JsonString.mdCfg.md_emailsnap_switch;
            cfg.mdCfg.md_ftpsnap_switch = JsonString.mdCfg.md_ftpsnap_switch;
            cfg.mdCfg.md_record_switch = JsonString.mdCfg.md_record_switch;
            cfg.mdCfg.md_ftprec_switch = JsonString.mdCfg.md_ftprec_switch;
            cfg.mdCfg.md_ioalmdo_switch = JsonString.mdCfg.md_ioalmdo_switch;
            cfg.mdCfg.etm = JsonString.mdCfg.etm;
            cfg.mdCfg.workday = JsonString.mdCfg.workday;
            cfg.mdCfg.weekend = JsonString.mdCfg.weekend;
            cfg.mdCfg.md_interval = JsonString.mdCfg.md_interval;
            cfg.mdCfg.MdbEnable = JsonString.mdCfg.MdbEnable;
            cfg.mdCfg.MdSensitiValue = JsonString.mdCfg.MdSensitiValue;
            cfg.mdCfg.MDThresholdValue = JsonString.mdCfg.MDThresholdValue;
            cfg.mdCfg.MdInterval = JsonString.mdCfg.MdInterval;
            cfg.mdCfg.MdRegion = JsonString.mdCfg.MdRegion;
            cfg.mdCfg.md_alarm = JsonString.mdCfg.md_alarm;
            cfg.mdCfg.defend_alarm = JsonString.mdCfg.defend_alarm;
            cfg.mdCfg.tc_alarm = JsonString.mdCfg.tc_alarm;
        
            cfg.devInfo.hwVer = JsonString.devInfo.hwVer;
            cfg.devInfo.swVer = JsonString.devInfo.swVer;
            cfg.devInfo.provisioningVer = JsonString.devInfo.provisioningVer;
            cfg.devInfo.publisherVer = JsonString.devInfo.publisherVer;
            cfg.devInfo.serialNo = JsonString.devInfo.serialNo;
        
            cfg.nwInfo.networktype = JsonString.nwInfo.networktype;
            cfg.nwInfo.macaddress = JsonString.nwInfo.macaddress;
            cfg.nwInfo.ip = JsonString.nwInfo.ip;
            cfg.nwInfo.netmask = JsonString.nwInfo.netmask;
            cfg.nwInfo.gateway = JsonString.nwInfo.gateway;
            cfg.nwInfo.sdnsip = JsonString.nwInfo.sdnsip;
            cfg.nwInfo.fdnsip = JsonString.nwInfo.fdnsip;
        
        
            console.log('cfg:', cfg);
        
            let msgString = VUtil_encodeMsg(cfg);
            console.log('msgString:', msgString);
        
            let arrayBuffer = [msgString.length + 16]
        
            let msg = new MQTTMessage();
            msg.dstId = 0;
            msg.msg = null;
            msg.msgLen = msgString.length;
            msg.msgType = 2;
            msg.srcId = gmyId;
        
            let offset = VUtil_encodeMsgHeader(arrayBuffer, msg);
        
            for (let i = 0; i < msgString.length; i++) {
              arrayBuffer[offset++] = msgString.charCodeAt(i);
            }
        
            let payload = new MqttPayload(arrayBuffer);
        
            payload = Buffer.from(payload.TrimmedBuffer);
            // Publish the message to the MQTT topic
            mqttClient.publish('vmukti/VCam1_1/tx/' + topic, payload, (err) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to publish message' });
              } else {
                return res.status(200).json({ message: 'Successfully published message' });
              }
            });
            mqttClient.end();
          }
  
          mqttClient.end();
        // Subscribe to the MQTT topic
        // mqttClient.subscribe('vmukti/VCam1_1/rx/' + topic, (err) => {
        //   if (!err) {
        //     console.log(`Subscribed to ${'vmukti/VCam1_1/rx/' + topic}`);
        //   }
        // });
        });
        topic = generateRandomTopic();
        gmyId = VUtil_getStreamId(topic);
    
        let msgString = VUtil_encodeMsg(cfg);
        let arrayBuffer = [msgString.length + 16]
    
        let msg = new MQTTMessage();
        msg.dstId = 0;
        msg.msg = null;
        msg.msgLen = msgString.length;
        msg.msgType = 2;
        msg.srcId = gmyId;
    
        let offset = VUtil_encodeMsgHeader(arrayBuffer, msg);
    
        for (let i = 0; i < msgString.length; i++) {
          arrayBuffer[offset++] = msgString.charCodeAt(i);
        }
    
        let payload = new MqttPayload(arrayBuffer);
    
        payload = Buffer.from(payload.TrimmedBuffer);     

        
        mqttClient.publish('vmukti/VCam1_1/tx/' + topic, payload, (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to publish message' });
          } else {
            return res.status(200).json({ 'appSettings': cfg });
          }
        });

        mqttClient.on('message', (mqttTopic, message) => {
          let buffer = Buffer.from(message);
          let Mqttmessage = VUtil_decodeMsgHeader(buffer);
          let appSettings = processGetConfigMsg(buffer, 16, Mqttmessage.msgLen)
          JsonString = appSettings
          res.status(200).json({ 'appSettings': appSettings });
          mqttClient.end();
        });
        
          // Handle MQTT client errors
        mqttClient.on('error', (error) => {
          console.error('MQTT client error:', error);
        });
        
        // Gracefully close the MQTT client on process exit
        process.on('SIGINT', () => {
          mqttClient.end();
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
          console.error('Uncaught exception:', err);
          mqttClient.end();
        });
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
          console.error('Unhandled Rejection at:', promise, 'reason:', reason);
          mqttClient.end();
        });

    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).json({ error: 'Proxy Error: Unable to fetch the requested resource.' });
    }
  }


  async function setsettingInternal(appSettings) {
    try {

        if (!appSettings) {
          return res.status(400).json({ error: 'Message is required' });
        }
      
        topic = generateRandomTopic();
        const mqttOptions = {
          clientId: topic,
        };        
        const mqttClient = mqtt.connect(brokerUrl, mqttOptions);

        // MQTT client connection event handler
        mqttClient.on('connect', () => {
            topic = generateRandomTopic();
            gmyId = VUtil_getStreamId(topic);
            let msgString = VUtil_encodeMsg(appSettings);
        
            let arrayBuffer = [msgString.length + 16]
        
            let msg = new MQTTMessage();
            msg.dstId = 0;
            msg.msg = null;
            msg.msgLen = msgString.length;
            msg.msgType = 2;
            msg.srcId = gmyId;
        
            let offset = VUtil_encodeMsgHeader(arrayBuffer, msg);
        
            for (let i = 0; i < msgString.length; i++) {
              arrayBuffer[offset++] = msgString.charCodeAt(i);
            }
        
            let payload = new MqttPayload(arrayBuffer);
        
            payload = Buffer.from(payload.TrimmedBuffer);
            // Publish the message to the MQTT topic
            mqttClient.publish('vmukti/VCam1_1/tx/' + topic, payload, (err) => {
              if (err) {
                return ({ error: 'Failed to publish message' });
              } else {
                return ({ message: 'Successfully published message' });
              }
            });
  
          mqttClient.end();

        });
        
    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).json({ error: 'Proxy Error: Unable to fetch the requested resource.' });
    }
  }

  module.exports = {
    getsetting,
    setsetting,
    setsettingInternal
  };