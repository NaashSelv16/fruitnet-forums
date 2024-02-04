// Route handler for forum web app
module.exports = function(app, forumData) {
    // Handle our routes
    // Home page

    app.get('/',function(req,res){
        res.render('index.ejs', forumData)
    });
    // About page

    app.get('/about',function(req,res){
        res.render('about.ejs', forumData);
    });
    // View Posts page

    app.get('/viewposts',function(req,res){
        // Query to select all posts from the database
        let sqlquery = `SELECT  *
                        FROM     Posts 
                        JOIN     topics 
                        ON       Posts.topic_id = topics.topic_id
                        JOIN     users 
                        ON       Posts.user_id=users.user_id
                        ORDER BY post_date`;
        // Run the query
        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }
          // Pass results to the EJS page and view it
          let data = Object.assign({}, forumData, {post:result});
          console.log(data)
          res.render('viewposts.ejs', data);
        });
    });
    // List Users page
    app.get('/users',function(req,res){
        // Query to select all users
        let sqlquery = `SELECT   username, firstname, surname, country
                        FROM     users 
                        ORDER BY username`;
                 
        // Run the query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            // Pass results to the EJS page and view it
            let data = Object.assign({}, forumData, {users:result});
            console.log(data)
            // Render the users.ejs page with the list of users
            res.render('users.ejs', data);
        });                        
    });
    // List Topics page
    app.get('/topics',function(req,res){
        // Query to select all topics
        let sqlquery = `SELECT   topic_id, topic_title, topic_description
                        FROM     topics
                        ORDER BY topic_title;`;
        // Run the query       
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            // Pass results to the EJS page and view it
            let data = Object.assign({}, forumData, {topics:result});
            console.log(data)
            // Render the topics.ejs page with the list of topics
            res.render('topics.ejs', data);
        });    
    });

    // Add a New Post page
    app.get('/addpost',function(req,res){
        // Set the initial values for the form
        let initialvalues = {username: '', topic: '', title: '', content: ''}
        // Pass the data to the EJS page and view it
        return renderAddNewPost(res, initialvalues, "") 
    });
    // Helper function to add post
    function renderAddNewPost(res, initialvalues, errormessage) {
        let data = Object.assign({}, forumData, initialvalues, {errormessage:errormessage});
        console.log(data)
        res.render("addpost.ejs", data);
        return 
    }
    // Add a New Post page form handler
    app.post('/addpost', function (req,res) {
        let user_id = -1
        let topic_id = -1
        // Get the user id from the user name
        let sqlquery = `SELECT user_id FROM users WHERE username = ?;`;
        db.query(sqlquery, [req.body.username], (err, result1) => {
            if (err) {
                return console.error(err.message);
            }
            if (result1.length==0) {
                return renderAddNewPost(res, req.body, "Can't find that user")
            }
            user_id = result1[0].user_id
            console.log("user is " + user_id)
    
            // Get the topic id from the topic title
            let sqlquery = `SELECT * FROM topics WHERE topic_title = ?;`;
            db.query(sqlquery, [req.body.topic], (err, result2) => {
                if (err) {
                    return console.error(err.message);
                }
                if (result2.length==0) {
                    return renderAddNewPost(res, req.body, "Can't find that topic")
                }
                topic_id = result2[0].topic_id
                console.log("topic is " + topic_id)
                // Check the user is a member of the topic
                sqlquery = `SELECT COUNT(*) as countmembership FROM memberships WHERE user_id=? AND topic_id=?;`;
                db.query(sqlquery, [user_id, topic_id], (err, result3) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    if (result3[0].countmembership==0) {
                        return renderAddNewPost(res, req.body,  "User is not a member of that topic")
                    }
                    // Everything is in order so insert the post
                    let sqlquery = `INSERT INTO Posts (text, user_id, topic_id)
                                VALUES (now(), ?, ?, ?)`;
                    let newrecord = [req.body.title, req.body.content, user_id, topic_id];
                    db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        return console.error(err.message);
                    }
                    else
                        res.send('You post has been added to forum');
                    });    
                });                   
            });
        });
    });

    // Search for Posts page
    app.get('/search',function(req,res){
        res.render("search.ejs", forumData);
    });

    // Search for Posts form handler
    app.get('/search-result', function (req, res) {
        //searching in the database
        let term = '%' + req.query.keyword + '%'
        let sqlquery = `SELECT *
                        FROM   Posts p
                        JOIN     topics t
                        ON       t.topic_id=p.topic_id
                        JOIN     users u
                        ON       p.user_id=u.user_id
                        WHERE  post_title LIKE ? OR post_content LIKE ?
                        ORDER BY post_date`
        //console.log(sqlquery)
                        db.query(sqlquery, [term, term], (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let data = Object.assign({}, forumData, {posts:result});
            console.log(data)
            res.render('search-result.ejs', data);
        });      
    });
    app.get('/username-link-result/:user',function(req,res){
        let user = req.params.user
        // Query to select all users
        let sqlquery = `SELECT   username, firstname, surname, country, topic_title
                        FROM     users u
                        LEFT JOIN     Posts p
                        ON       p.user_id = u.user_id
                        LEFT JOIN     topics t
                        ON       p.topic_id = t.topic_id
                        WHERE username LIKE ?
                        ORDER BY username;`
                 
        // Run the query
                        db.query(sqlquery, [user], (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let data = Object.assign({}, forumData, {user:result});
            console.log(data)
            res.render('user-info.ejs', data);
        });                        
    });
    app.get('/topic-link-result/:topic',function(req,res){
        let topic = req.params.topic
        // Query to select all users
        let sqlquery = `SELECT topic_title, topic_description, username
                        FROM memberships m
                        JOIN users u
                        ON m.user_id = u.user_id
                        JOIN topics t
                        ON m.topic_id = t.topic_id
                        WHERE topic_title LIKE ?
                        ORDER BY topic_title;`
                 
        // Run the query
                        db.query(sqlquery, [topic], (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let data = Object.assign({}, forumData, {topic:result});
            console.log(data)
            res.render('topics-info.ejs', data);
        });                        
    });
}
