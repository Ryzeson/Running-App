# Project Summary
The purpose of this document is to detail the technology, tools, languages, frameworks, concepts, skills, and any other ideas that I encountered while building this project. This document was created mostly for my sake, in order to remember, reference, and solidify all of the many things I learned throughout this process, but will also serve to highlight all the technological facets that this project touches upon.

# JavaScript
When I started this project, I made some simple JavaScript games in the past, but this introduced me to more intermediate concepts for the first time.

## Promises and Async/Await

I don't think it is an exageration to say that promises and async/await calls, along with callbacks, were some of the most challenging programming concepts I ever had to wrap my head around. I knew I had to make an effort to fully understand these, as they are central to the language, but I will admit that they broke my brain many times in the process. There is nothing even really that complex about them, but this asynchrnonous paradigm is just so unlike what I have worked with before, that it took me many tries before using them clicked for me.

Inside the folder `learning_examples` are some files that explore what Promises are, how the resolve / reject functionality works, and promises differ from async/await. I needed to create these examples to really understand for myself how these concepts work and clear up some misconceptions I had. Hoepfully these can help you too, if you are also confused like I was!

Additionally, taking methods that I wrote promises, and rewriting them using the async/await really helped with understanding the differences. By doing this, I finally understood the true power and usefulness of async/await.

# Node + Express
Express makes it very easy to setup the various routes needed for the node server. The biggest initial challenges working with node and express were understanding what data is actually being sent in the request and response variables, why this is a callback, and middleware.  

## EJS (Embedded JavaScript)
There were many times where I would want to render a page, but make some slight changes based on information in the server response. For example, I wanted to display the user's username on the main page, or display the appropriate error message to the user depending on what went wrong. To do this, I decided to use the templating language EJS. This also allowed me to adhere to DRY, as I could use EJS to include a header and footer on every page, and I would only need to update the respective header and footer files if I wanted to make any changes, instead of needing to update every file that used them. Working with this reminds me very much of PHP, as you can inject backend logic straight into an otherwise purely html page.

# AWS

## EC2
I wanted to host my application using the AWS EC2 service because this is a fundamental service that I had never used before. I deployed previous projects using AWS Elastic Beanstalk, which is a lot more streamlined experience, but does a lot of the configuration work behind the scenes, so I thought it would be a good experience to work with an EC2 instance directly.

I decided on an t2.micro instance, because this is the cheapest option, and my application is really small so there were no real processing or memory concerns. Copying the code to the instance by cloning my GitHub repository, starting the server and seeing the application running in a browser was mostly straightforward. The most difficult part was configuring the correct security rules, making sure the correct ports were accessible.

### systemd
I could start the node server while connected to the EC2 instance, but the application would stop as soon as I disconnected from the instance. To keep the application running even while I was not actively connected, I learned I had to use a tool like systemd.

The two important files for this to work properly are the following, located at `etc/systemd/system` in my EC2 instance:

`running-app.service`: this defines the actual service, with the necessary scripts to run, environemt variables, and other configuration information

`/running-app.service.d/environment.config`: this contains a list of environment variables used by the service file. It is identical in function and purpose to the `.env` file that I use locally; it is just that systemd uses its own set environment variables.

Because the name of my service is `running-app.service`, the following commands are used to interact with it:

To start the service: `sudo systemctl start running-app`

To check the status: `sudo systemctl status running-app`

To stop the service: `sudo systemctl stop running-app`

To reload the daemon after updating the service file: `sudo systemctl daemon-reload`

## Code Pipeline and Code Deploy
I also wanted to implement some form of continuous integration, so that when I made a change to the application, this would be displayed immediately, without the need to recopy the latest code and start the application again. For this I used Code Pipeline. The general deployment workflow is as follows:

1. I make a code change to the application, and push that change to GitHub
2. CodePipeline sees this new code was pushed, and triggers CodeDeploy to make a deployment on my EC2 instance
3. CodeDeploy deploys the application by following the instructions outlined in the `appspec.yml`file located at the root of the application
4. The updated application can be seen in the browser

### `appspec.yml`
This file instructs CodeDeploy on how and where to deploy the application. Included in this file are custom shell scripts that are run at various points (i.e., "hooks") in the deployment process, that are needed to carry out additional functionality. In my application these are:

`stop_service.sh`
* This stops the application if it is currently running via systemd

`npm_install.sh`
* This installs the necessary application dependencies via npm

`setup_systemd_env.sh`
* This dynamically creates the `environment.config` used by systemd. It retrieves and parses all environment variables from AWS Parameter store, as well as the instance's IPV4 address from its instance metadata. The IPV4 address changes every time the instance is stopped and started, so instead of having to manually update this every time, this script does it automatically.

`start_service.sh`
* Actually starts the application via systemd

[Full list of AppSpec hooks](#https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#appspec-hooks-server)

## Parameter Store
I chose to store the values required in the application's `.env` file in the AWS Parameter Store. I remember learning about both the Parameter Store and the Secrets Manager while studying for my AWS Associate Developer exam. I chose to use AWS Parameter Store over Secrets Manager because this seems to be the recommended solution for EC2 instances, has built-in encryption options, and Parameter Store is free. This turned out to be a very convenient and easy to use service.

# Database

## Deciding on Postgres and supabase
I decided to use a relational database, because I don't have much experience with NoSQL databases, and I didn't anticipate anything that a NoSQL database would lend itself better to handling than a regular SQL database would. I also knew I would least need relations between users and their progress, so a SQL database made the most sense. I went with Postgres, because again this is what is the RDBMS that I was most familiar with, and I saw that it had good support with NodeJS via the `pg` library.

When first developing this application, I just set up a local Postgres database, and wrote queries / constructed tables using pgAdmin. When I decided that I wanted to host this application, I considered a few options. I already decided on using an AWS EC2 instance to host the node application, so I first explored other AWS services for hosting. AWS RDS has a Postgres option, but this costs money. It is cheap, but I wanted an option that would be entirely free so I didn't have to worry about a big bill if there was some oversight on my end. This is also the reason why I also decided against AWS Aurora, which also has a Postgres option. Another AWS option was hosting my own Postgres server on a separate EC2 instance, but again this isn't totally free, and I wanted a quicker option that I didn't need to configure and could just get up and running. 

So after some research, I decided to use Supabase, which is a free, open-source, cloud Postgres database option (backed by AWS). I am glad I chose this option, because it is very user-friendly and convenient.

## Database Structure
Below is the ERD for this application's database. It is very simple, but even this required significant thought and planning.
![alt text](../db/running_app_erd.png)

## users
The user table has an auto-generated integer id, that is used as the primary key to uniquely identify each user in the system. They also have a unique username. The username must be unique because that is what they use to login. I did not make the username the primary key for this table, because I thought about potential functionality of letting the user change their username, which is a common use case in many other applications. In the case that the username was the primary key, you would also need to update this in all other tables where it was being used as a foreign key. Additionally, it is much easier to use a short arbitrary id when joining to other tables and store in the user session, than it is to use a username, in my opinion.

This table also contains the user's hashed password, a unique email, and 'verified' flag. The email must be unique because this is what is used to reset their password. If multiple users shared the same email, the application would not know which user's password to reset. The 'verified' flag determines if the user has clicked the link in the email verificaiton link. If this step is not done, the user is not allowed to login.

## progress
The progress table has a unique id that is the foreign key of the users table's id attribute. When a user signs up, a record in this progress table is created at the same time as the record in the users table is created. Every other column in this table corresponds to the user's progress for a specific program (e.g., column _5k stores their 5k program progress). Each of thse is represented as a string of bits of 0's and 1's, representing which days are in progress or completed.

## password_reset_tokens
This table has a composite key consisting of a user_id, a foreign key of the users table's id attribute, and a (hashed) password reset token. This table's key is more than just user_id, because a user can request a password reset link multiple times, which would create multiple records in the database. Each of these will have a unique reset token that is contained in the password reset link, though. This table also has a timestamp that is 15 minutes after the token was generated. The application will check to see if this token is not exipred before allowing the user to reset their password. This is added as a security measure, because while the tokens are made sufficiently long and entropic, we wouldn't want a potential hacker to have unlimited time to try and brute force the code contained in a password reset link.

# User management

## Session management

## Forgot Password

### bcrypt
This library helps to hash passwords. You can even specify the number of "salt" rounds you want applied, depending on the complexity needed. I need to do more research about how different hashing methods, and how this works under the hood.

# General Concepts

## Error Handling
This was another area that should have been relatively straightforward, but I found to be tricky coming from a Java background. Java lets you handle different types of exceptions with the use of multiple catch blocks. You are only allowed one catch block for each try block in JavaScript, so if you need more control handling specific errors, you must do so using if/else within the catch block. Also, it is wise to either make your custom errors either extend the Error class, or throw actual Error objects with unique names, instead of just throwing strings/other objects like was doing for most of this project.

## Ajax
This was actually my first time using and learning about ajax. In this project, an ajax call allowed me to update the progress table dynamically, without the need to refresh the page or send back an entirely new page upon recieving a response from the server. I was going to just use the 204 response code (no content) which would have served the same purpose, but the 'Completed' checkbox did not have a submit button on its form, so I couldn't trigger a post route.

## Pessimistic Updating
One issue that I ran into was the following: The user would check the 'Completed' box, and the UI would update immediately (i.e., the box becomes checked and the table cell would become grayed out). Although this happens almost instantly when this ajax request is succesful, if there was an error updating the database, the user would still see that the box become grayed out. That is, they would see a signal that their action was successful, without any indication that their action failed. If they were to refresh the page or log back in at a later time, they would see that their progress was not actually saved when they thought it was, which is a bad user experience. To solve this, I actually disable all further interactive user actions, and change the cursor to a loading icon until the ajax response reports back that the update has been completed successfully. It is a change that is barely noticeable when things are working as expected, but becomes very important if unexpected issues were to arise.

## Separation of Server vs Client
I already knew the separation of concerns between the sever and client, and which should do what, but it was still tricky at times to makes sure each has only the necessary and sufficient information to do its job properly. For example, after deciding to use session ids to keep track of logged in users, I had to think about what was necessary to pass between requests, and what I could leave out but retrieve when necessary, to ensure there was no security concern. To do this, I just passed around the user's arbitrary user id. Another salient moment was when I realized that I should actually have the code to generate the main workout progress tables located server-side, instead of as a client-side script like I had when this project was still just a static application.

## Security
Although not a large appilication, it still contains sensitive data, such as server configuration information (e.g., EC2 instance information, email server credentials, database credentials) and private user information (e.g., email and password), so I made sure to take the following necessary steps to protect this information.
* The EC2 instance is configured with the correct inbound and outbound security roles, so that only the correct ports are exposed, limiting unwanted access.
* Within AWS, the EC2 instance is configured with only the correct IAM roles, following the [principle of least privilege](#https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html#grant-least-privilege) so that it can only access and be accessed by the services required. Dealing with AIM roles and policies issues was a bit difficult to debug in my experience, especially when trying to give the correct access to get CodeDeploy to work, but this experience definitely helped me to understand these and internalize how they work.
* All passwords and password reset tokens are also hashed, so that even if the data in the database was compromised, no personal user information would be at risk.
* All configuration details are kept within an a separate configuration file that is excluded from git, so that none of my personal application details are ever publically visible. This seems obvious, but is something that can be easily forgotten or overlooked, so I made a conscious effort to prevent this mistake.

# Acknowledgements
I used countless resources during the making of this project, but I will highlight some of the best and most important ones below:

* [Angela Yu's Web Development Udemy Course](#https://www.udemy.com/course/the-complete-web-development-bootcamp/?utm_source=adwords&utm_medium=udemyads&utm_campaign=LongTail_la.EN_cc.US&utm_content=deal4584&utm_term=_._ag_81829991707_._ad_532193842022_._kw__._de_c_._dm__._pl__._ti_dsa-1007766171312_._li_9006788_._pd__._&matchtype=&gad_source=1&gclid=Cj0KCQjw-r-vBhC-ARIsAGgUO2AtKNpkbEsFWsSRePRq3KJYs3dDAQbd4d2M2Pmxzne2nr-rdBU4s0oaArdcEALw_wcB&couponCode=2021PM20)
* Understanding the order of execution between synchronous, asynchronous, and promises: This [post](#https://stackoverflow.com/questions/63257952/understanding-async-js-with-promises-task-and-job-queue) and [video](#https://www.youtube.com/watch?v=28AXSTCpsyU)
* [Deploying a node application to EC2](#https://www.youtube.com/watch?v=oHAQ3TzUTro)
* [Implementing a 'Forgot Password' workflow](#https://supertokens.com/blog/implementing-a-forgot-password-flow#)

For a full list of all resources and notes, see `daily_log.txt`.