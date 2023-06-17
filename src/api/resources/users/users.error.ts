/*

The InfoUserInUse class represents an error that occurs when user information 
such as email, username, or phone number, is already associated with an existing account.

*/

class InfoUserInUse extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The email or username or phone number is already associated with an account.');
      this.status = 409;
      this.name = 'InfoUserInUse';
    }
  }
  
/*

The IncorrectCredentials class represents an error that occurs when
the provided credentials (such as username and password) are incorrect.

*/

  class IncorrectCredentials extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'Incorrect credentials. Make sure the username and password are correct.');
      this.status = 409;
      this.name = 'IncorrectCredentials';
    }
  }
  
/*

The UserNotExist class represents an error that occurs when the requested user does not exist. 

*/

  class UserNotExist extends Error {
    status: number;
    name: string;
  
    constructor(message?: string) {
      super(message || 'The user does not exist. Operation cannot be completed.');
      this.status = 404;
      this.name = 'UserNotExist';
    }
  }
  
  export { InfoUserInUse, IncorrectCredentials, UserNotExist };
  