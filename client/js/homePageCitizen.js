document.addEventListener('DOMContentLoaded', () => {
    const newReportButton = document.getElementById('newReportButton');
    const myReportsButton = document.getElementById('myReportsButton');
    const profileButton = document.getElementById('profileButton');
    
    /* ---------- Attaches a click event listener to the 'New Report' button ---------- */
    if (newReportButton) {
        newReportButton.addEventListener('click', () => {
            window.location.href = '../html/newReportPage.html'; 
        });
    } else {
        console.warn("Element with ID 'newReportButton' not found. Cannot attach click listener.");
    }

    /* ---------- Attaches a click event listener to the 'My Reports' button ---------- */
    if (myReportsButton) {
        myReportsButton.addEventListener('click', () => {
            window.location.href = '../html/myReportsPage.html'; 
        });
    } else {
        console.warn("Element with ID 'myReportsButton' not found. Cannot attach click listener.");
    }

    /* ---------- Attaches a click event listener to the 'Profile' button ---------- */
    if (profileButton) {
        profileButton.addEventListener('click', () => {
            window.location.href = '../html/profilePage.html'; 
        });
    } else {
        console.warn("Element with ID 'profileButton' not found. Cannot attach click listener.");
    }
});