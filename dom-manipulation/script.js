/************************************************
 * GLOBAL DATA
 ************************************************/

let quotes = [
  { text: "Success is not final.", category: "Motivation" },
  { text: "Talk is cheap. Show me the code.", category: "Programming" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const notification = document.getElementById("notification");

/************************************************
 * TASK 0: CREATE ADD QUOTE FORM (REQUIRED)
 ************************************************/

function createAddQuoteForm() {
  const container = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.onclick = addQuote;

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(button);

  document.body.appendChild(container);
}

/************************************************
 * TASK 0: ADD QUOTE FUNCTION
 ************************************************/

function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (text === "" || category === "") {
    return;
  }

  quotes.push({ text: text, category: category });

  saveQuotesToLocalStorage();
  populateCategories();

  quoteDisplay.textContent = `"${text}" - ${category}`;
}

/************************************************
 * TASK 0: SHOW RANDOM QUOTE
 ************************************************/

function showRandomQuote() {
  const index = Math.floor(Math.random() * quotes.length);
  const quote = quotes[index];

  quoteDisplay.textContent = `"${quote.text}" - ${quote.category}`;

  // Task 1 requirement
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

/************************************************
 * TASK 1: LOCAL STORAGE
 ************************************************/

function saveQuotesToLocalStorage() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

/************************************************
 * TASK 1: JSON EXPORT / IMPORT
 ************************************************/

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);

    saveQuotesToLocalStorage();
    populateCategories();

    notification.textContent = "Quotes imported successfully.";
  };

  reader.readAsText(event.target.files[0]);
}

/************************************************
 * TASK 2: CATEGORY FILTERING
 ************************************************/

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = ["all"];

  quotes.forEach(function (q) {
    if (!categories.includes(q.category)) {
      categories.push(q.category);
    }
  });

  select.innerHTML = "";

  categories.forEach(function (cat) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    select.value = savedCategory;
  }
}

function filterQuote() {
  const select = document.getElementById("categoryFilter");
  const selected = select.value;

  localStorage.setItem("selectedCategory", selected);

  if (selected === "all") {
    showRandomQuote();
    return;
  }

  const filtered = quotes.filter(function (q) {
    return q.category === selected;
  });

  if (filtered.length > 0) {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = `"${quote.text}" - ${quote.category}`;
  }
}

/************************************************
 * TASK 3: SERVER SYNC (ASYNC / AWAIT REQUIRED)
 ************************************************/

async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();

  return data.slice(0, 5).map(function (post) {
    return {
      text: post.title,
      category: "Server"
    };
  });
}

async function postQuoteToServer(quote) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quote)
  });

  return await response.json();
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: server data wins
  quotes = serverQuotes;

  localStorage.setItem("quotes", JSON.stringify(quotes));

  notification.textContent = "Quotes synced with server.";
}

/************************************************
 * EVENT LISTENERS
 ************************************************/

document
  .getElementById("newQuote")
  .addEventListener("click", showRandomQuote);

document
  .getElementById("exportQuotes")
  .addEventListener("click", exportToJsonFile);

/************************************************
 * INITIALIZATION
 ************************************************/

loadQuotesFromLocalStorage();
createAddQuoteForm();
populateCategories();
showRandomQuote();
setInterval(syncQuotes, 60000);
