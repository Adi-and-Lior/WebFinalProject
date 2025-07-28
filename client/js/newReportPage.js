document.addEventListener('DOMContentLoaded',async () => {
    // --- Defining HTML elements ---
    const backButton = document.getElementById('backButton');
    const reportForm = document.querySelector('.report-form');
    const API_BASE_URL = 'https://webfinalproject-j4tc.onrender.com/api';
    // Fault type elements
    const faultTypeSelect = document.getElementById('fault-type');
    const faultDescriptionTextarea = document.getElementById('fault-description');
    const faultDescriptionOptionalIndicator = document.querySelector('label[for="fault-description"] .optional-indicator');
    const faultDescriptionRequiredIndicator = document.querySelector('label[for="fault-description"] .required-indicator');
    const faultDescriptionValidationIconContainer = document.querySelector('label[for="fault-description"] .validation-icon-container');
    const faultTypeStatusIcon = faultTypeSelect.closest('.input-container').querySelector('.asterisk');
    const faultDescriptionStatusIcon = faultDescriptionTextarea.closest('.frame-textarea').querySelector('.validation-icon');

    // Location elements
    const locationSelect = document.getElementById('location');
    const manualAddressSection = document.getElementById('manualAddressSection');
    const citySelect = document.getElementById('citySelect');
    const streetSelect = document.getElementById('streetSelect');
    const houseNumberInput = document.getElementById('houseNumberInput');
    const locationStatusIcon = locationSelect.closest('.input-container').querySelector('.asterisk');
    const cityStatusIcon = citySelect.closest('.input-container').querySelector('.asterisk');
    const streetStatusIcon = streetSelect.closest('.input-container').querySelector('.asterisk');
    const houseNumberStatusIcon = houseNumberInput ? houseNumberInput.closest('.input-container').querySelector('.asterisk') : null;


    // Media upload elements
    const uploadSelect = document.getElementById('upload');
    const mediaUploadSection = document.getElementById('mediaUploadSection');
    const mediaFileInput = document.getElementById('media-file');
    const uploadStatusIcon = uploadSelect.closest('.input-container').querySelector('.asterisk');
    const mediaFileStatusIcon = mediaFileInput.closest('.input-container').querySelector('.asterisk');

    // Camera elements
    const video = document.getElementById('cameraPreview');
    const captureButton = document.getElementById('capture');
    const canvas = document.getElementById('canvas');
    let capturedBlob = null;
    let stream = null;

    // Variables for location and address
    let currentLat = null;
    let currentLon = null;
    let locationString = '';
    let currentCity = ''; 
    let manualLat = null; 
    let manualLon = null; 
    let manualFullAddress = ''; 

    // User info from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let currentUsername = 'Anonymous';
    let currentUserId = 'anonymous';

    let citiesData = [];
    let streetsData = [];
    async function loadCities() {
    console.log("loadCities: --- STARTING CITY LOAD ---");
    try {
        const res = await fetch(`${API_BASE_URL}/cities`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const citySelect = document.getElementById("citySelect");
        if (!citySelect) {
            console.warn("loadCities: לא נמצא אלמנט עם id citySelect");
            return;
        }

        citySelect.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "בחר עיר";
        citySelect.appendChild(defaultOption);

        data.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });

        if (window.$ && $(citySelect).select2) {
            $(citySelect).select2({
                placeholder: "בחר עיר",
                dir: "rtl"
            });
        }

        console.log("loadCities: הושלם בהצלחה");
    } catch (err) {
        console.error("loadCities: שגיאה בשליפת ערים:", err);
    }
}

    async function loadStreetsForCity(cityName) {
    console.log(`loadStreetsForCity: --- STARTING STREET LOAD for city: '${cityName}' ---`);

    const streetSelect = document.getElementById("streetSelect");
    const streetStatusIcon = document.getElementById("streetStatusIcon");

    streetsData = [];
    
    if ($(streetSelect).hasClass("select2-hidden-accessible")) {
        $(streetSelect).select2('destroy');
    }

    streetSelect.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "בחר רחוב";
    streetSelect.appendChild(defaultOption);

    if (!cityName) {
        console.log("אין עיר נבחרת, הפונקציה תצא.");
        updateStatusIcon(streetSelect, streetStatusIcon, false);
        $(streetSelect).select2({
            placeholder: "בחר רחוב",
            dir: "rtl",
            width: "100%"
        });
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/streets?city=${encodeURIComponent(cityName)}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        streetsData = [...new Set(data)]; 

        streetsData.forEach(street => {
    const name = typeof street === 'string' ? street : street.name; 
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    streetSelect.appendChild(option);
});

        $(streetSelect).select2({
            placeholder: "בחר רחוב",
            dir: "rtl",
            width: "100%"
        });
        updateStatusIcon(streetSelect, streetStatusIcon, true);

    } catch (err) {
        console.error("שגיאה בטעינת רחובות:", err);
        streetSelect.innerHTML = '<option value="">שגיאה בטעינת רחובות</option>';
        updateStatusIcon(streetSelect, streetStatusIcon, false);
    } finally {
        console.log("loadStreetsForCity: --- FINISHED ---");
    }
}
async function loadFaultTypes() {
    console.log('[INFO] Loading fault types from server...');
    try {
        // ביצוע בקשת GET לשרת כדי לקבל את רשימת סוגי התקלות
        const response = await fetch(`${API_BASE_URL}/fault-types`); 
        if (!response.ok) {
            // אם התגובה מהשרת אינה תקינה (לדוגמה, סטטוס 404 או 500)
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch fault types');
        }
        // המרת התשובה ל-JSON
        const faultTypes = await response.json();
        console.log('[DEBUG] Fault types received:', faultTypes);
        // לולאה על כל סוג תקלה שהתקבל מהשרת ויצירת אופציה עבורו
        faultTypes.forEach(type => {
            const option = document.createElement('option'); // יצירת אלמנט <option>
            option.value = type.value; // הגדרת ה-value של האופציה (לדוגמה: "בור בכביש")
            option.textContent = type.label; // הגדרת הטקסט שיוצג למשתמש (לדוגמה: "בור בכביש")
            faultTypeSelect.appendChild(option); // הוספת האופציה לאלמנט ה-<select>
        });

        // אתחול Select2 מחדש עבור בורר סוג התקלה
        // חשוב לוודא ש-jQuery ו-Select2 נטענו לפני שורה זו
        console.log('[INFO] Fault types loaded successfully.');
    } catch (error) {
        console.error('שגיאה בטעינת סוגי התקלות:', error);
        alert('שגיאה בטעינת סוגי התקלות. אנא רענן את הדף או נסה שוב מאוחר יותר.');
    }
}
async function loadLocationModes() {
  console.log('[INFO] Loading location modes from server...');
  try {
    const response = await fetch(`${API_BASE_URL}/location-modes`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch location modes');
    }
    const locationModes = await response.json();
    console.log('[DEBUG] Location modes received:', locationModes);

    locationSelect.innerHTML = '<option disabled selected hidden>בחר מיקום</option>'; // אתחל את הסלקט לפני הוספת אופציות

    locationModes.forEach(mode => {
      const option = document.createElement('option');
      option.value = mode.value; // או בהתאם לשדות במודל שלך
      option.textContent = mode.label;
      locationSelect.appendChild(option);
    });

    console.log('[INFO] Location modes loaded successfully.');
  } catch (error) {
    console.error('שגיאה בטעינת מיקומים:', error);
    alert('שגיאה בטעינת מיקומים. אנא רענן את הדף או נסה שוב מאוחר יותר.');
  }
}

async function loadMediaOptions() {
  console.log('[INFO] Loading media options from server...');
  try {
    const response = await fetch(`${API_BASE_URL}/media-options`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch media options');
    }
    const mediaOptions = await response.json();
    console.log('[DEBUG] Media options received:', mediaOptions);

    uploadSelect.innerHTML = '<option disabled selected hidden>בחר אפשרות</option>'; // אתחל את הסלקט

    mediaOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      uploadSelect.appendChild(option);
    });

    console.log('[INFO] Media options loaded successfully.');
  } catch (error) {
    console.error('שגיאה בטעינת אפשרויות מדיה:', error);
    alert('שגיאה בטעינת אפשרויות מדיה. אנא רענן את הדף או נסה שוב מאוחר יותר.');
  }
}

    if (loggedInUser) {
        currentUsername = loggedInUser.username;
        currentUserId = loggedInUser.userId;
        console.log('Logged-in user:', currentUsername, 'ID:', currentUserId);
    } else {
        console.warn('No user logged in to localStorage. Redirecting...');
        alert('שגיאה: משתמש לא מחובר. אנא התחבר שוב.');
        window.location.href = '../index.html';
    }
    await loadFaultTypes();
    await loadLocationModes();
    await loadMediaOptions();
    if (backButton) {
        backButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/html/homePageCitizen.html';
        });
    }
    const V_ICON_PATH = '../images/V_icon.svg'; 
    const ASTERISK_ICON_PATH = '../images/asterisk.svg';
    function updateStatusIcon(inputElement, iconElement) {
        if (!iconElement) return;

        if (inputElement.tagName === 'SELECT') {
            if (inputElement.value !== '') {
                iconElement.src = V_ICON_PATH;
            } else {
                iconElement.src = ASTERISK_ICON_PATH;
            }
        } else if (inputElement.type === 'file') {
            if (inputElement.files.length > 0) {
                iconElement.src = V_ICON_PATH;
            } else {
                iconElement.src = ASTERISK_ICON_PATH;
            }
        }
        else {
            if (inputElement.value.trim() !== '') {
                iconElement.src = V_ICON_PATH;
            } else {
                iconElement.src = ASTERISK_ICON_PATH;
            }
        }
    }
    function updateFaultDescriptionRequirement() {
        const selectedFaultType = faultTypeSelect.value;
        if (selectedFaultType === 'type4') {
            faultDescriptionTextarea.setAttribute('required', 'true');
            if (faultDescriptionOptionalIndicator) faultDescriptionOptionalIndicator.style.display = 'none';
            if (faultDescriptionRequiredIndicator) faultDescriptionRequiredIndicator.style.display = 'inline';
            if (faultDescriptionValidationIconContainer) faultDescriptionValidationIconContainer.style.display = 'inline-block';
        } else {
            faultDescriptionTextarea.removeAttribute('required');
            if (faultDescriptionOptionalIndicator) faultDescriptionOptionalIndicator.style.display = 'inline';
            if (faultDescriptionRequiredIndicator) faultDescriptionRequiredIndicator.style.display = 'none';
            if (faultDescriptionValidationIconContainer) faultDescriptionValidationIconContainer.style.display = 'none';
            faultDescriptionTextarea.value = '';
        }
        updateStatusIcon(faultTypeSelect, faultTypeStatusIcon);
        updateStatusIcon(faultDescriptionTextarea, faultDescriptionStatusIcon);
    }
    function handleLocationSelection() {
        const selectedLocationType = locationSelect.value;
        console.log(`handleLocationSelection: Selected location type: ${selectedLocationType}`);

        if (selectedLocationType === 'loc2') { 
            manualAddressSection.style.display = 'block';
            citySelect.setAttribute('required', 'true');
            streetSelect.setAttribute('required', 'true');
            houseNumberInput.removeAttribute('required'); 
            loadStreetsForCity(citySelect.value.trim());
            updateStatusIcon(citySelect, cityStatusIcon);
            updateStatusIcon(streetSelect, streetStatusIcon);
            if (houseNumberInput.hasAttribute('required') && houseNumberStatusIcon) {
                updateStatusIcon(houseNumberInput, houseNumberStatusIcon);
            } else if (houseNumberStatusIcon) {
                houseNumberStatusIcon.src = ASTERISK_ICON_PATH;
            }
            currentLat = null;
            currentLon = null;
            locationString = '';
            currentCity = '';
        } else if (selectedLocationType === 'loc1') { 
            manualAddressSection.style.display = 'none';
            citySelect.removeAttribute('required');
            citySelect.value = '';
            streetSelect.removeAttribute('required');
            streetSelect.value = '';
            houseNumberInput.removeAttribute('required'); 
            houseNumberInput.value = '';
            streetsData = [];
            if (cityStatusIcon) cityStatusIcon.src = ASTERISK_ICON_PATH;
            if (streetStatusIcon) streetStatusIcon.src = ASTERISK_ICON_PATH;
            if (houseNumberStatusIcon) houseNumberStatusIcon.src = ASTERISK_ICON_PATH;
            getCurrentLocation();
        } else { 
            manualAddressSection.style.display = 'none';
            citySelect.removeAttribute('required');
            citySelect.value = '';
            streetSelect.removeAttribute('required');
            streetSelect.value = '';
            houseNumberInput.removeAttribute('required'); 
            houseNumberInput.value = '';
            streetsData = [];
            if (cityStatusIcon) cityStatusIcon.src = ASTERISK_ICON_PATH;
            if (streetStatusIcon) streetStatusIcon.src = ASTERISK_ICON_PATH;
            if (houseNumberStatusIcon) houseNumberStatusIcon.src = ASTERISK_ICON_PATH;
            currentLat = null;
            currentLon = null;
            locationString = '';
            currentCity = '';
        }
        updateStatusIcon(locationSelect, locationStatusIcon);
    }
    async function getCurrentLocation() {
        if (!navigator.geolocation) {
            alert("Your browser does not support Geolocation. Please use the 'Manual location entry' option.");
            locationSelect.value = 'loc2';
            handleLocationSelection();
            return;
        }
        console.log("getCurrentLocation: Attempting to get current position...");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                currentLat = position.coords.latitude;
                currentLon = position.coords.longitude;
                console.log(`getCurrentLocation: Current Location: Lat ${currentLat}, Lon ${currentLon}`);
                try {
                    const apiKey = 'AIzaSyBnRHLdYCyHCyCZA30LeDv468lFXEvgbvA';
                    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLat},${currentLon}&key=${apiKey}`);
                    const data = await response.json();
                    console.log("getCurrentLocation: Geocoding API response:", data);
                    if (data.status === 'OK' && data.results.length > 0) {
                        locationString = data.results[0].formatted_address;
                        const addressComponents = data.results[0].address_components;
                        const cityComponent = addressComponents.find(component =>
                            component.types.includes('locality') || component.types.includes('administrative_area_level_1')
                        );
                        currentCity = cityComponent ? cityComponent.long_name : '';
                        console.log("getCurrentLocation: Resolved address:", locationString, "City:", currentCity);
                        alert(`Location detected: ${locationString}`);
                    } else {
                        locationString = `Lat: ${currentLat}, Lon: ${currentLon}`;
                        currentCity = '';
                        alert("Location detected, but could not convert to full address.");
                    }
                } catch (err) {
                    console.error("getCurrentLocation: Geocoding error:", err);
                    locationString = `Lat: ${currentLat}, Lon: ${currentLon}`;
                    currentCity = '';
                    alert("Location detected, but failed to get full address.");
                }
            },
            (error) => {
                console.error("getCurrentLocation: Error getting current location:", error);
                let errorMessage = "An error occurred while detecting the location.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "User denied the request for Geolocation. Please allow access to location in browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "The request to get location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = "An unknown error occurred while detecting location.";
                        break;
                }
                alert(errorMessage);
                locationSelect.value = '';
                handleLocationSelection();
                currentLat = null;
                currentLon = null;
                locationString = '';
                currentCity = '';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }
    async function geocodeAddress(city, street, houseNumber) {
    const address = `${houseNumber ? houseNumber + ' ' : ''}${street}, ${city}, Israel`; // בנה את הכתובת
    const apiKey = 'AIzaSyBnRHLdYCyHCyCZA30LeDv468lFXEvgbvA'; // השתמש במפתח ה-API שלך
    console.log(`geocodeAddress: Attempting to geocode address: '${address}'`);
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
        const data = await response.json();
        console.log("geocodeAddress: Geocoding API response:", data);
        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            manualLat = location.lat;
            manualLon = location.lng;
            manualFullAddress = data.results[0].formatted_address; // שמור את הכתובת המלאה
            console.log(`geocodeAddress: Geocoded successfully. Lat: ${manualLat}, Lng: ${manualLon}, Full Address: ${manualFullAddress}`);
            return { lat: manualLat, lng: manualLon, fullAddress: manualFullAddress };
        } else {
            manualLat = null;
            manualLon = null;
            manualFullAddress = '';
            console.warn(`geocodeAddress: Could not geocode address: ${address}. Status: ${data.status}`);
            alert(`Could not find coordinates for the provided address: ${address}. Please check the address.`);
            return null;
        }
    } catch (err) {
        manualLat = null;
        manualLon = null;
        manualFullAddress = '';
        console.error('geocodeAddress: Error during geocoding:', err);
        alert(`An error occurred during address geocoding: ${err.message}`);
        return null;
    }
}
    function updateMediaUploadVisibility() {
        const selectedUploadOption = uploadSelect.value;
        console.log('updateMediaUploadVisibility: Upload option selected:', selectedUploadOption);
        mediaUploadSection.style.display = 'none';
        mediaFileInput.removeAttribute('required');
        mediaFileInput.removeAttribute('accept');
        mediaFileInput.removeAttribute('capture');
        mediaFileInput.value = '';
        video.style.display = 'none';
        captureButton.style.display = 'none';
        stopCamera();
        const existingPreview = document.getElementById('capturedImagePreview');
        if (existingPreview) {
            existingPreview.remove();
        }
        capturedBlob = null;
        updateStatusIcon(mediaFileInput, mediaFileStatusIcon);
        if (selectedUploadOption === 'option1') {
            mediaUploadSection.style.display = 'none';
            mediaFileInput.removeAttribute('required');
            video.style.display = 'block';
            captureButton.style.display = 'inline-block';
            startCamera();
        } else if (selectedUploadOption === 'option2') {
            mediaUploadSection.style.display = 'block';
            mediaFileInput.setAttribute('required', 'true');
            mediaFileInput.setAttribute('accept', 'image/*,video/*');
            mediaFileInput.removeAttribute('capture');
            mediaFileInput.value = '';
            updateStatusIcon(mediaFileInput, mediaFileStatusIcon);
        }
        console.log('updateMediaUploadVisibility: Media file field required:', mediaFileInput.hasAttribute('required'));
        updateStatusIcon(uploadSelect, uploadStatusIcon);
    }
    async function startCamera() {
        try {
            stopCamera();
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.play();
            console.log("startCamera: Camera started successfully.");
        } catch (err) {
            console.error('startCamera: Error accessing camera:', err);
            alert('Cannot enable camera: ' + err.message + '\nPlease ensure you have a camera connected and allow access to it in your browser settings.');
            uploadSelect.value = '';
            updateMediaUploadVisibility();
        }
    }
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log("stopCamera: Camera track stopped.");
            });
            stream = null;
        }
        video.srcObject = null;
        video.pause();
        console.log("stopCamera: Camera stopped.");
    }
    if (captureButton) {
        captureButton.addEventListener('click', () => {
            if (!stream) {
                alert('No active camera stream to capture image.');
                return;
            }
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                capturedBlob = blob;
                alert("Image successfully captured and saved for the report.");
                const img = document.createElement('img');
                img.src = URL.createObjectURL(blob);
                img.style.maxWidth = '100px';
                img.style.maxHeight = '100px';
                img.style.marginTop = '10px';
                const existingPreview = document.getElementById('capturedImagePreview');
                if (existingPreview) {
                    existingPreview.src = img.src;
                } else {
                    img.id = 'capturedImagePreview';
                    captureButton.parentNode.insertBefore(img, captureButton.nextSibling);
                }
                stopCamera();
                video.style.display = 'none';
                captureButton.style.display = 'none';
                updateStatusIcon({ type: 'file', files: [capturedBlob] }, mediaFileStatusIcon);
            }, 'image/jpeg');
        });
    }

    // --- Event listeners ---
    if (faultTypeSelect) {
        faultTypeSelect.addEventListener('change', updateFaultDescriptionRequirement);
        updateFaultDescriptionRequirement();
        updateStatusIcon(faultTypeSelect, faultTypeStatusIcon);
    }
    if (faultDescriptionTextarea) {
        faultDescriptionTextarea.addEventListener('input', () => {
            updateStatusIcon(faultDescriptionTextarea, faultDescriptionStatusIcon);
        });
        updateStatusIcon(faultDescriptionTextarea, faultDescriptionStatusIcon);
    }
    if (locationSelect) {
        locationSelect.addEventListener('change', handleLocationSelection);
        handleLocationSelection();
    }
    if (citySelect) {
     $(citySelect).on('select2:select', (e) => {
        const selectedCity = e.params.data.text.trim();
        console.log(`select2: City selected: '${selectedCity}'`);
        loadStreetsForCity(selectedCity);  
        updateStatusIcon(citySelect, cityStatusIcon);
    });
    citySelect.addEventListener('blur', () => {
        if (citySelect.value.trim() && streetSelect.value.trim()) {
            geocodeAddress(citySelect.value.trim(), streetSelect.value.trim(), houseNumberInput.value.trim());
        }
    });
}
if (streetSelect) {
     $(streetSelect).on('select2:select', () => {
        updateStatusIcon(streetSelect, streetStatusIcon);
    });
    streetSelect.addEventListener('blur', () => {
        if (citySelect.value.trim() && streetSelect.value.trim()) {
            geocodeAddress(citySelect.value.trim(), streetSelect.value.trim(), houseNumberInput.value.trim());
        }
    });
}
if (houseNumberInput) {
    houseNumberInput.addEventListener('input', () => {
        if (houseNumberStatusIcon) {
            updateStatusIcon(houseNumberInput, houseNumberStatusIcon);
        }
    });
    houseNumberInput.addEventListener('blur', () => {
        if (citySelect.value.trim() && streetSelect.value.trim()) {
            geocodeAddress(citySelect.value.trim(), streetSelect.value.trim(), houseNumberInput.value.trim());
        }
    });
}
    if (uploadSelect) {
        uploadSelect.addEventListener('change', updateMediaUploadVisibility);
        updateMediaUploadVisibility();
    }
    if (mediaFileInput) {
        mediaFileInput.addEventListener('change', () => {
            updateStatusIcon(mediaFileInput, mediaFileStatusIcon);
        });
        updateStatusIcon(mediaFileInput, mediaFileStatusIcon);
    }
    if (reportForm) {
        reportForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!reportForm.checkValidity()) {
                alert('Please fill in all required fields.');
                reportForm.reportValidity();
                return;
            }
            const faultType = faultTypeSelect.options[faultTypeSelect.selectedIndex].text;
            const faultDescription = faultDescriptionTextarea.value.trim();
            const locationType = locationSelect.value;
            let locationData = {};
            if (locationType === 'loc2') {
    if (manualLat === null || manualLon === null) {
        const geocoded = await geocodeAddress(citySelect.value.trim(), streetSelect.value.trim(), houseNumberInput.value.trim());
        if (!geocoded) {
            alert('Cannot submit report. Could not determine coordinates for the manual address. Please check the address and try again.');
            return; 
        }
    }
    locationData = {
        type: 'manual',
        city: citySelect.value.trim(),
        street: streetSelect.value.trim(),
        houseNumber: houseNumberInput.value.trim(),
        latitude: manualLat, 
        longitude: manualLon, 
        address: manualFullAddress || `${houseNumberInput.value.trim()} ${streetSelect.value.trim()}, ${citySelect.value.trim()}` // כתובת מלאה
    };
}
         else if (locationType === 'loc1') {
                if (currentLat === null || currentLon === null) {
                    alert('Cannot submit the report. Current location was not detected. Please try again or choose manual location.');
                    return;
                }
                locationData = {
                    type: 'current',
                    city: currentCity || '',
                    latitude: currentLat,
                    longitude: currentLon,
                    address: locationString || ''
                };
            } else {
                alert('Please select a location type.');
                return;
            }
            const uploadOption = uploadSelect.value;
            let mediaToUpload = null;
            if (uploadOption === 'option1') {
                if (capturedBlob) {
                    mediaToUpload = new File([capturedBlob], 'captured_image.jpeg', { type: 'image/jpeg' });
                } else {
                    alert('לא צולמה תמונה. אנא צלם תמונה או בחר באפשרות אחרת.');
                    return;
                }
            } else if (uploadOption === 'option2') {
                if (mediaFileInput.files.length > 0) {
                    mediaToUpload = mediaFileInput.files[0];
                } else {
                    alert('אנא בחר קובץ תמונה/וידאו מספריית המדיה שלך.');
                    return;
                }
            } else {
                alert('אנא בחר אפשרות להעלאת מדיה (מצלמה או ספריית תמונות).');
                return;
            }
            const locationSelect = document.getElementById('location');
            fetch('/api/location-modes')
  .then((res) => res.json())
  .then((modes) => {
    console.log('Modes:', modes);
    locationSelect.innerHTML = '<option disabled selected hidden>בחר מיקום</option>';
    modes.forEach((mode) => {
      const option = document.createElement('option');
      option.value = mode.value;
      option.textContent = mode.label;
      locationSelect.appendChild(option);
    });
  })
  .catch((err) => {
    console.error('שגיאה בטעינת מיקומים:', err);
  });
  const uploadSelect = document.getElementById('upload');

fetch('/api/media-options')
  .then((res) => res.json())
  .then((options) => {
    console.log('Media Options:', options);
    uploadSelect.innerHTML = '<option disabled selected hidden>בחר אפשרות</option>';
    options.forEach((opt) => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      uploadSelect.appendChild(option);
    });
  })
  .catch((err) => {
    console.error('שגיאה בטעינת אפשרויות העלאה:', err);
  });
            const formData = new FormData();
            formData.append('faultType', faultType);
            formData.append('faultDescription', faultDescription);
            formData.append('locationType', locationType);
            formData.append('locationDetails', JSON.stringify(locationData));
            formData.append('uploadOption', uploadOption);
            if (mediaToUpload) {
                formData.append('mediaFile', mediaToUpload);
            }
            formData.append('createdBy', currentUsername);
            formData.append('creatorId', currentUserId);
            console.log('Report data ready for client submission:', {
                faultType,
                faultDescription,
                locationType,
                locationDetails: locationData,
                uploadOption,
                mediaFile: mediaToUpload ? mediaToUpload.name : 'No file',
                createdBy: currentUsername,
                creatorId: currentUserId
            });
            try {
                console.log('[Client] mediaToUpload:', mediaToUpload);
                console.log('[Client] mediaToUpload name:', mediaToUpload?.name);
                console.log('[Client] mediaToUpload size:', mediaToUpload?.size);
                console.log('[Client] mediaToUpload type:', mediaToUpload?.type);
                for (const pair of formData.entries()) {
                    console.log(pair[0]+ ': ' + pair[1]);
                }
                const res = await fetch(`${API_BASE_URL}/reports`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (res.ok) {
                    console.log('Report submitted successfully:', data.message);
                    let displayLocation = '';
                    if (locationType === 'loc1') {
                        displayLocation = locationString || `Your current location (lat: ${currentLat}, lon: ${currentLon})`;
                    } else if (locationType === 'loc2') {
                        displayLocation = `עיר: ${citySelect.value} , רחוב: ${streetSelect.value} ,`;
                        if (houseNumberInput.value) {
                            displayLocation += ` מספר בית: ${houseNumberInput.value}`;
                        }
                    }
                    localStorage.setItem('lastReportDetails', JSON.stringify({
                        faultType: faultTypeSelect.options[faultTypeSelect.selectedIndex].text,
                        faultDescription: faultDescription,
                        location: displayLocation,
                        timestamp: new Date().toISOString(),
                        mediaId: data.mediaGridFSId || 'no media',
                        mediaMimeType: data.mediaMimeType || null
                    }));
                    localStorage.setItem('lastReportId', data.reportId || data._id);
                    alert('הדיווח נשלח בהצלחה!');
                    window.location.href = '/html/reportReceivedPage.html';
                } else {
                    alert('Failed to submit report: ' + data.message);
                }
            } catch (error) {
                console.error('Error submitting report:', error);
                alert('An error occurred while submitting the report. Please try again later.');
            }
        });
    }
    loadCities();
});