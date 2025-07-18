document.addEventListener('DOMContentLoaded', async () => {
    const backButton = document.getElementById('backButton');
    const reportsListContainer = document.querySelector('.reports-list-container');
    const sortReportsDropdown = document.getElementById('sort-reports-dropdown');

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let currentUserId = loggedInUser ? loggedInUser.userId : null;
    let currentUserType = loggedInUser ? loggedInUser.userType : null;
     
    const API_BASE_URL = 'https://webfinalproject-j4tc.onrender.com/api';
    if (!currentUserId) {
        console.warn('אין משתמש מחובר. לא ניתן לאחזר דיווחים.');
        reportsListContainer.innerHTML = '<p class="no-reports-message">אנא התחבר כדי לראות את הדיווחים שלך.</p>';
        return; 
    }
    
    async function fetchReports() {
        try {
            let url = `${API_BASE_URL}/reports`;
            if (currentUserType === 'citizen') {
                url += `?creatorId=${currentUserId}`;
            }

            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'כשל באחזור דיווחים מהשרת.');
            }

            let reports = await res.json();
            console.log('דיווחים נטענו בהצלחה:', reports);
            return reports;

        } catch (error) {
            console.error('שגיאה באחזור דיווחים:', error);
            alert('אירעה שגיאה באחזור הדיווחים. אנא נסה שוב מאוחר יותר.');
            return [];
        }
    }
    let allReports = [];
    allReports = await fetchReports();
    async function deleteReport(reportId) {
        if (!confirm('האם אתה בטוח שברצונך למחוק דיווח זה?')) {
            return;
        }

        try {
            const res = await fetch(`/api/reports/${reportId}?userId=${currentUserId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'כשל במחיקת דיווח מהשרת.');
            }

            alert('הדיווח נמחק בהצלחה!');
            // רענן את רשימת הדיווחים לאחר המחיקה
            allReports = await fetchReports();
            displayReports(sortReports(allReports, sortReportsDropdown.value));

        } catch (error) {
            console.error('שגיאה במחיקת דיווח:', error);
            alert(`אירעה שגיאה במחיקת הדיווח: ${error.message}`);
        }
    }

    function createReportCard(report) {
        const reportCard = document.createElement('section');
        reportCard.classList.add('report-card');
        reportCard.dataset.reportId = report._id;

        reportCard.addEventListener('click', (event) => {
        // ודא שהקליק לא היה על כפתור המחיקה או אלמנט בתוכו
        if (!event.target.closest('.delete-report-button')) {
            window.location.href = `/html/reportingDetailsPage.html?id=${report._id}`;
        }
    });

        const timestamp = report.timestamp ? new Date(report.timestamp) : null;
        const displayDate = timestamp ? timestamp.toLocaleDateString('he-IL') : 'לא ידוע';
        const displayTime = timestamp ? timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '';

        let statusClass = '';
        let statusText = '';
        switch (report.status) {
            case 'in-progress':
                statusClass = 'status-in-progress';
                statusText = 'בטיפול';
                break;
            case 'completed':
                statusClass = 'status-paid'; 
                statusText = 'הושלם';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusText = 'נדחה';
                break;
            default:
                statusClass = '';
                statusText = report.status || 'לא ידוע';
        }

        let mediaHtml = '';
        if (report.media) {
            const mediaUrl = `${API_BASE_URL}/media/${report.media}`; 
            const mimeType = report.mediaMimeType;
        
         if (mimeType && mimeType.startsWith('image/')) {
        mediaHtml = `<section class="report-image-wrapper">
                         <img src="${mediaUrl}" alt="תמונת דיווח" class="report-thumbnail">
                     </section>`;
    } else if (mimeType && mimeType.startsWith('video/')) {
        mediaHtml = `<section class="report-image-wrapper">
                         <video src="${mediaUrl}" controls class="report-thumbnail"></video>
                     </section>`;
    } }else {
        // Fallback for cases where mediaMimeType is missing or not recognized
        // (לדוגמה, דיווחים ישנים שלא נשמרו עם mediaMimeType, או סוג קובץ לא נתמך)
        mediaHtml = `<section class="report-image-wrapper">
                         <img src="https://placehold.co/90x90/eeeeee/333333?text=אין+מדיה" alt="אין מדיה" class="report-thumbnail">
                     </section>`;
    }
        reportCard.innerHTML = `
            <section class="report-details">
                <h3 class="report-type">${report.faultType}</h3>
                <h3 class="report-location">${report.location.city ? `${report.location.street}, ${report.location.city}` : (report.location.type === 'current' ? 'מיקום נוכחי' : 'לא ידוע')}</h3>
                <h3 class="report-date">${displayDate}</h3>
                <h3 class="report-status ${statusClass}">${statusText}</h3>
            </section>
            ${mediaHtml}
            ${currentUserType === 'citizen' ? `
            <button class="delete-report-button" title="מחק דיווח">
                <img src="../images/Trash_can.svg" alt="מחק" class="trash-icon">
            </button>` : ''}

        `;

        const deleteButton = reportCard.querySelector('.delete-report-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // מונע את הפעלת ה-listener של reportCard
                deleteReport(report._id);
            });
        }
        return reportCard;
    }

    function displayReports(reports) {
        reportsListContainer.innerHTML = ''; // ניקוי הקונטיינר הקיים
        if (reports.length === 0) {
            reportsListContainer.innerHTML = '<p class="no-reports-message">אין דיווחים להצגה.</p>';
            return;
        }
        reports.forEach(report => {
            reportsListContainer.appendChild(createReportCard(report));
        });
    }

    function sortReports(reports, sortType) {
        const sortedReports = [...reports];
        switch (sortType) {
            case 'date-default':
                sortedReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'status':
                const statusOrder = {'in-progress': 1, 'completed': 2, 'rejected': 3 };
                sortedReports.sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99));
                break;
            case 'alphabetical':
                sortedReports.sort((a, b) => (a.faultType || '').localeCompare(b.faultType || '', 'he')); // מיון בעברית
                break;
            default:
                break;
        }
        return sortedReports;
    }

    if (backButton) {
        backButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.history.back(); // Go back to the previous page
        });
    }

    if (sortReportsDropdown) {
        sortReportsDropdown.addEventListener('change', () => {
            const currentSortType = sortReportsDropdown.value;
            displayReports(sortReports(allReports, currentSortType));
        });
    }

    displayReports(sortReports(allReports, sortReportsDropdown.value)); 

    console.log('myReportsPage.js נטען במלואו.');
});