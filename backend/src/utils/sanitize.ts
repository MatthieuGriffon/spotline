import sanitizeHtml from  'sanitize-html';


export function sanitizePseudo(pseudo: string): string {
  return pseudo.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20)
}

export function sanitizeDescription(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // on vire tout HTML
    allowedAttributes: {}, // on autorise rien non plus
    disallowedTagsMode: 'discard', // on jette ce qui est interdit
  }).trim()
}