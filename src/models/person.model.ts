import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { User } from "./user.model";

@Table({
  timestamps: true,
  paranoid: true,
  modelName: "Person",
})
export class Person extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  telephone!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  dateBurn!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  biography!: string;

  @Column(DataType.DATE)
  deletedAt?: Date;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number; // Column to store the userId

  @BelongsTo(() => User)
  user!: User; // Define the association with the User model
}
