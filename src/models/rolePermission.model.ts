import { Table, Model, Column, ForeignKey, DataType } from "sequelize-typescript"
import { Permission } from "./permissio.model";
import { Role } from "./role.model";


@Table({
    timestamps: false,
    modelName: "RolePermission",
  })
  export class RolePermission extends Model {
    @ForeignKey(() => Role)
    @Column(DataType.INTEGER) // Specify the data type as INTEGER
    roleId!: number;
  
    @ForeignKey(() => Permission)
    @Column(DataType.INTEGER) 
    permissionId!: number;
  }