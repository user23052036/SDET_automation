const flag = true;

if (!flag) {
  console.log(flag);
  console.log("inside if block");
} else {
  console.log(flag);
  console.log("inside else block");
}

let i = 0;
while (i < 10) {
  console.log(i);
  i++;
}

i = 0;
do {
  console.log(i);
  i++;
} while (i < 10);

for (let k = 0; k < 10; k++) {
  console.log(k);
}

if ((i == 0 || i == 1) && (i == 10 || i == 11)) {
  console.log("wallla!");
}
