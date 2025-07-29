document.addEventListener('DOMContentLoaded', () => {
  const loginForm     = document.querySelector('.login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const selectedUserType = localStorage.getItem('selectedUserType');
  const backButton = document.getElementById('backButton');
  const API_BASE_LOGIN = 'https://webfinalproject-j4tc.onrender.com/api/login';
  const togglePassword = document.getElementById('togglePassword');
  const lockIcon = document.getElementById('lockIcon');
  let passwordVisible = false;
  togglePassword.addEventListener('click', () => {
  passwordVisible = !passwordVisible;
  passwordInput.type = passwordVisible ? 'text' : 'password';
  togglePassword.src = passwordVisible ? '../images/eye_open.png' : '../images/eye_closed.png';
  });

  passwordInput.addEventListener('input', () => {
  if (passwordInput.value.trim() !== '') {
    lockIcon.style.display = 'none';
    togglePassword.style.display = 'block';
  } else {
    lockIcon.style.display = 'block';
    togglePassword.style.display = 'none';
  }
});

// בתחילה להסתיר את כפתור העין אם אין טקסט
togglePassword.style.display = 'none';

  console.log('Selected user type on the login page:', selectedUserType);
  console.log('Login page script loaded');
  console.log('loginForm:', loginForm);
  if (!loginForm) {
    console.warn("טופס התחברות לא נמצא. וודא שקיים אלמנט עם class 'login-form'.");
    return;
  }
  if (backButton) {
        backButton.addEventListener('click', () => window.history.back());
    }
  loginForm.addEventListener('submit', async event => {
    console.log('Submit event triggered');
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) {
      alert('אנא הזן שם משתמש וסיסמה.');
      return;
    }
    if (!selectedUserType) {
      alert('שגיאה: סוג משתמש לא נבחר. אנא חזור לדף הבחירה.');
      console.error('selectedUserType הוא null או undefined.');
      return;
    }
    try {
      const res  = await fetch(API_BASE_LOGIN, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ username, password, userType: selectedUserType })
      });
      const data = await res.json();
      console.log('Full server response:', data);
      if (!res.ok) {
        alert(data.error || 'שגיאת התחברות: שם משתמש או סיסמה שגויים.');
        console.error('התחברות נכשלה מהשרת:', data.error || 'שגיאה לא ידועה');
        return;
      }
      console.log('Login successful:', data.message);
      console.log('User data from server:', data.user);
      if (!data.user) {
        console.warn('התשובה מהשרת חסרה עטיפת user.');
        alert('שגיאה פנימית בשרת: נתוני משתמש חסרים בתגובה.');
        return;
      }
      const { username: loggedInUsername, userId, userType, city } = data.user;
      localStorage.setItem('loggedInUserName', loggedInUsername);
      localStorage.setItem('loggedInUserId', userId); 
      localStorage.setItem('selectedUserType', userType); 
      localStorage.setItem('loggedInUser', JSON.stringify({
        username: loggedInUsername, 
        userId,
        userType,
        city: city || null
      }));
      if ((userType || '').toLowerCase() === 'employee' && city) {
          localStorage.setItem('loggedInUserCity', city);
      } else {
          localStorage.removeItem('loggedInUserCity');
      }
      console.log('User data saved to localStorage:', localStorage.getItem('loggedInUser'));
      console.log('loggedInUserName in LS:', localStorage.getItem('loggedInUserName'));
      console.log('loggedInUserId in LS:', localStorage.getItem('loggedInUserId'));
      console.log('selectedUserType in LS:', localStorage.getItem('selectedUserType'));
      console.log('loggedInUserCity in LS:', localStorage.getItem('loggedInUserCity'));
      alert('התחברת בהצלחה!');
      setTimeout(() => {
        if (selectedUserType === 'citizen') {
          window.location.href = '/html/homePageCitizen.html';
        } else if (selectedUserType === 'employee') {
          window.location.href = '/html/homePageEmployee.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 500);
    } catch (err) {
      alert('אירעה שגיאה בחיבור לשרת. אנא נסה שוב מאוחר יותר.');
      console.error('שגיאת Fetch:', err);
    }
  });
});