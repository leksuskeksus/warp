const https = require("https");
const fs = require("fs");
const path = require("path");

const assets = [
  {
    url: "https://app.joinwarp.com/_next/static/chunks/6f7724a58a14cab1.css",
    file: "6f7724a58a14cab1.css",
  },
  {
    url: "https://app.joinwarp.com/_next/static/chunks/8e8a01bc8e699344.css",
    file: "8e8a01bc8e699344.css",
  },
];

const destDir = path.resolve(__dirname, "../reference-source");
fs.mkdirSync(destDir, { recursive: true });

function downloadAsset(asset) {
  const targetPath = path.join(destDir, asset.file);
  return new Promise((resolve, reject) => {
    const request = https.get(asset.url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        const redirectUrl = new URL(
          response.headers.location,
          asset.url,
        ).toString();
        response.resume();
        downloadAsset({ ...asset, url: redirectUrl })
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(
          new Error(
            `Failed to download ${asset.url} (status ${response.statusCode})`,
          ),
        );
        response.resume();
        return;
      }

      const fileStream = fs.createWriteStream(targetPath);
      response.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close(resolve);
      });
      fileStream.on("error", (error) => {
        fs.rm(targetPath, { force: true }, () => reject(error));
      });
    });

    request.on("error", (error) => reject(error));
  });
}

async function run() {
  for (const asset of assets) {
    process.stdout.write(`Fetching ${asset.url} -> ${asset.file}... `);
    await downloadAsset(asset);
    process.stdout.write("done\n");
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
