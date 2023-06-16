class InfoRoleInUse extends Error {
    status: number;
    name: string;

    constructor(message?: string) {
      super(message || 'Existe un rol con el mismo nombre');
      this.status = 409;
      this.name = 'InfoRoleInUse';
    }
  }
  
  
  class RoleNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'El rol no existe. Operación no puede ser completada');
      this.status = 404;
      this.name = 'RoleNotExist';
    }
  }
  
  export { InfoRoleInUse,  RoleNotExist };