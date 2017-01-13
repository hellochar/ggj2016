# to make a dev build:
# emit webpack output in a production environment
NODE_ENV=production npm run build
cp index_dev_build.html build/index.html
cp -r font-awesome-4.5.0 build/