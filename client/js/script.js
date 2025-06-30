document.addEventListener('DOMContentLoaded', () => {
    const profileOptions = document.querySelectorAll('.userBlock');
    const continueButton = document.querySelector('.continue-button');

    let selectedProfile = null;

    profileOptions.forEach(option => {
        option.addEventListener('click', () => {
            profileOptions.forEach(opt => {
                opt.classList.remove('selected');
                const checkIcon = opt.querySelector('.check-icon');
                if (checkIcon) {
                    checkIcon.classList.add('hidden');
                }
            });
            option.classList.add('selected');
            const selectedCheckIcon = option.querySelector('.check-icon');
            if (selectedCheckIcon) {
                selectedCheckIcon.classList.remove('hidden'); // מציג את ה-V
            }

            selectedProfile = option.dataset.profile;
            console.log('פרופיל נבחר:', selectedProfile);
            localStorage.setItem('selectedUserType', selectedProfile);
        });
    });
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            if (selectedProfile) {
                window.location.href = '/html/loginPage.html'; 
            } else {
                alert('אנא בחר פרופיל כדי להמשיך.');
            }
        });
    }
});

    
