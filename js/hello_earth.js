// node is the engine which healps to run js files

console.log("hello earth");

var a = 4; // (old way of writting )
// after js es6 we use let instead of var  (let ~ var)
let b = "7";
var c = 3.3;

console.log(typeof b);

let req = true;
console.log(typeof req);
console.log(!req);

// possible data types are null,undefined,boolean, string, number
// understand the diff between redeclair and reassign
// reassign can be done for all
// redeclair cannot be done for let and const only works for var

var c = a + b;
// we cannot redeclare variables with let keyword, need to use var

// but with const we canot reassign or redeclair because a constant value can never change throught the program
const pi = 3.1415;
pi = 8;

console.log(pi);
