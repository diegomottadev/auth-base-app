
class ProfileParameterNotSpecify extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'Does not specify a parameter to look up the user profile.');
      this.status = 404;
      this.name = 'ProfileParameterNotSpecify';
    }
  }  
/*

  The ProfileNotExist class represents an error that occurs when the requested user profile does not exist. 

*/

  class ProfileNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The user profile does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'RoleNotExist';
    }
  }
  
  export {   ProfileNotExist,ProfileParameterNotSpecify };


