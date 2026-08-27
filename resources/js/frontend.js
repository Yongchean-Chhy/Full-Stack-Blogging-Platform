function switch_tab(tab){
    const loginForm = document.getElementById("login_form_section");
    const registerFrom = document.getElementById("register_form");

    if (tab === "login"){
        loginForm.style.display = "block";
        registerFrom.style.display = "none";
    }
    else{
        loginForm.style.display = "none";
        registerFrom.style.display = "block";
    }
}
