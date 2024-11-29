// Initialize data from localStorage or use default structure
let data = JSON.parse(localStorage.getItem('shopData')) || {
    daily: {},
    monthly: {},
    currentMonth: getCurrentMonth()
  };
  
  // Load transaction history on page load
  document.addEventListener("DOMContentLoaded", () => {
    loadTransactionHistory();
    updateDisplay();
  });
  
  // Function to record a new transaction
  function recordTransaction() {
    console.log("Record Transaction button clicked"); // Debugging log
  
    // Retrieve input values
    const sale = Number(document.getElementById('sale').value) || 0;
    const payment = Number(document.getElementById('payment').value) || 0;
    const sideAmount = Number(document.getElementById('sideAmount').value) || 0;
    const note = document.getElementById('note').value.trim() || "No notes";
  
    console.log("Input values - Sale:", sale, "Payment:", payment, "Side Amount:", sideAmount, "Note:", note); // Debugging log
  
    const today = getCurrentDate();
    const currentMonth = getCurrentMonth();
  
    // Initialize data structure if it doesn't exist for today or current month
    if (!data.daily[today]) data.daily[today] = { sales: 0, payments: 0, sideAmounts: 0, transactions: [] };
    if (!data.monthly[currentMonth]) data.monthly[currentMonth] = { sales: 0, payments: 0, sideAmounts: 0 };
  
    // Update daily and monthly totals
    data.daily[today].sales += sale;
    data.daily[today].payments += payment;
    data.daily[today].sideAmounts += sideAmount;
    data.daily[today].transactions.push({ sale, payment, sideAmount, note });
  
    data.monthly[currentMonth].sales += sale;
    data.monthly[currentMonth].payments += payment;
    data.monthly[currentMonth].sideAmounts += sideAmount;
  
    console.log("Updated daily data:", data.daily[today]); // Debugging log
    console.log("Updated monthly data:", data.monthly[currentMonth]); // Debugging log
  
    updateDisplay(); // Update display
    storeData(); // Save to localStorage
    addDailyTransactionToHistory(today, sale, payment, sideAmount, note);
    addMonthlyTransactionToHistory(currentMonth);
  
    // Clear input fields after recording transaction
    document.getElementById('sale').value = '';
    document.getElementById('payment').value = '';
    document.getElementById('sideAmount').value = '';
    document.getElementById('note').value = '';
  }
  
  // Function to display daily and monthly totals
  function updateDisplay() {
    const today = getCurrentDate();
    const currentMonth = getCurrentMonth();
    const todayData = data.daily[today] || { sales: 0, payments: 0, sideAmounts: 0 };
    const monthData = data.monthly[currentMonth] || { sales: 0, payments: 0, sideAmounts: 0 };
  
    // Update daily summary
    document.getElementById('totalSalesToday').innerText = todayData.sales;
    document.getElementById('totalPaymentsToday').innerText = todayData.payments;
    document.getElementById('totalSideAmountToday').innerText = todayData.sideAmounts;
    document.getElementById('balanceToday').innerText = todayData.sales - (todayData.payments + todayData.sideAmounts);
  
    // Update monthly summary
    document.getElementById('totalSalesMonth').innerText = monthData.sales;
    document.getElementById('totalPaymentsMonth').innerText = monthData.payments;
    document.getElementById('totalSideAmountMonth').innerText = monthData.sideAmounts;
    document.getElementById('balanceMonth').innerText = monthData.sales - (monthData.payments + monthData.sideAmounts);
  }
  
  // Function to view transactions within a date range
  function viewTransactionsForRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const filteredHistory = document.getElementById('filteredTransactionHistory');
    filteredHistory.innerHTML = ''; // Clear previous entries
  
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  
    for (const date in data.daily) {
      if (date >= startDate && date <= endDate) {
        data.daily[date].transactions.forEach(transaction => {
          const item = document.createElement('li');
          item.textContent = `${date} - Sale: ₹${transaction.sale}, Side Deduction: ₹${transaction.sideAmount}, Payment: ₹${transaction.payment}, Note: ${transaction.note}`;
          filteredHistory.appendChild(item);
        });
      }
    }
  }
  
  // Function to calculate totals for a date range
  function calculateTotalsForRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
  
    let totalSales = 0;
    let totalPayments = 0;
    let totalSideAmounts = 0;
  
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  
    for (const date in data.daily) {
      if (date >= startDate && date <= endDate) {
        totalSales += data.daily[date].sales;
        totalPayments += data.daily[date].payments;
        totalSideAmounts += data.daily[date].sideAmounts;
      }
    }
  
    document.getElementById('totalSalesRange').innerText = totalSales;
    document.getElementById('totalPaymentsRange').innerText = totalPayments;
    document.getElementById('totalSideAmountRange').innerText = totalSideAmounts;
    document.getElementById('balanceRange').innerText = totalSales - (totalPayments + totalSideAmounts);
  }
  
  // Store data in localStorage
  function storeData() {
    console.log("Storing data to localStorage"); // Debugging log
    localStorage.setItem("shopData", JSON.stringify(data));
  }
  
  // Helper functions to get the current date and month
  function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  function getCurrentMonth() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}`;
  }
  
  // Load transaction history from stored data on page load
  function loadTransactionHistory() {
    const transactionHistory = document.getElementById('transactionHistory');
    transactionHistory.innerHTML = ''; // Clear previous entries
  
    for (const date in data.daily) {
      const dayData = data.daily[date];
      dayData.transactions.forEach(transaction => {
        const item = document.createElement('li');
        item.textContent = `${date} - Sale: ₹${transaction.sale}, Side Deduction: ₹${transaction.sideAmount}, Payment: ₹${transaction.payment}, Note: ${transaction.note}`;
        transactionHistory.appendChild(item);
      });
    }
  }
  
  // Add a daily transaction to the history display
  function addDailyTransactionToHistory(date, sale, payment, sideAmount, note) {
    const dailyHistory = document.getElementById('transactionHistory');
    const item = document.createElement('li');
    item.textContent = `${date} - Sale: ₹${sale}, Side Deduction: ₹${sideAmount}, Payment: ₹${payment}, Note: ${note}`;
    dailyHistory.appendChild(item);
  }
  
  // Add monthly totals to the monthly history display
  function addMonthlyTransactionToHistory(month) {
    const monthlyHistory = document.getElementById('monthlyHistory');
    monthlyHistory.innerHTML = '';
    for (const monthKey in data.monthly) {
      const monthData = data.monthly[monthKey];
      const item = document.createElement('li');
      item.textContent = `${monthKey} - Total Sales: ₹${monthData.sales}, Total Payments: ₹${monthData.payments}, Total Side Deductions: ₹${monthData.sideAmounts}, Balance: ₹${monthData.sales - monthData.payments - monthData.sideAmounts}`;
      monthlyHistory.appendChild(item);
    }
  }
  