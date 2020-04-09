
var $table = $('#table')

$(function () {
  $table.bootstrapTable()
})

var userCheck=()=>{

  let u = document.getElementById('user');
  let uv = document.getElementById('user_val');
  let un = document.getElementById('username');
  let rl = document.getElementById('role');
  let ps = document.getElementById('password');
  let pc = document.getElementById('confirm_password');

  if(!u.checked){
    uv.value = 0;
    un.value = rl.value = ps.value = pc.value = '';
    un.disabled = rl.disabled = ps.disabled = pc.disabled = true;
  }else{
    uv.value = 1;
    un.disabled = rl.disabled = ps.disabled = pc.disabled = false;
  }
}

var passwordCheck = (val)=>{
  let psc = val;
  let ps = document.getElementById('password').value;
  let lb = document.getElementById('password_confirm');
  if(psc !== ps){
    lb.innerHTML = 'Password Mismatch!';
    lb.className = 'btn btn-danger btn-block'
  }else{
    lb.innerHTML = '';
    lb.className = ''
  }
}

var userCheckU = (val) => {
  let u = document.getElementById('user_u');
  let uv = document.getElementById('user_val_u');
  let un = document.getElementById('username_u');
  let rl = document.getElementById('role_u');
  let ps = document.getElementById('password_u');
  let pc = document.getElementById('confirm_password_u');

  if (!u.checked) {
    uv.value = 0; 
    un.disabled = true; rl.disabled = true; ps.disabled = true; pc.disabled = true;
  } else {
    uv.value = 1;
    un.disabled = false;rl.disabled = false;ps.disabled = false;pc.disabled = false;
  }
}

var passwordCheckU = (val) => {
  let psc = val;
  let ps = document.getElementById('password_u').value;
  let lb = document.getElementById('password_confirm_u');
  if (psc !== ps) {
    lb.innerHTML = 'Password Mismatch!';
    lb.className = 'btn btn-danger btn-block'
  } else {
    lb.innerHTML = '';
    lb.className = ''
  }
}

var ctxL = document.getElementById("lineChart").getContext('2d');
var myLineChart = new Chart(ctxL, {
  type: 'line',
  data: {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [{
      label: "Item 1",
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: [
        'rgba(105, 0, 132, .2)',
      ],
      borderColor: [
        'rgba(200, 99, 132, .7)',
      ],
      borderWidth: 2
    },
    {
      label: "Item 2",
      data: [28, 48, 40, 19, 86, 27, 90],
      backgroundColor: [
        'rgba(0, 137, 132, .2)',
      ],
      borderColor: [
        'rgba(0, 10, 130, .7)',
      ],
      borderWidth: 2
    }
    ]
  },
  options: {
    responsive: true
  }
});
