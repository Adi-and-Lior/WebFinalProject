let map; // משתנה גלובלי שיחזיק את מופע המפה
let markers = []; // מערך גלובלי שיחזיק את הסמנים (markers) על המפה

// פונקציה לטעינה דינמית של סקריפט ה-API של גוגל מפות
async function loadGoogleMapsScript() {
    try {
        // שליפת מפתח ה-API מהשרת שלך
        const response = await fetch('/api/google-maps-api-key');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const apiKey = data.apiKey;

        if (!apiKey) {
            throw new Error('מפתח API למפות לא הוחזר מהשרת.');
        }

        // יצירת אלמנט הסקריפט עבור ה-API של גוגל מפות
        const script = document.createElement('script');
        // הפרמטר 'callback=initMap' אומר לגוגל מפות לקרוא לפונקציה initMap() ברגע שה-API נטען
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        console.log("Google Maps API script loaded successfully."); // הודעה לניפוי באגים

    } catch (error) {
        console.error('שגיאה בטעינת מפתח ה-API של גוגל מפות או הסקריפט:', error);
        alert('אירעה שגיאה בטעינת המפה. אנא נסה שוב מאוחר יותר.');
    }
}

// פונקציית initMap: זו הפונקציה שנקראת על ידי ה-API של גוגל מפות לאחר שנטען.
// היא מאתחלת ומציגה את המפה.
function initMap() {
    console.log("initMap: Initializing Google Map."); // הודעה לניפוי באגים
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 31.0, lng: 35.0 }, // מרכז מפה ברירת מחדל (לדוגמה, מרכז ישראל)
        zoom: 7, // רמת זום
    });

    // טעינת הדיווחים והצגתם על המפה
    loadReportsAndDisplayOnMap();
}

// פונקציה לטעינת דיווחים והצגתם כסמנים על המפה
async function loadReportsAndDisplayOnMap() {
    try {
        // קריאה ל-API בשרת שלך כדי לקבל את מיקומי הדיווחים
        // נניח שנקודת קצה זו תחזיר מערך של אובייקטים { lat: <latitude>, lng: <longitude>, title: <description> }
        const response = await fetch('/api/my-reports-locations'); // שימוש בנקודת הקצה שצוינה על ידך
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reportsLocations = await response.json();

        clearMarkers(); // ניקוי סמנים קיימים לפני הוספת חדשים

        // עדכון תצוגת מספר הדיווחים
        const reportNumberDisplay = document.getElementById('reportNumberDisplay');
        if (reportNumberDisplay) {
            reportNumberDisplay.textContent = ` (${reportsLocations.length})`;
        }

        const bounds = new google.maps.LatLngBounds(); // אובייקט להתאמת תצוגת המפה לכל הסמנים

        reportsLocations.forEach(report => {
            // יצירת סמן עבור כל דיווח
            const marker = new google.maps.Marker({
                position: { lat: report.lat, lng: report.lng },
                map: map,
                title: report.title // כותרת הסמן (יופיע ב-tooltip)
            });
            markers.push(marker); // הוספת הסמן למערך הגלובלי

            // הרחבת גבולות המפה כדי לכלול את מיקום הסמן
            bounds.extend(new google.maps.LatLng(report.lat, report.lng));

            // ניתן להוסיף כאן חלון מידע (InfoWindow) אם אובייקט הדיווח מכיל פרטים נוספים
            // לדוגמה, אם הדיווח מכיל גם 'description':
            // const infoWindow = new google.maps.InfoWindow({
            //     content: `<h3>${report.title}</h3><p>${report.description || ''}</p>`,
            // });
            // marker.addListener('click', () => {
            //     infoWindow.open(map, marker);
            // });
        });

        // התאמת המפה להצגת כל הסמנים, אם נמצאו דיווחים
        if (reportsLocations.length > 0) {
            map.fitBounds(bounds);
        }

    } catch (error) {
        console.error('שגיאה בטעינת הדיווחים למפה:', error);
        alert('אירעה שגיאה בטעינת הדיווחים למפה.');
    }
}

// פונקציה להסרת כל הסמנים מהמפה
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null); // הסרת הסמן מהמפה
    }
    markers = []; // ניקוי מערך הסמנים
    console.log("All existing markers cleared from map."); // הודעה לניפוי באגים
}

// בחירת כפתור הבית (שינוי קל ב-querySelector ליתר דיוק)
const homeButton = document.querySelector('footer.thank-you-footer button'); // כפתור חזרה לעמוד הבית
if (homeButton) {
    homeButton.addEventListener('click', () => {
        window.location.href = '/html/homePageCitizen.html'; // ניווט לעמוד הבית
    });
} else {
    console.error("Home button not found. Please ensure your HTML has a button within a 'footer' with class 'thank-you-footer'.");
}

// ודא שסקריפט גוגל מפות נטען כאשר החלון נטען במלואו
window.onload = loadGoogleMapsScript;
