let data = JSON.parse(localStorage.getItem("shopData")) || {};

if (!data.shops) {
  data.shops = {
    shop1: { daily: {}, weekly: {}, monthly: {} },
    shop2: { daily: {}, weekly: {}, monthly: {} }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  updateShopTitle();
  updateDisplay();
  loadHistory();
});

document.getElementById("recordBtn").addEventListener("click", recordTransaction);
document.getElementById("viewBtn").addEventListener("click", viewRange);
document.getElementById("calcBtn").addEventListener("click", calculateRange);

function recordTransaction() {

  const saleInput = document.getElementById("sale").value;
  const paymentInput = document.getElementById("payment").value;
  const sideInput = document.getElementById("sideAmount").value;
  const noteInput = document.getElementById("note").value.trim();

  const sale = parseFloat(saleInput) || 0;
  const payment = parseFloat(paymentInput) || 0;
  const side = parseFloat(sideInput) || 0;
  const note = noteInput || "No note";

  const shop = document.getElementById("shopSelect").value;
  const shopData = data.shops[shop];

  if (sale === 0 && payment === 0 && side === 0) {
    alert("Enter at least one value");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const month = today.substring(0,7);
  const week = getWeekKey(today);

  if (!shopData.daily[today]) {
    shopData.daily[today] = {sales:0,payments:0,side:0,transactions:[]};
  }

  if (!shopData.monthly[month]) {
    shopData.monthly[month] = {sales:0,payments:0,side:0};
  }

  if (!shopData.weekly[week]) {
    shopData.weekly[week] = {sales:0,payments:0,side:0};
  }

  shopData.daily[today].sales += sale;
  shopData.daily[today].payments += payment;
  shopData.daily[today].side += side;

  shopData.daily[today].transactions.push({
    sale,
    payment,
    side,
    note
  });

  shopData.monthly[month].sales += sale;
  shopData.monthly[month].payments += payment;
  shopData.monthly[month].side += side;

  shopData.weekly[week].sales += sale;
  shopData.weekly[week].payments += payment;
  shopData.weekly[week].side += side;

  localStorage.setItem("shopData", JSON.stringify(data));

  clearInputs();
  updateDisplay();
  loadHistory();
}

function updateDisplay() {

const shop = document.getElementById("shopSelect").value;
const shopData = data.shops[shop];


  const today = new Date().toISOString().split("T")[0];
  const month = today.substring(0, 7);
  const week = getWeekKey(today);

  const todayData = shopData.daily[today] || { sales: 0, payments: 0, side: 0 };
  const monthData = shopData.monthly[month] || { sales: 0, payments: 0, side: 0 };
  const weekData = shopData.weekly[week] || { sales: 0, payments: 0, side: 0 };

  document.getElementById("salesToday").innerText = todayData.sales.toFixed(2);
  document.getElementById("paymentsToday").innerText = todayData.payments.toFixed(2);
  document.getElementById("sideToday").innerText = todayData.side.toFixed(2);
  document.getElementById("balanceToday").innerText =
    (todayData.sales - todayData.payments - todayData.side).toFixed(2);

  document.getElementById("salesMonth").innerText = monthData.sales.toFixed(2);
  document.getElementById("paymentsMonth").innerText = monthData.payments.toFixed(2);
  document.getElementById("sideMonth").innerText = monthData.side.toFixed(2);
  document.getElementById("balanceMonth").innerText =
    (monthData.sales - monthData.payments - monthData.side).toFixed(2);

    document.getElementById("salesWeek").innerText = weekData.sales.toFixed(2);
document.getElementById("paymentsWeek").innerText = weekData.payments.toFixed(2);
document.getElementById("sideWeek").innerText = weekData.side.toFixed(2);
document.getElementById("balanceWeek").innerText =
  (weekData.sales - weekData.payments - weekData.side).toFixed(2);
}


function loadHistory() {

const shop = document.getElementById("shopSelect").value;
const shopData = data.shops[shop];


  const list = document.getElementById("historyList");
  list.innerHTML = "";

  Object.keys(shopData.daily).sort().forEach(date => {
  shopData.daily[date].transactions.forEach((t, index) => {

      const li = document.createElement("li");
     li.innerHTML = `
${date} - Sale: ₹${t.sale}, Payment: ₹${t.payment}, Side: ₹${t.side}
<br><b>Note:</b> ${t.note}
<button class="delete-btn" onclick="deleteTransaction('${shop}','${date}',${index})">Delete</button>
`;

      list.appendChild(li);
    });
  });
}
function deleteTransaction(shop, date, index) {

  
  const shopData = data.shops[shop];
  

  if (!confirm("Delete this transaction?")) return;

  // Remove transaction
  shopData.daily[date].transactions.splice(index, 1);

  // 🔁 Recalculate that day's totals properly
  let newSales = 0;
  let newPayments = 0;
  let newSide = 0;

  shopData.daily[date].transactions.forEach(t => {
    newSales += t.sale;
    newPayments += t.payment;
    newSide += t.side;
  });

   shopData.daily[date].sales = newSales;
  shopData.daily[date].payments = newPayments;
  shopData.daily[date].side = newSide;
  
  // 🔁 Recalculate FULL monthly & weekly safely
  recalculateAllTotals();

  localStorage.setItem("shopData", JSON.stringify(data));

  updateDisplay();
  loadHistory();
}
function viewRange() {

  const shop = document.getElementById("shopSelect").value;
  const shopData = data.shops[shop];

  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  const list = document.getElementById("filteredHistory");

  list.innerHTML = "";

  if (!start || !end) return alert("Select dates");

  Object.keys(shopData.daily).forEach(date => {
    if (date >= start && date <= end) {

      shopData.daily[date].transactions.forEach(t => {

        const li = document.createElement("li");
        li.textContent =
          `${date} - Sale: ₹${t.sale}, Payment: ₹${t.payment}, Side: ₹${t.side}`;

        list.appendChild(li);
      });
    }
  });
}


function calculateRange() {

  const shop = document.getElementById("shopSelect").value;
  const shopData = data.shops[shop];

  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  let sales = 0, payments = 0, side = 0;

  Object.keys(shopData.daily).forEach(date => {
    if (date >= start && date <= end) {
      sales += shopData.daily[date].sales;
      payments += shopData.daily[date].payments;
      side += shopData.daily[date].side;
    }
  });

  document.getElementById("totalSalesRange").innerText = sales.toFixed(2);
  document.getElementById("totalPaymentsRange").innerText = payments.toFixed(2);
  document.getElementById("totalSideRange").innerText = side.toFixed(2);
  document.getElementById("balanceRange").innerText =
    (sales - payments - side).toFixed(2);
}

function getWeekKey(dateString) {
  const date = new Date(dateString);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date - firstDayOfYear) / 86400000);
  const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${weekNumber}`;
}

function recalculateAllTotals(shop) {

  const shopData = data.shops[shop];

  shopData.monthly = {};
  shopData.weekly = {};

  Object.keys(shopData.daily).forEach(date => {

    const month = date.substring(0, 7);
    const week = getWeekKey(date);

    if (!shopData.monthly[month]) {
      shopData.monthly[month] = { sales: 0, payments: 0, side: 0 };
    }

    if (!shopData.weekly[week]) {
      shopData.weekly[week] = { sales: 0, payments: 0, side: 0 };
    }

    shopData.monthly[month].sales += shopData.daily[date].sales;
    shopData.monthly[month].payments += shopData.daily[date].payments;
    shopData.monthly[month].side += shopData.daily[date].side;

    shopData.weekly[week].sales += shopData.daily[date].sales;
    shopData.weekly[week].payments += shopData.daily[date].payments;
    shopData.weekly[week].side += shopData.daily[date].side;
  });
}



function updateShopTheme() {

  const shop = document.getElementById("shopSelect").value;
  const body = document.body;

  // remove old themes
  body.classList.remove("theme-ambajipeta");
  body.classList.remove("theme-mukkamala");

  if (shop === "shop1") {
    body.classList.add("theme-ambajipeta");
  }

  if (shop === "shop2") {
    body.classList.add("theme-mukkamala");
  }
}

function clearInputs(){
  document.getElementById("sale").value="";
  document.getElementById("payment").value="";
  document.getElementById("sideAmount").value="";
  document.getElementById("note").value="";
}

document.getElementById("shopSelect").addEventListener("change", () => {

  updateShopTheme();
  updateDisplay();
  loadHistory();

});

document.getElementById("shopSelect").addEventListener("change", () => {
  updateShopTitle();
  updateDisplay();
  loadHistory();
});