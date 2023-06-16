class InfoPermissionInUse extends Error {
    status: number;
    name: string;

    constructor(message?: string) {
      super(message || 'Existe un permiso con el mismo nombre');
      this.status = 409;
      this.name = 'InfoPermissionInUse';
    }
  }
  
  
  class PermissionNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'El permiso no existe. Operación no puede ser completada');
      this.status = 404;
      this.name = 'PermissionNotExist';
    }
  }
  
  export { InfoPermissionInUse,  PermissionNotExist };