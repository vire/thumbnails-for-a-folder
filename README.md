# thumbnails-for-a-folder

> Generates a thumbnails image for given folder with photos (useful for storing archives in s3 along with thumbnails to see where are particular photos)

first generate thumbnails for photos in input folder

`bun process-input-folder.ts <path-to-folder-with-photos>`

then

`bun generate-thumbnails.ts <path-to-folder-with-thumbnails>`
