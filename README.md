# Foodie: Food Delivery Website

Foodie is a Full-stack web application built with the **MERN stack** (MongoDB, Express, React, Node.js). It allows users to browse a dynamic menu, place orders, and securely complete transactions through an integrated payment system.

## Features

- **User Authentication**: Secure login and signup using **bcryptjs** and **JWT tokens** for session management.
- **Dynamic Menu**: Fetches and displays food items from MongoDB, with a real-time search feature.
- **Checkout & Payment**: Smooth order placement and payment process via **Razorpay** integration.
- **Responsive Design**: Built with **Bootstrap** for an adaptive user interface.

## Tech Stack

- **Frontend**: React.js, Bootstrap-dark-5
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: bcryptjs, JWT
- **Payment Gateway**: Razorpay


## Please Note

Wait for few seconds if the menu items is not loaded, as the free tier services pauses after sometime and after backend, the live project will work properly.

## How to Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Sanskar1204/Foodie.git

   ```

2. Install dependencies

   ```bash
   npm install

   ```

3. Start the Backend server:

   ```bash
   cd backend
   nodemon index.js

   ```

4. Start the FrontEnd server:

   ```bash
   npm start

   ```

## Contribution

**Contributions are welcome! If you have suggestions or find bugs, feel free to open an issue or submit a pull request.**  
Make sure to follow the contributing guidelines before submitting changes.
