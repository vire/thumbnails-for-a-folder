const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputFolder = process.argv[2];

if (!inputFolder) {
  console.error("Please provide an input folder.");
  process.exit(1);
}

fs.readdir(inputFolder, (err, files) => {
  if (err) {
    console.error("Error reading the directory:", err);
    process.exit(1);
  }

  const images = files.filter(
    (file) => path.extname(file).toLowerCase() === ".jpg"
  );

  if (images.length === 0) {
    console.log("No .jpg images found in the folder.");
    return;
  }

  const thumbnailSize = 300; // Size of each thumbnail
  const borderSize = 5; // Border size around each thumbnail
  const gap = 15; // Gap between thumbnails
  const maxColumns = 5; // Maximum thumbnails per row

  const rows = Math.ceil(images.length / maxColumns);
  const outputWidth = thumbnailSize * maxColumns + gap * (maxColumns - 1);
  const outputHeight = thumbnailSize * rows + gap * (rows - 1);

  const compositeImages = images.map((file, index) => {
    const x = (index % maxColumns) * (thumbnailSize + gap);
    const y = Math.floor(index / maxColumns) * (thumbnailSize + gap);

    return {
      input: path.join(inputFolder, file),
      top: y + borderSize, // Add border size to y position
      left: x + borderSize, // Add border size to x position
      resize: {
        width: thumbnailSize - 2 * borderSize, // Reduce size for border
        height: thumbnailSize - 2 * borderSize, // Reduce size for border
      },
    };
  });

  sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite(compositeImages)
    .toFile(`${inputFolder}.jpg`)
    .then(() => {
      console.log(`${inputFolder}.jpg generated successfully!`);
    })
    .catch((err) => {
      console.error("Error processing images:", err);
    });
});
