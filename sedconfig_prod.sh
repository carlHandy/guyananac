#!/bin/bash
PROJECTID=803904687416
PROJECTNAME=maxsold-seller-portal

STORAGE_BUCKET_NAME=maxsold-seller-portal.appspot.com
MASK_DATA=False


CLIENT_HOSTING=seller-portal-client-prod
CLIENT_APIKEY=AIzaSyAwWEWCBqBWNvy796Za9VUIsJfrGRYOAAo
CLIENT_DOMAIN=sellerportal.maxsold.com
CLIENT_APPID=4b20cd48b9897289a045cd
CLIENT_AUTHDOMAIN=maxsold-seller-portal.firebaseapp.com

FUNCTIONS_BASEURL=us-central1-maxsold-seller-portal

GOOGLE_PLACESKEY=AIzaSyArYd7gq2-GSHENb--0nTcZN4yl_1kjYKI


# Angular Client - Hosting
sed -i "s/\"mx-seller-portal\": \[/\"$CLIENT_HOSTING\": \[/g" .firebaserc
sed -i "s/mx-seller-portal/$PROJECTNAME/g" .firebaserc
sed -i "s/mx-seller-portal/$CLIENT_HOSTING/g" firebase.json

# Angular Client - Environment
sed -i "s/authDomain: \'seller.maxsold.dev\'/authDomain: \'$CLIENT_AUTHDOMAIN\'/g" src/environments/environment.ts
sed -i "s/authDomain: \'seller.maxsold.dev\'/authDomain: \'$CLIENT_AUTHDOMAIN\'/g" src/environments/environment.prod.ts
sed -i "s/us-central1-mx-seller-portal/$FUNCTIONS_BASEURL/g" src/environments/environment.ts
sed -i "s/us-central1-mx-seller-portal/$FUNCTIONS_BASEURL/g" src/environments/environment.prod.ts
sed -i "s/969854014217/$PROJECTID/g" src/environments/environment.ts
sed -i "s/969854014217/$PROJECTID/g" src/environments/environment.prod.ts
sed -i "s/AIzaSyD_hfDc7NWCsTWBkhtQk4jkDc9ch2BNYKU/$CLIENT_APIKEY/g" src/environments/environment.ts
sed -i "s/AIzaSyD_hfDc7NWCsTWBkhtQk4jkDc9ch2BNYKU/$CLIENT_APIKEY/g" src/environments/environment.prod.ts
sed -i "s/seller.maxsold.dev/$CLIENT_DOMAIN/g" src/environments/environment.ts
sed -i "s/seller.maxsold.dev/$CLIENT_DOMAIN/g" src/environments/environment.prod.ts
sed -i "s/mx-seller-portal/$PROJECTNAME/g" src/environments/environment.ts
sed -i "s/mx-seller-portal/$PROJECTNAME/g" src/environments/environment.prod.ts
sed -i "s/eda1a2f77affed9cbf79d8/$CLIENT_APPID/g" src/environments/environment.ts
sed -i "s/eda1a2f77affed9cbf79d8/$CLIENT_APPID/g" src/environments/environment.prod.ts

# Angular Client - Places
sed -i "s/AIzaSyD3AMgTVIpOi-OeB8xD-kwsOXneTjy08Xw/$GOOGLE_PLACESKEY/g" src/index.html

# Angular Admin - Environment
sed -i "s/us-central1-mx-seller-portal/$FUNCTIONS_BASEURL/g" src/environments/environment.ts
sed -i "s/us-central1-mx-seller-portal/$FUNCTIONS_BASEURL/g" src/environments/environment.prod.ts

