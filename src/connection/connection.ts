import { Sequelize } from "sequelize-typescript"
import { User } from "../models/user.model"

export const connection = new Sequelize({
    dialect: "mysql",
    host: "localhost",
    username: "root",
    password: "",
    database: "clone_linktree",
    logging: false,
    models: [
        User
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