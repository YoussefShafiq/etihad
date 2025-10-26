document.getElementById('theme-toggle').addEventListener('click', function () {
    document.body.classList.toggle('light');
    if (document.body.classList.contains('light')) {
        localStorage.setItem('light', true)
    } else {
        localStorage.setItem('light', false)
    }
});

if(localStorage.getItem('light') === 'true') {
    document.body.classList.add('light');
}