async function handle_register(e) {
    e.preventDefault();
    let data = {
        username: document.getElementById("register_username").value,
        email: document.getElementById("register_email").value,
        password: document.getElementById("register_password").value,
        confirm_password: document.getElementById("confirm_password").value
    };
    const res = await fetch("/api/register", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById("login_message").innerText = result.message || "";
    if (res.ok){
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("welcome_new").style.display = "block";
        window.location.href = "dashboard";
    }
}


async function handle_login(e) {
    e.preventDefault();
    let data = {
        username: document.getElementById("login_username").value,
        password: document.getElementById("login_password").value
    };
    console.log(data)
    const res = await fetch("/api/login", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById("login_message").innerText = data.message;

    if (res.ok) {
        window.location.href = "dashboard";
    }
    else{
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("welcome_message").style.display = "block";
    }
}

function switch_tab(tab){
    const login_form = document.getElementById("login_form_section");
    const register_form = document.getElementById("register_form");

    const buttons = document.querySelectorAll(".tabs button");

    buttons.forEach(button => button.classList.remove("active"));
    console.log(buttons);
    if (tab === "login") {
        login_form.style.display = "block";
        register_form.style.display = "none";
        buttons[0].classList.add("active");
    } 
    else {
        login_form.style.display = "none";
        register_form.style.display = "block";
        buttons[1].classList.add("active");
    }
}