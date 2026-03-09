# MongoDB Setup Guide for Fuel Buddy

This guide will help you set up MongoDB for the Fuel Buddy application.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Community Server or MongoDB Atlas (cloud)

## Option 1: Local MongoDB Installation

### Windows Installation

1. Download MongoDB Community Server from [MongoDB's official website](https://www.mongodb.com/try/download/community)
2. Follow the installation wizard
3. During installation, make sure to install MongoDB as a service
4. The installer will also install MongoDB Compass (GUI tool) if desired

### macOS Installation

Using Homebrew:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

Start MongoDB:
```bash
brew services start mongodb/brew/mongodb-community
```

### Linux Installation

Follow the instructions for your specific distribution on the [MongoDB installation center](https://docs.mongodb.com/manual/administration/install-on-linux/).

## Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free account
3. Create a new cluster
4. Create a database user and set a password
5. Set up IP access list (add 0.0.0.0/0 for development)
6. Copy the connection string and update your `.env` file

## Environment Configuration

Update your `.env` file in the root directory with the appropriate MongoDB URI:

### For Local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/fuel-buddy
```

### For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/fuel-buddy?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, and `<cluster-url>` with your actual credentials.

## Starting the Application

1. Make sure MongoDB is running:
   - For local: Ensure the MongoDB service is started
   - For Atlas: Ensure you have internet connectivity

2. Install dependencies:
```bash
cd backend
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The application should connect to MongoDB and show a success message in the console.

## Troubleshooting

### Connection Issues
- Verify MongoDB is running
- Check that the MONGODB_URI in your `.env` file is correct
- Ensure firewall settings allow connections on MongoDB's port (usually 27017)

### Common Error Messages
- `ECONNREFUSED`: MongoDB is not running or the connection string is incorrect
- `Authentication failed`: Username/password in the connection string is incorrect
- `Server selection timed out`: Network connectivity issue or incorrect cluster URL

## Sample Connection Test

You can test the connection by starting the server and looking for this message:
```
MongoDB Connected: localhost
```

If you see this message, your MongoDB setup is successful!