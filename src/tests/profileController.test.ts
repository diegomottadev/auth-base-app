import { Permission } from '../models/permission.model';
import { Person } from '../models/person.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { edit , me} from '../api/resources/profile/profile.controller'; // Ajusta la ruta al archivo donde se encuentra la función edit
import { ProfileParameterNotSpecify } from '../api/resources/profile/profile.error';
import { UserNotExist } from '../api/resources/users/users.error';

    // Mockear los modelos y las funciones necesarias
    jest.mock('./../models/user.model.ts', () => ({
    User: {
        findOne: jest.fn(),
    },
    }));

    jest.mock('./../models/person.model.ts', () => ({
    Person: {
        findOne: jest.fn(),
    },
    }));


    describe('me', () => {
      it('should return the user profile when ID is specified', async () => {
        const userId = 1;
        const userMock = {
          id: userId,
          // ... define other properties of User model as needed
        } as User;
    
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(userMock);
    
        const result = await me(userId);
    
        expect(result).toEqual(userMock);
        expect(User.findOne).toHaveBeenCalledWith({
          include: [{ model: Person }, { model: Role, include: [Permission] }],
          where: { id: userId },
        });
      });
    
      it('should throw an error when ID is not specified', async () => {
        try {
          await me(); // Llamada a la función sin especificar el ID
          // Si no se lanza la excepción, falla la prueba
          fail('Expected ProfileParameterNotSpecify error to be thrown');
        } catch (error: any) {
          // Verificar que la excepción arrojada sea la esperada
          expect(error).toBeInstanceOf(ProfileParameterNotSpecify);
          expect(error.message).toBe('Does not specify a parameter ID [null] to look up the user profile');
        }
        });
      });


  
  describe('edit', () => {
    beforeEach(() => {
      // Limpiar los mocks antes de cada prueba
      jest.clearAllMocks();
    });
  
    it('debería editar el usuario y la persona asociada correctamente', async () => {
        // Mockear los datos necesarios para la prueba
        const userId = 1;
        const userData = {
          name: 'John Doe',
          email: 'johndoe@example.com',
        };
        const personData = {
          firstName: 'John',
          lastName: 'Doe',
          dateBurn: new Date(),
          telephone: '123456789',
          biography: 'Lorem ipsum',
        };
    
        // Mockear la función findOne de User para devolver un usuario existente
        const userMock = {
            id: userId,
            name: 'Old Name',
            email: 'oldemail@example.com',
            save: jest.fn().mockResolvedValue(true),
          } as unknown as jest.Mocked<User>;
          
          jest.spyOn(User, 'findOne').mockResolvedValueOnce(userMock);
          
  
      // Mockear la función findOne de Person para devolver una persona existente
      const personMock = {
        id: 1,
        firstName: 'Old First Name',
        lastName: 'Old Last Name',
        dateBurn: new Date(),
        telephone: '987654321',
        biography: 'Old Biography',
        save: jest.fn().mockResolvedValue(true),
      }  as unknown as jest.Mocked<Person>;;
      jest.spyOn(Person, 'findOne').mockResolvedValueOnce(personMock);
  
      // Ejecutar la función edit
      const updatedUser = await edit(userId, {
        ...userData,
        ...personData,
      });
  
      // Verificar que User.findOne haya sido llamado con los parámetros correctos
      expect(User.findOne).toHaveBeenCalledWith({
        include: [{ model: Person }, { model: Role, include: [Permission] }],
        where: { id: userId },
      });
  
      // Verificar que Person.findOne haya sido llamado con los parámetros correctos
      expect(Person.findOne).toHaveBeenCalledWith({ where: { userId: userId } });
  
      // Verificar que los datos del usuario hayan sido actualizados correctamente
      expect(userMock.name).toBe(userData.name);
      expect(userMock.email).toBe(userData.email);
      expect(userMock.save).toHaveBeenCalled();
  
      // Verificar que los datos de la persona hayan sido actualizados correctamente
      expect(personMock.firstName).toBe(personData.firstName);
      expect(personMock.lastName).toBe(personData.lastName);
      expect(personMock.dateBurn).toBe(personData.dateBurn);
      expect(personMock.telephone).toBe(personData.telephone);
      expect(personMock.biography).toBe(personData.biography);
      expect(personMock.save).toHaveBeenCalled();
  
      // Verificar que el usuario actualizado se haya devuelto correctamente
      expect(updatedUser).toBe(userMock);
    });
  
    // Puedes escribir más pruebas para cubrir diferentes casos y escenarios
    it('should throw UserNotExist exception when the user does not exist', async () => {
      const userId = 1;
      const userData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        dateBurn: new Date(),
        telephone: '123456789',
        biography: 'Lorem ipsum',
      };
  
      // Mockear la función findOne de User para devolver null (usuario no existe)
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null);
  
      try {
        await edit(userId, userData);
        fail('Expected UserNotExist error to be thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(UserNotExist);
      }
    });
  });