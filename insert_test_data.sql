# Insert data into the tables

SELECT * FROM myforum.memberships;

USE myforum;

INSERT INTO myforum.memberships(user_id,topic_id)
VALUES(1,1),(1,2);

INSERT INTO myforum.memberships(user_id,topic_id)
VALUES(2,1);

SELECT username,topics.name
FROM users
JOIN memberships
ON memberships.user_id=users.user_id
JOIN topics
ON memberships.topic_id=topics.topic_id