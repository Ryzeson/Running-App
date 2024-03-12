# Project Highlights and Lessons Learned
The purpose of this document is to detail the technology, tools, languages, frameworks, concepts, skills, and any other ideas that I encountered while building this project. This document was created mostly for my sake, in order to remember, reference, and solidify all of the many things I learned throughout this process, but will also serve to highlight all the technological facets that this project touches upon.

# JavaScript
When I started this project, I made some simple JavaScript games in the past, but this introduced me to many intermediate concepts for the first time.

## Promises and Async/Await

I don't think it is an exageration to say that promises and async/await calls, along with callbacks, were some of the most challenging programming concepts I ever had to wrap my head around. I knew I had to make an effort to fully understand these, as they are central to the language, but I will admit that they broke my brain many times in the process. There is nothing even really that complex about them, but this asynchrnonous paradigm is just so unlike what I have worked with before, that it took me many tries before using them clicked for me.

Inside the folder `learning_examples` are some files that explore what Promises are, how the resolve / reject functionality works, and promises differ from async/await. I needed to create these examples to really understand for myself how these concepts work and clear up some misconceptions I had. Hoepfully these can help you too, if you are also confused like I was!

Additionally, taking methods that I wrote promises, and rewriting them using the async/await really helped with understanding the differences. By doing this, I finally understood the true power and usefulness of async/await.

# Node + Express

## Libraries

## EJS (Embedded JavaScript)
There were many times where I would want to render a page, but make some slight changes based on information in the server response. For example, I wanted to display the user's username on the main page, or display the appropriate error message to the user depending on what went wrong. To do this, I decided to use the templating language EJS. This also allowed me to adhere to DRY, as I could use EJS to include a header and footer on every page, and I would only need to update the respective header and footer files if I wanted to make any changes, instead of needing to update every file that used them. Working with this reminds me very much of PHP, as you can inject backend logic straight into an otherwise purely html page.

# AWS

## EC2

### Shell

### systemd

## Code Deploy

### `appspec.yml`

## Code Pipeline

## Parameter Store

## Security (?)

# Database

## Deciding on Postgres and supabase
I decided to use a relational database, because I don't have much experience with NoSQL databases, and I didn't anticipate anything that a NoSQL database would lend itself better to handling than a regular SQL database would. I also knew I would least need relations between users and their progress, so a SQL database made the most sense. I went with Postgres, because again this is what is the RDBMS that I was most familiar with, and I saw that it had good support with NodeJS via the `pg` library.

When first developing this application, I just set up a local Postgres database, and wrote queries / constructed tables using pgAdmin. When I decided that I wanted to host this application, I considered a few options. I already decided on using an AWS EC2 instance to host the node application, so I first explored other AWS services for hosting. AWS RDS has a Postgres option, but this costs money. It is cheap, but I wanted an option that would be entirely free so I didn't have to worry about a big bill if there was some oversight on my end. This is also the reason why I also decided against AWS Aurora, which also has a Postgres option. Another AWS option was hosting my own Postgres server on a separate EC2 instance, but again this isn't totally free, and I wanted a quicker option that I didn't need to configure and could just get up and running. 

So after some research, I decided to use Supabase, which is a free, open-source, cloud Postgres database option (backed by AWS). I am glad I chose this option, because it is very user-friendly and convenient.

## Database Structure
Below is the ERD for this application's database. It is very simple, but even this required significant thought and planning.
![alt text](../db/running_app_erd.png)

## users

## progress

## password_reset_tokens

# User management

## Session management

## Signup

## Login

## Forgot Password

# General Concepts

## .env file

## Error handling

## Ajax and Pessimistic Updating

## Separation of Server vs Client