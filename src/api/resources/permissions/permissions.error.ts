
/*

The InfoPermissionInUse class represents an error that occurs when the requested permission with the same name already exists. 
It is used to handle situations where a permission name is already in use and prevents creating a duplicate permission with the same name.

*/

class InfoPermissionInUse extends Error {
    status: number;
    name: string;

    constructor(message?: string) {
      super(message || 'There is a permission with the same name.');
      this.status = 409;
      this.name = 'InfoPermissionInUse';
    }
  }
  

/*

  The PermissionNotExist class represents an error that occurs when the requested role does not exist. 

*/
  
  class PermissionNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The permission does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'PermissionNotExist';
    }
  }
  
  export { InfoPermissionInUse,  PermissionNotExist };