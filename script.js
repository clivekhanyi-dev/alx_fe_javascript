const quotes = [
  { text: "Success is not final.", category: "Motivation" },
  { text: "Talk is cheap. Show me the code.", category: "Programming" }
];

const quoteDisplay = document.getElementById("quoteDisplay");

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>${quote.category}</small>
  `;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  quotes.push({ text, category });
  alert("Quote added!");
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
