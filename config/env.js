const env = {
  database: 'hrportal',
  username: 'root',
  password: '1234',
  port: 3306,
  host: 'localhost',
  dialect: 'mysql',
  pool: {
	  max: 5,
	  min: 0,
	  acquire: 30000,
	  idle: 10000
  }
};
// const env = {
//   database: 'HrPortal',
//   username: 'chand',
//   password: 'Hrportal@12345',
//   port: 3306,
//   host: '159.223.177.89',
//   dialect: 'mysql',
//   pool: {
// 	  max: 5,
// 	  min: 0,
// 	  acquire: 30000,
// 	  idle: 10000
//   }
// };
// const env = {
//   database: 'hrportal',
//   username: 'root',
//   password: '12345678',
//   host: '127.0.0.1',
//   port: 3306,
//   dialect: 'mysql',
//   pool: {
// 	  max: 5,
// 	  min: 0,
// 	  acquire: 30000,
// 	  idle: 10000
//   }
// };


module.exports = env;