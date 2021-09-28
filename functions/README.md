# Firebase project init

First you need to have an active project on your computer start it with

	firebase init functions

Then remove everything from the folder "functions" created by the firebase plugin, when it asks to install npm dependencies use "n" for No, you would do it with the entire repository. For everything else is it up to you.

# Git clone

Now, you can clone the repo on the folder /functions NOT the project base, the folder functions.

For example if you run "firebase init functions" on the folder C:/app, you must git clone on "C:/app/functions"

Now, inside "/functions", run

	npm install

To install node dependencies.


# Firebase Authentication

 1. Go to [Firebase Console](https://console.firebase.google.com/)
 2. Select the project
 3. Go to settings > Users and Permissions
 4. Select "Service Accounts" tab
 5. Click on "Generate new private key"
 6. Download file and save it as "acc.json" on directory /functions/credentials/acc.json

# Default values configuration

file: /functions/index.js

    const defaultCollection = 'documents';
    // This refer to the default collection where documents are stored
    // if none is sent to the request endpoint on google function.
    
    const defaultSortKey = 'invoiceId';
    // This refer to the default key from each invoice to sort

    const timeZone = 'America/Toronto';
    // This refer to the timezone used to calculate hours

# Deployment to google functions

### You need to be inside the "functions" directory!
Executing

    firebase deploy

Will deploy the function


# Permissions

You may receive a "403: Unauthorized" error on your browser once deployed, you can refer to this [Stack Overflow Answer](https://stackoverflow.com/questions/52539441/403-response-from-google-cloud-functions) with solving instructions

# Testing

You can run

	firebase emulators:start

To start the emulator and test your function locally (But it may behave differently that google cloud)