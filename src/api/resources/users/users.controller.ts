import { User } from "../../../models/user.model"
import { Op } from 'sequelize';

export const create = async (user: { name: string; email: string }, password: string): Promise<User> => {
  const userCreated = await User.create({
    name: user.name,
    email: user.email,
    password: password,
    active: true,
  });

  return userCreated;
};

export const all = (): Promise<User[]> => {
  return User.findAll({
    where: {
      id: { [Op.not]: null },
    },
  });
};

export const find = (id: number | null = null, name: string | null = null, email: string | null = null): Promise<User | null> => {
  if (id) return User.findOne({ where: { id: parseInt(id.toString()) } });
  if (email) return User.findOne({ where: { email: email } });
  if (name) return User.findOne({ where: { name: name } });

  throw new Error('No especifico un parametro para buscar el usuario');
};

export const findByEmail = (email: string): Promise<User | null> => {
  if (email) return User.findOne({ where: {
    [Op.or]: [
      { email: email },
      { name: email }
    ]
  }}
);

  throw new Error('No especifico un email para buscar el usuario');
};

export const userExist = ({ email }: { email: string }): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    User.findAll({
      where: { email: email },
    })
      .then((users) => {
        resolve(users.length > 0);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const edit = (id: number, user: { name: string; email: string }): Promise<User | null> => {
  return new Promise<User | null>((resolve, reject) => {
    User.update(
      {
        name: user.name,
        email: user.email,
      },
      {
        where: {
          id: id,
        },
      }
    )
      .then(() => {
        let response = find(id);
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const destroy = (id: number, userToDelete: User): Promise<User> => {
  return new Promise<User>((resolve, reject) => {
    User.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve(userToDelete);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
