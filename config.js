// The names of the BASE models supported (day offsets handled later)
const jcModelList = ' { "models":  [ "UK2", "UK12" ] }';


// Detailed configuration for each supported model
const jcFullSupportedModels = ' \
{ "models":  \
    [ \
        { \
            "name": "UK2", \
            "description": "UK 2Km (Your Data)", \
            "enabled": true, \
            "fullname": "UK 2Km (+0->+1)", \
            "url": "https://storage.googleapis.com/rasp-output/UK2/", \
            "centre":    ["54.3964386", "-3.9669495"],  \
            "swcorner": ["49.4383430", "-10.7258911"], \
            "necorner": ["59.3545303", "2.7919922"],	\
            "resolution": 2000, \
            "zoom": 6, \
            "parameters": ["wstar_bsratio","wstar","bsratio","hwcrit","dwcrit","hbl","dbl","hglider","bltopvariab","experimental1","zwblmaxmin","sfcshf","sfcsunpct","sfctemp","sfcdewpt","mslpress","sfcwind0","sfcwind","blwind","bltopwind","blwindshear","wblmaxmin","zsfclcldif","zsfclcl","zsfclclmask","zblcldif","zblcl","zblclmask","blcwbase","blcloudpct","rain1","cape","blicw","press1000","press950","press850","press700","press500","stars","starshg"], \
            "soundings": ["sounding1","sounding2","sounding3","sounding4","sounding5","sounding6","sounding7","sounding8","sounding9","sounding10","sounding11","sounding12","sounding13","sounding14","sounding15","sounding16"], \
			"trackaverage": false, \
            "days": ["","+1"], \
			"plot_hours": [ \
				{ \
					"day" : "", \
					"hours" : ["0600", "0700", "0800", "0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900", "2000", "2100"] \
				}, \
				{ \
					"day" : "1", \
					"hours" : ["0600", "0700", "0800", "0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800"] \
				} \
			] \
        }, \
        { \
            "name": "UK12", \
            "description": "UK 12Km (Your Data)", \
            "enabled": true, \
            "fullname": "UK 12Km (+0->+3)", \
            "url": "https://storage.googleapis.com/rasp-output/UK12/", \
            "centre":    ["54.2952499", "-4.1747437"],  \
            "swcorner": ["48.8365898", "-11.6136475"], \
            "necorner": ["59.7539062", "3.2641602"],	\
            "resolution": 12000, \
            "zoom": 6, \
            "parameters": ["wstar_bsratio","wstar","bsratio","hwcrit","dwcrit","hbl","dbl","hglider","bltopvariab","experimental1","zwblmaxmin","sfcshf","sfcsunpct","sfctemp","sfcdewpt","mslpress","sfcwind0","sfcwind","blwind","bltopwind","blwindshear","wblmaxmin","zsfclcldif","zsfclcl","zsfclclmask","zblcldif","zblcl","zblclmask","blcwbase","blcloudpct","rain1","cape","blicw","press1000","press950","press850","press700","press500","stars","starshg"], \
			"trackaverage": true, \
            "days": ["","+1","+2","+3"], \
			"plot_hours": [ \
				{ \
					"day" : "", \
					"hours" : ["0600", "0700", "0800", "0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800", "1900", "2000", "2100"] \
				}, \
				{ \
					"day" : "1", \
					"hours" : ["0600", "0700", "0800", "0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800"] \
				}, \
				{ \
					"day" : "2", \
					"hours" : ["0600", "0700", "0800", "0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800"] \
				}, \
				{ \
					"day" : "3", \
					"hours" : ["0600", "0700", "0800", "0900", "1000", "1100", "1200", "1300", "1400", "1500", "1600", "1700", "1800"] \
				} \
			] \
        } \
	] \
}'; // <-- THIS JSON IS NOW VALID (Comments removed)

// List of all possible parameters and their display names/descriptions
const jcFullSupportedParameters = ' \
{ "parameters":  \
    [ \
        { "name": "wstar_bsratio",  "longname": "Thermal Updraft Velocity & B/S Ratio",             "primary": true,     "description": "description" }, \
        { "name": "wstar",          "longname": "Thermal Updraft Velocity (W*)",                    "primary": true,     "description": "description" }, \
        { "name": "bsratio",        "longname": "Buoyancy/Shear Ratio",                             "primary": false,    "description": "description" }, \
        { "name": "hwcrit",         "longname": "Ht of Critical Updraft Strength (225fpm)",         "primary": false,    "description": "description" }, \
        { "name": "dwcrit",         "longname": "Depth of Critical Updraft Strength (AGL Hcrit)",   "primary": false,    "description": "description" }, \
        { "name": "hbl",            "longname": "BL Top",                                           "primary": false,    "description": "description" }, \
        { "name": "dbl",            "longname": "BL Depth",                                         "primary": false,    "description": "description" }, \
        { "name": "hglider",        "longname": "Thermalling Height",                               "primary": true,     "description": "description" }, \
        { "name": "bltopvariab",    "longname": "Thermal Height Uncertainty",                       "primary": false,    "description": "description" }, \
        { "name": "experimental1",  "longname": "Ht of Critical Updraft Strength (175fpm)",         "primary": false,    "description": "description" }, \
        { "name": "zwblmaxmin",     "longname": "MSL Height of max/min Wbl",                        "primary": false,    "description": "description" }, \
        { "name": "sfcshf",         "longname": "Surface Heating",                                  "primary": false,    "description": "description" }, \
        { "name": "sfcsunpct",      "longname": "Normalized Sfc. Sun",                              "primary": false,    "description": "description" }, \
        { "name": "sfctemp",        "longname": "Sfc.Temperature",                                  "primary": true,     "description": "description" }, \
        { "name": "sfcdewpt",       "longname": "Sfc.Dew Point",                                    "primary": false,    "description": "description" }, \
        { "name": "mslpress",       "longname": "MSL Pressure",                                     "primary": false,    "description": "description" }, \
        { "name": "sfcwind0",       "longname": "Sfc.Wind (2m)",                                    "primary": true,     "description": "description" }, \
        { "name": "sfcwind",        "longname": "Sfc.Wind (10m)",                                   "primary": true,     "description": "description" }, \
        { "name": "blwind",         "longname": "BL Avg. Wind",                                     "primary": true,     "description": "description" }, \
        { "name": "bltopwind",      "longname": "Wind at BL Top",                                   "primary": false,    "description": "description" }, \
        { "name": "blwindshear",    "longname": "BL Wind Shear",                                    "primary": false,    "description": "description" }, \
        { "name": "wblmaxmin",      "longname": "BL Max. Up/Down (Convergence)",                    "primary": true,     "description": "description" }, \
        { "name": "zsfclcldif",     "longname": "Cu Potential",                                     "primary": false,    "description": "description" }, \
        { "name": "zsfclcl",        "longname": "Cu Cloudbase (Sfc.LCL) MSL",                       "primary": false,    "description": "description" }, \
        { "name": "zsfclclmask",    "longname": "Cu Cloudbase where CuPotential > 0",               "primary": true,     "description": "description" }, \
        { "name": "zblcldif",       "longname": "OD Potential",                                     "primary": false,    "description": "description" }, \
        { "name": "zblcl",          "longname": "OD Cloudbase (BL CL) MSL",                         "primary": false,    "description": "description" }, \
        { "name": "zblclmask",      "longname": "OD Cloudbase where ODpotential > 0",               "primary": false,    "description": "description" }, \
        { "name": "blcwbase",       "longname": "BL Cld-Base if CloudWater predicted",              "primary": false,    "description": "description" }, \
        { "name": "blcloudpct",     "longname": "BL Cloud Cover",                                   "primary": false,    "description": "description" }, \
        { "name": "rain1",          "longname": "Rain",                                             "primary": true,     "description": "description" }, \
        { "name": "cape",           "longname": "CAPE",                                             "primary": false,    "description": "description" }, \
        { "name": "blicw",          "longname": "BL Integrated Cloud Water",                        "primary": false,    "description": "description" }, \
        { "name": "press1000",      "longname": "Vertical Velocity at 1000mb",                      "primary": false,    "description": "press1000 description" }, \
        { "name": "press950",       "longname": "Vertical Velocity at 950mb",                       "primary": false,    "description": "press950 description" }, \
        { "name": "press850",       "longname": "Vertical Velocity at 850mb",                       "primary": true,     "description": "press850 description" }, \
        { "name": "press700",       "longname": "Vertical Velocity at 700mb",                       "primary": false,    "description": "press700 description" }, \
        { "name": "press500",       "longname": "Vertical Velocity at 500mb",                       "primary": false,    "description": "press500 description" }, \
        { "name": "stars",          "longname": "Star Rating",                                      "primary": true,     "description": "stars description" }, \
        { "name": "starshg",        "longname": "Star Rating - Foot Launchers",                     "primary": true,     "description": "starshg description" } \
    ] \
}'; // <-- THIS JSON IS VALID

// Sounding locations per model
const jcModelSoundings = ' \
{ "soundings":  \
    [ \
        { "model": "UK2", \
            "location":[ \
                { "name": "Exeter",          "centre": ["50.7344",   "-3.4139"] }, \
                { "name": "Fairford",        "centre": ["51.682",    "-1.7900"] }, \
                { "name": "Herstmonceaux",   "centre": ["50.8833",   "0.3333"] }, \
                { "name": "Newtown",         "centre": ["52.5157",   "-3.300"] }, \
                { "name": "Cambridge",       "centre": ["52.2050",   "0.1750"] }, \
                { "name": "Nottingham",      "centre": ["52.9667",   "-1.1667"] }, \
                { "name": "Cheviots",        "centre": ["55.5",      "-2.2"] }, \
                { "name": "Callander",       "centre": ["56.2500",   "-4.2333"] }, \
                { "name": "Aboyne",       	 "centre": ["57.0833",   "-2.8333"] }, \
                { "name": "Buckingham",      "centre": ["52.0000",   "-0.9833"] }, \
                { "name": "Larkhill",        "centre": ["51.2000",   "-1.8167"] }, \
                { "name": "Leeds",           "centre": ["53.869",    "-1.650"] }, \
                { "name": "Carrickmore",     "centre": ["54.599",    "-7.049"] }, \
                { "name": "CastorBay NI",    "centre": ["54.5",      "-6.33"] }, \
                { "name": "Talgarth",        "centre": ["51.979558", "-3.206081"] }, \
                { "name": "Camphill",        "centre": ["53.305",    "-1.7291"] } \
            ] \
        }, \
        { "model": "UK12", \
            "location":[ \
                { "name": "Exeter",          "centre": ["50.7344",   "-3.4139"] }, \
                { "name": "Fairford",        "centre": ["51.682",    "-1.7900"] }, \
                { "name": "Herstmonceaux",   "centre": ["50.8833",   "0.3333"] }, \
                { "name": "Newtown",         "centre": ["52.5157",   "-3.300"] }, \
                { "name": "Cambridge",       "centre": ["52.2050",   "0.1750"] }, \
                { "name": "Nottingham",      "centre": ["52.9667",   "-1.1667"] }, \
                { "name": "Cheviots",        "centre": ["55.5",      "-2.2"] }, \
                { "name": "Callander",       "centre": ["56.2500",   "-4.2333"] }, \
                { "name": "Aboyne",       	 "centre": ["57.0833",   "-2.8333"] }, \
                { "name": "Buckingham",      "centre": ["52.0000",   "-0.9833"] }, \
                { "name": "Larkhill",        "centre": ["51.2000",   "-1.8167"] }, \
                { "name": "Leeds",           "centre": ["53.869",    "-1.650"] }, \
                { "name": "Carrickmore",     "centre": ["54.599",    "-7.049"] }, \
                { "name": "CastorBay NI",    "centre": ["54.5",      "-6.33"] }, \
                { "name": "Talgarth",        "centre": ["51.979558", "-3.206081"] }, \
                { "name": "Camphill",        "centre": ["53.305",    "-1.7291"] } \
            ] \
        } \
    ] \
}'; // <-- THIS JSON IS NOW VALID (Comment removed)

// --- General Settings ---
const scDefaultSoundingPopupSize = "530"; // Size of the sounding image popup
const scDefaultModel = "UK12";            // Default model to show on load (must be in jcModelList)
const scDefaultParameter = "stars";       // Default parameter to show on load
const scDefaultParameterTime = "1200";    // Default time to show on load (ensure this exists in plot_hours for the default model/day)
const icMapHeight = 600;                  // Default map height (might be overridden by setsize.js)
const icMapWidth = 600;                   // Default map width (might be overridden by setsize.js)
const scWaterMarkLocation = 'topleft';    // Options: bottomleft, bottomright, topleft, topright
const scZoomLocation = 'bottomleft';      // Options: bottomleft, bottomright, topleft, topright
const scScaleLocation = 'topright';       // Options: bottomleft, bottomright, topleft, topright
const scOpacityLocation = 'bottomright';  // Options: bottomleft, bottomright, topleft, topright

// --- Paths and URLs ---
const sForecastServerRoot = "https://storage.googleapis.com/rasp-output";   // YOUR GCS BUCKET URL
const scWatermarkLogoLocation = "water-mark-logo.png"; // Path to your watermark logo (relative to index.html)
const scPathToIcons = 'icons/'; // <<-- IMPORTANT: Define path to icons (e.g., sndmkr.png, gliding-club-inv.png) relative to index.html

// --- Base Map Configuration ---
const scAttribution = 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'; // Attribution - important!
const scAttributionOSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // Standard OSM Tiles (HTTPS)

const icDefaultZoom = 6; // Default map zoom level

// --- Default Image Paths (Used for initial load - will be updated dynamically) ---
// Note: These rely on default model/param/time and the structure defined in main.js
// The '/FCST/' part is *removed* here too, matching the change in main.js
var scScalePanelDefault = sForecastServerRoot + "/"+scDefaultModel+"/"+scDefaultParameter +".curr."+scDefaultParameterTime +"lst.d2.side.png";
var scTitlePanelDefault = sForecastServerRoot + "/"+scDefaultModel+"/"+scDefaultParameter +".curr."+scDefaultParameterTime +"lst.d2.head.png";