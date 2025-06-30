document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    const reportsTitleElement = document.querySelector('.reports-title h1');
    const reportNumberDisplay = document.getElementById('reportNumberDisplay');
    const backToHomeButton = document.getElementById('backToHomeButton');
    const displayFaultType = document.getElementById('displayFaultType');
    const displayLocation = document.getElementById('displayLocation');
    const displayDate = document.getElementById('displayDate');
    const displayTime = document.getElementById('displayTime');
    const displayDescription = document.getElementById('displayDescription');
    const mediaContainer = document.getElementById('mediaContainer');
    const displayStatus = document.getElementById('displayStatus');
    const displayMunicipalityResponse = document.getElementById('displayMunicipalityResponse');

    const statusTranslations = {
        'in-progress': 'בטיפול',
        'completed': 'הושלם',
        'rejected': 'נדחה',
    };

    async function fetchReportDetails(id) {
        try {
            const BASE_URL = 'https://webfinalproject-j4tc.onrender.com';
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

    function populateReportData(report) {
        displayFaultType.textContent = report.faultType || 'לא ידוע';

        let locationText = '';
        if (report.location) {
            if (report.location.city) locationText += report.location.city;
            if (report.location.street) locationText += `, ${report.location.street}`;
            if (report.location.houseNumber) locationText += ` ${report.location.houseNumber}`;
        }
        displayLocation.textContent = locationText || 'לא הוזן מיקום';

        if (report.timestamp) {
            const date = new Date(report.timestamp);
            displayDate.textContent = date.toLocaleDateString('he-IL');
            displayTime.textContent = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        } else {
            displayDate.textContent = 'לא ידוע';
            displayTime.textContent = 'לא ידוע';
        }

        displayDescription.textContent = report.faultDescription || 'אין תיאור.';

        mediaContainer.innerHTML = '';
        if (report.media) {
            const mediaUrl = `/uploads/${report.media}`;
            if (report.media.match(/\.(jpeg|jpg|gif|png)$/i)) {
                const img = document.createElement('img');
                img.src = mediaUrl;
                img.alt = 'תמונה מצורפת לדיווח';
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                mediaContainer.appendChild(img);
            } else if (report.media.match(/\.(mp4|webm|ogg)$/i)) {
                const video = document.createElement('video');
                video.src = mediaUrl;
                video.controls = true;
                video.style.maxWidth = '100%';
                video.style.height = 'auto';
                mediaContainer.appendChild(video);
            } else {
                mediaContainer.textContent = 'קובץ מדיה לא נתמך.';
            }
        }
        let normalizedStatus = (report.status || '').toLowerCase().replace(/_/g, '-');
        const statusHebrew = statusTranslations[normalizedStatus] || 'לא ידוע';

        if (displayStatus) {
            displayStatus.textContent = statusHebrew;

            displayStatus.classList.remove('status-completed', 'status-rejected', 'status-in-progress');

            if (normalizedStatus === 'completed') {
                displayStatus.classList.add('status-paid');
            } else if (normalizedStatus === 'rejected') {
                displayStatus.classList.add('status-rejected');
            } else if (normalizedStatus === 'in-progress') {
                displayStatus.classList.add('status-in-progress');
            }
        }
        displayMunicipalityResponse.textContent = report.municipalityResponse || 'טרם התקבלה תגובה מהרשות המקומית.';
    }
    if (!reportId) {
        reportsTitleElement.textContent = 'שגיאה: ID דיווח חסר';
        console.error('Report ID is missing from the URL.');
        return;
    }
    const currentReport = await fetchReportDetails(reportId);
    if (currentReport) {
        if (reportsTitleElement) { 
            reportsTitleElement.textContent = `דיווח #${reportId.slice(-4)}`;
        }
        populateReportData(currentReport);
    } else {
        reportsTitleElement.textContent = 'שגיאה בטעינת דיווח';
        document.querySelector('main').innerHTML =
            `<p style="color: red; text-align: center;">הדיווח לא נמצא או אירעה שגיאה בטעינה.</p>`;
        if (backToHomeButton) backToHomeButton.style.display = 'none';
    }

    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', () => {
            window.location.href = '../html/homePageEmployee.html';
        });
    }

});