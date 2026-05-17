const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const port = process.env.PORT || 3000;
const appName = process.env.APP_NAME || "Release Status Dashboard";
const environment = process.env.NODE_ENV || "development";
const debug = process.env.DEBUG === "true";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getReleases() {
  const filePath = path.join(__dirname, "releases.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileContents);
}

app.get("/", (req, res) => {
  try {
    const releases = getReleases();

    const rows = releases
      .map(
        (release) => `
          <tr>
            <td>${escapeHtml(release.service)}</td>
            <td>${escapeHtml(release.version)}</td>
            <td>${escapeHtml(release.environment)}</td>
            <td>${escapeHtml(release.status)}</td>
            <td>${escapeHtml(release.deployedAt)}</td>
          </tr>
        `
      )
      .join("");

    res.send(`
      <html>
        <head>
          <title>${escapeHtml(appName)}</title>
        </head>
        <body>
          <h1>${escapeHtml(appName)}</h1>
          <p>Environment: ${escapeHtml(environment)}</p>

          <table border="1" cellpadding="8">
            <tr>
              <th>Service</th>
              <th>Version</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Deployed At</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Failed to load release data:", error);
    res.status(500).send("Failed to load release data");
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: appName,
    environment,
    uptime: process.uptime()
  });
});

app.get("/api/releases", (req, res) => {
  try {
    res.json(getReleases());
  } catch (error) {
    console.error("Failed to load release data:", error);
    res.status(500).json({
      error: "Failed to load release data"
    });
  }
});

app.get("/api/config", (req, res) => {
  res.json({
    appName,
    environment,
    port,
    debug
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`${appName} listening on port ${port}`);
  });
}

module.exports = app;