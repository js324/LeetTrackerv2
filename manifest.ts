import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlmcEycU+vqr0H/mbdK7Uk6/uUUTf8S8XCraTM4oavEwz12TSQpKXjUHrXEaD5i5fQoYd0Ewp7xZ+yPh8WKrMko9B+kZiWmERDX9iV4+T/wp5ddfamNS4NdulkDJQ0qOHSZTkDvfUDL6ZRelMfb4HAWSLi8Ek6Hx4I3A0Coh+RTWU4XgYLWGv7jqmEzVR+zKjQO2HwcfuMGrYVdhCRP5K54itdqF22imdAK0MEHAzFjq+OWoKs+7709jpX7dIsaLHQQ5ljUmCU3hgsQ5HBzG2/bzdCefq7FHkJDw4YwFn5gVL+ZwsDdMS5w5OAPrbW0ywzFXgJ3jhXwcebXt3EAD5XwIDAQAB",
  oauth2: {
    client_id: "471474308672-okk6mb26mset4blonbfsh9e5m7bdme1n.apps.googleusercontent.com",
    scopes:["https://www.googleapis.com/auth/drive.file"]
  },
  permissions: [
    "identity",
    "identity.email",
    "storage"
  ],  
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  host_permissions: [
    "https://sheets.googleapis.com/v4/*",
    "https://www.googleapis.com/drive/v3/*"
  ],
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon-34.png",
  },
  icons: {
    "128": "icon-128.png",
  },
  content_scripts: [
    {
      matches: ["http://leetcode.com/problems*", "https://leetcode.com/problems*"],
      js: ["src/pages/content/index.js"],
      // KEY for cache invalidation
      css: ["assets/css/contentStyle<KEY>.chunk.css"],
	  run_at: "document_start",
    },
  ],
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-34.png",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;
