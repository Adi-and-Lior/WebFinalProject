document.addEventListener('DOMContentLoaded', () => {
  const loginForm     = document.querySelector('.login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  // קוראים את selectedUserType מ-localStorage בתחילת הטעינה של דף הלוגין
  // זה בסדר גמור, זה הערך שאמור להישלח לשרת.
  const selectedUserType = localStorage.getItem('selectedUserType');
  const API_BASE_LOGIN = 'https://webfinalproject-j4tc.onrender.com/api/login';
  console.log('Selected user type on the login page:', selectedUserType);

  if (!loginForm) {
    console.warn("טופס התחברות לא נמצא. וודא שקיים אלמנט עם class 'login-form'.");
    return;
  }

  loginForm.addEventListener('submit', async event => {
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
        // אפשר גם להפנות למסך שגיאה או לטפל אחרת
        alert('שגיאה פנימית בשרת: נתוני משתמש חסרים בתגובה.');
        return; // יציאה מהפונקציה
      }

      const { username: loggedInUsername, userId, userType, city } = data.user;

      // *** התיקון העיקרי כאן: שמירת השדות החשובים בנפרד ***
      // זה יבטיח ש-profilePage.js יוכל לקרוא אותם ישירות
      localStorage.setItem('loggedInUserName', loggedInUsername);
      localStorage.setItem('loggedInUserId', userId); // שים לב: זה ה-ID של המשתמש
      localStorage.setItem('selectedUserType', userType); // וזה סוג המשתמש

      // שמירה של אובייקט ה-JSON עדיין שימושית אם אתה רוצה לגשת לכל הפרטים במקום אחד
      localStorage.setItem('loggedInUser', JSON.stringify({
        username: loggedInUsername, // חשוב להשתמש בשם המשתמש שהתקבל מהשרת
        userId,
        userType,
        city: city || null
      }));

      // שמור את העיר בנפרד רק אם היא קיימת (רלוונטי לעובד)
      if ((userType || '').toLowerCase() === 'employee' && city) {
          localStorage.setItem('loggedInUserCity', city);
      } else {
          // ודא שאתה מנקה את loggedInUserCity אם זה לא עובד
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
          // ברירת מחדל למקרה שאין selectedUserType (לא אמור לקרות עם הבדיקה למעלה)
          window.location.href = 'index.html';
        }
      }, 500);

    } catch (err) {
      alert('אירעה שגיאה בחיבור לשרת. אנא נסה שוב מאוחר יותר.');
      console.error('שגיאת Fetch:', err);
    }
  });
});