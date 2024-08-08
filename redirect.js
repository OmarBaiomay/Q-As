document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const location = window.location.href

    console.log(location)

    console.log(isLoggedIn)

    if(location.includes("login") && isLoggedIn){
        window.location.href = 'main.html'

    }else if(location.includes("main") && !isLoggedIn){
        window.location.href = 'login.html'

    }else if(location.includes("index") && !isLoggedIn){
        window.location.href = 'login.html'
    }
});
