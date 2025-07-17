document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');  

    const reportsTitleElement = document.querySelector('.reports-title h2');
    const backArrow = document.querySelector('.back-arrow');

    if (!reportId) {
        reportsTitleElement.textContent = 'שגיאה: ID דיווח חסר';
        console.error('Report ID is missing from the URL.');
        return;
    }
    const reportNumberDisplayElement = document.getElementById('reportNumberDisplay');
    if (reportNumberDisplayElement) {
        reportNumberDisplayElement.textContent = `${reportId.slice(-4)}`;
    }

    const statusTranslations = {
        'in-progress': 'בטיפול',
        'completed': 'הושלם',
        'rejected': 'נדחה',
    };

    // כתובת הבסיס של השרת - החלף לפי הצורך
    const backendBaseUrl = 'https://webfinalproject-j4tc.onrender.com';

    try {
        const response = await fetch(`${backendBaseUrl}/api/reports/${reportId}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('דיווח לא נמצא.');
            throw new Error(`שגיאה בשליפת דיווח: ${response.statusText}`);
        }
        const report = await response.json();
        console.log('Report details fetched:', report);

        document.getElementById('displayFaultType').textContent = report.faultType || 'לא ידוע';

        if (report.location) {
            let locationText = '';
            if (report.location.city)        locationText += report.location.city;
            if (report.location.street)      locationText += `, ${report.location.street}`;
            if (report.location.houseNumber) locationText += ` ${report.location.houseNumber}`;
            document.getElementById('displayLocation').textContent = locationText || 'לא הוזן מיקום';
        } else {
            document.getElementById('displayLocation').textContent = 'לא הוזן מיקום';
        }

        if (report.timestamp) {
            const dateObj = new Date(report.timestamp);
            document.getElementById('displayDate').textContent =
                dateObj.toLocaleDateString('he-IL');
            document.getElementById('displayTime').textContent =
                dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        } else {
            document.getElementById('displayDate').textContent  = 'לא ידוע';
            document.getElementById('displayTime').textContent  = 'לא ידוע';
        }

        document.getElementById('displayDescription').textContent =
            report.faultDescription || 'אין תיאור.';

        const mediaContainer = document.getElementById('mediaContainer');
        mediaContainer.innerHTML = '';  // ניקוי לפני הוספה

        console.log('Media filename:', report.media);
        if (report.media) {
    const mediaUrl = `${backendBaseUrl}/api/media/${report.media}`;

    try {
        // שולח בקשת HEAD כדי לקבל רק את הכותרות, לא את התוכן
        const headResponse = await fetch(mediaUrl, { method: 'HEAD' });
        if (!headResponse.ok) throw new Error('שגיאה בקבלת מדיה');

        const contentType = headResponse.headers.get('Content-Type');
        console.log('Media Content-Type:', contentType);

        mediaContainer.innerHTML = ''; // ניקוי קודם

        if (contentType && contentType.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = mediaUrl;
            img.alt = 'תמונה מצורפת לדיווח';
            img.style.maxWidth = '100%';
            mediaContainer.appendChild(img);
        } else if (contentType && contentType.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.controls = true;
            video.style.maxWidth = '100%';
            mediaContainer.appendChild(video);
        } else {
            mediaContainer.textContent = 'קובץ מדיה לא נתמך.';
        }
    } catch (err) {
        console.error('Error loading media:', err);
        mediaContainer.textContent = 'שגיאה בטעינת המדיה.';
    }
} else {
    mediaContainer.textContent = 'אין מדיה מצורפת.';
}

        let normalizedStatus = (report.status || '').toLowerCase().replace(/_/g, '-');
        const statusHebrew = statusTranslations[normalizedStatus] || 'לא ידוע';
        const statusElement = document.getElementById('displayStatus');
        statusElement.textContent = statusHebrew;

        statusElement.classList.remove('status-paid', 'status-rejected', 'status-in-progress');
        if (normalizedStatus === 'completed') {
            statusElement.classList.add('status-paid');
        } else if (normalizedStatus === 'rejected') {
            statusElement.classList.add('status-rejected');
        } else if (normalizedStatus === 'in-progress') {
            statusElement.classList.add('status-in-progress');
        }

        document.getElementById('displayMunicipalityResponse').textContent =
            report.municipalityResponse || 'טרם התקבלה תגובה מהרשות המקומית.';

    } catch (error) {
        console.error('Error loading report details:', error);
        reportsTitleElement.textContent = 'שגיאה בטעינת דיווח';
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML =
                `<p style="color:red;text-align:center;">${error.message}</p>`;
        }
    }

    const editPageButton = document.querySelector('.footer-employee button');
    if (editPageButton) {
        editPageButton.addEventListener('click', () => {
            window.location.href = `/html/reportChangePage.html?id=${reportId}`;
        });
    }

    if (backArrow) {
        backArrow.addEventListener('click', evt => {
            evt.preventDefault();
            window.history.back();
        });
    }
});
