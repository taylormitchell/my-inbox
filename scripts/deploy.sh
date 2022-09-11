git push origin main
ssh $DROPLET_USER@$DROPLET_IP \
    "cd /home/$DROPLET_USER/code/my-inbox/src && "\
    "git pull origin main && "\
    "PATH=/home/$DROPLET_USER/.nvm/versions/node/v17.7.1/bin:$PATH && "\
    "npm run build"