// const vscode = require("vscode");

// function activate(context) {
//   context.subscriptions.push(
//     vscode.commands.registerCommand("gitAssistant.startChat", () => {
//       const panel = vscode.window.createWebviewView(
//         "gitAssistantChat",
//         "Chat with Git Assistant",
//         vscode.ViewColumn.One,
//         {
//           enableScripts: true,
//         }
//       );

//       panel.webview.html = getWebviewContent();

//       panel.webview.onDidReceiveMessage(async (message) => {
//         if (message.command === "askQuestion") {
//           const response = await fetchLLMResponse(message.text);
//           panel.webview.postMessage({ command: "showResponse", response });
//         } else if (message.command === "insertCommand") {
//           const terminal = vscode.window.createTerminal("Git Assistant");
//           terminal.sendText(message.command);
//           terminal.show();
//         }
//       });
//     })
//   );
// }

// async function fetchLLMResponse(query) {
//   const apiKey =
//     "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"; // Replace with your actual API key
//   const url = "https://api.openai.com/v1/completions";
//   const payload = {
//     model: "text-davinci-003",
//     prompt: `Convert this query to a Git command: ${query}`,
//     max_tokens: 50,
//     temperature: 0.7,
//   };

//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify(payload),
//   });

//   const data = await response.json();
//   return data.choices[0].text.trim();
// }

// function getWebviewContent() {
//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Chat with Git Assistant</title>
// </head>
// <body>
//   <h1>Git Assistant Chat</h1>
//   <input type="text" id="query" placeholder="Ask something..." />
//   <button onclick="sendQuery()">Send</button>
//   <div id="responseContainer"></div>

//   <script>
//     const vscode = acquireVsCodeApi();

//     function sendQuery() {
//       const query = document.getElementById('query').value;
//       vscode.postMessage({ command: 'askQuestion', text: query });
//     }

//     window.addEventListener('message', event => {
//       const message = event.data;

//       if (message.command === 'showResponse') {
//         const responseContainer = document.getElementById('responseContainer');
//         responseContainer.innerHTML = '';

//         const responseText = document.createElement('p');
//         responseText.textContent = message.response;
//         responseContainer.appendChild(responseText);

//         const insertButton = document.createElement('button');
//         insertButton.textContent = 'Insert Command';
//         insertButton.onclick = () => vscode.postMessage({ command: 'insertCommand', command: message.response });
//         responseContainer.appendChild(insertButton);
//       }
//     });
//   </script>
// </body>
// </html>`;
// }

// function deactivate() {}

// module.exports = {
//   activate,
//   deactivate,
// };

const vscode = require("vscode");

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("gitAssistant.startChat", () => {
      const panel = vscode.window.createWebviewPanel(
        "gitAssistantChat", // Identifier for the webview
        "Chat with Git Assistant", // Title of the panel
        vscode.ViewColumn.One, // Editor column to show the new webview panel in
        {
          enableScripts: true, // Enable scripts in the webview
        }
      );

      panel.webview.html = getWebviewContent();

      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === "askQuestion") {
          const response = await fetchLLMResponse(message.text);
          panel.webview.postMessage({ command: "showResponse", response });
        } else if (message.command === "insertCommand") {
          const terminal = vscode.window.createTerminal("Git Assistant");
          terminal.sendText(message.command);
          terminal.show();
        }
      });
    })
  );
}

async function fetchLLMResponse(query) {
  const apiKey =
    "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"; // Replace with your actual API key
  const url = "https://api.openai.com/v1/completions";
  const payload = {
    model: "text-davinci-003",
    prompt: `Convert this query to a Git command: ${query}`,
    max_tokens: 50,
    temperature: 0.7,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    // Ensure the response contains the expected structure
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].text.trim();
    } else {
      throw new Error("No valid response received from the API");
    }
  } catch (error) {
    console.error("Error fetching LLM response:", error.message);
    return "Sorry, I couldn't generate a Git command. Please try again.";
  }
}

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat with Git Assistant</title>
</head>
<body>
  <h1>Git Assistant Chat</h1>
  <input type="text" id="query" placeholder="Ask something..." />
  <button onclick="sendQuery()">Send</button>
  <div id="responseContainer"></div>

  <script>
    const vscode = acquireVsCodeApi();

    function sendQuery() {
      const query = document.getElementById('query').value;
      vscode.postMessage({ command: 'askQuestion', text: query });
    }

    window.addEventListener('message', event => {
      const message = event.data;

      if (message.command === 'showResponse') {
        const responseContainer = document.getElementById('responseContainer');
        responseContainer.innerHTML = '';
        
        const responseText = document.createElement('p');
        responseText.textContent = message.response;
        responseContainer.appendChild(responseText);
        
        const insertButton = document.createElement('button');
        insertButton.textContent = 'Insert Command';
        insertButton.onclick = () => vscode.postMessage({ command: 'insertCommand', command: message.response });
        responseContainer.appendChild(insertButton);
      }
    });
  </script>
</body>
</html>`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
