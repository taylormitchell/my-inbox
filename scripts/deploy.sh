# create dist.zip
zip -r dist.zip dist
scp dist.zip $DROPLET_USER@$DROPLET_IP:~/dist.zip
rm dist.zip
ssh $DROPLET_USER@$DROPLET_IP \
    "unzip dist.zip && "\
    "rm dist.zip && "\
    "rm -rf code/my-inbox && "\
    "mv dist code/my-inbox && "\
    "cd code/my-inbox && "\
    "PATH=/home/$DROPLET_USER/.nvm/versions/node/v17.7.1/bin:$PATH && "\
    "npm install --omit=dev && "\
    "pm2 restart my-inbox"