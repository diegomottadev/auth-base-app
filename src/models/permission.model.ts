import { Table, Model, Column, DataType, BeforeValidate, BelongsToMany } from "sequelize-typescript"
import { Role } from "./role.model";
import { RolePermission } from "./rolePermission.model";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "Permission",
})
export class Permission extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  // Define the many-to-many association with roles
  @BelongsToMany(() => Role, () => RolePermission)
  roles!: Role[];

  @BeforeValidate
  static async checkUniqueName(role: Permission) {
    const existingPermission = await Permission.findOne({
      where: { name: role.name },
    });

    if (existingPermission && existingPermission.id !== role.id) {
      throw new Error("Permission name must be unique");
    }
  }
}