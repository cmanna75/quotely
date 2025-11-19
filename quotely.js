// Scriptable: Daily Quote Widget
// Displays a daily random quote based on a hash of the date

// CONFIGURATION
const GIST_URL = "https://gist.githubusercontent.com/cmanna75/bb90b547698fcd9818913170f801f020/raw/31e45f24657b1d86d6eaa5b338b3fc961b30b272/quote.json";

// MAIN
let widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentLarge();
}
Script.complete();

// FUNCTIONS
async function createWidget() {
  const widget = new ListWidget();

  // Set static background color
  widget.backgroundColor = new Color("#dfdcd3");

  // Load quotes
  let quotes = await loadQuotes();
  if (!quotes || quotes.length === 0) {
    widget.addText("No quotes available.");
    return widget;
  }

  // Pick a quote using date hash
  let dateHash = hashString(new Date().toDateString());
  let quote = quotes[dateHash % quotes.length];

  // Format quote
  const quoteText = widget.addText(`"${quote.quote}"`);
  quoteText.font = Font.systemFont(16);
  quoteText.minimumScaleFactor = 0.5;
  quoteText.textColor = Color.black();
  quoteText.lineLimit = 0;

  if (quote.speaker) {
    const speakerText = widget.addText(`- ${quote.speaker}`);
    speakerText.font = Font.italicSystemFont(12);
    speakerText.textColor = Color.darkGray();
  }

  const sourceText = widget.addText(quote.source);
  sourceText.font = Font.systemFont(10);
  sourceText.textColor = Color.gray();

  widget.spacing = 6;
  return widget;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

async function loadQuotes() {
  try {
    let req = new Request(GIST_URL);
    return await req.loadJSON();
  } catch (e) {
    console.error("Error loading quotes:", e);
    return [];
  }
}
