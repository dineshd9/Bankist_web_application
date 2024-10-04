'use strict';

const account1 = {
  name:"Dinesh",
  username: 'dd',
  pin: 1111,
  balance: 5000,
  movements: [
    { type: 'deposit', date: '2024-01-12', amount: 2000 },
    { type: 'withdrawal', date: '2024-01-15', amount: -500 }
  ]
};

const account2 = {
  name:"jannu",
  username: 'dj',
  pin: 2222,
  balance: 10000,
  movements: [
    { type: 'deposit', date: '2024-09-11', amount: 900 },
    { type: 'deposit', date: '2024-09-11', amount: 20000 }
  ]
};

const accounts = [account1, account2];

const loginBtn = document.querySelector('.login__btn');
const userInput = document.querySelector('.login__input--user');
const pinInput = document.querySelector('.login__input--pin');
const welcomeMessage = document.querySelector('.welcome');
const app = document.querySelector('.app');
const balanceValue = document.querySelector('.balance__value');
const movementsContainer = document.querySelector('.movements');
const balanceDate = document.querySelector('.balance__date span');
const logoutTimer = document.querySelector('.logout-timer');
const timerElement = document.querySelector('.timer');
const transferBtn = document.querySelector('.form__btn--transfer');
const transferToInput = document.querySelector('.form__input--to');
const transferAmountInput = document.querySelector('.form__input--amount');
const loanBtn = document.querySelector('.form__btn--loan');
const loanAmountInput = document.querySelector('.form__input--loan-amount');
const closeAccountBtn = document.querySelector('.form__btn--close');
const closeUserInput = document.querySelector('.form__input--user');
const closePinInput = document.querySelector('.form__input--pin');
const sortBtn = document.querySelector('.btn--sort');

let timer; 
let currentAccount; 
let sorted = false; 

//logout 
const startLogoutTimer = function () {
  let time = 300; 
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    timerElement.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      logout();
    }
    time--;
  };
  tick();
  timer = setInterval(tick, 1000);
};

// logout
const logout = function () {
  welcomeMessage.textContent = 'Log in to get started';
  app.style.opacity = 0;
  userInput.value = pinInput.value = ''; 
  clearInterval(timer); 
};

// balance, movements, and summary
const updateUI = function (account) {

  account.balance = account.movements.reduce((acc, mov) => acc + mov.amount, 0);
  balanceValue.textContent = `Rs.${account.balance.toFixed(2)}`;

  const now = new Date();
  balanceDate.textContent = `${now.getDate()}/${
    now.getMonth() + 1
  }/${now.getFullYear()}`;
  displayMovements(account.movements);
  updateSummary(account.movements);
};

//  movements
const displayMovements = function (movements) {
  movementsContainer.innerHTML = '';
  movements.forEach((mov, i) => {
    const type = mov.type === 'deposit' ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${mov.date}</div>
        <div class="movements__value">Rs.${Math.abs(mov.amount).toFixed(2)}</div>
      </div>
    `;
    movementsContainer.insertAdjacentHTML('afterbegin', html);
  });
};

// In, Out, Interest
const updateSummary = function (movements) {
  const incomes = movements
    .filter(mov => mov.type === 'deposit')
    .reduce((acc, mov) => acc + mov.amount, 0);
  const outgoings = movements
    .filter(mov => mov.type === 'withdrawal')
    .reduce((acc, mov) => acc + Math.abs(mov.amount), 0);
  const interest = incomes * 0.01; 
  document.querySelector('.summary__value--in').textContent = `Rs.${incomes.toFixed(2)}`;
  document.querySelector('.summary__value--out').textContent = `Rs.${outgoings.toFixed(2)}`;
  document.querySelector('.summary__value--interest').textContent = `Rs.${interest.toFixed(2)}`;
};

// sort 
const sortMovements = function () {
  const movements = currentAccount.movements.slice();
  const sortedMovements = sorted
    ? movements.sort((a, b) => new Date(a.date) - new Date(b.date))
    : movements.sort((a, b) => new Date(b.date) - new Date(a.date));

  displayMovements(sortedMovements);
  sorted = !sorted; 
  sortBtn.textContent = sorted ? '↑ SORT' : '↓ SORT';
};

// Transfer 
transferBtn.addEventListener('click', function (e) {
  e.preventDefault(); 

  const amount = Number(transferAmountInput.value);
  const receiverUsername = transferToInput.value;
  const receiverAccount = accounts.find(
    acc => acc.username === receiverUsername
  );

  transferToInput.value = transferAmountInput.value = '';

  if (!receiverAccount) {
    alert('Username does not match any account');
  } else if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiverAccount.username !== currentAccount.username
  ) {
    currentAccount.balance -= amount;
    receiverAccount.balance += amount;
    currentAccount.movements.push({
      type: 'withdrawal',
      date: new Date().toISOString().split('T')[0], 
      amount: -amount
    });
    receiverAccount.movements.push({
      type: 'deposit',
      date: new Date().toISOString().split('T')[0], 
      amount: amount
    });

    updateUI(currentAccount);
  } else if (amount > currentAccount.balance) {
    alert('Insufficient amount');
  } else {
    alert('Invalid transaction');
  }
});

// Loan function
loanBtn.addEventListener('click', function (e) {
  e.preventDefault(); 
  const loanAmount = Number(loanAmountInput.value);

  loanAmountInput.value = '';

  if (loanAmount > 0) {
    currentAccount.balance += loanAmount;
    currentAccount.movements.push({
      type: 'deposit',
      date: new Date().toISOString().split('T')[0],
      amount: loanAmount
    });
    updateUI(currentAccount);
  }
});

// Close account
closeAccountBtn.addEventListener('click', function (e) {
  e.preventDefault(); 
  const username = closeUserInput.value;
  const pin = Number(closePinInput.value);
  closeUserInput.value = closePinInput.value = '';
  const index = accounts.findIndex(
    acc => acc.username === username && acc.pin === pin
  );

  if (index !== -1) {
    if (currentAccount.balance === 0) {
      accounts.splice(index, 1);
      logout();
    } else if (currentAccount.balance < 0) {
      alert('Cannot delete account with negative balance');
    }
  } else {
    alert('Username or PIN does not match');
  }
});

// Sort button 
sortBtn.addEventListener('click', function (e) {
  e.preventDefault();
  sortMovements();
});

// Login button 
loginBtn.addEventListener('click', function (e) {
  e.preventDefault(); 

  const username = userInput.value;
  const pin = Number(pinInput.value);

  currentAccount = accounts.find(
    acc => acc.username === username && acc.pin === pin
  );

  if (currentAccount) {

    welcomeMessage.textContent = `Welcome back, ${currentAccount.name}`;
    app.style.opacity = 1;

    userInput.value = pinInput.value = '';
    if (timer) clearInterval(timer); 
    startLogoutTimer();

    updateUI(currentAccount);
  }
});
