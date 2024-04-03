const cameraDetails = require("../models/cameraDetails");
const AiCamera = require("../models/aicamera");
const cameraList = require("../models/cameraList");
const cameraSubscriberInfo = require("../models/cameraSubscriberInfo");
const cameraSharingInfo = require("../models/CameraSharingInfo")
const customer = require("../models/userModel")
const Camera = require("../models/camera");
const CVRPlan = require("../models/CVRPlan");
const url_list = require("../models/url_list");
const streamdetails = require("../models/streamdetails");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const {setsettingInternal} = require('./settingController')
const { v4: uuidv4 } = require('uuid');
const sendEmail = require("../utils/sendEmail");
const camerahistory = require("../models/camerahistory")

function getSettingDefault(cameraurl, email, deviceID, cameraname) {
  var appSettings = {
    uuid: deviceID,
    grUuid: email,
    streamCfg: {
      enabled: 1,
      enableAudio: 1,
      enableTelnet: 0,
      isHd: 0,
      publishUrl: cameraurl,
      mqttUrl: "tcp://pro.ambicam.com:1883", // Or use ConfigurationManager.AppSettings["mqttserver"] to get the value.
      telnetUrl: "telnet.ambicam.com:8888",
      fwUpdtTo: "a0",
    },
    timeCfg: {
      dstmode: 0,
      autoupdate: 1,
      autoupdatetzonvif: 0,
      ntpinterval: 1,
      ntpenable: 1,
      time: "00000000",
      timeZone: "Asia/Calcutta",
      tz: "STD:+5:30",
      ntpserver: "time.ambicam.com",
    },
    emailCfg: {
      emailserver: "smtp.gmail.com",
      emailusername: "alerts@ambicam.com",
      emailpassword: "v|c{azo)>?6",
      from: "alerts@ambicam.com",
      to: email,
      subject: "Ambicam Motion Alert",
      text: "This is an ambicam email alert",
      attatchment: "",
      emailport: 465,
      ssl: 1,
      logintype: 1,
    },
    videoCh011: {
      bps: 512,
      fps: 20,
      gop: 60,
      brmode: 2,
      piclevel: 1,
      fixqplevel: 1,
      width: 1280,
      height: 720,
      bmainstream: 1,
      bfield: 0,
    },
    videoCh012: {
      bps: 256,
      fps: 15,
      gop: 60,
      brmode: 2,
      piclevel: 1,
      fixqplevel: 1,
      width: 640,
      height: 360,
      bmainstream: 1,
      bfield: 0,
    },
    videoCh013: {
      bps: 64,
      fps: 5,
      gop: 15,
      brmode: 2,
      piclevel: 4,
      fixqplevel: 4,
      width: 320,
      height: 180,
      bmainstream: 1,
      bfield: 0,
    },
    displayCfg: {
      hue: 50,
      brightness: 50,
      saturation: 50,
      contrast: 50,
      ircutmode: 1,
    },
    osdCfg: {
      rgncnt: 2,
      fontsize: 1,
      x_0: 928,
      y_0: 32,
      w_0: 304,
      h_0: 32,
      cont_0: "YYYY-MM-DD hh:mm:ss",
      show_0: 1,
      x_1: 64,
      y_1: 32,
      w_1: 112,
      h_1: 32,
      cont_1: cameraname,
      show_1: 1,
    },
    recordCh011: {
      startTimerRec: 0,
      startManualRec: 1,
      singlefiletime: 300,
      enable: 0,
      filepath: "/bin/vs/sd/rec",
    },
    recordCh012: {
      startTimerRec: 0,
      startManualRec: 0,
      singlefiletime: 60,
      enable: 0,
      filepath: "/bin/vs/sd/rec",
    },
    recordSch: {
      etm: 0,
      enWorkday: 0,
      enWeekend: 0,
      enSun: 0,
      enMon: 0,
      enTue: 0,
      enWed: 0,
      enThu: 0,
      enFri: 0,
      enSat: 0,
      workday: [0, -1, 0, -1, 0, -1],
      weekend: [0, -1, 0, -1, 0, -1],
      sun: [0, -1, 0, -1, 0, -1],
      mon: [0, -1, 0, -1, 0, -1],
      tue: [0, -1, 0, -1, 0, -1],
      wed: [0, -1, 0, -1, 0, -1],
      thu: [0, -1, 0, -1, 0, -1],
      fri: [0, -1, 0, -1, 0, -1],
      sat: [0, -1, 0, -1, 0, -1]
    },
    imageCfg: {
      devno: 0,
      chn: 0,
      flip: 0,
      mirror: 0,
      wdr: 1,
    },
    mdCfg: {
      md_email_switch: 0,
      md_snap_switch: 1,
      md_emailsnap_switch: 0,
      md_ftpsnap_switch: 1,
      md_record_switch: 0,
      md_ftprec_switch: 0,
      md_ioalmdo_switch: 0,
      etm: 2,
      workday: 0,
      weekend: 0,
      md_interval: 30,
      MdbEnable: 0,
      MdSensitiValue: 1,
      MDThresholdValue: 10,
      MdInterval: 30,
      MdRegion: [
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        0, 0,
      ],
      md_alarm: 0,
      defend_alarm: 0,
      tc_alarm: 0,
    },
    devInfo: {
      hwVersion: 1,
      swVer: 1,
      provisioningVer: 1,
      publisherVer: 1,
      serialNo: "VVVIPC1504173580HSDS-j0TsuixTi4l",
      sdStatus: "",
      sdSize: 0,
      sdleftSize: 0
    },
    nwInfo: {
      networktype: "NONE",
      macaddress: "00:00:00:00:00:00",
      ip: "0.0.0.0",
      netmask: "0.0.0.0",
      gateway: "0.0.0.0",
      sdnsip: "0.0.0.0",
      fdnsip: "0.0.0.0",
    },
    PtzCfg: {
      leftPos: 595,
      rightPos: 0,
      upPos: 0,
      downPos: 0,
      farPos: 0,
      nearPos: 0,
      currTiltPos: 0,
      currPanPos: 0,
      currZoomPos: 0,
    },
    rectime: 30,
  };

  return appSettings;
}


// get users Camera
exports.getAllCameras = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = req.query.resultPerPage;
  const page = req.query.page || 1;
  const shareId = req.query.shareId;
  const contentId = req.query.contentId;

    if(shareId && contentId){
      let sharedcam = await cameraSharingInfo.findOne({cameraid:contentId})
      sharedcam._isallow = 1;
      sharedcam.save();
      console.log(sharedcam)
    }
  try {
    const cameralists = await cameraDetails.find({ customerid: req.query.customerid });
    
    const totalItems = cameralists.length;
    const totalPages = Math.ceil(totalItems / resultPerPage);

    const startIndex = (page - 1) * resultPerPage;
    const endIndex = page * resultPerPage;

    const paginatedCameralists = cameralists.slice(startIndex, endIndex);

    // Create an array of promises to fetch related data
    const promises = paginatedCameralists.map(async (camera) => {
      const subdevice = await cameraSubscriberInfo.findOne({ id: camera.subid });
      const cameraListData = await cameraList.findOne({ cameraID: subdevice.subdeviceid });
      const urlData = await url_list.findOne({ id: subdevice.urlid });
      const cvrPlanData = await CVRPlan.findOne({ id: subdevice.cvrplanid });
      const streamnameData = await streamdetails.findOne({ cameraid: camera.cameraid });

      // const uuid = streamnameData.streamname; // Assuming 'uuid' is the field name
      // const buffer = uuid.buffer;
      // const uuidString = buffer.toString('hex');
      // const uuidWithoutHyphens = uuidString;
      // const formattedUUID = `${uuidWithoutHyphens.slice(0, 8)}-${uuidWithoutHyphens.slice(8, 12)}-${uuidWithoutHyphens.slice(12, 16)}-${uuidWithoutHyphens.slice(16, 20)}-${uuidWithoutHyphens.slice(20)}`;

      return {
        cameraid: camera.cameraid,
        customerid: camera.customerid,
        cameraname: camera.name,
        cameraurl: urlData.streamurl,
        createdDate: camera.created_date,
        deviceid: cameraListData ? cameraListData.cameraID : "null",
        is360:cameraListData? cameraListData.is360 : "null",
        isfhd: camera.isfhd,
        islive: streamnameData ? streamnameData.status : 0,
        isnumplate:cameraListData ? cameraListData.isnumplate : "null",
        isptz: camera.isptz,
        plandays: cvrPlanData.plandays,
        plandisplayname: cvrPlanData.plan_name,
        planname: cvrPlanData.plan_name,
        streamname: streamnameData.streamname,
      };
    });

    // Execute all promises in parallel
    const jsonData = await Promise.all(promises);

    res.status(200).json({
      success: true,
      totalItems,
      totalPages,
      currentPage: page,
      cameras: jsonData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


exports.getShareCameras = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = req.query.resultPerPage;
  const page = req.query.page || 1;
  const sharinginfo = await cameraSharingInfo.find({receiveremail: req.query.email });
  
  // for (const info of sharinginfo) {
  //   if (info._isallow == 0) {   
  //     throw new Error("You are not allowed to access this data");
  //   }
  // }
  try {
   
    // Extract customerIDs from the documents
    const cameraid = sharinginfo.map((camera) => camera.cameraid);
    const cameralists = await cameraDetails.find({ cameraid: { $in: cameraid } });

    const totalItems = cameralists.length;
    const totalPages = Math.ceil(totalItems / resultPerPage);

    const startIndex = (page - 1) * resultPerPage;
    const endIndex = page * resultPerPage;

    const paginatedCameralists = cameralists.slice(startIndex, endIndex);

    // Create an array of promises to fetch related data
    const promises = paginatedCameralists.map(async (camera) => {
      const subdevice = await cameraSubscriberInfo.findOne({ id: camera.subid });
      const cameraListData = await cameraList.findOne({ cameraID: subdevice.subdeviceid });
      const urlData = await url_list.findOne({ id: subdevice.urlid });
      const cvrPlanData = await CVRPlan.findOne({ id: subdevice.cvrplanid });
      const streamnameData = await streamdetails.findOne({ cameraid: camera.cameraid });

      // const uuid = streamnameData.streamname; // Assuming 'uuid' is the field name
      // const buffer = uuid.buffer;
      // const uuidString = buffer.toString('hex');
      // const uuidWithoutHyphens = uuidString;
      // const formattedUUID = `${uuidWithoutHyphens.slice(0, 8)}-${uuidWithoutHyphens.slice(8, 12)}-${uuidWithoutHyphens.slice(12, 16)}-${uuidWithoutHyphens.slice(16, 20)}-${uuidWithoutHyphens.slice(20)}`;

      return {
        cameraid: camera.cameraid,
        customerid: camera.customerid,
        cameraname: camera.name,
        cameraurl: urlData.streamurl,
        createdDate: camera.created_date,
        deviceid: cameraListData.cameraID,
        is360: cameraListData.is360,
        isfhd: camera.isfhd,
        islive: streamnameData.status,
        isnumplate: cameraListData.isnumplate,
        isptz: camera.isptz,
        plandays: cvrPlanData.plandays,
        plandisplayname: cvrPlanData.plan_name,
        planname: cvrPlanData.plan_name,
        streamname: streamnameData.streamname,
      };
    });

    // Execute all promises in parallel
    const jsonData = await Promise.all(promises);

    res.status(200).json({
      success: true,
      totalItems,
      totalPages,
      currentPage: page,
      cameras: jsonData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//for user
exports.addCamera = catchAsyncErrors(async (req, res, next) => {
  const name = req.body.name;
  const cameraID = req.body.cameraID;
  const customerid = req.body.customerid;
  const email = req.body.email;

  // const camera = await cameraDetails.find({ cameraid: cameraID });
  const camera = await cameraSubscriberInfo.findOne({ subdeviceid: cameraID });

  const urlid = await url_list.findOne({ id: camera.urlid });

  const user = await customer.findOne({ customerid: customerid });

  
  if (!camera) {
    return next(new ErrorHander("Camera not found", 404));
  }
  const cameraDetail = await cameraDetails.findOne({ subid: camera.id });

  if (cameraDetail) {
    return next(new ErrorHander("Camera already exists", 400));
  }


  let cameraid = uuidv4();
  cameraid = cameraid.toUpperCase();
  let created_date = Date.now();
  const streamname = uuidv4();


  const product = await cameraDetails.create({
    cameraid,
    customerid,
    name,
    created_date,
    subid: camera.id,
  });

  const streamDetails = await streamdetails.create({
    cameraid:cameraid, // Use the same cameraid as the newly created camera
    streamname: streamname, // Set your stream name here
    status: 0,               // Add other relevant fields
    StatusDate:Date.now(),
    alertDate:Date.now(),
  });

  if (!streamDetails) {
    return next(new ErrorHander("Failed to create streamdetails", 500));
  }

  // let id = getNextSequentialID()
  const highestIdRecord = await camerahistory.findOne().sort({ id: -1 });
  // Find the highest `id` value from the existing cameraList records

  // Calculate the next `id` value
  const id = highestIdRecord ? highestIdRecord.id + 1 : 1;

  const history = await camerahistory.create({
    id: id,
    email: email,
    device_id: cameraID,
    serverurl: urlid.streamurl,
    streamname: streamname,
    create_camera: Date.now(),
    delete_camera: ''
  })

  user.isactive = 1;
  await user.save();

  const appSettings = getSettingDefault("rtmp://" + urlid.streamurl + streamname, email, cameraID, "Ambicam " + name);
  
  setsettingInternal(appSettings);
  res.status(201).json({
    success: true,
    product,
  });
});

//for user
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const cameraid = req.query.id;
  const deviceid = req.query.deviceid;
  // console.log("cameraid", cameraid);

  const existCamera = await cameraDetails.findOne({ cameraid: cameraid })

  if (!existCamera) {
    return next(new ErrorHander("Camera not found", 404));
  }

  // Use the remove method on the document itself
  await existCamera.deleteOne();
  
  const streaminfo = await streamdetails.findOne({ cameraid: cameraid });
  if (!streaminfo) {
    return next(new ErrorHander("Camera not found", 404));
  }
  
  // Use the remove method on the document itself
  await streaminfo.deleteOne();

  const history = await camerahistory.findOne({ device_id: deviceid})

  history.delete_camera = Date.now()
  await history.save()

  res.status(200).json("Camera Deleted Successfully");
});


exports.updateCameraname = catchAsyncErrors(async (req, res, next) => {
const cameraname = req.body.name;
const cameraID = req.body.deviceId;
  try {
    const camero = await cameraSubscriberInfo.findOne({ subdeviceid: cameraID });
    if (!camero) {
      return next(new ErrorHander("Camera not found", 404));
    }
  const cameralists = await cameraDetails.findOne({subid: camero.id})
    cameralists.name = cameraname;
    await cameralists.save();

    res.status(200).json({
      success: true,
      cameras: cameralists,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


exports.getSingleCameras = async (cameraid) => {
  try {
    const existCamera = await Camera.findOne({ cameraid });
    return existCamera;
  } catch (error) {
    throw error;
  }
};

let counter = 100000;

exports.ShareThisCamera  = catchAsyncErrors(async (req,res,next) => {
  // Find the highest `id` value from the existing cameraList records
  const highestIdRecord = await cameraSharingInfo.findOne().sort({ id: -1 });

  const id = highestIdRecord ? highestIdRecord.id + 1 : 1;

  // const id = getNextSequentialID();
  const useremail =req.body.useremail;
  const cameraname = req.body.cameraname;
  const cameraid = req.body.cameraid.toUpperCase();
  const customerid = req.body.customerid;
  const receiveremail = req.body.receiveremail;
  const subscribercode = uuidv4();

  const camshare = await cameraSharingInfo.findOne({cameraid:cameraid,receiveremail:receiveremail})
  if (camshare){
    return next(new ErrorHander(`This Camera Is Already Shared With ${receiveremail}`,403))
  }
  
  try{
    const newsharecam = await cameraSharingInfo.create({
      id : id ,
      cameraid : cameraid,
      customerid : customerid,
      receiveremail : receiveremail,
      subscribercode : subscribercode
    })
    const message = `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
        }
  
        h1 {
          color: #007acc;
        }
  
        p {
          font-size: 16px;
        }
  
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
  
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #007acc;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Ambicam Account Verification</h1>
        <p>Hello ${receiveremail},</p>
        <p>You're invited to view ${useremail}'s camera video.</p>
        <p>${useremail} wants you to check out a camera video stream: ${cameraname}</p>
        <a href="https://home.ambicam.com/dashboard/?shareId=${subscribercode}&contentId=${cameraid}">Watch Now</a>
        <p>Best regards,<br>Ambicam Support Team</p>
      </div>
    </body>
  </html>`;

    await sendEmail({
      email: receiveremail,
      subject: `${useremail} wants you to checkout a camera videostream`,
      message:message,
    });

    res.status(200).json({
      success: true,
      message: 'Camera Shared successfully',
    });
  }catch (error) {
    console.error(error);
    next(error);
  }
});

function getNextSequentialID() {
  // Increment the counter and return the new value
  return counter++;
}

exports.DeleteSharedCamera = catchAsyncErrors(async(req,res,next) => {
  const cameraid =req.query.cameraid.toUpperCase();
  const receiveremail = req.query.email;
  const sharedcamera = await cameraSharingInfo.findOne({
    cameraid:cameraid,
    receiveremail:receiveremail,
  });
await sharedcamera.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Shared Camera Deleted successfully',
  });
})

// exports.getAdminCameras = catchAsyncErrors(async (req, res, next) => {
//   const resultPerPage = 20;
//   const page = req.query.page || 1; // Get the page from the request query or default to 1

//   try {
//     const cameralists = await cameraDetails.find();
    
//     const totalItems = cameralists.length;
//     const totalPages = Math.ceil(totalItems / resultPerPage);

//     const startIndex = (page - 1) * resultPerPage;
//     const endIndex = page * resultPerPage;

//     // Slice the array to get the items for the current page
//     const paginatedCameralists = cameralists.slice(startIndex, endIndex);

//     // Create an array of promises to fetch related data for the current page
//     const promises = paginatedCameralists.map(async (camera) => {
//       const subdevice = await cameraSubscriberInfo.findOne({ id: camera.subid });
//       const subdeviceID = subdevice ? subdevice.subdeviceid : null;
//       const cameraListData = await cameraList.findOne({ cameraID: subdeviceID });
//       const urlData = await url_list.findOne({ id: subdevice ? subdevice.urlid : null });
//       const cvrPlanData = await CVRPlan.findOne({ id: subdevice ? subdevice.cvrplanid : null });
//       const streamnameData = await streamdetails.findOne({ cameraid: camera.cameraid });
//       const customeremail = await customer.findOne({customerid:camera.customerid})


//       // let formattedUUID = null;
//       // if (streamnameData) {
//       //   const uuid = streamnameData.streamname; // Assuming 'uuid' is the field name
//       //   const buffer = uuid.buffer;
//       //   const uuidString = buffer.toString('hex');
//       //   const uuidWithoutHyphens = uuidString;
//       //   formattedUUID = `${uuidWithoutHyphens.slice(0, 8)}-${uuidWithoutHyphens.slice(8, 12)}-${uuidWithoutHyphens.slice(12, 16)}-${uuidWithoutHyphens.slice(16, 20)}-${uuidWithoutHyphens.slice(20)}`;
//       // }

//       return {
//         cameraid: camera.cameraid,
//         customerid: camera.customerid,
//         email: customeremail.email,
//         cameraname: camera.name,
//         cameraurl: urlData ? urlData.streamurl : "NULL",
//         createdDate: camera.created_date,
//         deviceid: cameraListData ? cameraListData.cameraID : "NULL",
//         is360: cameraListData ? cameraListData.is360 : "NULL",
//         isfhd: camera.isfhd,
//         islive: streamnameData ? streamnameData.status : "NULL",
//         isnumplate: cameraListData ? cameraListData.isnumplate : "NULL",
//         isptz: camera.isptz,
//         plandays: cvrPlanData ? cvrPlanData.plandays : "NULL",
//         plandisplayname: cvrPlanData ? cvrPlanData.plan_name : "NULL",
//         planname: cvrPlanData ? cvrPlanData.plan_name : "NULL",
//         streamname: streamnameData.streamname,
//       };
//     });

//     // Execute all promises in parallel
//     const jsonData = await Promise.all(promises);

//     res.status(200).json({
//       success: true,
//       totalItems,
//       totalPages,
//       currentPage: page,
//       cameras: jsonData,
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });
// exports.ProUrl = async (cameradid) => {
//   try {
//     const ProUrl = await cameraList.findOne({ cameraID: cameradid });
//     return ProUrl;
//   }
//   catch (error) {
//     throw error;
//   }
// }

// Get Product Details
// exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {

//   const cameraid = req.body.cameraid;

//   const product = await cameraDetails.find({ cameraid: cameraid });

//   if (!product) {
//     return next(new ErrorHander("Product not found", 404));
//   }

//   res.status(200).json({
//     success: true,
//     product,
//   });
// });

exports.addAiCamera = catchAsyncErrors(async (req, res, next) => {
  const cameraid = req.body.cameraid;
  const customerid = req.body.customerid;
  const ai_name = req.body.ai_name;
  const event =req.body.event;
  const rtmp =req.body.rtmp;
  const selectedCamerastream = req.body.selectedCamerastream;
  const existingCamera = await AiCamera.findOne({ cameraid });

  if (existingCamera) {
    return res.status(400).json({
      success: false,
      message: 'A camera with the provided camera already in progress.',
    });
  }
  const aicamera = await AiCamera.create({
    cameraid,
    ai_name,
    customerid,
    event,
    rtmp,
    selectedCamerastream,
    request_date:Date.now(),
  });

  res.status(201).json({
    success: true,
    aicamera,
  });
});


exports.getAiCamera = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = req.query.resultPerPage;
  const page = req.query.page || 1;

  try {
    const aicameralists = await AiCamera.find({ customerid: req.query.customerid });
    const cameraIds = aicameralists.map(aicamera => aicamera.cameraid);
    const totalItems = aicameralists.length;
    const totalPages = Math.ceil(totalItems / resultPerPage);

    const startIndex = (page - 1) * resultPerPage;
    const endIndex = page * resultPerPage;
    const cameralists = await cameraDetails.find({ cameraid: cameraIds });
    const paginatedCameralists = cameralists.slice(startIndex, endIndex);
    // Create an array of promises to fetch related data
    const promises = paginatedCameralists.map(async (camera) => {
   
      const aicamera = aicameralists.find(aicam => aicam.cameraid === camera.cameraid);
      const aistatus = aicamera ? aicamera.ai_status : null;
      const live_status = aicamera ? aicamera.live_status : null;
      const ai_name = aicamera ? aicamera.ai_name : null;
      const subdevice = await cameraSubscriberInfo.findOne({ id: camera.subid });
      const cameraListData = await cameraList.findOne({ cameraID: subdevice.subdeviceid });
      const urlData = await url_list.findOne({ id: subdevice.urlid });
      const cvrPlanData = await CVRPlan.findOne({ id: subdevice.cvrplanid });
      const streamnameData = await streamdetails.findOne({ cameraid: camera.cameraid });
      return {
        Aistatus: aistatus,
        Livestatus: live_status,
        Aimodal: ai_name,
        cameraid: camera.cameraid,
        customerid: camera.customerid,
        cameraname: camera.name,
        cameraurl: urlData.streamurl,
        createdDate: camera.created_date,
        deviceid: cameraListData ? cameraListData.cameraID : "null",
        is360:cameraListData? cameraListData.is360 : "null",
        isfhd: camera.isfhd,
        islive: streamnameData ? streamnameData.status : 0,
        isnumplate:cameraListData ? cameraListData.isnumplate : "null",
        isptz: camera.isptz,
        plandays: cvrPlanData.plandays,
        plandisplayname: cvrPlanData.plan_name,
        planname: cvrPlanData.plan_name,
        streamname: streamnameData.streamname,
      };
    });

    // Execute all promises in parallel
    const jsonData = await Promise.all(promises);

    res.status(200).json({
      success: true,
      totalItems,
      totalPages,
      currentPage: page,
      cameras: jsonData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});



exports.getmultiplepage = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = req.query.resultPerPage;
  const page = req.query.page || 1;
  const shareId = req.query.shareId;
  const contentId = req.query.contentId;

  try {
    const cameralists = await cameraDetails.find({ customerid: req.query.customerid });
    
    const totalItems = cameralists.length;
    const totalPages = Math.ceil(totalItems / resultPerPage);

    const startIndex = (page - 1) * resultPerPage;
    const endIndex = page * resultPerPage;

    const paginatedCameralists = cameralists.slice(startIndex, endIndex);

    // Create an array of promises to fetch related data
    const promises = paginatedCameralists.map(async (camera) => {
      const subdevice = await cameraSubscriberInfo.findOne({ id: camera.subid });
      const cameraListData = await cameraList.findOne({ cameraID: subdevice.subdeviceid });
      const urlData = await url_list.findOne({ id: subdevice.urlid });
      const cvrPlanData = await CVRPlan.findOne({ id: subdevice.cvrplanid });
      const streamnameData = await streamdetails.findOne({ cameraid: camera.cameraid });
      const aicamera = await AiCamera.find({ cameraid: camera.cameraid});

      // const uuid = streamnameData.streamname; // Assuming 'uuid' is the field name
      // const buffer = uuid.buffer;
      // const uuidString = buffer.toString('hex');
      // const uuidWithoutHyphens = uuidString;
      // const formattedUUID = `${uuidWithoutHyphens.slice(0, 8)}-${uuidWithoutHyphens.slice(8, 12)}-${uuidWithoutHyphens.slice(12, 16)}-${uuidWithoutHyphens.slice(16, 20)}-${uuidWithoutHyphens.slice(20)}`;

      return {
        cameraid: camera.cameraid,
        customerid: camera.customerid,
        cameraname: camera.name,
        cameraurl: urlData.streamurl,
        createdDate: camera.created_date,
        deviceid: cameraListData ? cameraListData.cameraID : "null",
        is360:cameraListData? cameraListData.is360 : "null",
        isfhd: camera.isfhd,
        islive: streamnameData ? streamnameData.status : 0,
        isnumplate:cameraListData ? cameraListData.isnumplate : "null",
        isptz: camera.isptz,
        plandays: cvrPlanData.plandays,
        plandisplayname: cvrPlanData.plan_name,
        planname: cvrPlanData.plan_name,
        streamname: streamnameData.streamname,
        aiCam:aicamera ? aicamera : "null",
      };
    });

    // Execute all promises in parallel
    const jsonData = await Promise.all(promises);

    res.status(200).json({
      success: true,
      totalItems,
      totalPages,
      currentPage: page,
      cameras: jsonData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});