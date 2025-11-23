// Scriptable: Daily Quote Widget
// Displays a daily random quote based on a hash of the date

// CONFIGURATION
const GIST_URL = "https://gist.githubusercontent.com/cmanna75/bb90b547698fcd9818913170f801f020/raw/f23c20e77daf007615721510c6f1f06e8664780c/quote.json";

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
  let now = new Date();
  let dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getDay()}`;
  let dateHash = cyrb53(dateKey);  // uses better hash
  let index = Math.floor(dateHash % 1e12 / 1e12 * quotes.length);
  let quote = quotes[index];

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

//archived
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function cyrb53(str) {
  let h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0) * 4294967296 + (h1 >>> 0);
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
