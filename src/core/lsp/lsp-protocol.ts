// Minimal LSP protocol type stubs, inlined to avoid a runtime dependency
// on vscode-languageserver-protocol. Only the types actually used by the
// LSP client code are defined here.
//
// Reference: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/

// ---------------------------------------------------------------------------
// Basic structures
// ---------------------------------------------------------------------------

export interface Position {
  line: number
  character: number
}

export interface Range {
  start: Position
  end: Position
}

export interface Location {
  uri: string
  range: Range
}

export interface TextEdit {
  range: Range
  newText: string
}

// ---------------------------------------------------------------------------
// Markup
// ---------------------------------------------------------------------------

export type MarkupKind = "plaintext" | "markdown"

export interface MarkupContent {
  kind: MarkupKind
  value: string
}

/** @deprecated Use MarkupContent instead. Kept for backwards compat. */
export type MarkedString = string | { language: string; value: string }

// ---------------------------------------------------------------------------
// Text documents
// ---------------------------------------------------------------------------

export interface TextDocumentIdentifier {
  uri: string
}

export interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
  version: number
}

export interface TextDocumentItem {
  uri: string
  languageId: string
  version: number
  text: string
}

export interface TextDocumentPositionParams {
  textDocument: TextDocumentIdentifier
  position: Position
}

// ---------------------------------------------------------------------------
// Completion
// ---------------------------------------------------------------------------

export interface CompletionContext {
  triggerKind: number
  triggerCharacter?: string
}

export interface CompletionParams extends TextDocumentPositionParams {
  context?: CompletionContext
}

export interface CompletionItem {
  label: string
  kind?: number
  detail?: string
  documentation?: string | MarkupContent
  sortText?: string
  insertText?: string
  insertTextFormat?: number
  textEdit?: TextEdit & { newText: string } | InsertReplaceEdit
  textEditText?: string
  commitCharacters?: string[]
}

export interface InsertReplaceEdit {
  newText: string
  insert: Range
  replace: Range
}

export interface CompletionList {
  isIncomplete: boolean
  items: CompletionItem[]
  itemDefaults?: {
    commitCharacters?: string[]
    editRange?: Range | { insert: Range; replace: Range }
    insertTextFormat?: number
  }
}

// ---------------------------------------------------------------------------
// Hover
// ---------------------------------------------------------------------------

export interface HoverParams extends TextDocumentPositionParams {}

export interface Hover {
  contents: string | MarkupContent | MarkedString | MarkedString[]
  range?: Range
}

// ---------------------------------------------------------------------------
// Signature help
// ---------------------------------------------------------------------------

export interface SignatureHelpContext {
  triggerKind: number
  triggerCharacter?: string
  isRetrigger: boolean
  activeSignatureHelp?: SignatureHelp
}

export interface SignatureHelpParams extends TextDocumentPositionParams {
  context?: SignatureHelpContext
}

export interface SignatureHelp {
  signatures: SignatureInformation[]
  activeSignature?: number
  activeParameter?: number
}

export interface SignatureInformation {
  label: string
  documentation?: string | MarkupContent
  parameters?: ParameterInformation[]
  activeParameter?: number
}

export interface ParameterInformation {
  label: string | [number, number]
  documentation?: string | MarkupContent
}

// ---------------------------------------------------------------------------
// Definition / Declaration / TypeDefinition / Implementation
// ---------------------------------------------------------------------------

export interface DefinitionParams extends TextDocumentPositionParams {}
export interface DeclarationParams extends TextDocumentPositionParams {}
export interface TypeDefinitionParams extends TextDocumentPositionParams {}
export interface ImplementationParams extends TextDocumentPositionParams {}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

export interface ReferenceContext {
  includeDeclaration: boolean
}

export interface ReferenceParams extends TextDocumentPositionParams {
  context: ReferenceContext
}

// ---------------------------------------------------------------------------
// Rename
// ---------------------------------------------------------------------------

export interface RenameParams extends TextDocumentPositionParams {
  newName: string
}

export interface WorkspaceEdit {
  changes?: { [uri: string]: TextEdit[] }
  documentChanges?: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[]
}

export interface TextDocumentEdit {
  textDocument: VersionedTextDocumentIdentifier
  edits: TextEdit[]
}

export interface CreateFile {
  kind: "create"
  uri: string
}

export interface RenameFile {
  kind: "rename"
  oldUri: string
  newUri: string
}

export interface DeleteFile {
  kind: "delete"
  uri: string
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export interface FormattingOptions {
  tabSize: number
  insertSpaces: boolean
  [key: string]: boolean | number | string
}

export interface DocumentFormattingParams {
  textDocument: TextDocumentIdentifier
  options: FormattingOptions
}

// ---------------------------------------------------------------------------
// Diagnostics
// ---------------------------------------------------------------------------

export type DiagnosticSeverity = 1 | 2 | 3 | 4

export interface Diagnostic {
  range: Range
  severity?: DiagnosticSeverity
  code?: number | string
  source?: string
  message: string
}

export interface PublishDiagnosticsParams {
  uri: string
  version?: number
  diagnostics: Diagnostic[]
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

export interface ClientCapabilities {
  general?: Record<string, any>
  textDocument?: Record<string, any>
  window?: Record<string, any>
  workspace?: Record<string, any>
  [key: string]: any
}

export interface ServerCapabilities {
  textDocumentSync?: number | TextDocumentSyncOptions
  completionProvider?: CompletionOptions
  hoverProvider?: boolean | object
  signatureHelpProvider?: SignatureHelpOptions
  definitionProvider?: boolean | object
  declarationProvider?: boolean | object
  typeDefinitionProvider?: boolean | object
  implementationProvider?: boolean | object
  referencesProvider?: boolean | object
  renameProvider?: boolean | object
  documentFormattingProvider?: boolean | object
  diagnosticProvider?: boolean | object
  [key: string]: any
}

export interface TextDocumentSyncOptions {
  openClose?: boolean
  change?: number
}

export interface CompletionOptions {
  triggerCharacters?: string[]
  resolveProvider?: boolean
}

export interface SignatureHelpOptions {
  triggerCharacters?: string[]
  retriggerCharacters?: string[]
}

export interface InitializeParams {
  processId: number | null
  clientInfo?: { name: string; version?: string }
  rootUri: string | null
  capabilities: ClientCapabilities
  [key: string]: any
}

export interface InitializeResult {
  capabilities: ServerCapabilities
}

// ---------------------------------------------------------------------------
// Messages (JSON-RPC)
// ---------------------------------------------------------------------------

export interface RequestMessage {
  jsonrpc: string
  id: number | string
  method: string
  params?: any
}

export interface ResponseMessage {
  jsonrpc: string
  id: number | string | null
  result?: any
  error?: ResponseError
}

export interface ResponseError {
  code: number
  message: string
  data?: any
}

export interface NotificationMessage {
  jsonrpc: string
  method: string
  params?: any
}

// ---------------------------------------------------------------------------
// Window messages
// ---------------------------------------------------------------------------

export interface LogMessageParams {
  type: number
  message: string
}

export interface ShowMessageParams {
  type: number
  message: string
}

// ---------------------------------------------------------------------------
// Document sync notifications
// ---------------------------------------------------------------------------

export interface DidOpenTextDocumentParams {
  textDocument: TextDocumentItem
}

export interface DidCloseTextDocumentParams {
  textDocument: TextDocumentIdentifier
}

export interface DidChangeTextDocumentParams {
  textDocument: VersionedTextDocumentIdentifier
  contentChanges: TextDocumentContentChangeEvent[]
}

export type TextDocumentContentChangeEvent =
  | { range: Range; text: string }
  | { text: string }
