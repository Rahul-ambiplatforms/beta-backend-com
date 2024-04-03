const axios = require('axios');
const fs = require('fs');
const spawn = require('child_process').spawn;
const path = require('path'); // Import the 'path' module
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;


async function downloadAndConvert(req, res) {
  try {
    const { cameraurl, streamid, startTimestamp, endTimestamp } = req.query;

    // Construct the URL to fetch the video from
    const downloadCameraUrl = cameraurl.replace(':1938', ':8088');
    const downloadUrl = `http://${downloadCameraUrl}SocialSharing?streamName=${streamid}&startTime=${startTimestamp}&endTime=${endTimestamp}`;

    // Get the project root directory
    const projectRoot = path.resolve(__dirname, '..'); // Go up one level to the project root

    // Create a temporary file path in the project root
    const tempFilePath = path.join(projectRoot, `${streamid}.mp4`);

    // Create a temporary file to save the downloaded content
    const writeStream = fs.createWriteStream(tempFilePath);

    writeStream.on('error', (error) => {
      console.error('Error writing to temp file:', error);
      // Handle the error, e.g., by sending an error response
      res.status(500).json({ error: 'Error saving the downloaded content.' });
    });

    // Make a request to the external URL
    const response = await axios.get(downloadUrl, { responseType: 'stream' });

    // Pipe the response stream to the temporary file
    response.data.pipe(writeStream);

    // Wait for the write stream to finish saving the file
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Use FFmpeg to convert the temporary video file to MP4 (modify as needed)
    const outputFilePath = path.join(projectRoot, `${streamid}-${startTimestamp}-${endTimestamp}.mp4`);
    const ffmpegProcess = spawn(ffmpegPath, ['-i', tempFilePath, '-c:v', 'libx264', '-strict', 'experimental', '-c:a', 'aac', '-b:a', '192k', outputFilePath]);

    await new Promise((resolve, reject) => {
      ffmpegProcess.on('exit', resolve);
      ffmpegProcess.on('error', reject);
    });

    // Set appropriate headers for download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename=${streamid}-${startTimestamp}-${endTimestamp}.mp4`);

    // Check if the converted file exists before attempting to read and delete it
    if (fs.existsSync(outputFilePath)) {
      // Pipe the converted MP4 file to the client (browser)
      const readStream = fs.createReadStream(outputFilePath);

      readStream.on('error', (error) => {
        console.error('Error reading converted file:', error);
        // Handle the error, e.g., by sending an error response
        res.status(500).json({ error: 'Error reading the converted file.' });
      });

      readStream.pipe(res);

      setTimeout(() => {
        // Clean up temporary files
        fs.unlinkSync(tempFilePath);
        // Check if the converted file exists before attempting to delete it
        if (fs.existsSync(outputFilePath)) {
          fs.unlinkSync(outputFilePath); // Remove the converted file
        }
      }, 5000);
      
    } else {
      // If the converted file doesn't exist, send an error response
      console.error('Converted file not found:', outputFilePath);
      res.status(500).json({ error: 'Converted file not found.' });
    }
  } catch (error) {
    console.error('Download and Conversion Error:', error);
    res.status(500).json({ error: 'Download and Conversion Error: Unable to fetch or convert the requested resource.' });
  }
}

module.exports = {
  downloadAndConvert,
};
