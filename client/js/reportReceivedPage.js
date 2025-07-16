document.addEventListener('DOMContentLoaded', () => {
    // Get HTML elements where report details will be displayed
    const displayFaultType = document.getElementById('displayFaultType');
    const displayLocation = document.getElementById('displayLocation');
    const displayDate = document.getElementById('displayDate');
    const displayTime = document.getElementById('displayTime');
    const displayDescription = document.getElementById('displayDescription');
    const displayMedia = document.getElementById('displayMedia');
    const mediaPreview = document.getElementById('mediaPreview');

    // Get buttons
    const goToMyReportsBtn = document.getElementById('goToMyReportsBtn');
    const goToHomeBtn = document.getElementById('goToHomeBtn');

    const API_BASE_URL = 'https://webfinalproject-j4tc.onrender.com/api'; 
    // Load report details from localStorage
    const lastReportDetails = JSON.parse(localStorage.getItem('lastReportDetails'));

    if (lastReportDetails) {
        console.log('Last report details found:', lastReportDetails);

        // Display fault type
        displayFaultType.textContent = lastReportDetails.faultType || 'לא ידוע';

        // Display location
        displayLocation.textContent = lastReportDetails.location || 'לא ידוע';

        // Parse date and time
        if (lastReportDetails.timestamp) {
            const date = new Date(lastReportDetails.timestamp);

            // Populate date and time within "Report Details"
            displayDate.textContent = date.toLocaleDateString('he-IL'); // Israeli date format
            displayTime.textContent = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }); // Israeli time format

        } else {
            displayDate.textContent = 'לא ידוע';
            displayTime.textContent = 'לא ידוע';
        }

        // Display fault description (if exists)
        displayDescription.textContent = lastReportDetails.faultDescription || 'אין תיאור';

        // Display media file
        if (lastReportDetails.mediaId && lastReportDetails.mediaId !== 'no media') {
    // ה-URL הנכון הוא דרך ה-API שמגיש מדיה לפי ID
    const mediaUrl = `${API_BASE_URL}/media/${lastReportDetails.mediaId}`;
    const mimeType = lastReportDetails.mediaMimeType; // קבל את ה-MIME type ששמרנו

    // וודא שננקה כל מדיה קודמת לפני הוספת החדשה
    // הסתר את אלמנט ה-img preview המקורי
// ננקה את התמונה הקודמת (הסר src), אבל לא נסתר אותה
    mediaPreview.src = '';
    // אם יש כבר אלמנט וידאו קודם, הסר אותו (חשוב במקרה של ניווט לדף הזה שוב)
    let existingVideoElement = document.getElementById('reportMediaVideoPreview');
    if (existingVideoElement) {
        existingVideoElement.remove();
    }

    if (mimeType && mimeType.startsWith('image/')) {
        mediaPreview.src = mediaUrl;
        mediaPreview.style.display = 'block'; // הצג את אלמנט ה-img
        displayMedia.textContent = 'קובץ תמונה מצורף'; // טקסט תיאורי
    } else if (mimeType && mimeType.startsWith('video/')) {
        const videoElement = document.createElement('video');
        videoElement.id = 'reportMediaVideoPreview'; // תן לו ID לזיהוי עתידי
        videoElement.controls = true;
        videoElement.src = mediaUrl;
        videoElement.classList.add('uploaded-media-preview');
        // הוסף את אלמנט הוידאו ל-displayMedia (או לכל אלמנט אחר שתבחר)
        displayMedia.appendChild(videoElement);
        displayMedia.textContent = 'קובץ וידאו מצורף'; // טקסט תיאורי
    } else {
        // Fallback אם אין MIME type או שהוא לא נתמך (או ש-mediaId קיים אבל mimeType לא)
        displayMedia.textContent = 'קובץ מדיה לא נתמך או לא זוהה';
        mediaPreview.style.display = 'none';
    }
} else {
    displayMedia.textContent = 'אין קובץ מצורף';
    mediaPreview.style.display = 'none';
}

    } else {
        // If no data in localStorage (e.g., user navigated directly to the page)
        console.warn('No recent report details found in localStorage.');
        displayFaultType.textContent = 'אין נתונים';
        displayLocation.textContent = 'אין נתונים';
        displayDate.textContent = 'אין נתונים';
        displayTime.textContent = 'אין נתונים';
        displayDescription.textContent = 'אין נתונים';
        displayMedia.textContent = 'אין נתונים';
        mediaPreview.style.display = 'none';
    }
    
    if (goToMyReportsBtn) {
        goToMyReportsBtn.addEventListener('click', () => {
            window.location.href = '/html/myReportsPage.html';
        });
    }

    if (goToHomeBtn) {
        goToHomeBtn.addEventListener('click', () => {
            window.location.href = '/html/homePageCitizen.html';
        });
    }
});