document.addEventListener('DOMContentLoaded', () => {
    const reportsViewButton = document.getElementById('reportsViewButton');
    const profileButton = document.getElementById('profileButton');

    /* ---------- Attaches a click event listener to the 'Reports View' button ---------- */
    if (reportsViewButton) {
        reportsViewButton.addEventListener('click', () => {
            window.location.href = '../html/reportsViewPage.html'; 
        });
    } else {
        console.warn("Element with ID 'reportsViewButton' not found. Cannot attach click listener.");
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
