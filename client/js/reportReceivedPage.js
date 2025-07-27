document.addEventListener('DOMContentLoaded', async () => {
    console.log('[INFO] DOM fully loaded');
    const displayFaultType = document.getElementById('displayFaultType');
    const displayLocation = document.getElementById('displayLocation');
    const displayDate = document.getElementById('displayDate');
    const displayTime = document.getElementById('displayTime');
    const displayDescription = document.getElementById('displayDescription');
    const displayMedia = document.getElementById('displayMedia');
    const mediaPreview = document.getElementById('mediaPreview');
    const goToMyReportsBtn = document.getElementById('goToMyReportsBtn');
    const goToHomeBtn = document.getElementById('goToHomeBtn');
    const API_BASE_URL = 'https://webfinalproject-j4tc.onrender.com/api';

    async function fetchReportById(reportId) {
        console.log(`[DEBUG] Fetching report by ID: ${reportId}`);
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}`);
            if (!response.ok) throw new Error('Failed to fetch report');
            const data = await response.json();
            console.log('[DEBUG] Report fetched from server:', data);
            return data;
        } catch (error) {
            console.error('שגיאה באחזור דיווח לפי ID:', error);
            return null;
        }
    }

    // פונקציה לעדכון מיקום הדיווח בשרת (הפונקציה החדשה שדיברנו עליה)
    async function updateReportLocation(reportId, city, street, houseNumber) {
        console.log(`[DEBUG] Updating report location for ID: ${reportId} to City: ${city}, Street: ${street}, Number: ${houseNumber}`);
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/location`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ city, street, houseNumber })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'כשל בעדכון מיקום הדיווח בשרת');
            }

            const data = await response.json();
            console.log('מיקום הדיווח עודכן בהצלחה בשרת:', data.report);
            return data.report; // החזר את הדיווח המעודכן
        } catch (error) {
            console.error('שגיאה בעדכון מיקום הדיווח בשרת:', error);
            // אין צורך להציג alert כאן, אפשר לטפל בזה במקום אחר אם צריך
            return null;
        }
    }

    async function getAddressFromCoordinates(lat, lon) {
        console.log(`[DEBUG] Getting address from coordinates: lat=${lat}, lon=${lon}`);
        try {
            const response = await fetch(`${API_BASE_URL}/reverse-geocode?lat=${lat}&lon=${lon}`);
            console.log('[DEBUG] Reverse geocode request status:', response.status);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reverse geocode');
            }
            const data = await response.json();
            console.log('[DEBUG] Address data returned:', data);
            return data;
        } catch (error) {
            console.error('שגיאה בפענוח מיקום (reverse geocode):', error);
            return null;
        }
    }

    function parseLocationString(locationStr) {
        console.log('[DEBUG] Parsing location string:', locationStr);
        let formattedLocation = '';

        if (locationStr.includes('עיר:') && locationStr.includes('רחוב:')) {
            const cityMatch = locationStr.match(/עיר:\s*([^,]+)/);
            const streetMatch = locationStr.match(/רחוב:\s*([^,]+)/);
            const numberMatch = locationStr.match(/מספר בית:\s*(\d+)/);

            const city = cityMatch ? cityMatch[1].trim() : '';
            const street = streetMatch ? streetMatch[1].trim() : '';
            const number = numberMatch ? numberMatch[1].trim() : '';

            formattedLocation = `${city}, ${street}${number ? ' ' + number : ''}`;
        } else {
            const parts = locationStr.split(',');
            if (parts.length >= 2) {
                const streetAndNumber = parts[0].trim();
                const city = parts[1].trim();
                formattedLocation = `${city} ${streetAndNumber}`;
            } else {
                formattedLocation = locationStr;
            }
        }
        console.log('[DEBUG] Parsed formatted location:', formattedLocation);
        return formattedLocation;
    }

    const lastReportId = localStorage.getItem('lastReportId');
    console.log('[DEBUG] Last report ID from localStorage:', lastReportId);
    let reportData = null;
    if (lastReportId) {
        reportData = await fetchReportById(lastReportId);
    }
    if (!reportData) {
        console.warn('[WARN] Report not found in server, trying localStorage fallback');
        reportData = JSON.parse(localStorage.getItem('lastReportDetails'));
        console.log('[DEBUG] Report from localStorage:', reportData);
    }

    if (reportData) {
        console.log('[INFO] Processing report data');
        displayFaultType.textContent = reportData.faultType || 'לא ידוע';

        if (reportData.location) {
            console.log('[DEBUG] Report location object:', reportData.location);
            if (reportData.location.type === 'manual') {
                const city = reportData.location.city || '';
                const street = reportData.location.street || '';
                const houseNumber = reportData.location.houseNumber || '';
                const address = `${city}, ${street}${houseNumber ? ' ' + houseNumber : ''}`;
                displayLocation.textContent = address;
            } else if (reportData.location.type === 'current') {
                const { latitude, longitude } = reportData.location;
                console.log('[DEBUG] Current location - lat:', latitude, 'lon:', longitude);
                if (latitude != null && longitude != null) {
                    const addressData = await getAddressFromCoordinates(latitude, longitude);
                    if (addressData) {
                        const city = addressData.city || addressData.town || addressData.village || '';
                        const street = addressData.road || '';
                        const houseNumber = addressData.house_number || '';
                        
                        // *** כאן הקוד החדש שיפעיל את פונקציית העדכון בשרת ***
                        // רק אם הדיווח לא עבר עדכון כזה בעבר (כלומר, שדות הכתובת ריקים)
                        // ואם ה-reportId זמין
                        if (lastReportId && (!reportData.location.city || !reportData.location.street)) {
                            console.log('[INFO] Updating report location in DB based on geocoded data.');
                            const updatedReport = await updateReportLocation(lastReportId, city, street, houseNumber);
                            if (updatedReport) {
                                // אם העדכון הצליח, נעדכן את אובייקט reportData כדי להציג את הנתונים החדשים
                                reportData.location.city = updatedReport.location.city;
                                reportData.location.street = updatedReport.location.street;
                                reportData.location.houseNumber = updatedReport.location.houseNumber;
                                reportData.location.type = updatedReport.location.type; // יהפוך ל-'manual'
                                reportData.location.latitude = undefined; // ננקה את הקואורדינטות כיוון שהמיקום עכשיו ידני
                                reportData.location.longitude = undefined; // ננקה את הקואורדינטות
                            }
                        }
                        // *** סוף הקוד החדש ***

                        const formattedLocation = `${city}, ${street}${houseNumber ? ' ' + houseNumber : ''}`.trim();
                        console.log('[DEBUG] Formatted location from GPS:', formattedLocation);
                        displayLocation.textContent = formattedLocation || 'מיקום לפי GPS';
                    } else {
                        console.warn('[WARN] Address data not found, showing fallback');
                        displayLocation.textContent = 'מיקום לפי GPS';
                    }
                } else {
                    console.warn('[WARN] Missing latitude/longitude');
                    displayLocation.textContent = 'מיקום לפי GPS';
                }
            } else {
                console.warn('[WARN] Unknown location type');
                displayLocation.textContent = 'מיקום לא ידוע';
            }
        } else {
            console.warn('[WARN] No location data at all');
            displayLocation.textContent = 'מיקום לא ידוע';
        }

        if (reportData.timestamp) {
            const date = new Date(reportData.timestamp);
            displayDate.textContent = date.toLocaleDateString('he-IL');
            displayTime.textContent = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        } else {
            displayDate.textContent = 'לא ידוע';
            displayTime.textContent = 'לא ידוע';
        }
        displayDescription.textContent = reportData.faultDescription || 'אין תיאור';
        if (reportData.media && reportData.media !== 'no media') {
            const mediaUrl = `${API_BASE_URL}/media/${reportData.media}`;
            const mimeType = reportData.mediaMimeType;
            console.log('[DEBUG] Media ID:', reportData.mediaId);
            console.log('[DEBUG] Media URL:', mediaUrl);
            console.log('[DEBUG] Media MIME type:', mimeType);
            mediaPreview.src = '';
            let existingVideo = document.getElementById('reportMediaVideoPreview');
            if (existingVideo) existingVideo.remove();
            if (mimeType && mimeType.startsWith('image/')) {
                mediaPreview.src = mediaUrl;
                mediaPreview.style.display = 'block';
                displayMedia.textContent = 'קובץ תמונה מצורף';
            } else if (mimeType && mimeType.startsWith('video/')) {
                const video = document.createElement('video');
                video.id = 'reportMediaVideoPreview';
                video.controls = true;
                video.src = mediaUrl;
                video.classList.add('uploaded-media-preview');
                displayMedia.appendChild(video);
                displayMedia.textContent = 'קובץ וידאו מצורף';
            } else {
                console.warn('[WARN] Unsupported or unknown media type');
                displayMedia.textContent = 'קובץ מדיה לא נתמך או לא זוהה';
                mediaPreview.style.display = 'none';
            }
        } else {
            console.log('[INFO] No media attached to report');
            displayMedia.textContent = 'אין קובץ מצורף';
            mediaPreview.style.display = 'none';
        }
    } else {
        console.error('[ERROR] No report data found');
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