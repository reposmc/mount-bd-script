echo "-----------------------------------------------"
echo "-----------  POSTGRESQL RESTORE SCRIPT  ------------"
echo "-----------------------------------------------"
echo "\nScript made by Leonel López for MC"

echo "*** Dropping database"
PGPASSWORD=$3 psql -U $2 -h $1 -c "DROP DATABASE IF EXISTS $4;"
echo "*** Creating database"
echo $4
PGPASSWORD=$3 psql -U $2 -h $1 -c "CREATE DATABASE $4 ENCODING 'UTF-8';"
echo "*** Mounting database"
PGPASSWORD=$3 psql -U $2 -h $1 $4 -f "$5";
echo "*** $4 database successfully mounted"