class IncorrectCredentials extends Error {
    status: number;
    name: string;
    constructor(message: string) {
      super(message);
      this.message = message || 'Credenciales incorrectas. Asegure que el email y contraseña sean correctas';
      this.status = 409;
      this.name = "IncorrectCredentials";
    }
  }
  
  export { IncorrectCredentials };