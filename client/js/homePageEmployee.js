document.addEventListener('DOMContentLoaded', () => {
    const reportsViewButton = document.getElementById('reportsViewButton');
    const profileButton = document.getElementById('profileButton');
    if (reportsViewButton) {
        reportsViewButton.addEventListener('click', () => {
            window.location.href = '../html/reportsViewPage.html'; 
        });
    } else {
        console.warn("Element with ID 'reportsViewButton' not found. Cannot attach click listener.");
    }

    if (profileButton) {
        profileButton.addEventListener('click', () => {
            window.location.href = '../html/profilePage.html'; 
        });
    } else {
        console.warn("Element with ID 'profileButton' not found. Cannot attach click listener.");
    }
});
