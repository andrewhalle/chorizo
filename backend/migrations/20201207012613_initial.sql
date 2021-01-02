-- Add migration script here
create table user (
  id       INTEGER PRIMARY KEY ASC NOT NULL,
  username TEXT NOT NULL,
  password_hash BLOB NOT NULL,
  password_salt BLOB NOT NULL
);

create table recurring_chore (
  id    INTEGER PRIMARY KEY ASC NOT NULL,
  title TEXT NOT NULL,
  repeat_every_days INTEGER NOT NULL,
  next_instance_date TEXT NOT NULL
);

create table chore (
  id INTEGER PRIMARY KEY ASC NOT NULL,
  title TEXT NOT NULL,
  assignee INTEGER,
  instance_of INTEGER,
  date TEXT NOT NULL,
  complete BOOLEAN NOT NULL DEFAULT false,
  FOREIGN KEY(assignee) REFERENCES user(id)
  FOREIGN KEY(instance_of) REFERENCES recurring_chore(id)
);
