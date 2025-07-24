let map;
let markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 31.0, lng: 35.0 }, 
        zoom: 7, 
    });

    loadReportsAndDisplayOnMap();
}

async function loadReportsAndDisplayOnMap() {
    try {
        // קריאה ל-API בשרת שלך כדי לקבל את מיקומי הדיווחים
        // נניח שנקודת קצה זו תחזיר מערך של אובייקטים { lat: <latitude>, lng: <longitude>, title: <description> }
        const response = await fetch('/api/my-reports-locations');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reportsLocations = await response.json();

        clearMarkers();

        reportsLocations.forEach(report => {
            addMarker(report.lat, report.lng, report.title);
        });

        if (reportsLocations.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            reportsLocations.forEach(report => {
                bounds.extend(new google.maps.LatLng(report.lat, report.lng));
            });
            map.fitBounds(bounds);
        }

    } catch (error) {
        console.error('שגיאה בטעינת הדיווחים למפה:', error);
        alert('אירעה שגיאה בטעינת הדיווחים למפה.');
    }
}

function addMarker(lat, lng, title) {
    const marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: title
    });
    markers.push(marker); 
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}
