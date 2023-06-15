import {
  Table,
  Model,
  Column,
  DataType,
  Unique
} from "sequelize-typescript";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "User",
})
// @DefaultScope(() => ({
//   attributes: { exclude: ["password"] },
// }))
export class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Unique({ name: 'uniqueEmail', msg: "Email already exists" })
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
      isUnique: async (value: string): Promise<void> => {
        const user = await User.findOne({ where: { email: value }, attributes: ['id'] });
        if (user) {
          throw new Error("Email already exists");
        }
      },
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

  @Column(DataType.DATE)
  confirmedAt?: Date;

  @Column(DataType.BOOLEAN)
  active?: boolean;

  @Column(DataType.DATE)
  deletedAt?: Date;

//   static associate(models: any) {
//     // Define associations here
//   }
}
