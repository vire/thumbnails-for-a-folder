const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const decode = require("heic-decode");
const { promisify } = require("util");
const convert = require("heic-convert");

const inputDir = process.argv[2] || "./photos";
const outputDir = `./${inputDir}-thumbnails`;
const thumbnailSize = 300;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to generate image thumbnails
async function generateImageThumbnails(imageFiles) {
  for (const file of imageFiles) {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, `thumb-${file}`);

    await sharp(inputFilePath)
      .resize(thumbnailSize, thumbnailSize)
      .toFile(outputFilePath);
    console.log(`Thumbnail created: ${outputFilePath}`);
  }
}

// Function to generate video thumbnails
async function generateVideoThumbnails(videoFiles) {
  for (const file of videoFiles) {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, `thumb-${file}.png`);

    await new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .on("end", () => {
          console.log(`Thumbnail created: ${outputFilePath}`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error processing video ${file}:`, err);
          reject(err);
        })
        .screenshots({
          count: 1,
          folder: outputDir,
          filename: `thumb-${file}.png`,
          size: `${thumbnailSize}x${thumbnailSize}`,
        });
    });
  }
}

async function generateHeicThumbnails(heicFiles) {
  for (const file of heicFiles) {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, `thumb-${file}.jpg`);
    console.log(`Processing HEIC file: ${inputFilePath}`);
    const inputBuffer = await promisify(fs.readFile)(inputFilePath);
    // const res = await decode({ buffer: inputbuffer });
    const outputBuffer = await convert({
      buffer: inputBuffer, // the HEIC file buffer
      format: "JPEG", // output format
      quality: 1, // the jpeg compression quality, between 0 and 1
    });

    await sharp(outputBuffer)
      .resize(thumbnailSize, thumbnailSize)
      .toFormat("jpeg")
      .toFile(outputFilePath);

    // await promisify(fs.writeFile)(outputFilePath, outputBuffer);
    console.log(`Thumbnail created: ${outputFilePath}`);
  }
}

// Main function to generate thumbnails
async function generateThumbnails() {
  try {
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    const videoFiles = files.filter((file) => /\.(mov)$/i.test(file));
    const heicFiles = files.filter((file) => /\.(heic)$/i.test(file));

    if (imageFiles.length === 0 && videoFiles.length === 0) {
      console.log("No image or video files found in the specified directory.");
      return;
    }

    await Promise.all([
      generateImageThumbnails(imageFiles),
      generateVideoThumbnails(videoFiles),
      generateHeicThumbnails(heicFiles),
    ]);
  } catch (error) {
    console.error("Error processing files:", error);
  }
}

// Check if input directory exists
if (!fs.existsSync(inputDir)) {
  console.error(`Input directory "${inputDir}" does not exist.`);
} else {
  generateThumbnails();
}
