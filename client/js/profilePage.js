document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const userProfileDisplay = document.getElementById('userProfileDisplay');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const deleteProfileButton = document.getElementById('deleteProfileButton');
    function updateUserProfileText() {
        const userProfileType = localStorage.getItem('selectedUserType'); 
        console.log('User profile type from localStorage:', userProfileType); 
        if (userProfileDisplay) {
            let displayText = 'מחובר כ-אורח'; 
            if (userProfileType === 'citizen') {
                displayText = 'מחובר כ-אזרח';
            } else if (userProfileType === 'employee') {
                displayText = 'מחובר כ-עובד';
            }
            userProfileDisplay.textContent = displayText;
        }
    }

    function updateUserName() {
        const userName = localStorage.getItem('loggedInUserName');
        console.log('User name from localStorage:', userName); 
        if (userNameDisplay) {
            userNameDisplay.textContent = userName || 'אורח';
        }
    }
    updateUserProfileText();
    updateUserName(); 

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('selectedUserType');
            localStorage.removeItem('loggedInUserId');
            localStorage.removeItem('loggedInUserName');
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
                        localStorage.removeItem('selectedUserType');
                        localStorage.removeItem('loggedInUserName');
                        localStorage.removeItem('loggedInUserId');
                        localStorage.removeItem('loggedInUserCity');
                        window.location.href = '../index.html'; 
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