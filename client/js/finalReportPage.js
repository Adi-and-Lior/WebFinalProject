/* ---------------- myReportsDetails.js (fixed media loading) ---------------- */
/* החלף BASE_URL אם ה‑backend רץ בדומיין אחר                                 */

document.addEventListener('DOMContentLoaded', async () => {

    /* ----- כתובת בסיס אחת לקריאות API ולקבצי ‎/uploads ----- */
    const BASE_URL = 'https://webfinalproject-j4tc.onrender.com';

    /* ---------- שליפת מזהה דוח מה‑URL ---------- */
    const urlParams = new URLSearchParams(window.location.search);
    const reportId  = urlParams.get('id');

    /* ---------- DOM Elements ---------- */
    const reportsTitleElement        = document.querySelector('.reports-title h1');
    const reportNumberDisplayElement = document.getElementById('reportNumberDisplay');
    const backToHomeButton           = document.getElementById('backToHomeButton');

    const displayFaultType           = document.getElementById('displayFaultType');
    const displayLocation            = document.getElementById('displayLocation');
    const displayDate                = document.getElementById('displayDate');
    const displayTime                = document.getElementById('displayTime');
    const displayDescription         = document.getElementById('displayDescription');
    const mediaContainer             = document.getElementById('mediaContainer');
    const displayStatus              = document.getElementById('displayStatus');
    const displayMunicipalityResponse = document.getElementById('displayMunicipalityResponse');

    /* ---------- תרגומי סטטוסים ---------- */
    const statusTranslations = {
        'in-progress': 'בטיפול',
        'completed'  : 'הושלם',
        'rejected'   : 'נדחה',
    };

    /* ---------- API ---------- */
    async function fetchReportDetails(id) {
        try {
            const response = await fetch(`${BASE_URL}/api/reports/${id}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('דיווח לא נמצא.');
                throw new Error(`שגיאה בשליפת דיווח: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('אירעה שגיאה בטעינת פרטי הדיווח.');
            return null;
        }
    }

    /* ---------- הצגת נתוני הדוח ---------- */
    async function populateReportData(report) {
        displayFaultType.textContent = report.faultType || 'לא ידוע';

        /* מיקום */
        let locationText = '';
        if (report.location) {
            if (report.location.city)        locationText += report.location.city;
            if (report.location.street)      locationText += `, ${report.location.street}`;
            if (report.location.houseNumber) locationText += ` ${report.location.houseNumber}`;
        }
        displayLocation.textContent = locationText || 'לא הוזן מיקום';

        /* תאריך ושעה */
        if (report.timestamp) {
            const date = new Date(report.timestamp);
            displayDate.textContent = date.toLocaleDateString('he-IL');
            displayTime.textContent = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        } else {
            displayDate.textContent = 'לא ידוע';
            displayTime.textContent  = 'לא ידוע';
        }

        /* תיאור */
        displayDescription.textContent = report.faultDescription || 'אין תיאור.';

        /* ----- מדיה ----- */
        mediaContainer.innerHTML = '';
        if (report.media) {
    const mediaUrl = `${BASE_URL}/api/media/${report.media}`;
    try {
        const headResponse = await fetch(mediaUrl, { method: 'HEAD' });
        if (!headResponse.ok) throw new Error('שגיאה בקבלת מידע על המדיה');

        const contentType = headResponse.headers.get('Content-Type') || '';
        console.log('Media Content-Type:', contentType);

        if (contentType.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = mediaUrl;
            img.alt = 'תמונה מצורפת לדיווח';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            mediaContainer.appendChild(img);
        } else if (contentType.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.controls = true;
            video.style.maxWidth = '100%';
            video.style.height = 'auto';
            mediaContainer.appendChild(video);
        } else {
            mediaContainer.textContent = 'קובץ מדיה לא נתמך.';
        }
    } catch (error) {
        console.error('Error loading media:', error);
        mediaContainer.textContent = 'שגיאה בטעינת המדיה.';
    }
}


        /* ----- סטטוס ----- */
        const normalizedStatus = (report.status || '').toLowerCase().replace(/_/g, '-');
        const statusHebrew     = statusTranslations[normalizedStatus] || 'לא ידוע';

        if (displayStatus) {
            displayStatus.textContent = statusHebrew;
            displayStatus.classList.remove('status-completed', 'status-rejected', 'status-in-progress');
            if (normalizedStatus === 'completed')  displayStatus.classList.add('status-paid');
            if (normalizedStatus === 'rejected')   displayStatus.classList.add('status-rejected');
            if (normalizedStatus === 'in-progress') displayStatus.classList.add('status-in-progress');
        }

        displayMunicipalityResponse.textContent =
            report.municipalityResponse || 'טרם התקבלה תגובה מהרשות המקומית.';
    }

    /* ---------- טעינה ראשונית ---------- */
    if (!reportId) {
        reportsTitleElement.textContent = 'שגיאה: ID דיווח חסר';
        console.error('Report ID is missing from the URL.');
        return;
    }

    const currentReport = await fetchReportDetails(reportId);
    if (currentReport) {
        if (reportNumberDisplayElement) {
        reportNumberDisplayElement.textContent = `${reportId.slice(-4)}`;
        }
        populateReportData(currentReport);
    } else {
        reportsTitleElement.textContent = 'שגיאה בטעינת דיווח';
        document.querySelector('main').innerHTML =
            `<p style="color:red;text-align:center;">הדיווח לא נמצא או אירעה שגיאה בטעינה.</p>`;
        if (backToHomeButton) backToHomeButton.style.display = 'none';
    }

    /* ---------- ניווט ---------- */
    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', () =>
            window.location.href = '../html/homePageEmployee.html'
        );
    }
});
