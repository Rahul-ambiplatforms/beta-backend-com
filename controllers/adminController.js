const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cameraDetails = require("../models/cameraDetails");
const AiCamera = require("../models/aicamera");
const cameraList = require("../models/cameraList");
const cameraSubscriberInfo = require("../models/cameraSubscriberInfo");
const url_list = require("../models/url_list");
const CVRPlan = require("../models/CVRPlan");
const streamdetails = require("../models/streamdetails");
const { v4: uuidv4 } = require('uuid');
const ApiFeatures = require("../utils/apifeatures")
const crypto = require("crypto");
// const cloudinary = require("cloudinary");
const randomstring = require('randomstring');
const customer = require("../models/userModel");
const CamHistory = require('../models/CamHistory')
const {setsettingInternal} = require('./settingController')
const sendToken = require("../utils/jwtToken");
const Admin = require("../models/adminModel");
const camerahistory = require("../models/camerahistory")
const axios =  require("axios");
const FormData = require('form-data');
const { S3Client, GetObjectCommand,ListObjectsCommand,PutObjectCommand  } = require('@aws-sdk/client-s3');
const https = require('https');

let counter = 100000;

exports.createCamera = catchAsyncErrors(async (req, res, next) => {
  let cameraID = req.body.deviceid;
  let isptz = req.body.isptz;
  let isfhd = req.body.isfhd;
  let is360 = req.body.is360;
  if (!cameraID) {
    return next(new ErrorHander("Device ID is required", 400));
  }
  // Find the highest `id` value from the existing cameraList records
  const highestIdRecord = await cameraList.findOne().sort({ id: -1 });

  const id = highestIdRecord ? highestIdRecord.id + 1 : 1;

  const cam = await cameraList.findOne({ cameraID: cameraID });

  if (cam) {
    return next(new ErrorHander("Device ID already exists", 400));
  }


  // const id = getNextSequentialID();

  let cameranew = await cameraList.create({
    id,
    cameraID,
    isptz,
    isfhd,
    is360
  });

  res.status(200).json({
    success: true,
    message: 'Camera created successfully',
  });
});

function getNextSequentialID() {
  // Increment the counter and return the new value
  return counter++;
}

exports.getAllCamera = catchAsyncErrors(async (req, res, next) => {
  try {
    // Get the page number and limit from the request query
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 20; // Number of records per page

    // Calculate the number of records to skip based on the page and limit
    const skip = (page - 1) * limit;

    if (req.query.deviceid) {
      // Search for camera records by 'deviceid'
      const deviceid = req.query.deviceid;
      const totalItems = await cameraList.countDocuments({ cameraID: deviceid });
      const totalPages = Math.ceil(totalItems / limit);
      const cameraListRecords = await cameraList.find({ cameraID: deviceid })
        .skip(skip)
        .limit(limit);
      
      // Create the data object
      const data = {
        success: true,
        message: 'Camera Searched data retrieved successfully',
        totalItems,
        totalPages,
        items: [],
        page,
      };
      
      for (const cameraListRecord of cameraListRecords) {
        // Find the corresponding cameraSubscriberInfo record using the deviceid
        let camSubscriberInfoRecord = await cameraSubscriberInfo.findOne({
          subdeviceid: cameraListRecord.cameraID,
        });
        
        const item = {
          cameraList: cameraListRecord,
          cameraSubscriberInfo: camSubscriberInfoRecord || 'No data',
        };
        
        data.items.push(item);
      }
      
      res.status(200).json(data);
    } else {



    // Find the total number of camera list records
    const totalItems = await cameraList.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalItems / limit);

    // Find all camera list records with pagination
    const cameraListRecords = await cameraList.find({})
      .skip(skip)
      .limit(limit);

    // Create an object to store the result data
    const data = {
      success: true,
      message: 'Camera data retrieved successfully',
      totalItems,totalPages,
      items: [],
      page,
    };

    // Iterate over each camera list record
    for (const cameraListRecord of cameraListRecords) {
      // Find the corresponding cameraSubscriberInfo record using the deviceid
      let camSubscriberInfoRecord = await cameraSubscriberInfo.findOne({
        subdeviceid:  cameraListRecord.cameraID ,
      });
     
     
      // Define the item object
      const item = {
        cameraList: cameraListRecord,
        cameraSubscriberInfo: camSubscriberInfoRecord || 'No data',
      };

      // Push the item into the items array
      data.items.push(item);
    }

    res.status(200).json(data);
  }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

exports.updateCamera = catchAsyncErrors(async (req, res, next) => {
  // const cameraID = req.body.deviceid; // Extract the plan ID from the request parameters
  const {deviceid, isvalid, isptz, isfhd,is360,ProUrl } = req.body; // Extract updated fields from the request body


  try {
      // Update cameraList document by ID
      const updatedCamera = await cameraList.findOne({cameraID:deviceid})

      if (!updatedCamera) {
          // If the document with the provided ID is not found
          return res.status(404).json({
            success: false,
            message: 'Data record not found.',
          });
      }
      updatedCamera.isvalid = isvalid;
      updatedCamera.isptz = isptz;
      updatedCamera.isfhd = isfhd;
      updatedCamera.is360 = is360;
      updatedCamera.ProUrl = ProUrl;
      await updatedCamera.save();
      
      res.status(200).json({
        success: true,
        message: 'Data record updated successfully',
        data: updatedCamera,
      });

  } catch (error) {
    console.error(error);
    next(error);
  }
});

exports.camtouser =catchAsyncErrors(async (req,res,next) =>{
  let cameraID = req.body.deviceid;
  let email = req.body.email;
  if (!email) {
    return next(new ErrorHander("Device ID is required", 400));
  }
  // Find the highest `id` value from the existing cameraList records
  const highestIdRecord = await cameraSubscriberInfo.findOne().sort({ id: -1 });

  // Calculate the next `id` value
  const id = highestIdRecord ? highestIdRecord.id + 1 : 1;


  const camsub = await cameraSubscriberInfo.findOne({ subdeviceid: cameraID });

  if (camsub) {
    return next(new ErrorHander("Device ID already exists", 400));
  }
  // const id = getNextSequentialID();
  
  let camsubnew = await cameraSubscriberInfo.create({
    id,
    subemail: email,
    subdeviceid: cameraID,
    issubscribe: 1,
    subscriptiondate: Date.now(),
    cvrplanid: 2,
    urlid: 76,
  });

  res.status(200).json({
    success: true,
    message: `Camera Allocated to ${email} successfully`,
  });
})

exports.getAllStreamUrls = async (req, res, next) => {
  try {
    const streamUrls = await url_list.find({}, 'streamurl'); // Fetch all stream URLs from url_list collection
    res.status(200).json({
      success: true,
      streamUrls: streamUrls
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};

exports.getUrllist = catchAsyncErrors(async (req, res, next) => {
  const url = await url_list.find();
  res.status(200).json({
      success: true,
      url,
  });
});

exports.deleteUrl = catchAsyncErrors(async (req, res, next) => {
  const urlId = req.params.id;

  // Find the URL by ID and remove it
  const url = await url_list.findById(urlId);

  if (!url) {
      return next(new ErrorHander('URL not found', 404));
  }

  await url.remove();

  res.status(200).json({
      success: true,
      message: 'URL deleted successfully',
  });
});


exports.updateUrls = catchAsyncErrors(async (req, res, next) => {
  const { streamurl } = req.body;
  const urlId = req.params.id;

  // Use findByIdAndUpdate to find and update the document in a single step
  const updatedUrl = await url_list.findByIdAndUpdate(urlId, { streamurl }, { new: true });

  if (!updatedUrl) {
      return next(new ErrorHander("URL not found", 404));
  }

  res.status(200).json({
      success: true,
      updatedUrl,
  });
});

exports.plans = catchAsyncErrors(async (req, res, next) => {
  try {
      const data = await CVRPlan.aggregate([
          {
              $lookup: {
                  from: 'url_list', // The name of the collection to perform the join with
                  localField: 'Serverid', // Field from CVRPlan collection
                  foreignField: 'id', // Field from url_list collection
                  as: 'urlDetails' // Name of the new field to store the joined data
              }
          },
          {
              $unwind: {
                  path: '$urlDetails',
                  preserveNullAndEmptyArrays: true // Include plans with no matching streamurl in url_list
              }
          },
          {
              $project: {
                  plan: '$plan_name', // Rename fields if necessary
                  plandays: '$plandays',
                  streamurl: {
                      $cond: {
                          if: { $eq: ['$urlDetails', null] }, // Check if urlDetails is null (no matching streamurl)
                          then: '', // Set streamurl to an empty string
                          else: '$urlDetails.streamurl' // Use the streamurl from urlDetails
                      }
                  }
              }
          }
      ]);

      res.status(200).json({
          success: true,
          serverUrl: data
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          error: 'Internal Server Error'
      });
  }
});

exports.getAllPlans = async (req, res, next) => {
  try {
    const plan_name = await CVRPlan.find({}, 'plan_name'); // Fetch all stream URLs from url_list collection
    res.status(200).json({
      success: true,
      plan_name: plan_name
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};

exports.getPlanById = catchAsyncErrors(async (req, res, next) => {
  const planId = req.params.id; // Extract the plan ID from the request parameters

  try {
      // Find the CVRPlan document by ID
      const plan = await CVRPlan.findById(planId).exec();

      if (!plan) {
          // If the document with the provided ID is not found
          return next(new ErrorHander("Plan not found", 404));
      }

      // Now, retrieve the 'streamurl' from the 'url_list' collection
      const streamurl = await url_list.findOne({ id: plan.Serverid }).select('streamurl').exec();

      // Send the retrieved plan fields and streamurl in the response
      res.status(200).json({
          success: true,
          plan: {
              _id: plan._id,
              // Include all CVRPlan fields here
              plan_name: plan.plan_name,
              plandays: plan.plandays,
              // ... include other fields as needed
              streamurl: streamurl ? streamurl.streamurl : null // Use streamurl if found, or null if not found
          }
      });
  } catch (error) {
      // Handle errors, e.g., validation errors
      next(error); // Pass the error to the error-handling middleware
  }
});


exports.updatePlan = catchAsyncErrors(async (req, res, next) => {
  const planId = req.params.id; // Extract the plan ID from the request parameters
  const { plan_name, plandays, streamurl } = req.body; // Extract updated fields from the request body


  try {
      // Update CVRPlan document by ID
      const updatedPlan = await CVRPlan.findByIdAndUpdate(planId, { plan_name, plandays }, { new: true }).exec();

      if (!updatedPlan) {
          // If the document with the provided ID is not found
          return next(new ErrorHander("Plan not found", 404));
      }

      // Find streamurl in url_list collection based on Serverid from CVRPlan
      const urlListEntry = await url_list.findOne({ streamurl: streamurl }).exec();

      if (urlListEntry) {
          // If the document with the provided Serverid is found in url_list collection
          // Save the id from url_list into CVRPlan's streamid field
          updatedPlan.Serverid = urlListEntry.id;
          await updatedPlan.save();

          // Send the updated plan and streamid in the response
          res.status(200).json({
              success: true,
              plan: {
                  _id: updatedPlan._id,
                  plan_name: updatedPlan.plan_name,
                  plandays: updatedPlan.plandays,
              }
          });
      } else {
          // If the document with the provided Serverid is not found in url_list collection
          return next(new ErrorHander("Streamurl not found for the given Serverid", 404));
      }
  } catch (error) {
      // Handle errors, e.g., validation errors
      next(error); // Pass the error to the error-handling middleware
  }
});


exports.deletePlan = catchAsyncErrors(async (req, res, next) => {
  const planId = req.params.id;

  // Find the URL by ID and remove it
  const plan = await CVRPlan.findById(planId);

  if (!plan) {
      return next(new ErrorHander('URL not found', 404));
  }

  await plan.remove();

  res.status(200).json({
      success: true,
      message: 'URL deleted successfully',
  });
});


exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const cameraid = req.params.id;
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

  res.status(200).json("Camera Deleted Successfully");
});


exports.getUsersCameras = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 20;
  const page = req.query.page || 1; // Get the page from the request query or default to 1

  try {
        const cameralists = await cameraDetails.find();
        const totalItems = cameralists.length;
        const totalPages = Math.ceil(totalItems / resultPerPage);
        const startIndex = (page - 1) * resultPerPage;
        const endIndex = page * resultPerPage;

        // Slice the array to get the items for the current page
        const paginatedCameralists = cameralists.slice(startIndex, endIndex);

            // Create an array of promises to fetch related data for the current page
       const promises = paginatedCameralists.map(async (camera) => {
        const subdevice = await cameraSubscriberInfo.findOne({ id: camera.subid });
        const subdeviceID = subdevice ? subdevice.subdeviceid : null;
       
        const cameraListData = await cameraList.findOne({ cameraID: subdeviceID });
        const urlData = await url_list.findOne({ id: subdevice ? subdevice.urlid : null });
        const cvrPlanData = await CVRPlan.findOne({ id: subdevice ? subdevice.cvrplanid : null });
        const streamnameData = await streamdetails.findOne({ cameraid: camera.cameraid });
        const customeremail = await customer.findOne({customerid:camera.customerid})

              return {
                cameraid: camera.cameraid,
                customerid: camera.customerid,
                email: customeremail.email,
                cameraname: camera.name,
                cameraurl: urlData ? urlData.streamurl : "NULL",
                createdDate: camera.created_date,
                deviceid: cameraListData ? cameraListData.cameraID : "NULL",
                is360: cameraListData ? cameraListData.is360 : "NULL",
                isfhd: camera.isfhd,
                islive: streamnameData ? streamnameData.status : "NULL",
                isnumplate: cameraListData ? cameraListData.isnumplate : "NULL",
                isptz: camera.isptz,
                plandays: cvrPlanData ? cvrPlanData.plandays : "NULL",
                plandisplayname: cvrPlanData ? cvrPlanData.plan_name : "NULL",
                planname: cvrPlanData ? cvrPlanData.plan_name : "NULL",
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


exports.searchUserCameras = catchAsyncErrors(async (req, res, next) => {
  const deviceId = req.query.deviceId;
  const email = req.query.email;
  const planname = req.query.planname;
  
  try {
    let cameralists = [];

    if (email) {
      const user = await customer.findOne({
        $or: [
        { email: { $regex: email, $options: 'i' } }, // Case-insensitive search
      ],
    });
      cameralists = await cameraDetails.find({ customerid: user.customerid });
    } else if (deviceId) {
      const cam = await cameraList.findOne({
        $or: [
          { cameraID: { $regex: deviceId, $options: 'i' } }, // Case-insensitive search
        ],
      });
      const subdevice = await cameraSubscriberInfo.findOne({ subdeviceid: cam.cameraID });
      cameralists = await cameraDetails.find({ subid: subdevice.id });
    }else if (planname) {
      const cam = await CVRPlan.findOne({
        $or: [
          { plan_name: { $regex: planname, $options: 'i' } }, // Case-insensitive search
        ],
      });
      const subdevice = await cameraSubscriberInfo.findOne({ cvrplanid: cam.id });
      cameralists = await cameraDetails.find({ subid: subdevice.id });
    }
    else {
      // Handle the case where neither deviceId nor email is provided.
      // You can return an error response or handle it as needed.
      return res.status(400).json({
        success: false,
        message: 'Please provide either deviceId or email for the query.',
      });
    }

    // Create an array of promises to fetch related data for all cameras
    const promises = cameralists.map(async (camera) => {
      const subdevice = await cameraSubscriberInfo.findOne({ id: camera.subid });
      const subdeviceID = subdevice ? subdevice.subdeviceid : null;
      const cameraListData = await cameraList.findOne({ cameraID: subdeviceID });
      const urlData = await url_list.findOne({ id: subdevice ? subdevice.urlid : null });
      const cvrPlanData = await CVRPlan.findOne({ id: subdevice ? subdevice.cvrplanid : null });
      const streamnameData = await streamdetails.findOne({ cameraid: camera.cameraid });
      const customeremail = await customer.findOne({ customerid: camera.customerid });

      return {
        cameraid: camera.cameraid,
        customerid: camera.customerid,
        email: customeremail.email,
        cameraname: camera.name,
        cameraurl: urlData ? urlData.streamurl : "NULL",
        createdDate: camera.created_date,
        deviceid: cameraListData ? cameraListData.cameraID : "NULL",
        is360: cameraListData ? cameraListData.is360 : "NULL",
        isfhd: camera.isfhd,
        islive: streamnameData ? streamnameData.status : "NULL",
        isnumplate: cameraListData ? cameraListData.isnumplate : "NULL",
        isptz: camera.isptz,
        plandays: cvrPlanData ? cvrPlanData.plandays : "NULL",
        plandisplayname: cvrPlanData ? cvrPlanData.plan_name : "NULL",
        planname: cvrPlanData ? cvrPlanData.plan_name : "NULL",
        streamname: streamnameData.streamname,
      };
    });

    // Execute all promises in parallel
    const jsonData = await Promise.all(promises);

    res.status(200).json({
      success: true,
      totalItems: cameralists.length,
      cameras: jsonData,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
});

exports.getTotalUser = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 20;
  const userCount = await customer.countDocuments();

  const totalUsers = Math.ceil(userCount);

  res.status(200).json({
    success: true,
    totalUsers,
  });
});

exports.getTotalCamera = catchAsyncErrors(async (req, res, next) => {

  const existCameras = await cameraDetails.countDocuments();

  const totalCameras = Math.ceil(existCameras);

  res.status(200).json(
    totalCameras,
  );
});

exports.getLiveCameras = catchAsyncErrors(async (req, res, next) => {

  try {
    // Query to count live cameras (status = 1) in the streamdetails collection
    const query = { status: 1 };
    const liveCameraCount = await streamdetails.countDocuments(query);
    console.log("live camera cpoint",liveCameraCount);
    
    // Return the result as JSON
    res.json({ liveCameraCount });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => { // Extract the plan ID from the request parameters
  const { plan_name, streamurl, deviceid, IPAddress, Username, EmailId } = req.body; // Extract updated fields from the request body

  try {
      // Update CVRPlan document by ID
      const updatedPlan = await cameraSubscriberInfo.findOne({ subdeviceid: deviceid }).exec();
      if (!updatedPlan) {
          // If the document with the provided ID is not found
          return next(new ErrorHander("Plan not found", 400));
      }

      // Find streamurl in url_list collection based on Serverid from CVRPlan
      const urlListEntry = await url_list.findOne({ streamurl: streamurl }).exec();

      const urlListEntryPrevious = await url_list.findOne({ id: updatedPlan.urlid }).exec();

      if (urlListEntry) {
          // If the document with the provided Serverid is found in url_list collection
          // Save the id from url_list into CVRPlan's streamid field
          
          // Send the updated plan and streamid in the response
          const cvrplan = await CVRPlan.findOne({ plan_name: plan_name }).exec();

          const cvrplanPrevious = await CVRPlan.findOne({ id: updatedPlan.cvrplanid }).exec();

          const previousHistory = await CamHistory.create({
            Actions:"Edit Camera",
            ActionDetails: "Previous Entry",
            CreatedTime: Date.now(),
            IPAddress: IPAddress,
            Username: Username,
            EmailId: EmailId,
            DeviceID: deviceid,
            ServerURL: urlListEntryPrevious.streamurl,
            CVRPlan: cvrplanPrevious.plan_name
          })
          
          updatedPlan.urlid = urlListEntry.id;
          updatedPlan.cvrplanid = cvrplan.id;
          await updatedPlan.save();

          const updatedHistory = await CamHistory.create({
            Actions:"Edit Camera",
            ActionDetails: "Updated Entry",
            CreatedTime: Date.now(),
            IPAddress: IPAddress,
            Username: Username,
            EmailId: EmailId,
            DeviceID: deviceid,
            ServerURL: streamurl,
            CVRPlan: plan_name
          })

          let streamDet = await cameraDetails.findOne({subid: updatedPlan.id})
          let streamname = await streamdetails.findOne({cameraid: streamDet.cameraid})
          
          const appSettings = getSettingDefault("rtmp://" + streamurl + streamname.streamname, EmailId, deviceid, "Ambicam " + streamDet.name);

          let response = await axios.post('https://mqtt-api-ocxhv.ondigitalocean.app/api/set', {
            appSettings
          })

          res.status(200).json({
              success: true,
              updatedPlan,
          });
      } else {
          // If the document with the provided Serverid is not found in url_list collection
          return next(new ErrorHander("Streamurl not found for the given Serverid", 400));
      }
  } catch (error) {
      // Handle errors, e.g., validation errors
      next(error); // Pass the error to the error-handling middleware
  }
});





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


exports.loginAdmin = catchAsyncErrors(async (req, res, next) => {
  const { username, hashcode } = req.body;

  // checking if user has given password and email both

  if (!username || !hashcode) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const user = await Admin.findOne({ username }).select("+hashcode");


  if (!user) {
    return next(new ErrorHander("Invalid email or password", 401));
  }

  
  if (hashcode === "RPHR%AJ@Torque") {
    sendToken(user, 200, res);
  }
  
  // if (password === "amb#3vmkt62wq") {
  //   sendToken(user, 200, res)
  // }

  // sendToken(user, 200, res);
});

exports.addCamera = catchAsyncErrors(async (req, res, next) => {
  const name = req.body.name;
  const cameraID = req.body.cameraID;
  const email = req.body.email;
  
  // const camera = await cameraDetails.find({ cameraid: cameraID });
  const camera = await cameraSubscriberInfo.findOne({ subdeviceid: cameraID });
  
  const urlid = await url_list.findOne({ id: camera.urlid });
  
  const user = await customer.findOne({ email: email });
  
  const customerid = user.customerid;
  
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

//FOR AI

exports.updateStatus = catchAsyncErrors(async (req, res) => {
  const cameraid = req.body.cameraid;
  const live_status = req.body.live_status;
  const aicamera = await AiCamera.findOne({cameraid:cameraid})
  
  if (!aicamera) {
    return res.status(404).json({ message: 'AiCamera not found' });
  }
  aicamera.live_status = live_status;
  await aicamera.save();
  // After updating, check if ai_status is true
  if (aicamera.ai_status === true) {    
    try {
      // Make the external API call
      // const response = await axios.post(apiEndpoint, payload);
      const response = await axios.post('https://octopus-app-gl75w.ondigitalocean.app/admin/active_ai', {
      cameraId:cameraid,
      status:true,
    },{
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
      // Log success or handle it as needed
      console.log(`AI activation successful for camera ${aicamera.cameraid}:`, response.data);

      // Optionally, include response data in your API response
      return res.status(200).json({ success: true, aicamera, aiActivationResponse: response.data });
    } catch (error) {
      // Log or handle API call error
      console.error(`Error activating AI for camera ${aicamera.cameraid}:`, error.response.data);

      // You might want to return the error or handle it differently
      return res.status(500).json({ success: false, message: 'Failed to activate AI', error: error.response.data });
    }
  } else {
    // If AI status is not true, just return the updated camera info
    return res.status(200).json({ success: true, aicamera });
  }
});
//
exports.active_ai = catchAsyncErrors(async (req, res, next) => {
  const cameraid = req.body.cameraid;
  const changestatus = req.body.status;
  const aicamera = await AiCamera.findOne({cameraid:cameraid})
  // If AiCamera document is not found, return 404 Not Found
  if (!aicamera) {
    return res.status(404).json({ message: 'AiCamera not found' });
  }

  if (changestatus === true){
    const response = await axios.post('https://ai1.ambicam.com:443/set_model',  {
      model_name:aicamera.ai_name.replace(".pt",""),
      camera_url:aicamera.rtmp,
      customer_id:aicamera.customerid,
      cameraId:cameraid,
      streamName:aicamera.selectedCamerastream,
    },{
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    await response;
    aicamera.activation_date= Date.now()  
    aicamera.ai_status = changestatus;
    aicamera.live_status = changestatus;
  }
  else{
    const response = await axios.post('https://ai1.ambicam.com:443/stop_stream',  {
      stream_key:`rtmp://media5.ambicam.com:1938/live/${aicamera.selectedCamerastream}_${aicamera.ai_name.replace(".pt","")}`,
    },{
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    await response;
    aicamera.deactivation_date= Date.now()  
    aicamera.ai_status = changestatus;
    aicamera.live_status = changestatus;
  }
  // Save the updated AiCamera document
  await aicamera.save();

  res.status(201).json({
    success: true,
    aicamera,
  });
});

async function getFilenamesFromBucket() {
  const s3Client = new S3Client({
      endpoint: "https://blr1.digitaloceanspaces.com",
      forcePathStyle: false,
      region: "us-east-1",
      credentials: {
          accessKeyId: "DO00R3UVUWRJDAWAW87X",
          secretAccessKey: "5Ru7ocF4NUQ/DxaOnmsz78l2VOrsHWxkpy0HKOOWnfg"
      }
  });

  const params = {
      Bucket: "torque-ai",
  };

  try {
    const response = await s3Client.send(new ListObjectsCommand(params));
    const filenames = response.Contents.map((object, index) => ({
        ID: index + 1,
        filename: object.Key
    }));
      return filenames;
  } catch (error) {
      console.error('Error fetching filenames from S3 bucket:', error);
      throw error;
  }
}

exports.getmodel = catchAsyncErrors(async (req, res, next) => { 
  try {
    const filenames = await getFilenamesFromBucket();
    res.status(200).json(filenames);
} catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}
});

async function getFileFromS3Bucket(filename) {
  const s3Client = new S3Client({
      endpoint: "https://blr1.digitaloceanspaces.com",
      forcePathStyle: false,
      region: "us-east-1",
      credentials: {
          accessKeyId: "DO00R3UVUWRJDAWAW87X",
          secretAccessKey: "5Ru7ocF4NUQ/DxaOnmsz78l2VOrsHWxkpy0HKOOWnfg"
      }
  });

  const params = {
      Bucket: "torque-ai",
      Key: filename
  };

  try {
      const { Body } = await s3Client.send(new GetObjectCommand(params));
      return Body;
  } catch (error) {
      console.error('Error fetching file from S3:', error);
      throw error;
  }
}

// Function to upload file to Python server
async function uploadFileToPythonServer(fileContent,filename) {
  try {
      const formData = new FormData();
      formData.append('model', fileContent, { filename });

      const response = await axios.post('https://ai1.ambicam.com:443/upload_model', formData, {
          headers: {
              ...formData.getHeaders(),
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
          
      });

      console.log(response.data);
      console.log('Model uploaded successfully.');
  } catch (error) {
      console.error('Error uploading model:', error);
      throw error;
  }
}

exports.deploymodel = catchAsyncErrors(async (req, res, next) => { 
  try {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).send('Filename is required.');
    }

    const fileContent = await getFileFromS3Bucket(filename);
    await uploadFileToPythonServer(fileContent, filename);
    res.status(200).send('Model uploaded successfully.');
} catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}
});


const s3Client = new S3Client({
  endpoint: "https://blr1.digitaloceanspaces.com",
  forcePathStyle: false,
  region: "us-east-1",
  credentials: {
      accessKeyId: "DO00R3UVUWRJDAWAW87X",
      secretAccessKey: "5Ru7ocF4NUQ/DxaOnmsz78l2VOrsHWxkpy0HKOOWnfg"
  }
});
exports.uploadmodel = catchAsyncErrors(async (req, res, next) => { 
  try {
    // Check if a file was provided in the request
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    const filename = req.file.originalname;
    const params = {
        Bucket: "torque-ai",
        Key: filename, // Use the provided filename
        Body: req.file.buffer, // Use the file data
        ACL: "private",
        Metadata: {
            "x-amz-meta-my-key": "your-value"
        }
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    res.status(200).send('File uploaded successfully');
} catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Internal server error');
}
});

exports.getaicamera = catchAsyncErrors(async (req, res) => {
  const aiData = await AiCamera.find()
  // console.log("getting data")
  res.status(200).json(aiData)
})
