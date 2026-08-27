document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("post_form");
    console.log("form", form);
    form.addEventListener("submit", handle_post);
});

async function handle_post(e) {
    e.preventDefault();
    let data = {
        title: document.getElementById("post_title").value,
        content: document.getElementById("post_content").value,
    };
    const res = await fetch("/api/create_blog", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if (res.ok){
        window.location.href= "/dashboard";
    }
}

async function handle_comment(e){
    e.preventDefault();

    const text_area = document.getElementById("commentText");
    const message_div = document.getElementById("commentMessage");

    const content = text_area.value.trim();
    if (!content){
        return;
    }


    const res = await fetch(`/api/blogs/${window.location.pathname.split('/').pop()}/comments`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });

    const result = await res.json();

    if(res.ok){
        message_div.innerHTML = '<div class="message success">Comment posted successfully!</div>';
        setTimeout(() => {
              window.location.reload();
        }, 1000);
    }
    else{
        message_div.innerHTML = `<div class="message error">${result.errors?.join(', ') || 'Failed to post comment'}</div>`;
    }
}