let express = require("express");
let app = express();
let cookie_parser = require("cookie-parser");
let fs = require("fs");
let path = require("path");
const { match } = require("assert");
const session = require("express-session");
const bcrypt = require("bcrypt");

const {add_user, get_user, add_to_blog, 
      get_all_blog, get_recent_blog, 
      add_comment, get_user_by_id, get_blog_by_id, 
      get_comments_by_blog_id, get_blogs_page, 
      get_blog_count, delete_comment} = require("./data")

const PORT = 4131;

app.use(express.json({ limit: '1mb' }));
app.use(cookie_parser());
app.use(express.urlencoded({ extended: true }));

app.use("/resources", express.static(path.join(__dirname, "resources")));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/resources/templates"));

function require_Auth(req, res, next){
  if(!req.session.user){
    return res.redirect('/login');
  }
  next();
}

function require_admin(req, res, next){
  if(!req.session.user || !req.session.user.is_admin){
    return res.status(403).json({status: "error", errors: ["Admin access required"]});
  }
  next();
}

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));


app.get(["/", "/about"], async (req, res) => {
  const recent_blog = await get_recent_blog();
  res.render("about", {recent_blog: recent_blog});
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/dashboard", async (req, res) =>{
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page-1)* limit;

  const blogs = await get_blogs_page(limit, offset);
  const total_blogs = await get_blog_count();
  const total_pages = Math.ceil(total_blogs / limit);
  
  const user = req.session.user;

  data = {
    blogs: blogs,
    user: user,
    current_page: page,
    total_pages: total_pages
  };

  return res.render('dashboard', data);
});

app.get('/blog/:id', async(req, res) => {
  const blog_id = req.params.id;
  const blog = await get_blog_by_id(blog_id);
  if(!blog){
    return res.status(404).json({status: "error", errors: ["Blog not found"]});
  }

  const comments = await get_comments_by_blog_id(blog_id);

  const user= await get_user_by_id(blog.user_id);
  
  blog["author_name"] = user.username;
  const data = {
    blog: blog,
    comments: comments,
    currentUser: req.session.user || null
  };


  return res.render('blog', data);

});

app.post("/api/blogs/:id/comments", async (req, res) => {
  if (!req.session.user){
    return res.status(401).json({status: "error", errors: ["You must logged in"]});
  }

  const blogId = req.params.id;
  const content = req.body.content?.trim();

  if (!content){
    return res.status(400).json({status: "error", errors: ["Comment cannot be empty"]});
  }

  const data = {
    blog_id: blogId,
    author_id: req.session.user.id,
    author_name: req.session.user.username,
    content: content,
    created_at: new Date()
  };

  const new_id = await add_comment(data);

  if (new_id > 0){
    return res.status(200).json({status: "success",message: ["Comment posted successfully"] });
  }
  else{
    return res.status(400).json({status: "error", errors: ["fail to post comment"]});
  }
});

app.post("/api/register", async (req, res) =>{
  const content_type = req.get("Content-Type") || "";
  if (!content_type.includes("application/json")){
    return res.status(400).json({status: "error", errors: ["Expected application/json."]});
  }

  let data = req.body;
  if(!data || Object.keys(data).length === 0){
    return res.status(400).json({ status: "error", errors: ["Empty request body."] });
  }

  const required_fields = ["username", "email", "password", "confirm_password"]
  for (const field of required_fields){
    if (!(field in data)){
      return res.status(400).json({ status: "error", errors: [`Missing field: ${field}.`] });
    }
  }

  if (data.password !== data.confirm_password){
    return res.status(400).json({ status: "error", errors: ["Passwords do not match"]});
  }

  const hashedPass = await bcrypt.hash(data.password, 10);
  data.hashedPassword = hashedPass;

  const new_user_id = add_user(data);
  if (new_user_id !== -1){
    return res.status(201).json({status: "success", user_id: new_user_id });
  }
  else{
    return res.status(401).json({ status: "error", errors: ["Failed to add user."]});
  }

});

app.get("/create_blog", require_Auth, (req, res) =>{
  res.render("create", {user: req.session.user});
});

app.post("/api/create_blog", async (req, res) =>{
  if (!req.session.user){
    return res.status(401).json({ status: "error", errors: ["Not login"] });
  }

  const data = {
    title: req.body.title,
    content: req.body.content,
    author_id: req.session.user.id,
  };
  
  await add_to_blog(data);
  return res.json({ status: "success", message: "Blog created successfully" });
});

app.post("/api/login", async (req, res)=>{
  const content_type = req.get("Content-Type") || "";
  if (!content_type.includes("application/json")){
    return res.status(400).json({status: "error", errors: ["Expected application/json."]});
  }

  let data = req.body;
  if(!data || Object.keys(data).length === 0){
    return res.status(400).json({ status: "error", errors: ["Empty request body."] });
  }


  let user_info = await get_user(data.username);
  if (!user_info){
    return res.status(400).json({ status: "error", errors: ["Invalid credentials"] });
  }

  const match = await bcrypt.compare(data.password, user_info.password_hash);
  console.log(match)
  if (!match){
    return res.status(400).json({ status: "error", errors: ["Invalid credentials"] });
  }

  req.session.user = {
    id: user_info.id,
    username: user_info.username,
    is_admin: user_info.is_admin
  };

  res.json({ message: "Login successful", user: req.session.user });
});

app.post("/logout", (req, res) =>{
  req.session.destroy();
  res.clearCookie("connection.sid");
  res.redirect("/dashboard");
});

app.delete("/api/comments/:id", require_admin, async (req, res) => {
  const row = await delete_comment(req.params.id);
  if (row){
    res.json({ success: true });
  }
});

app.get("/404", (req, res) => {
  res.render('404');
})

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});