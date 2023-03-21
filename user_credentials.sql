create schema Final_assignment;

CREATE TABLE Final_assignment.user_credential(
  user_id int NOT NULL AUTO_INCREMENT,
  user_name varchar(100),
  user_password int,
  user_email varchar(100),
  PRIMARY KEY(user_id)
);
