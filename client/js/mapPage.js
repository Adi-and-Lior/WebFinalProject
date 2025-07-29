let map;
let markers = [];
let infoWindow; 

/* ---------- Dynamically loads Google Maps API script and fetches API key ---------- */
async function loadGoogleMapsScript() {
    try {
        const response = await fetch('/api/google-maps-api-key');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const apiKey = data.apiKey;

        if (!apiKey) {
            throw new Error('מפתח API למפות לא הוחזר מהשרת.');
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        console.log("Google Maps API script loaded successfully.");
    } catch (error) {
        console.error('שגיאה בטעינת מפתח ה-API של גוגל מפות או הסקריפט:', error);
        alert('אירעה שגיאה בטעינת המפה. אנא נסה שוב מאוחר יותר.');
    }
}

/* ---------- Initializes the Google Map and its InfoWindow ---------- */
function initMap() {
    console.log("initMap: Initializing Google Map.");
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 31.0, lng: 35.0 }, 
        zoom: 7,
    });

    infoWindow = new google.maps.InfoWindow();
    loadReportsAndDisplayOnMap();
}

/* ---------- Fetches all reports and displays them as markers on the map ---------- */
async function loadReportsAndDisplayOnMap() {
    try {
        const response = await fetch('/api/all-reports-locations');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let reportsLocations = await response.json();
        reportsLocations = reportsLocations.filter(report => report.status === "in-progress");
        clearMarkers();
        const reportNumberDisplay = document.getElementById('reportNumberDisplay');
        if (reportNumberDisplay) {
            reportNumberDisplay.textContent = ` (${reportsLocations.length})`;
        }
        const bounds = new google.maps.LatLngBounds();
        reportsLocations.forEach(report => {
            const marker = new google.maps.Marker({
                position: { lat: report.lat, lng: report.lng },
                map: map,
                title: report.title 
            });
            markers.push(marker);
            bounds.extend(new google.maps.LatLng(report.lat, report.lng));

            marker.addListener('click', () => {
                infoWindow.setContent(`<h3>${report.title}</h3>`); 
                infoWindow.open(map, marker);
            });
        });

        if (reportsLocations.length > 0) {
            map.fitBounds(bounds);
        } else {
            map.setCenter({ lat: 31.0, lng: 35.0 });
            map.setZoom(7);
        }

    } catch (error) {
        console.error('שגיאה בטעינת הדיווחים למפה:', error);
        alert('אירעה שגיאה בטעינת הדיווחים למפה.');
    }
}

/* ---------- Removes all markers from the map ---------- */
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    console.log("All existing markers cleared from map.");
}

/* ---------- Event listener for the home button to navigate back ---------- */
const homeButton = document.querySelector('footer.thank-you-footer button');
if (homeButton) {
    homeButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.history.back();
    });
} else {
    console.error("Home button not found. Please ensure your HTML has a button within a 'footer' with class 'thank-you-footer'.");
}

/* ---------- Loads Google Maps script upon window load ---------- */
window.onload = loadGoogleMapsScript;