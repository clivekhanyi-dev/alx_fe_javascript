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
 * TASK 0: SHOW RANDOM QUOTE
 ************************************************/

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.textContent = `"${quote.text}" - ${quote.category}`;

  // Task 1: Session Storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

/************************************************
 * TASK 0: addQuote FUNCTION (REQUIRED NAME)
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

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

/************************************************
 * TASK 2: CATEGORY FILTERING
 ************************************************/

function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all"];

  quotes.forEach(function (quote) {
    if (!categories.includes(quote.category)) {
      categories.push(quote.category);
    }
  });

  categoryFilter.innerHTML = "";

  categories.forEach(function (cat) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }
}

function filterQuote() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;

  localStorage.setItem("selectedCategory", selectedCategory);

  if (selectedCategory === "all") {
    showRandomQuote();
    return;
  }

  const filteredQuotes = quotes.filter(function (quote) {
    return quote.category === selectedCategory;
  });

  if (filteredQuotes.length > 0) {
    const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    quoteDisplay.textContent = `"${quote.text}" - ${quote.category}`;
  }
}

/************************************************
 * TASK 1: JSON EXPORT / IMPORT
 ************************************************/

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
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
 * TASK 3: SERVER SYNC & CONFLICT RESOLUTION
 ************************************************/

function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
    .then(response => response.json())
    .then(data => {
      return data.map(post => ({
        text: post.title,
        category: "Server"
      }));
    });
}

function syncQuotes() {
  fetchQuotesFromServer().then(serverQuotes => {
    quotes = serverQuotes; // server takes precedence
    saveQuotesToLocalStorage();
    populateCategories();
    notification.textContent = "Quotes synced from server.";
  });
}

/************************************************
 * EVENT LISTENERS (REQUIRED)
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
populateCategories();
showRandomQuote();
setInterval(syncQuotes, 60000);
