echo "-----------------------------------------------"
echo "----------  MONGODB RESTORE SCRIPT  -----------"
echo "-----------------------------------------------"
echo "\nScript made by Leonel López for MC"

echo "*** Dropping database\n\n"
mongosh mongodb://$2:$3@$1:$6/$4?authSource=admin --eval "db.dropDatabase()" --quiet

echo "*** Creating database\n\n"
mongosh mongodb://$2:$3@$1:$6/$4?authSource=admin --eval "db.createCollection('$4')" --quiet

echo "*** Mounting database\n\n"
mongoimport --host $1 -u $2 -p $3 --port $6 --db $4 --collection $4 --jsonArray $5 --authenticationDatabase admin

echo "*** $4 database successfully mounted"