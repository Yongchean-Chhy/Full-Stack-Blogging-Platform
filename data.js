const mysql = require("mysql2/promise");

var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "cse-mysql-classes-02.cse.umn.edu", // this will work
  user: "C4131F25U15",
  database: "C4131F25U15",
  password: "275", // we really shouldn't be saving this here long-term -- and I probably shouldn't be sharing it with you...
});

async function add_user(data){
  let conn = await connPool.getConnection();
  const sql = `insert into Users (username, email, password_hash, created_at, updated_at, last_login, is_active) 
                values (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, TRUE)`
  const params = [
    data.username,
    data.email,
    data.hashedPassword
  ];
 
  const [result] = await conn.execute(sql, params);
  const new_id = result.insertId;
  conn.release();
  return new_id;
}

async function get_user(username){
  let conn = await connPool.getConnection();
  const sql = `select * from Users where username=?`;
  const [result] = await conn.execute(sql, [username]);
  conn.release();
  return result[0];
}

async function get_user_by_id(id){
  let conn = await connPool.getConnection();
  const sql = `select * from Users where id=?`;
  const [result] = await conn.execute(sql, [id]);
  conn.release();
  return result[0];
}


async function add_to_blog(data){
  let conn = await connPool.getConnection();
  const sql = `insert into blogs (title, content, created_at, user_id)
                values (?, ?, CURRENT_TIMESTAMP, ?)`
  const params = [
    data.title,
    data.content,
    data.author_id,
  ];
  console.log(params)
  const [result] = await conn.execute(sql, params);
  const new_id = result.insertId;
  conn.release();
  return new_id;
}

async function get_all_blog(){
  let conn = await connPool.getConnection();
  const sql = `select * from blogs`;
  const [result] = await conn.execute(sql);
  conn.release();
  return result
}

async function get_recent_blog(){
  let conn = await connPool.getConnection();
  const sql = `select * from blogs ORDER BY blogs.created_at DESC limit 4`;
  const [result] = await conn.execute(sql);
  conn.release()
  return result
}

async function add_comment(data){
  let conn = await connPool.getConnection();
  const sql = `insert into comments (blog_id, author_id, author_name, content, created_at)
                values (?, ?, ?, ?, CURRENT_TIMESTAMP)`
  param = [
      data.blog_id,
      data.author_id,
      data.author_name,
      data.content
  ];

  const [result] = await conn.execute(sql, param);
  const new_id = result.insertId;
  conn.release();
  return new_id
}

async function get_blog_by_id(id){
  let conn = await connPool.getConnection();
  const sql = `select * from blogs where id=?`
  const [result] = await conn.execute(sql, [id]);
  conn.release();
  return result[0];
}

async function get_comments_by_blog_id(b_id) {
  let conn = await connPool.getConnection();
  const sql = `select * from comments where blog_id=?`
  const [result] = await conn.execute(sql, [b_id]);
  conn.release();
  return result;
}

async function get_blogs_page(limit, offset) {
  let conn = await connPool.getConnection();
  const sql = `SELECT blogs.*, Users.username AS author_name
                FROM blogs
                JOIN Users ON blogs.user_id = Users.id
                ORDER BY blogs.created_at DESC
                LIMIT ${offset}, ${limit}`
  const [result] = await conn.execute(sql);
  conn.release();
  return result;
}

async function get_blog_count(){
  const conn = await connPool.getConnection();
  const sql = `select count(*) as total from blogs`
  const [result] = await conn.execute(sql);
  conn.release();
  return result[0].total;
}

async function delete_comment(id){
  const conn = await connPool.getConnection();
  const sql = `delete from comments where id=?`
  const [result] = await conn.execute(sql, [id]);
  conn.release();
  return result.affectedRows;
}

module.exports = {
  add_user,
  get_user,
  add_to_blog,
  get_all_blog,
  get_recent_blog,
  get_user_by_id,
  add_comment,
  get_blog_by_id,
  get_comments_by_blog_id,
  get_blogs_page,
  get_blog_count,
  delete_comment,
};