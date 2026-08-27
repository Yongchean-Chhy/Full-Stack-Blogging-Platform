CREATE TABLE Users (
    id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
ALTER TABLE Users DROP PRIMARY KEY;
ALTER TABLE Users MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY;

ALTER TABLE Users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

INSERT INTO Users (id, username, email, password_hash, created_at, updated_at, last_login, is_active) VALUES
(1, 'admin', 'ABC@bobo,.com', 'hashed_password_1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, TRUE);
INSERT INTO Users (username, email, password_hash, created_at, updated_at, last_login, is_active) VALUES
('admin2', 'ABC2@bobo,.com', 'hashed_password_2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, TRUE);

CREATE TABLE blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO blogs (title, content, image_url, created_at) VALUES
('Testing', 'Hello', 'Cat', CURRENT_TIMESTAMP);

ALTER TABLE blogs
ADD COLUMN user_id INT;

ALTER TABLE blogs
ADD CONSTRAINT fk_blogs_user
FOREIGN KEY (user_id)
REFERENCES Users(id);

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  author_id INT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blog_id) REFERENCES blogs(id),
  FOREIGN KEY (author_id) REFERENCES Users(id)
);