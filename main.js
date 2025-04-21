// --- START OF FILE main.js ---

// Version 1.7 (Smart Controls - Desktop Drag Scroll)
// Main JavaScript Build file

(function() { // Wrap in an IIFE (Immediately Invoked Function Expression) to avoid polluting global scope

    // --- Global Variables (within IIFE scope) ---
    var map;                    // Leaflet map instance
    var lPlotOverlay;           // Leaflet image overlay for the forecast
	var titleObj;               // Reference to title image element
	var sideScaleObj;           // Reference to side scale image element
	var scaleObj;               // Reference to bottom scale image element (used for src update)
	var gsSelectedModel;        // Store the selected MODEL name (e.g., "UK12")
    var gsSelectedDaySuffix;    // Store the selected DAY suffix (e.g., "", "+1", "+2")
    var gsSelectedTime;         // Store the selected TIME string (e.g., "1200")
    var gsSelectedParameter;    // Store the selected PARAMETER name
    var gSoundingLayer;         // Layer group holding sounding markers
	var gfOpacityLevel = 0.3;   // Initial opacity for the forecast overlay (0.0 to 1.0)
    var currentModelConfig = null; // Store config for the currently selected model
    const DEFAULT_PARAM_PREFERENCE = 'stars'; // Preferred default parameter
    const DEFAULT_TIME_PREFERENCE = '1200';   // Preferred default time

    // ---------------------------------------------------------------------------------------
    // ---- Helper Function Definitions ----
    // ---------------------------------------------------------------------------------------

    // =============================================
    // == NEW: Drag Scrolling Helper Function ==
    // =============================================
    function enableDragScroll(slider) {
        if (!slider) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        // Mouse Down: Start tracking
        slider.addEventListener('mousedown', (e) => {
            // Ignore if clicking on scrollbar itself or not left mouse button
            if (e.offsetX >= slider.clientWidth - 15 || e.button !== 0) return; // Adjust 15px tolerance for scrollbar width
            isDown = true;
            slider.classList.add('active-drag');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            // console.log("Drag Start: startX=", startX, "scrollLeft=", scrollLeft);
        });

        // Mouse Leave: Stop tracking if mouse leaves the element while down
        slider.addEventListener('mouseleave', () => {
            if (!isDown) return;
            isDown = false;
            slider.classList.remove('active-drag');
            // console.log("Drag Leave");
        });

        // Mouse Up: Stop tracking (global mouseup listener is safer)
        document.addEventListener('mouseup', (e) => { // Changed to document listener
            if (!isDown || e.button !== 0) return;
            isDown = false;
            if(slider.classList.contains('active-drag')){ // Only remove if it was active
               slider.classList.remove('active-drag');
               // console.log("Drag End (mouseup)");
            }
        }, true); // Use capture phase to catch mouseup reliably

        // Mouse Move: Perform the scroll
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault(); // Prevent text selection, etc.
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5; // Multiply for faster scroll feel (adjust 1.5 as needed)
            slider.scrollLeft = scrollLeft - walk;
            // console.log("Dragging: x=", x, "walk=", walk, "newScrollLeft=", slider.scrollLeft);
        });

         // Prevent default drag behavior on buttons/links inside if needed
         // This helps ensure button clicks still work reliably
        const itemsInside = slider.querySelectorAll('button, a'); // Add other clickable elements if necessary
        itemsInside.forEach(item => {
            item.addEventListener('dragstart', (e) => e.preventDefault());
        });

        console.log("Drag scroll enabled for element:", slider.id || slider.className);
    }
    // =============================================
    // =============================================


    function AddAttribution() {
        // console.log("---AddAttribution()");
        if (typeof L === 'undefined' || !L.tileLayer) { console.error("Leaflet library (L) not available."); return; }
        if (!scAttributionOSM || !scAttribution) { console.error("Base map URL/attribution missing."); return; }
        L.tileLayer(scAttributionOSM, { attribution: scAttribution, subdomains: 'abc', maxZoom: 18 }).addTo(map);
        console.log("Added base map tile layer.");
    }

    function GetModelCentre(sModel) {
        // console.log("---GetModelCentre(" + sModel + ")");
        try {
            var oaList = JSON.parse(jcFullSupportedModels);
            const modelConfig = oaList.models.find(m => m.enabled && m.name === sModel);
            if (modelConfig?.centre?.length === 2) {
                const lat = parseFloat(modelConfig.centre[0]);
                const lon = parseFloat(modelConfig.centre[1]);
                if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
            }
        } catch (e) { console.error("Error parsing models JSON (GetModelCentre):", e); }
        console.warn(sModel + " centre not found/invalid. Using default.");
        return [51.0, -1.0];
    }

    function GetModelZoom(sModel) {
        // console.log("---GetModelZoom(" + sModel + ")");
         try {
            var oaList = JSON.parse(jcFullSupportedModels);
            const modelConfig = oaList.models.find(m => m.enabled && m.name === sModel);
            if (modelConfig && typeof modelConfig.zoom !== 'undefined') {
                const zoom = parseInt(modelConfig.zoom, 10);
                if (!isNaN(zoom)) return zoom;
            }
        } catch (e) { console.error("Error parsing models JSON (GetModelZoom):", e); }
        return icDefaultZoom;
    }

    function GetModelCorners(sModel) {
        // console.log("---GetModelCorners(" + sModel + ")");
        try {
            var oaList = JSON.parse(jcFullSupportedModels);
            const modelConfig = oaList.models.find(m => m.enabled && m.name === sModel);
            if (modelConfig?.swcorner?.length === 2 && modelConfig?.necorner?.length === 2) {
                 var swLat = parseFloat(modelConfig.swcorner[0]);
                 var swLng = parseFloat(modelConfig.swcorner[1]);
                 var neLat = parseFloat(modelConfig.necorner[0]);
                 var neLng = parseFloat(modelConfig.necorner[1]);
                 if (!isNaN(swLat) && !isNaN(swLng) && !isNaN(neLat) && !isNaN(neLng)) {
                     return [[swLat, swLng], [neLat, neLng]];
                 }
            }
        } catch (e) { console.error("Error parsing JSON (GetModelCorners):", e); }
        console.warn(sModel + " corners not found/invalid. Using default.");
        return [[49.4, -10.8], [59.4, 2.8]];
    }

    function CreateDefaultURL() {
        if (!sForecastServerRoot || !gsSelectedModel || !gsSelectedParameter || !gsSelectedTime) {
             console.warn(`CreateDefaultURL: Missing info - Model: ${gsSelectedModel}, Param: ${gsSelectedParameter}, Time: ${gsSelectedTime}`);
             return null;
        }
        return `${sForecastServerRoot}/${gsSelectedModel}${gsSelectedDaySuffix || ''}/${gsSelectedParameter}.curr.${gsSelectedTime}lst.d2.body.png`;
    }

    function AddModelParameters(sModel) {
        console.log(`>>> AddModelParameters(Model=${sModel}) - Applying default preference: '${DEFAULT_PARAM_PREFERENCE}'`);
        const paramSelector = document.getElementById("sParamSelect");
        if (!paramSelector) { console.error("Parameter selector element ('sParamSelect') not found."); return; }
        paramSelector.innerHTML = '';

        let defaultParamFound = false;
        let firstAvailableParam = null;
        gsSelectedParameter = null;

        try {
            if (typeof jcFullSupportedParameters === 'undefined' || typeof jcFullSupportedModels === 'undefined') {
                 console.error("jcFullSupportedParameters or jcFullSupportedModels not defined."); paramSelector.add(new Option("Error: Config missing", "")); return;
            }
            var oaAllParameters = JSON.parse(jcFullSupportedParameters);
            var paramDetails = {};
            oaAllParameters.parameters.forEach(p => { paramDetails[p.name] = { longname: p.longname, primary: p.primary }; });

            var oaModelList = JSON.parse(jcFullSupportedModels);
             if (!currentModelConfig || currentModelConfig.name !== sModel) {
                  currentModelConfig = oaModelList.models.find(m => m.enabled && m.name === sModel);
             }

            if (currentModelConfig && currentModelConfig.parameters && currentModelConfig.parameters.length > 0) {
                var optionsAdded = 0;

                currentModelConfig.parameters.forEach(paramName => {
                    const details = paramDetails[paramName];
                    if (details) {
                        var option = new Option(details.longname, paramName);
                        option.style.color = details.primary ? "blue" : "black";
                        paramSelector.add(option);
                        optionsAdded++;
                        if (optionsAdded === 1) { firstAvailableParam = paramName; }
                        if (paramName === DEFAULT_PARAM_PREFERENCE) { defaultParamFound = true; }
                    } else { console.warn(`Details missing for parameter: ${paramName}`); }
                });
                console.log("Added " + optionsAdded + " parameters to dropdown.");

                if (defaultParamFound) {
                    paramSelector.value = DEFAULT_PARAM_PREFERENCE;
                    gsSelectedParameter = DEFAULT_PARAM_PREFERENCE;
                    console.log(`Default parameter set to preferred: ${gsSelectedParameter}`);
                } else if (firstAvailableParam) {
                    paramSelector.value = firstAvailableParam;
                    gsSelectedParameter = firstAvailableParam;
                    console.log(`Preferred parameter '${DEFAULT_PARAM_PREFERENCE}' not found. Defaulting to first available: ${gsSelectedParameter}`);
                } else {
                     paramSelector.add(new Option("N/A", ""));
                     gsSelectedParameter = null;
                     console.warn("No valid parameters found for model " + sModel);
                }
            } else { console.warn(`No parameters found/defined for model ${sModel}.`); paramSelector.add(new Option("N/A", "")); gsSelectedParameter = null; }
        } catch (e) { console.error("Error parsing JSON in AddModelParameters:", e); paramSelector.add(new Option("Error", "")); gsSelectedParameter = null; }
    }

    function populateModelSelector() {
        console.log("---Populating Model Selector---");
        const selector = document.getElementById("sModelSelect");
        if (!selector) { console.error("Element 'sModelSelect' not found."); return; }
        selector.innerHTML = '';

        try {
            const modelData = JSON.parse(jcFullSupportedModels);
            let foundDefault = false;
            modelData.models.forEach(model => {
                if (model.enabled) {
                    const displayText = model.description || model.name;
                    const option = new Option(displayText, model.name);
                    selector.add(option);
                    if (model.name === gsSelectedModel) { option.selected = true; foundDefault = true; }
                }
            });
            if (!foundDefault && selector.options.length > 0) {
                selector.selectedIndex = 0; gsSelectedModel = selector.value;
                 console.warn(`Configured default model '${scDefaultModel}' not found or not enabled. Defaulting to first model: ${gsSelectedModel}`);
            }
        } catch (e) { console.error("Error populating models:", e); selector.add(new Option("Error loading", "")); }
    }

    function updateDayButtons() {
        console.log("---Updating Day Buttons---");
        const container = document.getElementById("dayButtonContainer"); // Get container reference
        if (!container || !currentModelConfig || !currentModelConfig.days) {
            if (container) container.innerHTML = 'N/A';
            console.warn("Cannot update day buttons - container or model config/days missing."); return;
        }
        container.innerHTML = ''; // Clear existing

        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	    const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const Now = new Date().getTime();
	    const mS_Day = 24 * 60 * 60 * 1000;
	    const T = new Date();
        let foundSelected = false;

        currentModelConfig.days.forEach(daySuffix => {
            const dayOffset = (daySuffix === "") ? 0 : parseInt(daySuffix.replace('+', ''), 10);
            if (isNaN(dayOffset)) { console.warn(`Invalid daySuffix found: ${daySuffix}`); return; }
            T.setTime(Now + (mS_Day * dayOffset));
            const btnText = `${dayName[T.getDay()]} ${T.getDate()} ${monthName[T.getMonth()]}`;
            const button = document.createElement('button');
            button.type = 'button'; button.textContent = btnText; button.title = `Day ${daySuffix || '+0'}`; button.dataset.daySuffix = daySuffix;
            if (daySuffix === gsSelectedDaySuffix) {
                 button.classList.add('active');
                 foundSelected = true;
                 // console.log(`Activating day button for suffix: '${daySuffix}'`); // Less verbose
             }
            button.addEventListener('click', (e) => handleDayChange(e.target.dataset.daySuffix));
            container.appendChild(button);
        });

        if (!foundSelected && container.firstChild) {
            gsSelectedDaySuffix = container.firstChild.dataset.daySuffix;
            container.firstChild.classList.add('active');
            console.warn("Could not activate the expected day button. Defaulted day selection to first button:", gsSelectedDaySuffix);
        }
         if (container.children.length === 0) {
             container.textContent = "No days available.";
             gsSelectedDaySuffix = undefined;
         }

        // *** NEW: Enable drag scroll on the populated container ***
        enableDragScroll(container);
    }

        function updateTimeButtons() {
        console.log(`---Updating Time Buttons (Filtering 0800-1800, Preferring ${DEFAULT_TIME_PREFERENCE})---`); // Log change
        const container = document.getElementById("timeButtonContainer");
         if (!container || !currentModelConfig || !currentModelConfig.plot_hours) {
             if(container) container.innerHTML = 'N/A';
             console.warn("Cannot update time buttons - container or model plot_hours missing.");
             gsSelectedTime = null;
             return;
         }
        container.innerHTML = ''; // Clear existing
        gsSelectedTime = null; // Reset global state before processing

        let dayOffset = 0;
        if (typeof gsSelectedDaySuffix !== 'undefined') {
            dayOffset = (gsSelectedDaySuffix === "") ? 0 : parseInt(gsSelectedDaySuffix.replace('+', ''), 10);
            if (isNaN(dayOffset)) { console.warn(`Invalid gsSelectedDaySuffix ('${gsSelectedDaySuffix}') passed to updateTimeButtons. Defaulting day offset to 0.`); dayOffset = 0; }
        } else { console.warn("gsSelectedDaySuffix is undefined in updateTimeButtons. Defaulting day offset to 0."); dayOffset = 0; }

        let originalHoursArray = [];
        if(currentModelConfig.plot_hours.length > dayOffset && Array.isArray(currentModelConfig.plot_hours[dayOffset].hours)) {
            originalHoursArray = currentModelConfig.plot_hours[dayOffset].hours;
        } else { console.warn(`No plot_hours defined or invalid format for day index ${dayOffset}`); }

        // *** START TIME FILTERING ***
        const filteredHoursArray = originalHoursArray.filter(time => {
            // Convert time string (e.g., "0900", "1400") to number for comparison
            const timeInt = parseInt(time, 10);
            // Check if conversion was successful and if it's within the desired range
            return !isNaN(timeInt) && timeInt >= 800 && timeInt <= 1800;
        });
        console.log(`Filtered times (0800-1800): ${filteredHoursArray.join(', ')}`);
        // *** END TIME FILTERING ***


        // --- Use filteredHoursArray for the rest of the logic ---
        if (filteredHoursArray.length === 0) {
             container.textContent = "No times available (0800-1800)."; // Updated message
             gsSelectedTime = null; // Explicitly null if no times
             console.log("No filtered time buttons to add for this day.");
             return;
        }

        // Determine the target time based on the FILTERED list
        let targetTime = null;
        // Does the preferred default time still exist after filtering?
        if (filteredHoursArray.includes(DEFAULT_TIME_PREFERENCE)) {
            targetTime = DEFAULT_TIME_PREFERENCE;
            // console.log(`Preferred time ${DEFAULT_TIME_PREFERENCE} is available in filtered list.`); // Less verbose
        } else if (filteredHoursArray.length > 0) {
            // Fallback to the first available time IN THE FILTERED LIST
            targetTime = filteredHoursArray[0];
            console.log(`Preferred time ${DEFAULT_TIME_PREFERENCE} not available in filtered list. Defaulting to first filtered time: ${targetTime}.`);
        } else {
            // This case should not be reached due to the length check above, but good for completeness
            console.log("No times available in filteredHoursArray.");
        }

        // Create buttons using the FILTERED list
        let timeActivated = false;
        filteredHoursArray.forEach(time => {
            const button = document.createElement('button');
            button.type = 'button'; button.textContent = time; button.dataset.time = time;
            if (time === targetTime) { // Activate based on calculated targetTime
                 button.classList.add('active');
                 gsSelectedTime = time; // Set global state
                 timeActivated = true;
                 // console.log(`Activating time button: ${gsSelectedTime}`); // Less verbose
            }
            button.addEventListener('click', (e) => handleTimeChange(e.target.dataset.time));
            container.appendChild(button);
        });

        // Fallback if targetTime logic failed (using FILTERED list)
        if (!timeActivated && container.firstChild) {
             gsSelectedTime = container.firstChild.dataset.time;
             container.firstChild.classList.add('active');
             console.warn("Could not activate the target time button. Defaulting to first filtered time button:", gsSelectedTime);
        }

        if (!gsSelectedTime) {
            console.warn("Finished updateTimeButtons but gsSelectedTime is still null/undefined after filtering.");
        }

         // Enable drag scroll on the populated container (using the filtered buttons)
         enableDragScroll(container);
    }

    function GetSoundingMarkers(L, sModel, sDaySuffix, sTime) {
        // console.log(`---GetSoundingMarkers(Model=${sModel}, DaySuffix=${sDaySuffix}, Time=${sTime})`);
        var oMarkers = [];
        var myIcon = L.icon({
            iconUrl: (typeof scPathToIcons !== 'undefined' ? scPathToIcons : './') + 'sndmkr.png', // Ensure correct path
            iconSize: [25, 25], iconAnchor: [12, 12], popupAnchor: [0, -12]
        });

        try {
            if (typeof jcModelSoundings === 'undefined') { console.warn("jcModelSoundings not defined."); return L.layerGroup(); }
            var oaSoundingList = JSON.parse(jcModelSoundings);
            const modelSoundings = oaSoundingList.soundings.find(m => m.model === sModel);

            if (modelSoundings?.location?.length > 0) {
                modelSoundings.location.forEach((loc, index) => {
                    var fLat = parseFloat(loc.centre[0]); var fLon = parseFloat(loc.centre[1]); var sName = loc.name;
                    var soundingFileIndex = index + 1; var sTooltipText = `${sName} (Sounding ${soundingFileIndex})`;
                    if (!isNaN(fLat) && !isNaN(fLon)) {
                        var marker = L.marker([fLat, fLon], { icon: myIcon })
                            .bindTooltip(sTooltipText)
                            .bindPopup(L.popup({ maxWidth: parseInt(scDefaultSoundingPopupSize || '530', 10) + 20, minWidth: parseInt(scDefaultSoundingPopupSize || '530', 10) }).setContent("Loading sounding...") );
                        marker.on('popupopen', function(e) {
                            if (!gsSelectedModel || typeof gsSelectedDaySuffix === 'undefined' || !gsSelectedTime) {
                                 console.error("Popup open error: Missing selection state.");
                                 e.target.getPopup().setContent("Error: Cannot determine current selection."); return;
                            }
                            var tooltipContent = e.target.getTooltip().getContent(); var match = tooltipContent.match(/Sounding (\d+)/);
                            var fileIndexToLoad = match ? match[1] : null; if (!fileIndexToLoad) { e.target.getPopup().setContent("Error determining sounding index."); return; }
                            var sImageUrl = `${sForecastServerRoot}/${gsSelectedModel}${gsSelectedDaySuffix}/sounding${fileIndexToLoad}.curr.${gsSelectedTime}lst.d2.png`;
                            var imgSize = scDefaultSoundingPopupSize || '530';
                            var sImageTag = `<img src='${sImageUrl}' width='${imgSize}' height='${imgSize}' style='width:${imgSize}px; height:${imgSize}px; display:block; margin:auto;' alt='Sounding plot for ${sName} at ${gsSelectedTime}'>`;
                            var sPopupContent = `<div style="text-align:center;"><b>${sName} - ${gsSelectedTime}</b>${sImageTag}</div>`;
                            e.target.getPopup().setContent(sPopupContent);
                        });
                        oMarkers.push(marker);
                    } else { console.warn(`Invalid lat/lon for sounding: ${sName}`); }
                });
            } //else { console.log(`No sounding locations defined for model ${sModel}`); } // Less verbose
        } catch (e) { console.error("Error parsing jcModelSoundings JSON:", e); }
        // console.log(`+++GetSoundingMarkers created ${oMarkers.length} markers for model ${sModel}.`); // Less verbose
        return L.layerGroup(oMarkers);
    }

    function BuildSoundingControl(sModel, sDaySuffix, sTime) {
        // console.log(`---BuildSoundingControl(Model=${sModel}, DaySuffix=${sDaySuffix}, Time=${sTime})`); // Less verbose
        if (gSoundingLayer && map && map.hasLayer(gSoundingLayer)) {
            map.removeLayer(gSoundingLayer);
        }
        if (gSoundingLayer) {
            gSoundingLayer.clearLayers();
        } else {
            gSoundingLayer = L.layerGroup();
        }
        gSoundingLayer = GetSoundingMarkers(L, sModel, sDaySuffix, sTime);
        // console.log("+++BuildSoundingControl finished (Sounding markers generated)."); // Less verbose
    }

    function UpdateOverlay(bUpdateSoundingControl) {
        // console.log(`---UpdateOverlay (Update Soundings: ${bUpdateSoundingControl})`); // Less verbose
        if (!gsSelectedModel || typeof gsSelectedDaySuffix === 'undefined' || !gsSelectedParameter || !gsSelectedTime) {
             console.error(`Update Aborted: Missing state - Model: ${gsSelectedModel}, Day: '${gsSelectedDaySuffix}', Param: ${gsSelectedParameter}, Time: ${gsSelectedTime}`); return;
        }
        console.log(`Updating for: Model=${gsSelectedModel}, DaySuffix='${gsSelectedDaySuffix}', Param=${gsSelectedParameter}, Time=${gsSelectedTime}`);

        if (bUpdateSoundingControl) {
             BuildSoundingControl(gsSelectedModel, gsSelectedDaySuffix, gsSelectedTime);
        }

        var sBaseImagePath = `${sForecastServerRoot}/${gsSelectedModel}${gsSelectedDaySuffix}/${gsSelectedParameter}.curr.${gsSelectedTime}lst.d2`;
        var sPlotURL = sBaseImagePath + ".body.png";
        var sScaleURL = sBaseImagePath + ".side.png";
        var sBottomScaleURL = sBaseImagePath + ".foot.png";
        var sTitleURL = sBaseImagePath + ".head.png";

        var gAImageBounds = GetModelCorners(gsSelectedModel);
        if (gAImageBounds) {
            if (lPlotOverlay && map.hasLayer(lPlotOverlay)) { // Check if layer is on map too
                 lPlotOverlay.setBounds(gAImageBounds);
                 lPlotOverlay.setUrl(sPlotURL);
                 // console.log("Updated overlay URL and bounds."); // Less verbose
            } else if (map) { // If overlay doesn't exist or not on map, create/add it
                 if (lPlotOverlay) map.removeLayer(lPlotOverlay); // Remove if exists but wasn't on map
                 lPlotOverlay = L.imageOverlay(sPlotURL, gAImageBounds, {
                     opacity: gfOpacityLevel, // Use current opacity
                     errorOverlayUrl: 'icons/error.png' // Ensure path is correct
                    }).addTo(map);
                 console.log("Created/Re-added forecast overlay.");
                 initializeOpacitySlider(); // Ensure slider is linked
            } else {
                 console.error("Could not update map overlay - Map object not available.");
            }
        } else { console.error("Could not update map overlay - Bounds missing."); }

        if (titleObj) { titleObj.src = sTitleURL; } // else { console.warn("Title image element not found."); } // Less verbose
        if (sideScaleObj) { sideScaleObj.src = sScaleURL; } // else { console.warn("Side scale image element not found."); }
        if (scaleObj) { scaleObj.src = sBottomScaleURL; } // else { console.warn("Bottom scale image element not found."); }
    }

    function handleModelChange(selectedModelName) {
        console.log("===== Model changed to:", selectedModelName, " =====");
        if (gsSelectedModel === selectedModelName && currentModelConfig) {
             // console.log("Model selection hasn't changed, skipping full update."); // Less verbose
             return;
        }
        gsSelectedModel = selectedModelName;

        try {
             const modelData = JSON.parse(jcFullSupportedModels);
             currentModelConfig = modelData.models.find(m => m.name === gsSelectedModel && m.enabled);
        } catch(e) { console.error("Error finding model config:", e); currentModelConfig = null; }

        if (currentModelConfig) {
            // console.log("Found config for model:", gsSelectedModel); // Less verbose

            if (currentModelConfig.days && currentModelConfig.days.length > 0) {
                gsSelectedDaySuffix = currentModelConfig.days[0];
                 // console.log(`Default day set to first available: '${gsSelectedDaySuffix}'`); // Less verbose
            } else {
                gsSelectedDaySuffix = "";
                 console.warn(`No 'days' array found for model ${gsSelectedModel}. Defaulting day suffix to empty string.`);
            }

            AddModelParameters(gsSelectedModel);
            updateDayButtons(); // This now calls enableDragScroll internally
            updateTimeButtons(); // This now calls enableDragScroll internally

            var aCentre = GetModelCentre(gsSelectedModel);
            var iZoom = GetModelZoom(gsSelectedModel);
            if (aCentre && typeof iZoom === 'number') {
                map.setView(aCentre, iZoom);
                // console.log(`Map view updated to center: ${aCentre}, zoom: ${iZoom}`); // Less verbose
            } else { console.warn("Could not get center/zoom for map view update."); }

            UpdateOverlay(true);

        } else {
            console.error("Could not find enabled config for model:", gsSelectedModel);
            document.getElementById("sParamSelect").innerHTML = '<option>Select Model</option>';
            document.getElementById("dayButtonContainer").innerHTML = 'N/A';
            document.getElementById("timeButtonContainer").innerHTML = 'N/A';
            if(lPlotOverlay && map) {
                 map.removeLayer(lPlotOverlay);
                 lPlotOverlay = null;
                 console.log("Removed forecast overlay as model config is missing.");
            }
            gsSelectedParameter = null;
            gsSelectedDaySuffix = undefined;
            gsSelectedTime = null;
        }
    }

    function handleParameterChange(selectedParam) {
        // console.log("Parameter changed to:", selectedParam); // Less verbose
        if (gsSelectedParameter === selectedParam) return;
        gsSelectedParameter = selectedParam;
        UpdateOverlay(false);
    }

    function handleDayChange(selectedDaySuffix) {
        // console.log("Day changed to:", selectedDaySuffix); // Less verbose
        if (gsSelectedDaySuffix === selectedDaySuffix) return;
        gsSelectedDaySuffix = selectedDaySuffix;

        const container = document.getElementById("dayButtonContainer");
        if (container) {
            container.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.daySuffix === gsSelectedDaySuffix);
            });
        }
        updateTimeButtons(); // Re-apply time defaults and enable drag scroll for new times
        UpdateOverlay(true); // Update overlay and soundings
    }

    function handleTimeChange(selectedTime) {
        // console.log("Time changed to:", selectedTime); // Less verbose
         if (gsSelectedTime === selectedTime) return;
        gsSelectedTime = selectedTime;

        const container = document.getElementById("timeButtonContainer");
         if (container) {
             container.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.time === gsSelectedTime);
             });
         }
        UpdateOverlay(false); // Only image update needed
    }

    function onMapClick(e) {
        // console.log("Map clicked at", e.latlng); // Less verbose
    }

    function DoClickUpdateOverlay() { // Called by onMapClick if uncommented
        var timeButtonContainer = document.getElementById("timeButtonContainer");
        if (!timeButtonContainer) return;
        var buttons = timeButtonContainer.querySelectorAll('button');
        if (buttons.length <= 1) return;
        let currentIndex = -1;
        buttons.forEach((btn, index) => { if(btn.classList.contains('active')) currentIndex = index; });
        let nextIndex = (currentIndex >= 0 && currentIndex < buttons.length - 1) ? currentIndex + 1 : 0;
        if (buttons[nextIndex]) handleTimeChange(buttons[nextIndex].dataset.time);
    }

    function initializeOpacitySlider() {
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValueSpan = document.getElementById('opacityValue');

        if (!opacitySlider) {
             console.warn("Could not initialize opacity slider: Slider element not found.");
             return;
        }
        // Set initial visual state
        const initialSliderValue = Math.round(gfOpacityLevel * 100);
        opacitySlider.value = initialSliderValue;
        if(opacityValueSpan) opacityValueSpan.textContent = `${initialSliderValue}%`;

        // Ensure only one listener
        opacitySlider.removeEventListener('input', handleOpacityInput);
        opacitySlider.addEventListener('input', handleOpacityInput);

        // Apply opacity if overlay already exists (e.g., on page load after init)
        if (lPlotOverlay && map.hasLayer(lPlotOverlay)) {
            lPlotOverlay.setOpacity(gfOpacityLevel);
            console.log("Opacity slider initialized and linked to existing overlay.");
        } else {
             console.log("Opacity slider initialized visually.");
        }
    }
    // Handler for opacity input
    function handleOpacityInput(event) {
        const sliderValue = event.target.value;
        const newOpacity = sliderValue / 100;
        const opacityValueSpan = document.getElementById('opacityValue');
        gfOpacityLevel = newOpacity; // Update global state
        if (lPlotOverlay && map.hasLayer(lPlotOverlay)) { // Apply to overlay if it exists and is on map
            lPlotOverlay.setOpacity(newOpacity);
        }
        if(opacityValueSpan) opacityValueSpan.textContent = `${sliderValue}%`;
    }

    function BuildMarkerLayers() {
        // console.log("---BuildMarkerLayers() - Simplified (No non-sounding layers loaded)"); // Less verbose
        // console.log("---BuildMarkerLayers finished initiation (no layers added)."); // Less verbose
    }

    function addEventListeners() {
        // console.log("---Adding Event Listeners---"); // Less verbose
        const modelSelect = document.getElementById("sModelSelect");
        const paramSelect = document.getElementById("sParamSelect");

        if (modelSelect) {
            modelSelect.removeEventListener('change', handleModelSelectChange);
            modelSelect.addEventListener('change', handleModelSelectChange);
            // console.log("Added listener for Model select."); // Less verbose
        } else { console.warn("Model select element not found for listener."); }

        if (paramSelect) {
            paramSelect.removeEventListener('change', handleParamSelectChange);
            paramSelect.addEventListener('change', handleParamSelectChange);
             // console.log("Added listener for Parameter select."); // Less verbose
        } else { console.warn("Parameter select element not found for listener."); }

        if (map) {
            map.off('click', onMapClick).on('click', onMapClick); // Keep map click listener
            // console.log("Added listener for Map click."); // Less verbose
        } else { console.warn("Map object not found for listener."); }
    }
    // Wrapper functions for event listeners remain the same
    function handleModelSelectChange(e) { handleModelChange(e.target.value); }
    function handleParamSelectChange(e) { handleParameterChange(e.target.value); }


    // ---------------------------------------------------------------------------------------
    // ---- Initialization Function ---- (Definition)
    // ---------------------------------------------------------------------------------------
     function initializeViewer() {
        console.log("===== Initializing RASP Viewer v1.7 =====");
        // Config checks...
        if (typeof scDefaultModel === 'undefined' || typeof sForecastServerRoot === 'undefined' || typeof jcFullSupportedModels === 'undefined' || typeof jcFullSupportedParameters === 'undefined') {
            console.error("Essential configuration missing. Cannot load.");
            alert("Viewer configuration error. Cannot load."); return;
        }
        gsSelectedModel = scDefaultModel;
        console.log(`Initial target model set to: ${gsSelectedModel}`);

        // Image element refs...
        titleObj = document.getElementById("theTitle");
        sideScaleObj = document.getElementById("theSideScale");
        scaleObj = document.getElementById("theBotScale");
        if (!titleObj || !sideScaleObj || !scaleObj) console.warn("One or more image display elements not found.");

        // Map initialization...
        var aCentre = GetModelCentre(gsSelectedModel);
        var initialZoom = GetModelZoom(gsSelectedModel);
        if (!aCentre) { console.error("Could not get map centre. Aborting."); return; }
        try {
            map = L.map('map', { center: aCentre, zoom: initialZoom, zoomControl: true });
            // Position zoom control if specified, otherwise Leaflet default (topleft)
            if (map.zoomControl && typeof scZoomLocation !== 'undefined') map.zoomControl.setPosition(scZoomLocation);
            // Add scale control if specified
            if (typeof scScaleLocation !== 'undefined') L.control.scale({ position: scScaleLocation }).addTo(map);
            AddAttribution();
            console.log("Map initialized.");
        } catch (e) {
            console.error("Leaflet map initialization failed:", e);
            document.getElementById('map').innerHTML = '<p style="color: red; text-align: center; margin-top: 20px;">Error initializing map. Check console.</p>';
            return;
        }

        // Populate Model Selector...
        populateModelSelector();

        // Trigger initial setup using defaults...
        // handleModelChange now calls updateDayButtons/updateTimeButtons, which in turn call enableDragScroll
        handleModelChange(gsSelectedModel);

        // Build Static Marker Layers...
        BuildMarkerLayers();

        // Initialize UI Controls...
        initializeOpacitySlider(); // Initialize the always-visible slider
        addEventListeners(); // Setup listeners

        // Final check... (optional, but good practice)
        if (!lPlotOverlay && gsSelectedModel && gsSelectedParameter && gsSelectedTime && map) {
             console.warn("Initial handleModelChange didn't seem to create the overlay, attempting fallback UpdateOverlay.");
             UpdateOverlay(true);
         } else if (lPlotOverlay) {
             console.log("Initial forecast overlay confirmed or created by handleModelChange.");
         }

        console.log("===== RASP Viewer Initialization Complete =====");
    }

	// --- DOMContentLoaded Event Listener ---
	// Ensures the DOM is ready before running the initialization code
	document.addEventListener('DOMContentLoaded', initializeViewer);

}()); // End of IIFE

// --- END OF FILE main.js ---