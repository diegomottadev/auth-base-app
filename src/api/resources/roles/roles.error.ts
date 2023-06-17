
/*

The InfoRoleInUse class represents an error that occurs when the requested role with the same name already exists. 
It is used to handle situations where a role name is already in use and prevents creating a duplicate role with the same name.

*/

class InfoRoleInUse extends Error {
    status: number;
    name: string;

    constructor(message?: string) {
      super(message || 'There is a role with the same name.');
      this.status = 409;
      this.name = 'InfoRoleInUse';
    }
  }
  
/*

  The RoleNotExist class represents an error that occurs when the requested role does not exist. 

*/

  class RoleNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The role does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'RoleNotExist';
    }
  }
  
  export { InfoRoleInUse,  RoleNotExist };