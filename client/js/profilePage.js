document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const userProfileDisplay = document.getElementById('userProfileDisplay');
    const userNameDisplay = document.getElementById('userNameDisplay'); // **אתר את האלמנט של שם המשתמש**

    // פונקציה לעדכון טקסט הפרופיל (מחובר כ-אזרח/עובד)
    function updateUserProfileText() {
        const userProfileType = localStorage.getItem('selectedUserType'); // קוראים את סוג הפרופיל מה-localStorage
        console.log('User profile type from localStorage:', userProfileType); // לדיבוג

        if (userProfileDisplay) {
            let displayText = 'מחובר כ-אורח'; // ברירת מחדל אם לא נמצא פרופיל

            if (userProfileType === 'citizen') {
                displayText = 'מחובר כ-אזרח';
            } else if (userProfileType === 'employee') {
                displayText = 'מחובר כ-עובד';
            }
            userProfileDisplay.textContent = displayText;
        }
    }

    // **פונקציה חדשה לעדכון שם המשתמש**
    function updateUserName() {
        // קוראים את השם שנשמר בעמוד ההתחברות תחת המפתח 'loggedInUserName'
        const userName = localStorage.getItem('loggedInUserName');
        console.log('User name from localStorage:', userName); // לדיבוג

        if (userNameDisplay) {
            // אם יש שם, נציג אותו. אחרת, נציג 'אורח' או 'משתמש' כברירת מחדל.
            userNameDisplay.textContent = userName || 'אורח';
        }
    }

    // קריאה לפונקציות בעת טעינת העמוד
    updateUserProfileText();
    updateUserName(); // **קריאה לפונקציה החדשה בעת טעינת העמוד**

    // לוגיקה של כפתור ההתנתקות
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // ניקוי נתוני המשתמש מ-localStorage
            localStorage.removeItem('selectedUserType'); // מנקה את סוג הפרופיל שנשמר
            localStorage.removeItem('loggedInUserName'); // **חשוב: מנקה גם את שם המשתמש בלחיצת התנתק**
            window.location.href = '../index.html';
        });
    }
});