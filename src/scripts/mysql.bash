echo "-----------------------------------------------"
echo "-----------  MYSQL RESTORE SCRIPT  ------------"
echo "-----------------------------------------------"
echo "\nScript made by Leonel López for MC"

echo "*** Dropping database"
mysql --host=$1 --user=$2 --password=$3 --execute="DROP DATABASE IF EXISTS ${4};";
echo "*** Creating database"
mysql --host=$1 --user=$2 --password=$3 --execute="CREATE DATABASE ${4};";
echo "*** Mounting database"
mysql --host=$1 --user=$2 --password=$3 $4 < $5;
echo "*** $4 database successfully mounted"