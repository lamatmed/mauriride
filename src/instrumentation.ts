export async function register() {
  // web-streams-polyfill override removed: jose 6.x+ handles Node.js 22 natively,
  // and the global ReadableStream override broke next-auth's Request body validation.
}
