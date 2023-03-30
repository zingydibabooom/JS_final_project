create schema if not exists Final_assignment;

CREATE TABLE if not exists Final_assignment.user_credential(
  user_id int NOT NULL AUTO_INCREMENT,
  user_name varchar(100),
  user_password varchar(100),
  user_email varchar(100),
  PRIMARY KEY(user_id)
);

CREATE TABLE if not exists Final_assignment.post(
  post_id int NOT NULL AUTO_INCREMENT,
  post_title varchar(50),
  post_text varchar(200),
  user_id int NOT NULL,
  post_date DATE,
  PRIMARY KEY(post_id),
  FOREIGN KEY (user_id) REFERENCES user_credential(user_id)
);

CREATE TABLE if not exists Final_assignment.image(
  image_id int NOT NULL AUTO_INCREMENT,
  image_name varchar(20),
  post_id int NOT NULL,
  PRIMARY KEY(image_id),
  FOREIGN KEY (post_id) REFERENCES post(post_id)
);

CREATE TABLE if not exists Final_assignment.user_comment(
   comment_id int NOT NULL AUTO_INCREMENT,
   comment_text varchar(100),
   reply_to_comment_id int,
   comment_date DATE,
   post_id int NOT NULL,
   PRIMARY KEY(comment_id),
   FOREIGN KEY (reply_to_comment_id) REFERENCES user_comment(comment_id),
   FOREIGN KEY (post_id) REFERENCES post(post_id)
)

