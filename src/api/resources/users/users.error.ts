class InfoUserInUse extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'El email o usuario o telefono ya estan asociados con una cuenta');
      this.status = 409;
      this.name = 'InfoUserInUse';
    }
  }
  
  class IncorrectCredentials extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'Credenciales incorrectas. Asegure que el username y contraseña sean correctas');
      this.status = 409;
      this.name = 'IncorrectCredentials';
    }
  }
  
  class UserNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'El usuario no existe. Operación no puede ser completada');
      this.status = 404;
      this.name = 'UserNotExist';
    }
  }
  
  export { InfoUserInUse, IncorrectCredentials, UserNotExist };
  