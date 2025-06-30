document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const userProfileDisplay = document.getElementById('userProfileDisplay');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const deleteProfileButton = document.getElementById('deleteProfileButton');

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
            localStorage.removeItem('loggedInUserId');
            localStorage.removeItem('loggedInUserName'); // **חשוב: מנקה גם את שם המשתמש בלחיצת התנתק**
            window.location.href = '../index.html';
        });
    }

    if (deleteProfileButton) {
        deleteProfileButton.addEventListener('click', async (event) => {
            event.preventDefault(); 

            const confirmDelete = confirm('האם אתה בטוח שברצונך למחוק את חשבונך וכל התקלות שדיווחת? פעולה זו בלתי הפיכה!');

            if (confirmDelete) {
                const userId = localStorage.getItem('loggedInUserId'); 

                if (!userId) {
                    alert('שגיאה: לא ניתן למצוא את מזהה המשתמש. אנא התחבר שוב.');
                    return;
                }

                try {
                    const response = await fetch(`/api/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        alert('החשבון וכל הדיווחים הקשורים נמחקו בהצלחה.');
                        // נקה את נתוני המשתמש מ-localStorage לאחר מחיקה מוצלחת
                        localStorage.removeItem('selectedUserType');
                        localStorage.removeItem('loggedInUserName');
                        localStorage.removeItem('loggedInUserId');
                        localStorage.removeItem('loggedInUserCity');
                        window.location.href = '../index.html'; // הפנה לדף הבית
                    } else {
                        const errorData = await response.json();
                        alert(`שגיאה במחיקת החשבון: ${errorData.message || 'נסה שוב מאוחר יותר.'}`);
                    }
                } catch (error) {
                    console.error('שגיאה בשליחת בקשת המחיקה:', error);
                    alert('אירעה שגיאה בעת ניסיון מחיקת החשבון. אנא נסה שוב מאוחר יותר.');
                }
            }
        });
    }
});