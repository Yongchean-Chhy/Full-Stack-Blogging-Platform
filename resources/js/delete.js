document.addEventListener("DOMContentLoaded", () =>{
     document.body.addEventListener("click", async (e) =>{
        if(!e.target.classList.contains("delete_button")){
            return;
        }
        
        const comment_id = e.target.dataset.commentId;
        if(!confirm("Delete this comment?")){
            return;
        }

        const res = await fetch(`/api/comments/${comment_id}`, {
            method: "DELETE"
        });

        if (res.ok){
            e.target.closest(".comment").remove();
        }
        else{
            alert("Failed to delete comment");
        }
    });
});