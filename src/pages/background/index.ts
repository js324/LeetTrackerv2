import { text } from "stream/consumers";
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



chrome.tabs.onUpdated.addListener(function(tabId, change, tab) {
    //notify the content script that the page has changed
    console.log("notifying contentscript");
    if(change.url)
        chrome.tabs.sendMessage(tabId, {message: "update"}); 
    return true; 
})

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
    if (request.message === 'reset') {
        chrome.identity.getAuthToken({ interactive: true }, async function (token) {
            chrome.storage.sync.get("spreadsheetId").then(async (spreadsheetId) => {
                deleteSheet(token, spreadsheetId);
                createFormatSheet(token);
            });
        });
    }
    if (request.message === 'submit') {
        //case 1: completely new user (or spreadsheet was deleted), create spreadsheet and then store id
        //case 2: user previously created spreadsheet and have stored sheet id in storage
        //case 3: user previously created spreadsheet, for some reason sheet id not stored, retrieve from drive
        console.log("preparing to submit");
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
                getSheetFromDrive(token).then(async (gotSheet) => { //was debating to just look at key, but then have to check if user deleted it anyway
                // if (Object.keys(spreadsheetId).length === 0)) { //empty
                    console.log("preparing to submit..");
                    if (!gotSheet) { //case 1, no sheet
                        console.log("NO SHEET IN DRIVE");
                        // createFormatSheet(token).then((spreadsheetId) => {
                            let spreadsheetId = await createFormatSheet(token);
                            appendRow(token, spreadsheetId);
                            console.log("sent response 1");
                            sendResponse({result: 1});
                        // });
                        
                    
                    }
                    else { //case 2, has sheet
                        chrome.storage.sync.get("spreadsheetId").then(({ spreadsheetId }) => {
                            console.log(spreadsheetId);
                            checkThenUpdate(token, spreadsheetId); });
                            console.log("sent response 2");
                            sendResponse({result: 2});
                        }
                });            
        });
        return true;
    }
    if (request.message === "process") {
        chrome.storage.sync.get({p_name: ""}).then((fromStorage) => {

            // names do not match--> this is a new problem and variables must be updated
            if (fromStorage.p_name != request.p_name){
                console.log("new problem - checking sheet for a past entry");

                chrome.identity.getAuthToken({ interactive: true }, async function (token) {
                    getSheetFromDrive(token).then((gotSheet) => { 
                        if (!gotSheet) { //no sheet - send response 
                            console.log("NO SHEET IN DRIVE");
                            chrome.storage.session.set({ url: request.url, p_name: request.p_name, p_isfave: -1, p_solved: request.p_solved,
                                p_difficulty: request.p_difficulty, p_tags: request.p_tags, p_tcomp: "", p_scomp: "", p_notes: "" }, () => {console.log("saved new problem"); chrome.runtime.sendMessage({message: "updatePopup"});});
                        }
                        else { //case 2, has sheet
                            chrome.storage.sync.get("spreadsheetId").then(({spreadsheetId}) => {
                                console.log(spreadsheetId);
                                findRow(token, spreadsheetId, request.p_name).then(async(rowInd) => {
                                    if (rowInd == -1) { // didn't find a matching row/no past data
                                        console.log ("couldn't find past entry");
                                        chrome.storage.session.set({ url: request.url, p_name: request.p_name, p_isfave: -1, p_solved: request.p_solved,
                                            p_difficulty: request.p_difficulty, p_tags: request.p_tags, p_tcomp: "", p_scomp: "", p_notes: "" }, () => {console.log("saved new problem"); chrome.runtime.sendMessage({message: "updatePopup"});});
                                    } else { // found a past entry
                                        loadFromSheet(token, spreadsheetId, rowInd+1, request.url);
                                    }
                                });
                            });
                        }
                        
                    });            
            });
            }
        });
    }
    if (request.message === "updateSolved") {
        chrome.storage.session.set({p_solved: true});
    }
});

function loadFromSheet(token, spreadsheetId, rowInd, url) {
    console.log("loading new problem from sheet");
    let init = {
        method: 'GET',
        async: true,
        headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
        },
    };
    return fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A${rowInd}:I${rowInd}`,
        init)
        .then((response) => {
            if (!response.ok) { 
                console.log("Getting drive sheet failed!");
                return false;
            }
            
            return response.json();
        }).then((row) => { 
            console.log(row["values"][0]);
            const entry = row["values"][0];
            chrome.storage.session.set({ url: url, p_name: entry[0], p_isfave: (entry[8] === "TRUE" ? 1 :0), p_solved: (entry[3] === "TRUE" ? 1 :0),
                    p_difficulty: entry[1], p_tags: entry[2].split(","), p_tcomp: entry[4], p_scomp: entry[5], p_notes: entry[6] }, () => {console.log("saved new problem"); chrome.runtime.sendMessage({message: "updatePopup"});});
        });
}

function checkThenUpdate(token, spreadsheetId) {
    chrome.storage.session.get({p_name: ""}).then(async ({p_name}) => {
        findRow(token, spreadsheetId, p_name).then(async (rowInd) => {
        console.log(rowInd);
        if (rowInd == -1) { //not found, just append
            appendRow(token, spreadsheetId);
        }
        else {
            updateRow(token, spreadsheetId, rowInd+1);
        }
        });
    }); 
}
async function updateRow(token, spreadsheetId, rowInd) {
    console.log(spreadsheetId);
    chrome.storage.session.get({url: "", p_name: "", p_isfave: 0, p_solved: 0, p_difficulty: "", p_tags: ["  "], 
    p_tcomp: "  ", p_scomp: "  ", p_notes: "  "}).then(({url, p_name, p_isfave, p_solved, p_difficulty, p_tags, p_tcomp, p_scomp, p_notes}) => {
        p_solved = p_solved == 1 ? true : false;//have to do this check because technically can be -1
        p_isfave = p_isfave == 1 ? true : false;
        let init = {
        method: 'PUT',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        'contentType': 'json', 
        body: JSON.stringify({ 
            "range": `A${rowInd}`,
            "majorDimension": "ROWS",
            // "valueInputOption": 'USER_ENTERED',
            
            "values": [
              [`=HYPERLINK(\"${url}\", \"${p_name}\")`, p_difficulty, p_tags.toString(), p_solved, p_tcomp, 
              p_scomp, p_notes, new Date(Date.now()).toLocaleString().split(',')[0], p_isfave]
            ]
        })
    };
    fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A${rowInd}?valueInputOption=USER_ENTERED`,
        init)
        .then((response) => response.json())
        .then(function(data) {
            console.log(data);
        });
    });

}
async function findRow(token, spreadsheetId, title) {
    let rows;
    let fetchWorked = true;
    let init = {
        method: 'GET',
        async: true,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
      };
    return fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=A:A`,
        init)
        .then((response) => {
            if (!response.ok) { 
                console.log("Getting drive sheet failed!");
                fetchWorked = false;
                return false;
            }
            
            return response.json();
        }).then((data) => { 
            console.log(data)
            rows = data['valueRanges'][0]['values'].findIndex((element) => element[0] == title);
            console.log(rows);
            return rows === undefined ? -1 : rows;
        });
        

}
async function deleteSheet(token, spreadsheetId) {
    
    let init = {
        method: 'POST',
        async: true,
        headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
            
        }
    };
    fetch(
        `https://www.googleapis.com/drive/v2/files/${spreadsheetId["spreadsheetId"]}/trash`,
        init)
}
async function createFormatSheet(token) {
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
    return fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        init)
        .then((response) => response.json())
        .then(async (data) => {
            console.log(data);
            chrome.storage.sync.set({ "spreadsheetId": data["spreadsheetId"] });
            formatDataRows(token, data["spreadsheetId"], data['sheets'][0]['properties']['sheetId']);
            addFormatHeader(token, data["spreadsheetId"], data['sheets'][0]['properties']['sheetId']);
            return addHeader(token, data["spreadsheetId"]);
        });
        
     
}
function getSheetFromDrive(token) {
    
    let fetchWorked = true;
    let init = {
        method: 'GET',
        async: true,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
      };
    return fetch(
        'https://www.googleapis.com/drive/v3/files?q=trashed%3Dfalse',
        init)
        .then((response) => {
            if (!response.ok) { 
                console.log("Getting drive sheet failed!");
                return false;
            }
            return response.json();
        })
        .then(function(data) {
            if (data) {
                console.log(data); //actually needs spreadsheet.get with the Spreadsheet ID (taken from drive fetch)
                if (data["files"].length == 0) {
                    return false;
                }
                chrome.storage.sync.set({ "spreadsheetId": data["files"][0]["id"] }).then(() => {
                    console.log("Value is set");
                });
                return true;
            }
        });
    
}
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
    red: parseInt(result[1], 16)/255,
    green: parseInt(result[2], 16)/255,
    blue: parseInt(result[3], 16)/255,
    alpha: .01
    } : null;
}
async function appendRow(token, spreadsheetId) {
    console.log(spreadsheetId);
    chrome.storage.session.get({url: "", p_name: "", p_isfave: 0, p_solved: 0, p_difficulty: "", p_tags: ["  "], 
    p_tcomp: "  ", p_scomp: "  ", p_notes: "  "}).then(({url, p_name, p_isfave, p_solved, p_difficulty, p_tags, p_tcomp, p_scomp, p_notes}) => {
        let backgroundColor = {};
        let textColor = {};
        console.log(url, p_name, p_isfave, p_solved, p_difficulty, p_tags, p_tcomp, p_scomp, p_notes);
        p_solved = p_solved == 1 ? true : false;//have to do this check because technically can be -1
        p_isfave = p_isfave == 1 ? true : false;

        switch (p_difficulty) {
            case "Easy":
                backgroundColor = hexToRgb("#aedbac");
                textColor = hexToRgb("#006d12");
                break;
            case "Medium":
                backgroundColor = hexToRgb("#f5de9e");
                textColor = hexToRgb("#6d4100");
                break;
            case "Hard":
                backgroundColor = hexToRgb("#f5ab9e");
                textColor = hexToRgb("#6d0400");
                break;
            default:
                break;
        }
        let init = {
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
                        "appendCells": {
                            "sheetId": 0,
                            "rows": [
                                {
                                    "values": [ 
                                    { "userEnteredValue": { "formulaValue": `=HYPERLINK(\"${url}\", \"${p_name}\")`},
                                        "userEnteredFormat": {"horizontalAlignment": "Center", "verticalAlignment": "MIDDLE",
                                        "wrapStrategy": 'WRAP', "textFormat": { "fontSize": 12 }}},
                                    { "userEnteredValue": { "stringValue": p_difficulty},
                                    "userEnteredFormat": {"horizontalAlignment": "Center", "verticalAlignment": "MIDDLE",
                                    "wrapStrategy": 'WRAP', "backgroundColor": backgroundColor, 
                                    "textFormat": { "foregroundColorStyle": { "rgbColor": textColor }}}},
                                    { "userEnteredValue": { "stringValue": p_tags.toString()},
                                    "userEnteredFormat": {"verticalAlignment": "MIDDLE", "wrapStrategy": 'WRAP'}},
                                    { "userEnteredValue": { "boolValue": p_solved}},
                                    { "userEnteredValue": { "stringValue": p_tcomp},
                                    "userEnteredFormat": {"horizontalAlignment": "Center", "verticalAlignment": "MIDDLE",
                                    "wrapStrategy": 'WRAP',}},
                                    { "userEnteredValue": { "stringValue": p_scomp},
                                    "userEnteredFormat": {"horizontalAlignment": "Center", "verticalAlignment": "MIDDLE",
                                    "wrapStrategy": 'WRAP',}},
                                    { "userEnteredValue": { "stringValue": p_notes},
                                    "userEnteredFormat": {"verticalAlignment": "MIDDLE", "wrapStrategy": 'WRAP',}},
                                    { "userEnteredValue": { "stringValue": new Date(Date.now()).toLocaleString().split(',')[0]},
                                    "userEnteredFormat": {"horizontalAlignment": "Center", "verticalAlignment": "MIDDLE",
                                    "wrapStrategy": 'WRAP',}},
                                    { "userEnteredValue": { "boolValue": p_isfave}},
                                    ]
                                }
                            ],
                            "fields": "userEnteredValue, userEnteredFormat"
                        }
                    }
                ]
            })
            
            };
            //8
        fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
            init)
            .then((response) => response.json())
            .then(function(data) {
                console.log(data);
            });
    });
    //Just do color coding/check with variables HERE instead of the sheets 
    //no good way to have if/else if/ else statement for Easy,Medium,Hard
    
}
async function addHeader(token, spreadsheetId) {
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
    return fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
        init)
        .then((response) => response.json())
        .then((data) => data["spreadsheetId"]);
}
async function addFormatHeader(token, spreadsheetId, sheetId) {
    
    
    let init = {
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
                    'addBanding': {
                        'bandedRange': {
                            'bandedRangeId': 1,
                            'range': {
                                'sheetId': sheetId,
                                'startRowIndex': 0
                            },
                            'rowProperties': {
                                'headerColor': {
                                'red': 0,
                                'green': 0,
                                'blue': 1,
                                'alpha': 1,
                                },
                                'firstBandColor': {
                                'red': .92156,
                                'green': .9372,
                                'blue': .94509,
                                'alpha': 0,
                                },
                                'secondBandColor': {
                                'red': 1.0,
                                'green': 1.0,
                                'blue': 1.0,
                                'alpha': 0,
                                }
                            },
                            },
                    },
                },
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
                        "startColumnIndex": 0
                    },
                    "cell": {
                        "userEnteredFormat": {
                        "backgroundColor": {
                            "red": .2901,
                            "green": .5254,
                            "blue": .9098 
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
                    "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment, wrapStrategy)"
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
        
    return fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        init)

        //have cell text wrap WrapStrategy (so cell text doesnt clip especially for notes)
        //maybe for review history just have another worksheet and table for tracking
        //add pushing to github (with file structure)
}

function formatDataRows(token, spreadsheetId, sheetId) { 
    let init = {
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
                    "repeatCell": {
                      "range": {
                        "sheetId": sheetId,
                        "startColumnIndex": 3,
                        "endColumnIndex": 4,
                      },
                      "cell": {'dataValidation': {'condition': {'type': 'BOOLEAN'}}},
                      'fields': 'dataValidation'
                    }
                },
                {
                    "repeatCell": {
                      "range": {
                        "sheetId": sheetId,
                        "startColumnIndex": 8,
                        "endColumnIndex": 9,
                      },
                      "cell": {'dataValidation': {'condition': {'type': 'BOOLEAN'}}},
                      'fields': 'dataValidation'
                    }
                },
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
}