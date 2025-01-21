# ATM Machine Program

# Step 1: Predefined User Data
users = {
    "1234": {"name": "Alice", "balance": 5000},  # PIN: User details
    "5678": {"name": "Bob", "balance": 3000},
}

# Step 2: Authentication Function
def authenticate():
    print("Welcome to the ATM!")
    attempts = 3  # Allow 3 attempts to enter the correct PIN
    while attempts > 0:
        pin = input("Enter your 4-digit PIN: ")
        if pin in users:
            print(f"\nHello, {users[pin]['name']}!")
            return pin
        else:
            attempts -= 1
            print(f"Invalid PIN. You have {attempts} attempt(s) left.")
    print("Too many failed attempts. Exiting...")
    return None

# Step 3: View Balance
def view_balance(pin):
    print(f"Your current balance is: ₹{users[pin]['balance']}")

# Step 4: Deposit Money
def deposit(pin):
    try:
        amount = float(input("Enter the amount to deposit: ₹"))
        if amount > 0:
            users[pin]['balance'] += amount
            print(f"₹{amount} deposited successfully!")
            view_balance(pin)
        else:
            print("Please enter a positive amount.")
    except ValueError:
        print("Invalid input. Please enter a numeric value.")

# Step 5: Withdraw Money
def withdraw(pin):
    try:
        amount = float(input("Enter the amount to withdraw: ₹"))
        if amount > 0 and amount <= users[pin]['balance']:
            users[pin]['balance'] -= amount
            print(f"₹{amount} withdrawn successfully!")
            view_balance(pin)
        elif amount > users[pin]['balance']:
            print("Insufficient balance.")
        else:
            print("Please enter a positive amount.")
    except ValueError:
        print("Invalid input. Please enter a numeric value.")

# Step 6: ATM Menu
def atm_menu(pin):
    while True:
        print("\nATM Menu:")
        print("1. View Balance")
        print("2. Deposit Money")
        print("3. Withdraw Money")
        print("4. Exit")
        choice = input("Enter your choice (1-4): ")
        if choice == "1":
            view_balance(pin)
        elif choice == "2":
            deposit(pin)
        elif choice == "3":
            withdraw(pin)
        elif choice == "4":
            print("Thank you for using the ATM. Goodbye!")
            break
        else:
            print("Invalid choice. Please enter a number between 1 and 4.")

# Step 7: Main Program
def main():
    pin = authenticate()
    if pin:
        atm_menu(pin)

# Execute the program
if __name__ == "__main__":
    main()