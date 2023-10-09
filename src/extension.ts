import * as vscode from 'vscode';
import { getSourceOutput } from 'cognitive-complexity-ts';

/**
 * An helper function that takes a function and a time (in ms) as parameters,
 * and returns a debounced version of that function that resolves with the
 * result of the function when it gets executed.
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number,
) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(
        () => resolve(func(...args) as ReturnType<F>),
        waitFor,
      );
    });
};

// This method is called when the extension is activated
// An extension is activated the very first time a command is executed
export function activate(context: vscode.ExtensionContext) {
  const provider = new CustomSidebarViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CustomSidebarViewProvider.viewType,
      provider,
    ),
  );
}

class CustomSidebarViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'uncanny-cognitive-complexity.openview';

  private _totalPhasesPromise: Thenable<number>;
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {
    const debouncedUpdateContent = debounce(
      (
        event:
          | vscode.TextEditor
          | vscode.TextDocument
          | vscode.TextDocumentChangeEvent
          | undefined,
      ) =>
        this.updateContent(
          event && 'document' in event ? event.document : event,
        ),
      200,
    );
    const facesDir = vscode.Uri.joinPath(
      this._extensionUri,
      'assets',
      'mr-incredible',
    );

    this._totalPhasesPromise = vscode.workspace.fs
      .readDirectory(facesDir)
      .then(facesFiles => facesFiles.length);

    // Update on editor switch
    vscode.window.onDidChangeActiveTextEditor(debouncedUpdateContent);
    // Update on document open
    vscode.workspace.onDidOpenTextDocument(debouncedUpdateContent);
    // Update on document change
    vscode.workspace.onDidChangeTextDocument(debouncedUpdateContent);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this._view = webviewView;

    // Render initial content
    this.updateContent();
  }

  private async updateContent(
    document = vscode.window.activeTextEditor?.document,
  ) {
    if (!this._view) {
      return;
    }

    const complexity = await this.getCognitiveComplexity(document);
    this._view.webview.html = await this.getHtmlContent(
      this._view.webview,
      complexity,
    );
  }

  private async getHtmlContent(
    webview: vscode.Webview,
    complexity = 0,
  ): Promise<string> {
    const totalPhases = await this._totalPhasesPromise;
    const faceId = Math.min(Math.floor(complexity / 10), totalPhases - 1);

    const face = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'assets',
        'mr-incredible',
        `${faceId}.jpg`,
      ),
    );

    return this.getHtml(face, complexity);
  }

  private getHtml(faceUri: vscode.Uri, complexity = 0) {
    return `
      <!doctype html>
      <html>
        <head>
          <style>
            img {
              width: 100%;
              max-width: 640px;
              aspect-ratio: 1 / 1;
              object-fit: contain;
              display: block;
              margin: 0 auto;
            }
            p {
              margin-top: 8px;
              text-align: center;
            }
            #author {
              position: absolute;
              bottom: 0;
            }
          </style>
        </head>
        <body>
          <img src="${faceUri}" alt="">
          <p>Cognitive Complexity: ${complexity}</p>
          <p id="author">Brought to you with ❤ by <a href="https://giorgio.garasto.me">Dabolus</a></p>
        </body>
      </html>
    `;
  }

  private async getCognitiveComplexity(
    document = vscode.window.activeTextEditor?.document,
  ): Promise<number> {
    if (
      !document ||
      // Only TS and JS files are supported
      (document.languageId !== 'typescript' &&
        document.languageId !== 'javascript')
    ) {
      return 0;
    }

    const { score: complexity } = getSourceOutput(document.getText());

    return complexity;
  }
}
