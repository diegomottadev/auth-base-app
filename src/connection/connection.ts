import { Sequelize } from "sequelize-typescript"
import { User } from "../models/user.model"
import dotenv from 'dotenv';
import { Role } from "../models/role.model";
import { Permission } from "../models/permission.model";
import { RolePermission } from "../models/rolePermission.model";
import log from '../../src/api/resources/utils/logger';
import { Person } from "../models/person.model";

dotenv.config();

/*

 - connection it creates a Sequelize instance for connecting to a MySQL database. 
 - It configures the dialect as "mysql" and sets the host, username, password, and database name based on environment variables.
 - The logging option is set to false to disable logging of database queries. 
 - It also specifies the models that will be used by Sequelize for database operations.

*/

 const connection = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST,
    username:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    logging: false,
    models: [
        User,
        Role,
        Permission,
        RolePermission,
        Person
    ]
})

/*

-connectionDB it is an asynchronous function that establishes a connection to the database by synchronizing
 the models with the database schema. 
-It uses the sync method provided by the Sequelize instance. If an error occurs during the synchronization process, 
 it is logged to the console.

*/

export const connectionDB = async (): Promise<boolean> => {
    try {
      await connection.sync();
      return true;
    } catch (error) {
      log.error(`Error connecting to the database: ${error}`);
      console.log(error);
      return false;
    }
  };
export const disconnectDB = async (): Promise<boolean> => {
  try {
    await connection.close();
    return true;
  } catch (error) {
    log.error(`Error disconnecting from the database: ${error}`);
    console.log(error);
    return false;
  }
};