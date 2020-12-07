-- Add migration script here
create table user (
  id       INTEGER PRIMARY KEY ASC,
  username TEXT
);

create table recurring_chore (
  id    INTEGER PRIMARY KEY ASC,
  title TEXT
);

create table chore (
  id INTEGER PRIMARY KEY ASC,
  title TEXT,
  assignee INTEGER,
  FOREIGN KEY(assignee) REFERENCES user(id)
);
