import {
  Table,
  Model,
  Column,
  DataType,
  // Unique,
  ForeignKey,
  BelongsTo,
  HasOne,
} from "sequelize-typescript";
import { Role } from "./role.model";
import { Person } from "./person.model";


@Table({
  timestamps: true,
  paranoid: true,
  modelName: "User",
})
export class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  // @Unique({ name: 'uniqueEmail', msg: "Email already exists" })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Email is required",
      },
      isEmail: {
        args: true,
        msg: "Valid email is required",
      },
      // isUnique: async (value: string): Promise<void> => {
      //   const user = await User.findOne({ where: { email: value }, attributes: ['id'] });
      //   if (user) {
      //     throw new Error("Email already exists");
      //   }
      // },
    },
  } as any)
  email!: string;
  

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        args: true,
        msg: "Password is required",
      },
    },
  } as any)
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  urlImageProfile?: string; // Add the urlImageProfile field
  
  @Column(DataType.DATE)
  confirmedAt?: Date;

  @Column(DataType.BOOLEAN)
  active?: boolean;

  @Column(DataType.DATE)
  deletedAt?: Date;

  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  roleId!: number; // Column to store the roleId

  @BelongsTo(() => Role)
  role!: Role; // Define the association with the Role model

  @HasOne(() => Person)
  person!: Person; // Define the association with the Person model
}
