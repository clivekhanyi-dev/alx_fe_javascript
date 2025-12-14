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
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
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
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.textContent = `"${quote.text}" - ${quote.category}`;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

/************************************************
 * TASK 1: LOCAL STORAGE
 ************************************************/

function saveQuotesToLocalStorage() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

/************************************************
 * TASK 2: CATEGORY FILTERING
 ************************************************/

function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = ["all"];

  quotes.forEach(function (q) {
    if (!categories.includes(q.category)) {
      categories.push(q.category);
    }
  });

  filter.innerHTML = "";

  categories.forEach(function (cat) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });

  const saved = localStorage.getItem("selectedCategory");
  if (saved) {
    filter.value = saved;
  }
}

function filterQuote() {
  const filter = document.getElementById("categoryFilter");
  const selected = filter.value;

  localStorage.setItem("selectedCategory", selected);

  if (selected === "all") {
    showRandomQuote();
    return;
  }

  const filtered = quotes.filter(q => q.category === selected);
  if (filtered.length > 0) {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    quoteDisplay.textContent = `"${quote.text}" - ${quote.category}`;
  }
}

/************************************************
 * TASK 1: JSON EXPORT / IMPORT
 ************************************************/

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotesToLocalStorage();
    populateCategories();
    notification.textContent = "Quotes imported successfully.";
  };
  reader.readAsText(event.target.files[0]);
}

/************************************************
 * TASK 3: SERVER SYNC (REQUIRED FUNCTIONS)
 ************************************************/

function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
    .then(res => res.json());
}

function postQuoteToServer(quote) {
  return fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(quote),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function syncQuotes() {
  fetchQuotesFromServer().then(serverData => {
    const serverQuotes = serverData.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server wins
    quotes = serverQuotes;
    saveQuotesToLocalStorage();
    populateCategories();

    notification.textContent = "Quotes synced from server.";
  });
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
 * INITIAL LOAD
 ************************************************/

loadQuotesFromLocalStorage();
createAddQuoteForm();
populateCategories();
showRandomQuote();
setInterval(syncQuotes, 60000);
