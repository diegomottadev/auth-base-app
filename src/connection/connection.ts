import { Sequelize } from "sequelize-typescript"
import { User } from "../models/user.model"
import dotenv from 'dotenv';
import { Role } from "../models/role.model";
import { Permission } from "../models/permissio.model";
import { RolePermission } from "../models/rolePermission.model";

dotenv.config();
export const connection = new Sequelize({
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
        RolePermission
    ]
})

async function connectionDB() {
    try {
        await connection.sync()
    } catch (error) {
        console.log(error)
    }
}

export default connectionDB