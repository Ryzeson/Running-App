# Kale's Kilometers, a Couch-to-5k Web App
This is a web application that keeps track of your progress as you train for different races. You can switch between different programs such as a 5k and 10k training schedule, and can check off each workout as you complete it. There is also a built in timer that you can use for all timed walk/run cycles.

## Technology
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Bootstrap](https://img.shields.io/badge/bootstrap-%238511FA.svg?style=for-the-badge&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![jQuery](https://img.shields.io/badge/jquery-%230769AD.svg?style=for-the-badge&logo=jquery&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

## Motivation
My friend wanted to get into running and decided to train for their first 5k. All they wanted was a simple application that could keep track of their workout progess and time them during timed runs. They were unable to find any applications that had this functionality but weren't also very expensive, so I decided to make one! It sounded like something that I could feasibly complete, but also teach me a lot as a sufficiently challenging first Node.js project.

## Setup Instructions
To run this project locally, follow the below instructions.
1. Make sure [Node.js](#https://nodejs.org/en/download) and [PostgreSQL](#https://www.postgresql.org/download/) are installed on your machine
2. Clone this repository
    ```
    git clone https://github.com/Ryzeson/Running-App.git
    ```
3. Set up the database and configure connection information
    * Create a new database
    * Run `db_setup.sql` to create the necessary tables
    * Create a new file called `.env` in your main `Running-App` directory, and paste in the text from `sample.env` making sure to **use your own database connection information** instead:
4. Navigate to the `Running-App` directory, and isntall the necessary dependencies
    ```
    npm install
    ```
5. Start the server
    ```
    node server.js
    ```
    Navigate to `http://localhost:3000` in your web browser, where you should see the application running


Note: This project is not currently publically hosted, as it costs too much money for me to maintain :). If you have any trouble setting this project up or would like to see a publically hosted version, please feel free to message me.


## What I learned
At every step of this project, I felt like I was learning something new. This was my first full-scale Node.js application that I built, and my first time setting up a devops pipeline from scratch, so both of these were full of great learning experiences. To keep track of everything that I leanred, I created `project_summary.md`, a detailed list of project highlights, how they work, and what I learned from them, and acknowledgements.

## How to use this project
Please feel free to reference, use, and/or adapt any or all parts of this repository in any way you wish. You can also reach out to me for any questions, comments, or feedback!

<!-- ## File Structure -->
