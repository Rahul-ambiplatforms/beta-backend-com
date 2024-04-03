// controllers/downloadController.js
const axios = require('axios');

async function downloadProxy(req, res) {
  try {
    const { cameraurl, streamid, startTimestamp, endTimestamp } = req.body;

    const downloadCameraUrl = cameraurl.replace(':1938', ':8088');
    const downloadUrl = `http://${downloadCameraUrl}SocialSharing?streamName=${streamid}&startTime=${startTimestamp}&endTime=${endTimestamp}`;
console.log(downloadUrl)
    // Make a request to the external URL
    const response = await axios.get(downloadUrl, { responseType: 'stream' });

    // Set appropriate headers for the response
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Disposition', `attachment; filename=${streamid}-${startTimestamp}-${endTimestamp}.mp4`);

    // Pipe the response from the external URL to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Proxy Error: Unable to fetch the requested resource.' });
  }
}

module.exports = {
  downloadProxy,
};
