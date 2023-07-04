import { Permission } from "../../../models/permission.model";
import { Person } from "../../../models/person.model";
import { Role } from "../../../models/role.model";
import { User } from "../../../models/user.model"
import { UserNotExist } from "../users/users.error";
import { ProfileParameterNotSpecify } from "./profile.error";
/* 

 This function is used to find a user based on the provided parameters. 
 It accepts three optional parameters: id, name, and email. 
 If id is provided, it finds the user by ID. If email is provided, it finds the user by email. 
 If name is provided, it finds the user by name. 
 It returns a Promise that resolves to the found user object or null if no user is found.

*/
export const me = (id: number | null = null): Promise<User | null> => {
    if (id) return User.findOne({ include: [{ model: Person }, { model: Role, include: [Permission] }],
                                   where: { id: parseInt(id.toString()) } });
  
    throw new ProfileParameterNotSpecify(`Does not specify a parameter ID [${id}] to look up the user profile`);
};


  /*

 This function is used to edit a user's profile. 
 It updates the user's profile information in the database and returns a Promise that resolves to the updated user profile object or null if the user profile is not found.

*/

export const edit = async (id: number, body: { name: string; email: string,firstName: string,lastName: string,dateBurn: Date ,telephone:string, biography:string }): Promise<User | null> => {
  try {
    
    const existingUser = await User.findOne({ include: [{ model: Person }, { model: Role, include: [Permission] }],
                                             where: { id: parseInt(id.toString()) } });
    if (!existingUser) {
      throw new UserNotExist();
    }

    // Editar el usuario
    existingUser.name = body.name;
    existingUser.email = body.email;
    await existingUser.save();

    // Obtener y editar la persona asociada
    const person = await Person.findOne({ where: { userId: id } });
    
    if (person) {
      // Puedes editar las propiedades de persona aquí si es necesario
      person.firstName = body.firstName
      person.lastName  = body.lastName
      person.dateBurn  = body.dateBurn
      person.telephone = body.telephone
      person.biography = body.biography
      
      await person.save();
    }

    // Devolver el usuario actualizado
    return existingUser;
  } catch (error) {
    throw error;
  }
};


export const saveUrlImageProfile = async (id: number, imageUrl: string) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    user.urlImageProfile = imageUrl;
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Error saving urlImageProfile for user with id ${id}: ${error}`);
  }
};