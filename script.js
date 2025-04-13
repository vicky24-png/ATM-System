// Currency conversion rates
const exchangeRates = {
    USD: 1,
    EUR: 0.85,
    INR: 75.50,
    GBP: 0.73
};

// User class to manage user data
class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.balance = 1000;
        this.transactions = [];
    }
}

// BankingSystem class to manage all banking operations
class BankingSystem {
    constructor() {
        // Initialize users array from localStorage
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeEventListeners();
            
            // Only check login status if we're not on the login page
            const isLoginPage = window.location.pathname.includes('index.html') || 
                              window.location.pathname.endsWith('/');
            if (!isLoginPage) {
                this.checkLoginStatus();
            }
        });
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Dashboard elements
        if (window.location.pathname.includes('dashboard.html')) {
            this.initializeDashboard();
        }
    }

    // Initialize dashboard elements
    initializeDashboard() {
        // Check if user is logged in before initializing dashboard
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Deposit and withdraw buttons
        const depositBtn = document.querySelector('.deposit-money');
        const withdrawBtn = document.querySelector('.withdraw-money');
        if (depositBtn) depositBtn.addEventListener('click', () => this.showModal('depositModal'));
        if (withdrawBtn) withdrawBtn.addEventListener('click', () => this.showModal('withdrawModal'));

        // Modal confirm buttons
        const confirmDeposit = document.getElementById('confirmDeposit');
        const confirmWithdraw = document.getElementById('confirmWithdraw');
        if (confirmDeposit) confirmDeposit.addEventListener('click', () => this.handleDeposit());
        if (confirmWithdraw) confirmWithdraw.addEventListener('click', () => this.handleWithdraw());

        // Currency converter
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.convertCurrency());
        }

        // Loan eligibility
        const checkEligibilityBtn = document.getElementById('checkEligibilityBtn');
        if (checkEligibilityBtn) {
            checkEligibilityBtn.addEventListener('click', () => this.checkLoanEligibility());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Update UI
        this.updateUserName();
        this.updateUI();
    }

    // Check login status and redirect if necessary
    checkLoginStatus() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
        }
    }

    // Handle login
    handleLogin(e) {
        e.preventDefault();
        try {
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value;

            if (!username || !password) {
                throw new Error('Please fill in all fields');
            }

            const user = this.users.find(u => u.username === username && u.password === password);
            if (!user) {
                throw new Error('Invalid username or password');
            }

            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Handle signup
    handleSignup(e) {
        e.preventDefault();
        try {
            const username = document.getElementById('signupUsername').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!username || !password) {
                throw new Error('Please fill in all fields');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (this.users.some(u => u.username === username)) {
                throw new Error('Username already exists');
            }

            const newUser = new User(username, password);
            this.users.push(newUser);
            localStorage.setItem('users', JSON.stringify(this.users));
            showToast('Account created successfully!');
            e.target.reset();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Handle deposit
    handleDeposit() {
        try {
            const amount = parseFloat(document.querySelector('#depositModal input').value);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            this.currentUser.balance += amount;
            this.addTransaction('Deposit', amount);
            this.updateUI();
            this.hideModal('depositModal');
            document.querySelector('#depositModal input').value = '';
            showToast('Deposit successful!');
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Handle withdraw
    handleWithdraw() {
        try {
            const amount = parseFloat(document.querySelector('#withdrawModal input').value);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            if (amount > this.currentUser.balance) {
                throw new Error('Insufficient funds');
            }

            this.currentUser.balance -= amount;
            this.addTransaction('Withdrawal', amount);
            this.updateUI();
            this.hideModal('withdrawModal');
            document.querySelector('#withdrawModal input').value = '';
            showToast('Withdrawal successful!');
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Add transaction
    addTransaction(type, amount) {
        const transaction = {
            type,
            amount,
            timestamp: new Date().toLocaleString()
        };

        this.currentUser.transactions.unshift(transaction); // Add to beginning of array
        this.updateStorage();
    }

    // Convert currency
    convertCurrency() {
        try {
            const amount = parseFloat(document.getElementById('convertAmount').value);
            const fromCurrency = document.getElementById('fromCurrency').value;
            const toCurrency = document.getElementById('toCurrency').value;

            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            const convertedAmount = amount * (exchangeRates[toCurrency] / exchangeRates[fromCurrency]);
            document.getElementById('convertResult').textContent = 
                `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Check loan eligibility
    checkLoanEligibility() {
        try {
            const amount = parseFloat(document.getElementById('loanAmount').value);
            const term = parseInt(document.getElementById('loanTerm').value);

            if (isNaN(amount) || isNaN(term)) {
                throw new Error('Please enter valid loan details');
            }

            const eligible = this.currentUser.balance >= amount * 0.2 && term >= 6 && term <= 60;
            const result = document.getElementById('eligibilityResult');
            result.innerHTML = eligible
                ? '<div class="text-green-500">You are eligible for this loan!</div>'
                : '<div class="text-red-500">Sorry, you are not eligible for this loan.</div>';
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Handle logout
    handleLogout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    // Show modal
    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    // Hide modal
    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Update UI
    updateUI() {
        const balanceAmount = document.getElementById('balanceAmount');
        if (balanceAmount && balanceAmount.textContent !== '****') {
            balanceAmount.textContent = `$${this.currentUser.balance.toFixed(2)}`;
        }

        this.updateTransactionList();
        this.updateStorage();
    }

    // Update transaction list
    updateTransactionList() {
        const transactionList = document.getElementById('transactionList');
        if (!transactionList) return;

        transactionList.innerHTML = '';
        this.currentUser.transactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'p-3 bg-gray-50 rounded-lg flex justify-between items-center';
            item.innerHTML = `
                <span class="font-semibold ${transaction.type === 'Deposit' ? 'text-green-500' : 'text-red-500'}">
                    ${transaction.type}
                </span>
                <span>$${transaction.amount.toFixed(2)}</span>
                <span class="text-gray-500 text-sm">${transaction.timestamp}</span>
            `;
            transactionList.appendChild(item);
        });
    }

    // Update storage
    updateStorage() {
        // Update current user in users array
        const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
        }

        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Function to update user name in dashboard
    updateUserName() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userNameElement = document.getElementById('userName');
        
        if (currentUser && currentUser.username) {
            // Capitalize first letter of username
            const displayName = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);
            userNameElement.textContent = displayName;
        } else {
            window.location.href = 'index.html'; // Redirect to login if no user found
        }
    }
}

// Initialize banking system
const bankingSystem = new BankingSystem(); 