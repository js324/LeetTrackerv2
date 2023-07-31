import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */

/*
    Issue:
    Is GAPI not possible to load in extensions? Can't find resources (docs seem to just use fetch)
*/
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded now update");


const API_KEY = '';
let user_signed_in = false;


chrome.identity.onSignInChanged.addListener(function (account_id, signedIn) {
    if (signedIn) {
        user_signed_in = true;
    } else {
        user_signed_in = false;
    }
});
 //have functions for just creating and intializing format of spreadsheet, authorizing oauth, 
 //appending rows
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.message === 'submit') {
        //case 1: completely new user (or spreadsheet was deleted), create spreadsheet and then store id
        //case 2: user previously created spreadsheet and have stored sheet id in storage
        //case 3: user previously created spreadsheet, for some reason sheet id not stored, retrieve from drive
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
        console.log("Auth token flow")
            createFormatSheet();
            let spreadsheetId = chrome.storage.sync.get("spreadsheetId");
            console.log(spreadsheetId);
        });
    }
    if (request.message == "append_row") { //look into failure case
        chrome.identity.getAuthToken({ interactive: false }, function (token) {
            
        });
    }
});
function createFormatSheet() {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        console.log(token);
        let init = {
            method: 'POST',
            async: true,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            'contentType': 'json',
            body: JSON.stringify({
                'properties': { 'title': 'LeetTracker Spreadsheet' }
            })
          };
        fetch(
            'https://sheets.googleapis.com/v4/spreadsheets',
            init)
            .then((response) => response.json())
            .then(function(data) {
                console.log(data)
                chrome.storage.sync.set({ "spreadsheetUrl": data["spreadsheetUrl"] })
                chrome.storage.sync.set({ "spreadsheetId": data["spreadsheetId"] }).then(() => {
                    console.log("Value is set");
                    
                });
                addFormatHeader(token, data["spreadsheetId"], data['sheets'][0]['properties']['sheetId']);
            });
            
            
            
    });
}
function getSheetFromDrive(token) {
    let init = {
        method: 'GET',
        async: true,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
      };
    fetch(
        'https://www.googleapis.com/drive/v3/files',
        init)
        .then((response) => response.json())
        .then(function(data) {
        chrome.storage.sync.set({ "spreadsheetUrl": data["spreadsheetUrl"] })
        chrome.storage.sync.set({ "spreadsheetId": data["spreadsheetId"] }).then(() => {
            console.log("Value is set");
            });
        });
    
}
function appendRow(token, spreadsheetId) {
    
}
function addFormatHeader(token, spreadsheetId, sheetId) {
    let init = {
        method: 'POST',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        'contentType': 'json', 
        body: JSON.stringify({ 
            "range": 'A1',
            "majorDimension": "ROWS",
            // "valueInputOption": 'USER_ENTERED',
            "values": [
              ["Title", "Difficulty", "Tags", "Solved", "Time Complexity", 
              "Space Complexity", "Notes", "Last Reviewed", "Needs Review"]
            ]
        })
        };
        //8
    fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
        init)
        .then((response) => response.json())
        .then(function(data) {
            console.log(data);
        });
    init = {
        method: 'POST',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        'contentType': 'json', 
        body: JSON.stringify({ 
            "requests": [
                {
                    'updateDimensionProperties': {
                        'range': {
                            'sheetId': sheetId,
                            'dimension': 'COLUMNS',
                            'startIndex': 0,
                            'endIndex': 1,
                        },
                        'properties': {
                            'pixelSize': 240
                        },
                        'fields': 'pixelSize'
                    }
                },
                {
                    'updateDimensionProperties': {
                        'range': {
                            'sheetId': sheetId,
                            'dimension': 'COLUMNS',
                            'startIndex': 6,
                            'endIndex': 7,
                        },
                        'properties': {
                            'pixelSize': 500
                        },
                        'fields': 'pixelSize'
                    }
                },
                {
                    'updateDimensionProperties': {
                        'range': {
                            'sheetId': sheetId,
                            'dimension': 'COLUMNS',
                            'startIndex': 7,
                            'endIndex': 8,
                        },
                        'properties': {
                            'pixelSize': 150
                        },
                        'fields': 'pixelSize'
                    }
                },
                {
                    'updateDimensionProperties': {
                        'range': {
                            'sheetId': sheetId,
                            'dimension': 'COLUMNS',
                            'startIndex': 8,
                            'endIndex': 9,
                        },
                        'properties': {
                            'pixelSize': 150
                        },
                        'fields': 'pixelSize'
                    }
                },
                {
                  "repeatCell": {
                    "range": {
                      "sheetId": sheetId,
                      "startRowIndex": 0,
                      "endRowIndex": 1,
                      "startColumnIndex": 0,
                      "endColumnIndex": 9
                    },
                    "cell": {
                      "userEnteredFormat": {
                        "backgroundColor": {
                          "red": 0.0,
                          "green": 0.0,
                          "blue": 0.0
                        }, 
                        "wrapStrategy": 'WRAP',
                        "horizontalAlignment" : "CENTER",
                        "textFormat": {
                          "foregroundColor": {
                            "red": 1.0,
                            "green": 1.0,
                            "blue": 1.0
                          },
                          "fontSize": 12,
                          "bold": true
                        }
                      }
                    },
                    "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
                  }
                },
                {
                  "updateSheetProperties": {
                    "properties": {
                      "sheetId": sheetId,
                      "gridProperties": {
                        "frozenRowCount": 1
                      }
                    },
                    "fields": "gridProperties.frozenRowCount"
                  }
                }
              ]
        })
        };
        
    fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        init)
        .then((response) => response.json())
        .then(function(data) {
            console.log(data);
        });

        //have cell text wrap WrapStrategy (so cell text doesnt clip especially for notes)
        //maybe for review history just have another worksheet and table for tracking
        //add pushing to github (with file structure)
}