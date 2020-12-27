-- Add migration script here
create table user (
  id       INTEGER PRIMARY KEY ASC,
  username TEXT,
  password_hash BLOB,
  password_salt BLOB
);

create table recurring_chore (
  id    INTEGER PRIMARY KEY ASC,
  title TEXT,
  repeat_every_days INTEGER,
  next_instance_date TEXT
);

create table chore (
  id INTEGER PRIMARY KEY ASC,
  title TEXT,
  assignee INTEGER,
  instance_of INTEGER,
  date TEXT,
  complete BOOLEAN,
  FOREIGN KEY(assignee) REFERENCES user(id)
  FOREIGN KEY(instance_of) REFERENCES recurring_chore(id)
);
