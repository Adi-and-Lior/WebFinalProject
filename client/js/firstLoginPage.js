document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.querySelector('.first-login-form');
    const newUsernameInput = document.getElementById('newUsername');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const employeeCodeSection = document.querySelector('.employee-code-section');
    const employeeAuthCodeInput = document.getElementById('employeeAuthCode');
    const backButton = document.getElementById('backButton');
    const selectedUserType = localStorage.getItem('selectedUserType'); 
    const API_REGISTER_USER = 'https://webfinalproject-j4tc.onrender.com/api/register'; 

    console.log('Selected user type on first login page:', selectedUserType);

    if (backButton) {
        backButton.addEventListener('click', () => window.history.back());
    }

    if (selectedUserType && selectedUserType.toLowerCase() === 'employee') {
        employeeCodeSection.classList.remove('hidden');
        employeeAuthCodeInput.setAttribute('required', 'true');
    } else {
        employeeCodeSection.classList.add('hidden');
        employeeAuthCodeInput.removeAttribute('required');
    }

    registrationForm.addEventListener('submit', async event => {
        event.preventDefault();
        const username = newUsernameInput.value.trim();
        const password = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const employeeAuthCode = employeeAuthCodeInput.value.trim();

        if (!username || !password || !confirmPassword) {
            alert('אנא מלא את כל השדות הנדרשים.');
            return;
        }

        if (password !== confirmPassword) {
            alert('הסיסמאות אינן תואמות. אנא וודא שהקלדת אותה סיסמה בשני השדות.');
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            newPasswordInput.focus();
            return;
        }

        if (!selectedUserType) {
            alert('שגיאה: סוג משתמש לא נבחר. אנא חזור לדף הבחירה.');
            console.error('selectedUserType הוא null או undefined.');
            return;
        }

        if (selectedUserType.toLowerCase() === 'employee' && !employeeAuthCode) {
            alert('כעובד, עליך להזין קוד אימות.');
            return;
        }

        try {
            const bodyData = { 
                username, 
                password, 
                userType: selectedUserType 
            };

            if (selectedUserType.toLowerCase() === 'employee') {
                bodyData.employeeAuthCode = employeeAuthCode;
            }

            const res = await fetch(API_REGISTER_USER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            const data = await res.json();
            console.log('Server response:', data);

            if (!res.ok) {
                alert(data.error || 'שגיאת הרשמה: אנא נסה שוב.');
                console.error('הרשמה נכשלה מהשרת:', data.error || 'שגיאה לא ידועה');
                return;
            }

            alert('ההרשמה בוצעה בהצלחה! כעת תוכל להתחבר.');
            
            setTimeout(() => {
                window.location.href = '/html/loginPage.html'; 
            }, 500);

        } catch (err) {
            alert('אירעה שגיאה בחיבור לשרת. אנא נסה שוב מאוחר יותר.');
            console.error('שגיאת Fetch:', err);
        }
    });
});