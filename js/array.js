let marks = Array(10);
console.log(marks);
// Creates an array with a length of 10
// It contains 6 empty slots, not six values of undefined explicitly assigned.
// You can fill these slots later.

let markss = new Array(20, 40, 35, 12, 37, 100);
console.log(markss);
// Creates an array containing the six specified values.
// Array(6) and new Array(6) behave the same way here. The new keyword is optional when calling the Array constructor.

let marksss = [20, 40, 35, 12, 37, 100];
submarks = marksss.slice(2, 6);
console.log("submarks from indx 2 to end: ", submarks); // includes start excludes end

console.log(marksss.length);
marksss.push(55);
marksss.pop();
marksss.unshift(33);
console.log(marksss);
console.log(marksss.indexOf(21)); // if not found prints -1
console.log(marksss.includes(120));

marksss.slice();

// reduce , filter and map
